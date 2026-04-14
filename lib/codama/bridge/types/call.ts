import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU128Decoder,
  getU128Encoder,
  getU32Decoder,
  getU32Encoder,
  type Codec,
  type Decoder,
  type Encoder,
  type ReadonlyUint8Array,
} from "@solana/kit";
import {
  getCallTypeDecoder,
  getCallTypeEncoder,
  type CallType,
  type CallTypeArgs,
} from "./callType";

export type Call = {
  ty: CallType;
  to: ReadonlyUint8Array;
  value: bigint;
  data: ReadonlyUint8Array;
};

export type CallArgs = {
  ty: CallTypeArgs;
  to: ReadonlyUint8Array;
  value: number | bigint;
  data: ReadonlyUint8Array;
};

export function getCallEncoder(): Encoder<CallArgs> {
  return getStructEncoder([
    ["ty", getCallTypeEncoder()],
    ["to", fixEncoderSize(getBytesEncoder(), 20)],
    ["value", getU128Encoder()],
    ["data", addEncoderSizePrefix(getBytesEncoder(), getU32Encoder())],
  ]);
}

export function getCallDecoder(): Decoder<Call> {
  return getStructDecoder([
    ["ty", getCallTypeDecoder()],
    ["to", fixDecoderSize(getBytesDecoder(), 20)],
    ["value", getU128Decoder()],
    ["data", addDecoderSizePrefix(getBytesDecoder(), getU32Decoder())],
  ]);
}

export function getCallCodec(): Codec<CallArgs, Call> {
  return combineCodec(getCallEncoder(), getCallDecoder());
}
