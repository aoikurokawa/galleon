import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type Option,
  type OptionOrNullable,
  type ReadonlyUint8Array,
} from "@solana/kit";
import { getCallDecoder, getCallEncoder, type Call, type CallArgs } from "./call";

export type BridgeSolanaToBaseStateOutgoingMessageTransfer = {
  to: ReadonlyUint8Array;
  localToken: Address;
  remoteToken: ReadonlyUint8Array;
  amount: bigint;
  call: Option<Call>;
};

export type BridgeSolanaToBaseStateOutgoingMessageTransferArgs = {
  to: ReadonlyUint8Array;
  localToken: Address;
  remoteToken: ReadonlyUint8Array;
  amount: number | bigint;
  call: OptionOrNullable<CallArgs>;
};

export function getBridgeSolanaToBaseStateOutgoingMessageTransferEncoder(): Encoder<BridgeSolanaToBaseStateOutgoingMessageTransferArgs> {
  return getStructEncoder([
    ["to", fixEncoderSize(getBytesEncoder(), 20)],
    ["localToken", getAddressEncoder()],
    ["remoteToken", fixEncoderSize(getBytesEncoder(), 20)],
    ["amount", getU64Encoder()],
    ["call", getOptionEncoder(getCallEncoder())],
  ]);
}

export function getBridgeSolanaToBaseStateOutgoingMessageTransferDecoder(): Decoder<BridgeSolanaToBaseStateOutgoingMessageTransfer> {
  return getStructDecoder([
    ["to", fixDecoderSize(getBytesDecoder(), 20)],
    ["localToken", getAddressDecoder()],
    ["remoteToken", fixDecoderSize(getBytesDecoder(), 20)],
    ["amount", getU64Decoder()],
    ["call", getOptionDecoder(getCallDecoder())],
  ]);
}

export function getBridgeSolanaToBaseStateOutgoingMessageTransferCodec(): Codec<
  BridgeSolanaToBaseStateOutgoingMessageTransferArgs,
  BridgeSolanaToBaseStateOutgoingMessageTransfer
> {
  return combineCodec(
    getBridgeSolanaToBaseStateOutgoingMessageTransferEncoder(),
    getBridgeSolanaToBaseStateOutgoingMessageTransferDecoder()
  );
}
