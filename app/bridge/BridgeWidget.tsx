"use client";

import { useState } from "react";
import { getWalletFeature } from "@wallet-standard/react";
import { SolanaSignAndSendTransaction } from "@solana/wallet-standard-features";
import type { SolanaSignAndSendTransactionFeature } from "@solana/wallet-standard-features";
import {
  address,
  createSolanaRpc,
  getBase58Encoder,
  getBase58Codec,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  getBase64EncodedWireTransaction,
  type Address,
  type TransactionSigner,
  type Instruction,
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  fetchMaybeToken,
  fetchMaybeMint,
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
import { isAddress as isEvmAddress, toBytes } from "viem";

import { fetchBridge, getBridgeSplInstruction } from "@/lib/codama/bridge";
import { DEPLOY_ENVS, CONFIGS, type DeployEnv } from "@/lib/bridge/constants";
import { getBridgePda, getTokenVaultPda, getOutgoingMessagePda } from "@/lib/bridge/pda";
import { buildPayForRelayInstruction } from "@/lib/bridge/payForRelay";
import { checkRelayStatus } from "./actions";
import { useWalletContext } from "./WalletContext";

// A no-op TransactionSigner built from a wallet address.
function addressSigner(addr: Address): TransactionSigner {
  return {
    address: addr,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signTransactions: async (txs) => txs as any,
  };
}

type BridgeStatus =
  | { type: "idle" }
  | { type: "pending"; message: string }
  | { type: "success"; signature: string; outgoingMessage: string }
  | { type: "relayed" }
  | { type: "error"; message: string };

type FormState = {
  deployEnv: DeployEnv;
  mint: string;
  remoteToken: string;
  to: string;
  amount: string;
  payForRelay: boolean;
};

export function BridgeWidget() {
  const { connected } = useWalletContext();
  const [form, setForm] = useState<FormState>({
    deployEnv: "testnet-prod",
    mint: "constant",
    remoteToken: "constant",
    to: "",
    amount: "",
    payForRelay: true,
  });
  const [status, setStatus] = useState<BridgeStatus>({ type: "idle" });

  if (!connected) {
    return (
      <p className="text-sm text-zinc-400 border rounded-lg px-4 py-3">
        Connect your wallet to get started.
      </p>
    );
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleBridge(e: React.FormEvent) {
    e.preventDefault();
    if (!connected) return;

    setStatus({ type: "pending", message: "Validating inputs…" });

    try {
      if (!isEvmAddress(form.to)) throw new Error("Invalid Base address");
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number");

      const config = CONFIGS[form.deployEnv];
      const rpc = createSolanaRpc(config.solana.rpcUrl);
      const walletAddr = address(connected.account.address as string);
      const payer = addressSigner(walletAddr);

      const mintAddress =
        form.mint === "constant" ? config.solana.spl : address(form.mint as Address);
      const remoteTokenAddress =
        form.remoteToken === "constant"
          ? config.base.wSpl
          : (form.remoteToken as `0x${string}`);

      setStatus({ type: "pending", message: "Fetching on-chain data…" });

      const maybeMint = await fetchMaybeMint(rpc, mintAddress);
      if (!maybeMint.exists) throw new Error("Mint account not found");

      const scaledAmount = BigInt(
        Math.floor(amount * Math.pow(10, maybeMint.data.decimals))
      );

      const mintBytes = new Uint8Array(getBase58Encoder().encode(mintAddress));
      const remoteTokenBytes = toBytes(remoteTokenAddress);

      const bridgeAccount = await getBridgePda(config.solana.bridgeProgram);
      const tokenVault = await getTokenVaultPda(
        config.solana.bridgeProgram,
        mintBytes,
        remoteTokenBytes
      );
      const { salt, pubkey: outgoingMessage } = await getOutgoingMessagePda(
        config.solana.bridgeProgram
      );
      const bridge = await fetchBridge(rpc, bridgeAccount);

      const [ataAddress] = await findAssociatedTokenPda(
        { owner: walletAddr, tokenProgram: maybeMint.programAddress, mint: mintAddress },
        { programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS }
      );
      const maybeAta = await fetchMaybeToken(rpc, ataAddress);
      if (!maybeAta.exists) {
        throw new Error("Token account not found. Create an associated token account first.");
      }

      setStatus({ type: "pending", message: "Building transaction…" });

      const ixs: Instruction[] = [
        getBridgeSplInstruction(
          {
            payer,
            from: payer,
            gasFeeReceiver: bridge.data.gasConfig.gasFeeReceiver,
            mint: mintAddress,
            fromTokenAccount: maybeAta.address,
            tokenVault,
            bridge: bridgeAccount,
            outgoingMessage,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
            systemProgram: SYSTEM_PROGRAM_ADDRESS,
            outgoingMessageSalt: salt,
            to: toBytes(form.to as `0x${string}`),
            remoteToken: remoteTokenBytes,
            amount: scaledAmount,
            call: null,
          },
          { programAddress: config.solana.bridgeProgram }
        ),
      ];

      if (form.payForRelay) {
        ixs.push(
          await buildPayForRelayInstruction(form.deployEnv, outgoingMessage, payer)
        );
      }

      const { value: blockhashValue } = await rpc.getLatestBlockhash().send();

      const msg0 = createTransactionMessage({ version: 0 as const });
      const msg1 = setTransactionMessageFeePayer(walletAddr, msg0);
      const msg2 = setTransactionMessageLifetimeUsingBlockhash(blockhashValue, msg1);
      const msg3 = appendTransactionMessageInstructions(ixs, msg2);

      type TxInput = Parameters<typeof compileTransaction>[0];
      const tx = compileTransaction(msg3 as unknown as TxInput);
      const base64 = getBase64EncodedWireTransaction(
        tx as Parameters<typeof getBase64EncodedWireTransaction>[0]
      );
      const txBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      setStatus({ type: "pending", message: "Waiting for wallet approval…" });

      const signAndSend = getWalletFeature(
        connected.wallet,
        SolanaSignAndSendTransaction
      ) as SolanaSignAndSendTransactionFeature[typeof SolanaSignAndSendTransaction] | undefined;

      if (!signAndSend) {
        throw new Error(`${connected.wallet.name} does not support signAndSendTransaction`);
      }

      const cluster = config.solana.cluster === "mainnet" ? "mainnet" : "devnet";
      const [{ signature }] = await signAndSend.signAndSendTransaction({
        transaction: txBytes,
        account: connected.account,
        chain: `solana:${cluster}`,
      });

      const sigBase58 = getBase58Codec().decode(new Uint8Array(signature));

      setStatus({ type: "success", signature: sigBase58, outgoingMessage });

      if (form.payForRelay) startRelayPolling(form.deployEnv, outgoingMessage);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isRejected =
        msg.includes("User rejected") ||
        msg.includes("User denied") ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e as any)?.code === 4001;
      setStatus({
        type: "error",
        message: isRejected ? "Transaction rejected." : msg.split("\n")[0],
      });
    }
  }

  function startRelayPolling(deployEnv: string, outgoingMessage: string) {
    const MAX_POLLS = 60;
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      try {
        const relayed = await checkRelayStatus(deployEnv, outgoingMessage);
        if (relayed) {
          clearInterval(interval);
          setStatus({ type: "relayed" });
        }
      } catch {
        // swallow transient errors, keep polling
      }
      if (count >= MAX_POLLS) clearInterval(interval);
    }, 10_000);
  }

  return (
    <form onSubmit={handleBridge} className="flex flex-col gap-4">
      <Field label="Environment">
        <select
          value={form.deployEnv}
          onChange={(e) => setField("deployEnv", e.target.value as DeployEnv)}
          className={inputCls}
        >
          {DEPLOY_ENVS.map((env) => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
      </Field>

      <Field label="Mint" hint="Solana address, or 'constant' for the default test SPL">
        <input
          value={form.mint}
          onChange={(e) => setField("mint", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Remote Token" hint="ERC-20 address on Base, or 'constant' for default">
        <input
          value={form.remoteToken}
          onChange={(e) => setField("remoteToken", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Recipient (Base address)">
        <input
          value={form.to}
          onChange={(e) => setField("to", e.target.value)}
          placeholder="0x…"
          required
          className={inputCls}
        />
      </Field>

      <Field label="Amount">
        <input
          value={form.amount}
          onChange={(e) => setField("amount", e.target.value)}
          type="number"
          step="any"
          min="0"
          required
          className={inputCls}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.payForRelay}
          onChange={(e) => setField("payForRelay", e.target.checked)}
          className="accent-black"
        />
        Pay for relay (recommended)
      </label>

      <button
        type="submit"
        disabled={status.type === "pending"}
        className="h-11 rounded-full bg-black text-white text-sm font-medium px-6 disabled:opacity-50 transition-opacity"
      >
        {status.type === "pending" ? status.message : "Bridge →"}
      </button>

      {status.type === "success" && (
        <StatusBox variant="success">
          <p className="font-medium">Transaction confirmed</p>
          <p className="font-mono text-xs mt-1 break-all opacity-80">{status.signature}</p>
          <p className="mt-2 opacity-70 text-xs">Waiting for automatic relay to Base…</p>
        </StatusBox>
      )}

      {status.type === "relayed" && (
        <StatusBox variant="success">
          <p className="font-medium">Relayed to Base successfully!</p>
        </StatusBox>
      )}

      {status.type === "error" && (
        <StatusBox variant="error">
          <p className="font-medium">Error</p>
          <p className="mt-1 text-sm">{status.message}</p>
        </StatusBox>
      )}
    </form>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  "border rounded-lg px-3 py-2 w-full text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function StatusBox({
  variant,
  children,
}: {
  variant: "success" | "error";
  children: React.ReactNode;
}) {
  const cls =
    variant === "success"
      ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 text-green-800 dark:text-green-300"
      : "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 text-red-800 dark:text-red-300";
  return <div className={`rounded-lg border p-4 text-sm ${cls}`}>{children}</div>;
}
