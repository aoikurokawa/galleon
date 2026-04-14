// Copied from @base/bridge/clients/ts/src/bridge/generated/instructions/bridgeSpl.ts

import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type AccountMeta,
  type AccountSignerMeta,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type Instruction,
  type InstructionWithAccounts,
  type InstructionWithData,
  type Option,
  type OptionOrNullable,
  type ReadonlyAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from "@solana/kit";
import { getAccountMetaFactory, type ResolvedAccount } from "../shared";
import { getCallDecoder, getCallEncoder, type Call, type CallArgs } from "./types/call";

export const BRIDGE_SPL_DISCRIMINATOR = new Uint8Array([87, 109, 172, 103, 8, 187, 223, 126]);

export type BridgeSplInstruction<
  TProgram extends string = string,
  TAccountPayer extends string | AccountMeta<string> = string,
  TAccountFrom extends string | AccountMeta<string> = string,
  TAccountGasFeeReceiver extends string | AccountMeta<string> = string,
  TAccountMint extends string | AccountMeta<string> = string,
  TAccountFromTokenAccount extends string | AccountMeta<string> = string,
  TAccountBridge extends string | AccountMeta<string> = string,
  TAccountTokenVault extends string | AccountMeta<string> = string,
  TAccountOutgoingMessage extends string | AccountMeta<string> = string,
  TAccountTokenProgram extends string | AccountMeta<string> = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  TAccountSystemProgram extends string | AccountMeta<string> = "11111111111111111111111111111111",
  TRemainingAccounts extends readonly AccountMeta<string>[] = [],
> = Instruction<TProgram> &
  InstructionWithData<ReadonlyUint8Array> &
  InstructionWithAccounts<
    [
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> & AccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountFrom extends string
        ? WritableSignerAccount<TAccountFrom> & AccountSignerMeta<TAccountFrom>
        : TAccountFrom,
      TAccountGasFeeReceiver extends string ? WritableAccount<TAccountGasFeeReceiver> : TAccountGasFeeReceiver,
      TAccountMint extends string ? WritableAccount<TAccountMint> : TAccountMint,
      TAccountFromTokenAccount extends string ? WritableAccount<TAccountFromTokenAccount> : TAccountFromTokenAccount,
      TAccountBridge extends string ? WritableAccount<TAccountBridge> : TAccountBridge,
      TAccountTokenVault extends string ? WritableAccount<TAccountTokenVault> : TAccountTokenVault,
      TAccountOutgoingMessage extends string ? WritableAccount<TAccountOutgoingMessage> : TAccountOutgoingMessage,
      TAccountTokenProgram extends string ? ReadonlyAccount<TAccountTokenProgram> : TAccountTokenProgram,
      TAccountSystemProgram extends string ? ReadonlyAccount<TAccountSystemProgram> : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type BridgeSplInstructionData = {
  discriminator: ReadonlyUint8Array;
  outgoingMessageSalt: ReadonlyUint8Array;
  to: ReadonlyUint8Array;
  remoteToken: ReadonlyUint8Array;
  amount: bigint;
  call: Option<Call>;
};

export type BridgeSplInstructionDataArgs = {
  outgoingMessageSalt: ReadonlyUint8Array;
  to: ReadonlyUint8Array;
  remoteToken: ReadonlyUint8Array;
  amount: number | bigint;
  call: OptionOrNullable<CallArgs>;
};

export function getBridgeSplInstructionDataEncoder(): Encoder<BridgeSplInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
      ["outgoingMessageSalt", fixEncoderSize(getBytesEncoder(), 32)],
      ["to", fixEncoderSize(getBytesEncoder(), 20)],
      ["remoteToken", fixEncoderSize(getBytesEncoder(), 20)],
      ["amount", getU64Encoder()],
      ["call", getOptionEncoder(getCallEncoder())],
    ]),
    (value) => ({ ...value, discriminator: BRIDGE_SPL_DISCRIMINATOR })
  );
}

export function getBridgeSplInstructionDataDecoder(): Decoder<BridgeSplInstructionData> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["outgoingMessageSalt", fixDecoderSize(getBytesDecoder(), 32)],
    ["to", fixDecoderSize(getBytesDecoder(), 20)],
    ["remoteToken", fixDecoderSize(getBytesDecoder(), 20)],
    ["amount", getU64Decoder()],
    ["call", getOptionDecoder(getCallDecoder())],
  ]);
}

export function getBridgeSplInstructionDataCodec(): Codec<BridgeSplInstructionDataArgs, BridgeSplInstructionData> {
  return combineCodec(getBridgeSplInstructionDataEncoder(), getBridgeSplInstructionDataDecoder());
}

export type BridgeSplInput<
  TAccountPayer extends string = string,
  TAccountFrom extends string = string,
  TAccountGasFeeReceiver extends string = string,
  TAccountMint extends string = string,
  TAccountFromTokenAccount extends string = string,
  TAccountBridge extends string = string,
  TAccountTokenVault extends string = string,
  TAccountOutgoingMessage extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  payer: TransactionSigner<TAccountPayer>;
  from: TransactionSigner<TAccountFrom>;
  gasFeeReceiver: Address<TAccountGasFeeReceiver>;
  mint: Address<TAccountMint>;
  fromTokenAccount: Address<TAccountFromTokenAccount>;
  bridge: Address<TAccountBridge>;
  tokenVault: Address<TAccountTokenVault>;
  outgoingMessage: Address<TAccountOutgoingMessage>;
  tokenProgram?: Address<TAccountTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  outgoingMessageSalt: BridgeSplInstructionDataArgs["outgoingMessageSalt"];
  to: BridgeSplInstructionDataArgs["to"];
  remoteToken: BridgeSplInstructionDataArgs["remoteToken"];
  amount: BridgeSplInstructionDataArgs["amount"];
  call: BridgeSplInstructionDataArgs["call"];
};

export function getBridgeSplInstruction<
  TAccountPayer extends string,
  TAccountFrom extends string,
  TAccountGasFeeReceiver extends string,
  TAccountMint extends string,
  TAccountFromTokenAccount extends string,
  TAccountBridge extends string,
  TAccountTokenVault extends string,
  TAccountOutgoingMessage extends string,
  TAccountTokenProgram extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = Address,
>(
  input: BridgeSplInput<
    TAccountPayer,
    TAccountFrom,
    TAccountGasFeeReceiver,
    TAccountMint,
    TAccountFromTokenAccount,
    TAccountBridge,
    TAccountTokenVault,
    TAccountOutgoingMessage,
    TAccountTokenProgram,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): BridgeSplInstruction<
  TProgramAddress,
  TAccountPayer,
  TAccountFrom,
  TAccountGasFeeReceiver,
  TAccountMint,
  TAccountFromTokenAccount,
  TAccountBridge,
  TAccountTokenVault,
  TAccountOutgoingMessage,
  TAccountTokenProgram,
  TAccountSystemProgram
> {
  const programAddress = (config?.programAddress ?? "") as TProgramAddress;

  const originalAccounts = {
    payer: { value: input.payer ?? null, isWritable: true },
    from: { value: input.from ?? null, isWritable: true },
    gasFeeReceiver: { value: input.gasFeeReceiver ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: true },
    fromTokenAccount: { value: input.fromTokenAccount ?? null, isWritable: true },
    bridge: { value: input.bridge ?? null, isWritable: true },
    tokenVault: { value: input.tokenVault ?? null, isWritable: true },
    outgoingMessage: { value: input.outgoingMessage ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<keyof typeof originalAccounts, ResolvedAccount>;

  const args = { ...input };

  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value = "11111111111111111111111111111111" as Address;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
  return Object.freeze({
    accounts: [
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.from),
      getAccountMeta(accounts.gasFeeReceiver),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.fromTokenAccount),
      getAccountMeta(accounts.bridge),
      getAccountMeta(accounts.tokenVault),
      getAccountMeta(accounts.outgoingMessage),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    data: getBridgeSplInstructionDataEncoder().encode(args as BridgeSplInstructionDataArgs),
    programAddress,
  } as BridgeSplInstruction<
    TProgramAddress,
    TAccountPayer,
    TAccountFrom,
    TAccountGasFeeReceiver,
    TAccountMint,
    TAccountFromTokenAccount,
    TAccountBridge,
    TAccountTokenVault,
    TAccountOutgoingMessage,
    TAccountTokenProgram,
    TAccountSystemProgram
  >);
}
