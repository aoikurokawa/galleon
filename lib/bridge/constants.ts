import { address } from "@solana/kit";
import type { Chain, Address as EvmAddress } from "viem";
import { base, baseSepolia } from "viem/chains";

export const DEPLOY_ENVS = [
  "testnet-alpha",
  "testnet-prod",
  "mainnet",
] as const;

export type DeployEnv = (typeof DEPLOY_ENVS)[number];

export type Config = {
  solana: {
    cluster: string;
    rpcUrl: string;
    bridgeProgram: ReturnType<typeof address>;
    baseRelayerProgram: ReturnType<typeof address>;
    jitoSol: ReturnType<typeof address>;
  };
  base: {
    chain: Chain;
    bridgeContract: EvmAddress;
    wJitoSol: EvmAddress;
  };
};

export const CONFIGS: Record<DeployEnv, Config> = {
  "testnet-alpha": {
    solana: {
      cluster: "devnet",
      rpcUrl: "https://api.devnet.solana.com",
      bridgeProgram: address("6YpL1h2a9u6LuNVi55vAes36xNszt2UDm3Zk1kj4WSBm"),
      baseRelayerProgram: address("ETsFnoWdJK8N7VJW6XXjiciyB2xeQfCXMQWNa85Zi9cn"),
      jitoSol: address("J1tos8mqbhdGcF3pgj4PCKyVjzWSURcpLZU7pPGHxSYi"),
    },
    base: {
      chain: baseSepolia,
      bridgeContract: "0x64567a9147fa89B1edc987e36Eb6f4b6db71656b",
      wJitoSol: "0x637A68e6a62C17Dd6e079b515A10D7c4a9B09736",
    },
  },
  "testnet-prod": {
    solana: {
      cluster: "devnet",
      rpcUrl: "https://api.devnet.solana.com",
      bridgeProgram: address("7c6mteAcTXaQ1MFBCrnuzoZVTTAEfZwa6wgy4bqX3KXC"),
      baseRelayerProgram: address("56MBBEYAtQAdjT4e1NzHD8XaoyRSTvfgbSVVcEcHj51H"),
      jitoSol: address("J1tos8mqbhdGcF3pgj4PCKyVjzWSURcpLZU7pPGHxSYi"),
    },
    base: {
      chain: baseSepolia,
      bridgeContract: "0x01824a90d32A69022DdAEcC6C5C14Ed08dB4EB9B",
      wJitoSol: "0x637A68e6a62C17Dd6e079b515A10D7c4a9B09736",
    },
  },
  mainnet: {
    solana: {
      cluster: "mainnet",
      rpcUrl: "https://api.mainnet-beta.solana.com",
      bridgeProgram: address("HNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM"),
      baseRelayerProgram: address("g1et5VenhfJHJwsdJsDbxWZuotD5H4iELNG61kS4fb9"),
      jitoSol: address("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"),
    },
    base: {
      chain: base,
      bridgeContract: "0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188",
      wJitoSol: "0xcd9E97cf45BC53acC35A5aFb70458c47c214E7C7",
    },
  },
};
