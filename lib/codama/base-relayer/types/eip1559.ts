import {
  combineCodec,
  getI64Decoder,
  getI64Encoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  type FixedSizeCodec,
  type FixedSizeDecoder,
  type FixedSizeEncoder,
} from "@solana/kit";
import {
  getEip1559ConfigDecoder,
  getEip1559ConfigEncoder,
  type Eip1559Config,
  type Eip1559ConfigArgs,
} from "./eip1559Config";

export type Eip1559 = {
  config: Eip1559Config;
  currentBaseFee: bigint;
  currentWindowGasUsed: bigint;
  windowStartTime: bigint;
};

export type Eip1559Args = {
  config: Eip1559ConfigArgs;
  currentBaseFee: number | bigint;
  currentWindowGasUsed: number | bigint;
  windowStartTime: number | bigint;
};

export function getEip1559Encoder(): FixedSizeEncoder<Eip1559Args> {
  return getStructEncoder([
    ["config", getEip1559ConfigEncoder()],
    ["currentBaseFee", getU64Encoder()],
    ["currentWindowGasUsed", getU64Encoder()],
    ["windowStartTime", getI64Encoder()],
  ]);
}

export function getEip1559Decoder(): FixedSizeDecoder<Eip1559> {
  return getStructDecoder([
    ["config", getEip1559ConfigDecoder()],
    ["currentBaseFee", getU64Decoder()],
    ["currentWindowGasUsed", getU64Decoder()],
    ["windowStartTime", getI64Decoder()],
  ]);
}

export function getEip1559Codec(): FixedSizeCodec<Eip1559Args, Eip1559> {
  return combineCodec(getEip1559Encoder(), getEip1559Decoder());
}
