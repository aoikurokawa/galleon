// Copied from @base/bridge/clients/ts/src/bridge/generated/accounts/
// bridge.ts + outgoingMessage.ts

import {
  assertAccountExists,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
  getBooleanDecoder,
  getBooleanEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Account,
  type Address,
  type EncodedAccount,
  type FetchAccountConfig,
  type FixedSizeCodec,
  type FixedSizeDecoder,
  type FixedSizeEncoder,
  type MaybeAccount,
  type MaybeEncodedAccount,
  type ReadonlyUint8Array,
  type Codec,
  type Decoder,
  type Encoder,
} from "@solana/kit";
import {
  getBaseOracleConfigDecoder,
  getBaseOracleConfigEncoder,
  getBufferConfigDecoder,
  getBufferConfigEncoder,
  getEip1559Decoder,
  getEip1559Encoder,
  getGasConfigDecoder,
  getGasConfigEncoder,
  getPartnerOracleConfigDecoder,
  getPartnerOracleConfigEncoder,
  getProtocolConfigDecoder,
  getProtocolConfigEncoder,
  getBridgeSolanaToBaseStateOutgoingMessageMessageDecoder,
  getBridgeSolanaToBaseStateOutgoingMessageMessageEncoder,
  type BaseOracleConfig,
  type BaseOracleConfigArgs,
  type BufferConfig,
  type BufferConfigArgs,
  type Eip1559,
  type Eip1559Args,
  type GasConfig,
  type GasConfigArgs,
  type PartnerOracleConfig,
  type PartnerOracleConfigArgs,
  type ProtocolConfig,
  type ProtocolConfigArgs,
  type BridgeSolanaToBaseStateOutgoingMessageMessage,
  type BridgeSolanaToBaseStateOutgoingMessageMessageArgs,
} from "./types";

// ── Bridge account ────────────────────────────────────────────────────────────

export const BRIDGE_DISCRIMINATOR = new Uint8Array([231, 232, 31, 98, 110, 3, 23, 59]);

export type Bridge = {
  discriminator: ReadonlyUint8Array;
  baseBlockNumber: bigint;
  nonce: bigint;
  guardian: Address;
  paused: boolean;
  eip1559: Eip1559;
  gasConfig: GasConfig;
  protocolConfig: ProtocolConfig;
  bufferConfig: BufferConfig;
  partnerOracleConfig: PartnerOracleConfig;
  baseOracleConfig: BaseOracleConfig;
};

export type BridgeArgs = {
  baseBlockNumber: number | bigint;
  nonce: number | bigint;
  guardian: Address;
  paused: boolean;
  eip1559: Eip1559Args;
  gasConfig: GasConfigArgs;
  protocolConfig: ProtocolConfigArgs;
  bufferConfig: BufferConfigArgs;
  partnerOracleConfig: PartnerOracleConfigArgs;
  baseOracleConfig: BaseOracleConfigArgs;
};

export function getBridgeEncoder(): FixedSizeEncoder<BridgeArgs> {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
      ["baseBlockNumber", getU64Encoder()],
      ["nonce", getU64Encoder()],
      ["guardian", getAddressEncoder()],
      ["paused", getBooleanEncoder()],
      ["eip1559", getEip1559Encoder()],
      ["gasConfig", getGasConfigEncoder()],
      ["protocolConfig", getProtocolConfigEncoder()],
      ["bufferConfig", getBufferConfigEncoder()],
      ["partnerOracleConfig", getPartnerOracleConfigEncoder()],
      ["baseOracleConfig", getBaseOracleConfigEncoder()],
    ]),
    (value) => ({ ...value, discriminator: BRIDGE_DISCRIMINATOR })
  );
}

export function getBridgeDecoder(): FixedSizeDecoder<Bridge> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["baseBlockNumber", getU64Decoder()],
    ["nonce", getU64Decoder()],
    ["guardian", getAddressDecoder()],
    ["paused", getBooleanDecoder()],
    ["eip1559", getEip1559Decoder()],
    ["gasConfig", getGasConfigDecoder()],
    ["protocolConfig", getProtocolConfigDecoder()],
    ["bufferConfig", getBufferConfigDecoder()],
    ["partnerOracleConfig", getPartnerOracleConfigDecoder()],
    ["baseOracleConfig", getBaseOracleConfigDecoder()],
  ]);
}

export function getBridgeCodec(): FixedSizeCodec<BridgeArgs, Bridge> {
  return combineCodec(getBridgeEncoder(), getBridgeDecoder());
}

export function decodeBridge<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<Bridge, TAddress> | MaybeAccount<Bridge, TAddress> {
  return decodeAccount(encodedAccount as MaybeEncodedAccount<TAddress>, getBridgeDecoder());
}

export async function fetchBridge<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<Bridge, TAddress>> {
  const maybeEncoded = await fetchEncodedAccount(rpc, address, config);
  const maybe = decodeAccount(maybeEncoded, getBridgeDecoder()) as MaybeAccount<Bridge, TAddress>;
  assertAccountExists(maybe);
  return maybe;
}

// ── OutgoingMessage account ───────────────────────────────────────────────────

export const OUTGOING_MESSAGE_DISCRIMINATOR = new Uint8Array([150, 255, 197, 226, 200, 215, 31, 29]);

export type OutgoingMessage = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  sender: Address;
  message: BridgeSolanaToBaseStateOutgoingMessageMessage;
};

export type OutgoingMessageArgs = {
  nonce: number | bigint;
  sender: Address;
  message: BridgeSolanaToBaseStateOutgoingMessageMessageArgs;
};

export function getOutgoingMessageEncoder(): Encoder<OutgoingMessageArgs> {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
      ["nonce", getU64Encoder()],
      ["sender", getAddressEncoder()],
      ["message", getBridgeSolanaToBaseStateOutgoingMessageMessageEncoder()],
    ]),
    (value) => ({ ...value, discriminator: OUTGOING_MESSAGE_DISCRIMINATOR })
  );
}

export function getOutgoingMessageDecoder(): Decoder<OutgoingMessage> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["nonce", getU64Decoder()],
    ["sender", getAddressDecoder()],
    ["message", getBridgeSolanaToBaseStateOutgoingMessageMessageDecoder()],
  ]);
}

export function getOutgoingMessageCodec(): Codec<OutgoingMessageArgs, OutgoingMessage> {
  return combineCodec(getOutgoingMessageEncoder(), getOutgoingMessageDecoder());
}

export function decodeOutgoingMessage<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<OutgoingMessage, TAddress> | MaybeAccount<OutgoingMessage, TAddress> {
  return decodeAccount(encodedAccount as MaybeEncodedAccount<TAddress>, getOutgoingMessageDecoder());
}

export async function fetchOutgoingMessage<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<OutgoingMessage, TAddress>> {
  const maybeEncoded = await fetchEncodedAccount(rpc, address, config);
  const maybe = decodeAccount(maybeEncoded, getOutgoingMessageDecoder()) as MaybeAccount<OutgoingMessage, TAddress>;
  assertAccountExists(maybe);
  return maybe;
}
