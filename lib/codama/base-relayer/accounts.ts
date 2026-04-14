// Copied from @base/bridge/clients/ts/src/base-relayer/generated/accounts/cfg.ts

import {
  assertAccountExists,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
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
} from "@solana/kit";
import {
  getEip1559Decoder,
  getEip1559Encoder,
  getGasConfigDecoder,
  getGasConfigEncoder,
  type Eip1559,
  type Eip1559Args,
  type GasConfig,
  type GasConfigArgs,
} from "./types";

export const CFG_DISCRIMINATOR = new Uint8Array([236, 69, 240, 199, 189, 123, 35, 99]);

export type Cfg = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  guardian: Address;
  eip1559: Eip1559;
  gasConfig: GasConfig;
};

export type CfgArgs = {
  nonce: number | bigint;
  guardian: Address;
  eip1559: Eip1559Args;
  gasConfig: GasConfigArgs;
};

export function getCfgEncoder(): FixedSizeEncoder<CfgArgs> {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
      ["nonce", getU64Encoder()],
      ["guardian", getAddressEncoder()],
      ["eip1559", getEip1559Encoder()],
      ["gasConfig", getGasConfigEncoder()],
    ]),
    (value) => ({ ...value, discriminator: CFG_DISCRIMINATOR })
  );
}

export function getCfgDecoder(): FixedSizeDecoder<Cfg> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["nonce", getU64Decoder()],
    ["guardian", getAddressDecoder()],
    ["eip1559", getEip1559Decoder()],
    ["gasConfig", getGasConfigDecoder()],
  ]);
}

export function getCfgCodec(): FixedSizeCodec<CfgArgs, Cfg> {
  return combineCodec(getCfgEncoder(), getCfgDecoder());
}

export function decodeCfg<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<Cfg, TAddress> | MaybeAccount<Cfg, TAddress> {
  return decodeAccount(encodedAccount as MaybeEncodedAccount<TAddress>, getCfgDecoder());
}

export async function fetchCfg<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<Cfg, TAddress>> {
  const maybeEncoded = await fetchEncodedAccount(rpc, address, config);
  const maybe = decodeAccount(maybeEncoded, getCfgDecoder()) as MaybeAccount<Cfg, TAddress>;
  assertAccountExists(maybe);
  return maybe;
}
