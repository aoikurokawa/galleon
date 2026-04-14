// Copied from @base/bridge/clients/ts/src/base-relayer/generated/instructions/payForRelay.ts

import {
  combineCodec,
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
  type AccountMeta,
  type AccountSignerMeta,
  type Address,
  type FixedSizeCodec,
  type FixedSizeDecoder,
  type FixedSizeEncoder,
  type Instruction,
  type InstructionWithAccounts,
  type InstructionWithData,
  type ReadonlyAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from "@solana/kit";
import { getAccountMetaFactory, type ResolvedAccount } from "../shared";

export const PAY_FOR_RELAY_DISCRIMINATOR = new Uint8Array([41, 191, 218, 201, 250, 164, 156, 55]);

export type PayForRelayInstruction<
  TProgram extends string = string,
  TAccountPayer extends string | AccountMeta<string> = string,
  TAccountCfg extends string | AccountMeta<string> = string,
  TAccountGasFeeReceiver extends string | AccountMeta<string> = string,
  TAccountMessageToRelay extends string | AccountMeta<string> = string,
  TAccountSystemProgram extends string | AccountMeta<string> = "11111111111111111111111111111111",
  TRemainingAccounts extends readonly AccountMeta<string>[] = [],
> = Instruction<TProgram> &
  InstructionWithData<ReadonlyUint8Array> &
  InstructionWithAccounts<
    [
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> & AccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountCfg extends string ? WritableAccount<TAccountCfg> : TAccountCfg,
      TAccountGasFeeReceiver extends string ? WritableAccount<TAccountGasFeeReceiver> : TAccountGasFeeReceiver,
      TAccountMessageToRelay extends string ? WritableAccount<TAccountMessageToRelay> : TAccountMessageToRelay,
      TAccountSystemProgram extends string ? ReadonlyAccount<TAccountSystemProgram> : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type PayForRelayInstructionData = {
  discriminator: ReadonlyUint8Array;
  mtrSalt: ReadonlyUint8Array;
  outgoingMessage: Address;
  gasLimit: bigint;
};

export type PayForRelayInstructionDataArgs = {
  mtrSalt: ReadonlyUint8Array;
  outgoingMessage: Address;
  gasLimit: number | bigint;
};

export function getPayForRelayInstructionDataEncoder(): FixedSizeEncoder<PayForRelayInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
      ["mtrSalt", fixEncoderSize(getBytesEncoder(), 32)],
      ["outgoingMessage", getAddressEncoder()],
      ["gasLimit", getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: PAY_FOR_RELAY_DISCRIMINATOR })
  );
}

export function getPayForRelayInstructionDataDecoder(): FixedSizeDecoder<PayForRelayInstructionData> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["mtrSalt", fixDecoderSize(getBytesDecoder(), 32)],
    ["outgoingMessage", getAddressDecoder()],
    ["gasLimit", getU64Decoder()],
  ]);
}

export function getPayForRelayInstructionDataCodec(): FixedSizeCodec<
  PayForRelayInstructionDataArgs,
  PayForRelayInstructionData
> {
  return combineCodec(getPayForRelayInstructionDataEncoder(), getPayForRelayInstructionDataDecoder());
}

export type PayForRelayInput<
  TAccountPayer extends string = string,
  TAccountCfg extends string = string,
  TAccountGasFeeReceiver extends string = string,
  TAccountMessageToRelay extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  payer: TransactionSigner<TAccountPayer>;
  cfg: Address<TAccountCfg>;
  gasFeeReceiver: Address<TAccountGasFeeReceiver>;
  messageToRelay: Address<TAccountMessageToRelay>;
  systemProgram?: Address<TAccountSystemProgram>;
  mtrSalt: PayForRelayInstructionDataArgs["mtrSalt"];
  outgoingMessage: PayForRelayInstructionDataArgs["outgoingMessage"];
  gasLimit: PayForRelayInstructionDataArgs["gasLimit"];
};

export function getPayForRelayInstruction<
  TAccountPayer extends string,
  TAccountCfg extends string,
  TAccountGasFeeReceiver extends string,
  TAccountMessageToRelay extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = Address,
>(
  input: PayForRelayInput<
    TAccountPayer,
    TAccountCfg,
    TAccountGasFeeReceiver,
    TAccountMessageToRelay,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): PayForRelayInstruction<
  TProgramAddress,
  TAccountPayer,
  TAccountCfg,
  TAccountGasFeeReceiver,
  TAccountMessageToRelay,
  TAccountSystemProgram
> {
  const programAddress = (config?.programAddress ?? "") as TProgramAddress;

  const originalAccounts = {
    payer: { value: input.payer ?? null, isWritable: true },
    cfg: { value: input.cfg ?? null, isWritable: true },
    gasFeeReceiver: { value: input.gasFeeReceiver ?? null, isWritable: true },
    messageToRelay: { value: input.messageToRelay ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<keyof typeof originalAccounts, ResolvedAccount>;

  const args = { ...input };

  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111" as Address;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
  return Object.freeze({
    accounts: [
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.cfg),
      getAccountMeta(accounts.gasFeeReceiver),
      getAccountMeta(accounts.messageToRelay),
      getAccountMeta(accounts.systemProgram),
    ],
    data: getPayForRelayInstructionDataEncoder().encode(args as PayForRelayInstructionDataArgs),
    programAddress,
  } as PayForRelayInstruction<
    TProgramAddress,
    TAccountPayer,
    TAccountCfg,
    TAccountGasFeeReceiver,
    TAccountMessageToRelay,
    TAccountSystemProgram
  >);
}
