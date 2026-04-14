import {
  getProgramDerivedAddress,
  type Address,
} from "@solana/kit";

import {
  BRIDGE_SEED,
  OUTGOING_MESSAGE_SEED,
  TOKEN_VAULT_SEED,
  CFG_SEED,
  MTR_SEED,
} from "./seeds";

export async function getBridgePda(bridgeProgram: Address) {
  const [pda] = await getProgramDerivedAddress({
    programAddress: bridgeProgram,
    seeds: [BRIDGE_SEED],
  });
  return pda;
}

export async function getTokenVaultPda(
  bridgeProgram: Address,
  mintBytes: Uint8Array,
  remoteTokenBytes: Uint8Array
) {
  const [pda] = await getProgramDerivedAddress({
    programAddress: bridgeProgram,
    seeds: [TOKEN_VAULT_SEED, mintBytes, remoteTokenBytes],
  });
  return pda;
}

export async function getOutgoingMessagePda(
  bridgeProgram: Address,
  salt?: Uint8Array
) {
  const s = salt ?? crypto.getRandomValues(new Uint8Array(32));
  const [pubkey] = await getProgramDerivedAddress({
    programAddress: bridgeProgram,
    seeds: [OUTGOING_MESSAGE_SEED, s],
  });
  return { salt: s, pubkey };
}

export async function getBaseRelayerCfgPda(baseRelayerProgram: Address) {
  const [pda] = await getProgramDerivedAddress({
    programAddress: baseRelayerProgram,
    seeds: [CFG_SEED],
  });
  return pda;
}

export async function getMtrPda(
  baseRelayerProgram: Address,
  salt?: Uint8Array
) {
  const s = salt ?? crypto.getRandomValues(new Uint8Array(32));
  const [pubkey] = await getProgramDerivedAddress({
    programAddress: baseRelayerProgram,
    seeds: [MTR_SEED, s],
  });
  return { salt: s, pubkey };
}
