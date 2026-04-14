import {
  combineCodec,
  getDiscriminatedUnionDecoder,
  getDiscriminatedUnionEncoder,
  getStructDecoder,
  getStructEncoder,
  getTupleDecoder,
  getTupleEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from "@solana/kit";
import {
  getBridgeSolanaToBaseStateOutgoingMessageTransferDecoder,
  getBridgeSolanaToBaseStateOutgoingMessageTransferEncoder,
  type BridgeSolanaToBaseStateOutgoingMessageTransfer,
  type BridgeSolanaToBaseStateOutgoingMessageTransferArgs,
} from "./bridgeSolanaToBaseStateOutgoingMessageTransfer";
import { getCallDecoder, getCallEncoder, type Call, type CallArgs } from "./call";

export type BridgeSolanaToBaseStateOutgoingMessageMessage =
  | { __kind: "Call"; fields: readonly [Call] }
  | { __kind: "Transfer"; fields: readonly [BridgeSolanaToBaseStateOutgoingMessageTransfer] };

export type BridgeSolanaToBaseStateOutgoingMessageMessageArgs =
  | { __kind: "Call"; fields: readonly [CallArgs] }
  | { __kind: "Transfer"; fields: readonly [BridgeSolanaToBaseStateOutgoingMessageTransferArgs] };

export function getBridgeSolanaToBaseStateOutgoingMessageMessageEncoder(): Encoder<BridgeSolanaToBaseStateOutgoingMessageMessageArgs> {
  return getDiscriminatedUnionEncoder([
    ["Call", getStructEncoder([["fields", getTupleEncoder([getCallEncoder()])]])],
    [
      "Transfer",
      getStructEncoder([
        ["fields", getTupleEncoder([getBridgeSolanaToBaseStateOutgoingMessageTransferEncoder()])],
      ]),
    ],
  ]);
}

export function getBridgeSolanaToBaseStateOutgoingMessageMessageDecoder(): Decoder<BridgeSolanaToBaseStateOutgoingMessageMessage> {
  return getDiscriminatedUnionDecoder([
    ["Call", getStructDecoder([["fields", getTupleDecoder([getCallDecoder()])]])],
    [
      "Transfer",
      getStructDecoder([
        ["fields", getTupleDecoder([getBridgeSolanaToBaseStateOutgoingMessageTransferDecoder()])],
      ]),
    ],
  ]);
}

export function getBridgeSolanaToBaseStateOutgoingMessageMessageCodec(): Codec<
  BridgeSolanaToBaseStateOutgoingMessageMessageArgs,
  BridgeSolanaToBaseStateOutgoingMessageMessage
> {
  return combineCodec(
    getBridgeSolanaToBaseStateOutgoingMessageMessageEncoder(),
    getBridgeSolanaToBaseStateOutgoingMessageMessageDecoder()
  );
}
