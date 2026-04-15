"use client";

import { useState } from "react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  toHex,
  type Address as EvmAddress,
  type WalletClient,
  type Chain,
} from "viem";
import { isAddress as isEvmAddress } from "viem";
import { address as solAddress, createSolanaRpc, getBase58Encoder } from "@solana/kit";
import { fetchMaybeMint } from "@solana-program/token";
import { DEPLOY_ENVS, CONFIGS, type DeployEnv } from "@/lib/bridge/constants";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

// ── ABIs ─────────────────────────────────────────────────────────────────────

const ERC20_ABI = [
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const BRIDGE_TOKEN_ABI = [
  {
    name: "bridgeToken",
    type: "function",
    inputs: [
      {
        name: "transfer",
        type: "tuple",
        components: [
          { name: "localToken", type: "address" },
          { name: "remoteToken", type: "bytes32" },
          { name: "to", type: "bytes32" },
          { name: "remoteAmount", type: "uint64" },
        ],
      },
      {
        name: "ixs",
        type: "tuple[]",
        components: [
          { name: "programId", type: "bytes32" },
          { name: "serializedAccounts", type: "bytes[]" },
          { name: "data", type: "bytes" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function solanaAddressToBytes32(addr: string): `0x${string}` {
  const bytes = new Uint8Array(getBase58Encoder().encode(addr as ReturnType<typeof solAddress>));
  return toHex(bytes, { size: 32 });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type BridgeStatus =
  | { type: "idle" }
  | { type: "pending"; message: string }
  | { type: "success"; txHash: string }
  | { type: "error"; message: string };

type FormState = {
  deployEnv: DeployEnv;
  localToken: string;
  remoteToken: string;
  to: string;
  amount: string;
};

// ── Connected form ─────────────────────────────────────────────────────────────

function BridgeForm({
  evmAddress,
  walletClient,
  onDisconnect,
}: {
  evmAddress: EvmAddress;
  walletClient: WalletClient;
  onDisconnect: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    deployEnv: "testnet-prod",
    localToken: "constant",
    remoteToken: "constant",
    to: "",
    amount: "",
  });
  const [status, setStatus] = useState<BridgeStatus>({ type: "idle" });

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleBridge(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "pending", message: "Validating inputs…" });

    try {
      const config = CONFIGS[form.deployEnv];

      if (!form.to) throw new Error("Recipient Solana address is required");

      // Validate recipient is a valid base58 address (32 bytes)
      let recipientBytes32: `0x${string}`;
      try {
        recipientBytes32 = solanaAddressToBytes32(form.to);
      } catch {
        throw new Error("Invalid Solana recipient address");
      }

      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number");

      const localToken = form.localToken === "constant"
        ? config.base.wSpl
        : (form.localToken as EvmAddress);

      const remoteTokenSolAddress =
        form.remoteToken === "constant"
          ? config.solana.spl
          : solAddress(form.remoteToken as ReturnType<typeof solAddress>);

      const remoteTokenBytes32 = solanaAddressToBytes32(remoteTokenSolAddress);

      // Ensure wallet is on the right chain
      const chainId = await walletClient.getChainId();
      if (chainId !== config.base.chain.id) {
        setStatus({ type: "pending", message: "Switching network…" });
        await walletClient.switchChain({ id: config.base.chain.id });
      }

      const publicClient = createPublicClient({
        chain: config.base.chain as Chain,
        transport: http(),
      });

      setStatus({ type: "pending", message: "Fetching token info…" });

      // Read ERC-20 decimals from Base (fall back to 18 if not implemented)
      let erc20Decimals: number;
      try {
        erc20Decimals = await publicClient.readContract({
          address: localToken,
          abi: ERC20_ABI,
          functionName: "decimals",
        });
      } catch {
        // Some tokens don't expose decimals(); check the contract exists first
        const code = await publicClient.getBytecode({ address: localToken });
        if (!code || code === "0x") {
          throw new Error(`No contract found at ${localToken} on ${config.base.chain.name}. Check the token address and environment.`);
        }
        erc20Decimals = 18;
      }

      // Read Solana mint decimals
      const rpc = createSolanaRpc(config.solana.rpcUrl);
      const maybeMint = await fetchMaybeMint(rpc, remoteTokenSolAddress);
      if (!maybeMint.exists) throw new Error("Solana mint account not found");
      const solanaMintDecimals = maybeMint.data.decimals;

      const localAmount = parseUnits(form.amount, erc20Decimals);
      const remoteAmount = BigInt(Math.floor(amount * Math.pow(10, solanaMintDecimals)));

      // Check and set ERC-20 allowance
      const allowance = await publicClient.readContract({
        address: localToken,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [evmAddress, config.base.bridgeContract],
      });

      if (allowance < localAmount) {
        setStatus({ type: "pending", message: "Approving token spend…" });
        const approveHash = await walletClient.writeContract({
          chain: config.base.chain as Chain,
          account: evmAddress,
          address: localToken,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [config.base.bridgeContract, localAmount],
        });
        setStatus({ type: "pending", message: "Waiting for approval confirmation…" });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      setStatus({ type: "pending", message: "Sending bridge transaction…" });

      const txHash = await walletClient.writeContract({
        chain: config.base.chain as Chain,
        account: evmAddress,
        address: config.base.bridgeContract,
        abi: BRIDGE_TOKEN_ABI,
        functionName: "bridgeToken",
        args: [
          {
            localToken,
            remoteToken: remoteTokenBytes32,
            to: recipientBytes32,
            remoteAmount,
          },
          [],
        ],
        value: 0n,
      });

      setStatus({ type: "success", txHash });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isRejected =
        msg.includes("User rejected") ||
        msg.includes("User denied") ||
        msg.includes("user rejected") ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e as any)?.code === 4001;
      setStatus({
        type: "error",
        message: isRejected ? "Transaction rejected." : msg.split("\n")[0],
      });
    }
  }

  const shortAddress = `${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {/* Connected wallet header */}
      <div className="flex items-center justify-between border rounded-lg px-4 py-3">
        <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">{shortAddress}</span>
        <button
          onClick={onDisconnect}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Disconnect
        </button>
      </div>

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

        <Field label="Local Token (Base ERC-20)" hint="ERC-20 address on Base, or 'constant' for default">
          <input
            value={form.localToken}
            onChange={(e) => setField("localToken", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Remote Token (Solana mint)" hint="Solana mint address, or 'constant' for default">
          <input
            value={form.remoteToken}
            onChange={(e) => setField("remoteToken", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Recipient (Solana address)">
          <input
            value={form.to}
            onChange={(e) => setField("to", e.target.value)}
            placeholder="Solana public key…"
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

        <button
          type="submit"
          disabled={status.type === "pending"}
          className="h-11 rounded-full bg-black text-white text-sm font-medium px-6 disabled:opacity-50 transition-opacity"
        >
          {status.type === "pending" ? status.message : "Bridge →"}
        </button>
      </form>

      {status.type === "success" && (
        <StatusBox variant="success">
          <p className="font-medium">Transaction submitted</p>
          <p className="font-mono text-xs mt-1 break-all opacity-80">{status.txHash}</p>
          <p className="mt-2 opacity-70 text-xs">
            The relayer will automatically prove and relay your tokens to Solana once the Base block is finalized (~15 min).
          </p>
        </StatusBox>
      )}

      {status.type === "error" && (
        <StatusBox variant="error">
          <p className="font-medium">Error</p>
          <p className="mt-1 text-sm">{status.message}</p>
        </StatusBox>
      )}
    </div>
  );
}

// ── Root widget ───────────────────────────────────────────────────────────────

export function BaseBridgeWidget() {
  const [evmAddress, setEvmAddress] = useState<EvmAddress | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  async function connectWallet() {
    setConnectError(null);
    if (typeof window === "undefined" || !window.ethereum) {
      setConnectError("No EVM wallet detected. Install MetaMask or Coinbase Wallet.");
      return;
    }
    try {
      const client = createWalletClient({ transport: custom(window.ethereum) });
      const [addr] = await client.requestAddresses();
      setWalletClient(client);
      setEvmAddress(addr);
    } catch (e) {
      setConnectError(String(e));
    }
  }

  function disconnect() {
    setEvmAddress(null);
    setWalletClient(null);
  }

  if (!evmAddress || !walletClient) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <p className="text-sm text-zinc-500">Connect an EVM wallet to get started.</p>
        <button
          onClick={connectWallet}
          className="h-11 rounded-full bg-black text-white text-sm font-medium px-6 hover:opacity-80 transition-opacity"
        >
          Connect EVM Wallet
        </button>
        {connectError && (
          <p className="text-sm text-red-600 dark:text-red-400">{connectError}</p>
        )}
      </div>
    );
  }

  return (
    <BridgeForm
      evmAddress={evmAddress}
      walletClient={walletClient}
      onDisconnect={disconnect}
    />
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

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
