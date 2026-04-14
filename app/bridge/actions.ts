"use server";

import {
  address,
  createSolanaRpc,
  getBase58Encoder,
  getBase58Codec,
} from "@solana/kit";
import {
  keccak256,
  encodeAbiParameters,
  toHex,
  padHex,
  createPublicClient,
  http,
  type Hex,
} from "viem";
import { fetchOutgoingMessage } from "@base/bridge/bridge";
import { CONFIGS, type DeployEnv } from "@/lib/bridge/constants";

const SUCCESSES_ABI = [
  {
    name: "successes",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "messageHash", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// See MessageType enum in MessageLib.sol
const MessageType = { Call: 0, Transfer: 1, TransferAndCall: 2 } as const;

function bytes32FromAddress(addr: string): Hex {
  const bytes = getBase58Encoder().encode(addr);
  let hex = toHex(new Uint8Array(bytes));
  if (hex.length !== 66) hex = padHex(hex, { size: 32 });
  return hex;
}

function buildInnerHash(
  outgoing: Awaited<ReturnType<typeof fetchOutgoingMessage>>
): Hex {
  const msg = outgoing.data.message;
  const sender = bytes32FromAddress(outgoing.data.sender);

  if (msg.__kind === "Call") {
    const call = msg.fields[0];
    const data = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "ty", type: "uint8" },
            { name: "to", type: "address" },
            { name: "value", type: "uint128" },
            { name: "data", type: "bytes" },
          ],
        },
      ],
      [
        {
          ty: Number(call.ty),
          to: toHex(new Uint8Array(call.to)),
          value: BigInt(call.value),
          data: toHex(new Uint8Array(call.data)),
        },
      ]
    );
    return keccak256(
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes" }],
        [sender, MessageType.Call, data]
      )
    );
  }

  if (msg.__kind === "Transfer") {
    const transfer = msg.fields[0];
    const transferTuple = {
      localToken: toHex(new Uint8Array(transfer.remoteToken)),
      remoteToken: bytes32FromAddress(transfer.localToken),
      to: padHex(toHex(new Uint8Array(transfer.to)), { size: 32, dir: "right" }),
      remoteAmount: BigInt(transfer.amount),
    } as const;
    const encodedTransfer = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "localToken", type: "address" },
            { name: "remoteToken", type: "bytes32" },
            { name: "to", type: "bytes32" },
            { name: "remoteAmount", type: "uint64" },
          ],
        },
      ],
      [transferTuple]
    );

    if (transfer.call.__option === "None") {
      return keccak256(
        encodeAbiParameters(
          [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes" }],
          [sender, MessageType.Transfer, encodedTransfer]
        )
      );
    }

    const call = transfer.call.value;
    const callTuple = {
      ty: Number(call.ty),
      to: toHex(new Uint8Array(call.to)),
      value: BigInt(call.value),
      data: toHex(new Uint8Array(call.data)),
    };
    const data = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { name: "localToken", type: "address" },
            { name: "remoteToken", type: "bytes32" },
            { name: "to", type: "bytes32" },
            { name: "remoteAmount", type: "uint64" },
          ],
        },
        {
          type: "tuple",
          components: [
            { name: "ty", type: "uint8" },
            { name: "to", type: "address" },
            { name: "value", type: "uint128" },
            { name: "data", type: "bytes" },
          ],
        },
      ],
      [transferTuple, callTuple]
    );
    return keccak256(
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes" }],
        [sender, MessageType.TransferAndCall, data]
      )
    );
  }

  throw new Error("Unsupported outgoing message type");
}

export async function checkRelayStatus(
  deployEnv: string,
  outgoingMessageAddress: string
): Promise<boolean> {
  const config = CONFIGS[deployEnv as DeployEnv];
  const rpc = createSolanaRpc(config.solana.rpcUrl);

  const outgoing = await fetchOutgoingMessage(
    rpc,
    address(outgoingMessageAddress)
  );

  const nonce = BigInt(outgoing.data.nonce);
  const innerHash = buildInnerHash(outgoing);

  const pubkeyBytes = getBase58Encoder().encode(address(outgoingMessageAddress));
  const pubkeyHex = padHex(toHex(new Uint8Array(pubkeyBytes)), { size: 32 });

  const outerHash = keccak256(
    encodeAbiParameters(
      [{ type: "uint64" }, { type: "bytes32" }, { type: "bytes32" }],
      [nonce, pubkeyHex, innerHash]
    )
  );

  const publicClient = createPublicClient({
    chain: config.base.chain,
    transport: http(),
  });

  const isSuccessful = await publicClient.readContract({
    address: config.base.bridgeContract,
    abi: SUCCESSES_ABI,
    functionName: "successes",
    args: [outerHash],
  });

  return isSuccessful;
}
