import {
  createSolanaRpc,
  type Address,
  type TransactionSigner,
} from "@solana/kit";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
import { fetchCfg, getPayForRelayInstruction } from "@base/bridge/base-relayer";

import { CONFIGS, type DeployEnv } from "./constants";
import { getBaseRelayerCfgPda, getMtrPda } from "./pda";

export async function buildPayForRelayInstruction(
  env: DeployEnv,
  outgoingMessage: Address,
  payer: TransactionSigner
) {
  const config = CONFIGS[env];
  const rpc = createSolanaRpc(config.solana.rpcUrl);

  const cfgAddress = await getBaseRelayerCfgPda(config.solana.baseRelayerProgram);
  const cfg = await fetchCfg(rpc, cfgAddress);

  const { salt, pubkey: messageToRelay } = await getMtrPda(
    config.solana.baseRelayerProgram
  );

  return getPayForRelayInstruction(
    {
      payer,
      cfg: cfgAddress,
      gasFeeReceiver: cfg.data.gasConfig.gasFeeReceiver,
      messageToRelay,
      mtrSalt: salt,
      systemProgram: SYSTEM_PROGRAM_ADDRESS,
      outgoingMessage,
      gasLimit: BigInt(2_000_000),
    },
    { programAddress: config.solana.baseRelayerProgram }
  );
}
