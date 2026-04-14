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
    spl: ReturnType<typeof address>;
    wEth: ReturnType<typeof address>;
    wErc20: ReturnType<typeof address>;
  };
  base: {
    chain: Chain;
    bridgeContract: EvmAddress;
    wSol: EvmAddress;
    wSpl: EvmAddress;
  };
};

export const CONFIGS: Record<DeployEnv, Config> = {
  "testnet-alpha": {
    solana: {
      cluster: "devnet",
      rpcUrl: "https://api.devnet.solana.com",
      bridgeProgram: address("6YpL1h2a9u6LuNVi55vAes36xNszt2UDm3Zk1kj4WSBm"),
      baseRelayerProgram: address("ETsFnoWdJK8N7VJW6XXjiciyB2xeQfCXMQWNa85Zi9cn"),
      spl: address("8KkQRERXdASmXqeWw7sPFB56wLxyHMKc9NPDW64EEL31"),
      wEth: address("Ds8zVAg2CCG9p1LL1PkeDBzr4hhsSYeeadKQZnH3KGkL"),
      wErc20: address("5RY1tS5AccP14676cQzs6EZBoV51Gek3FoWPyU1syhrq"),
    },
    base: {
      chain: baseSepolia,
      bridgeContract: "0x64567a9147fa89B1edc987e36Eb6f4b6db71656b",
      wSol: "0x003512146Fd54b71f926C7Fd4B7bd20Fc84E22c5",
      wSpl: "0x80351342c4dd23C78c0837C640E041a239e67cD8",
    },
  },
  "testnet-prod": {
    solana: {
      cluster: "devnet",
      rpcUrl: "https://api.devnet.solana.com",
      bridgeProgram: address("7c6mteAcTXaQ1MFBCrnuzoZVTTAEfZwa6wgy4bqX3KXC"),
      baseRelayerProgram: address("56MBBEYAtQAdjT4e1NzHD8XaoyRSTvfgbSVVcEcHj51H"),
      spl: address("8KkQRERXdASmXqeWw7sPFB56wLxyHMKc9NPDW64EEL31"),
      wEth: address("EgN6b7stvhxJGo9br4kFefmFWjMjM6NThNX4uFvwJGbE"),
      wErc20: address("ESyyyhXapf6HdqwVtxpfg6Sit7AdqEoLRBCGja9sBLx1"),
    },
    base: {
      chain: baseSepolia,
      bridgeContract: "0x01824a90d32A69022DdAEcC6C5C14Ed08dB4EB9B",
      wSol: "0xCace0c896714DaF7098FFD8CC54aFCFe0338b4BC",
      wSpl: "0x955C7356776F9304feD38ed5AeC5699436C7C614",
    },
  },
  mainnet: {
    solana: {
      cluster: "mainnet",
      rpcUrl: "https://api.mainnet-beta.solana.com",
      bridgeProgram: address("HNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM"),
      baseRelayerProgram: address("g1et5VenhfJHJwsdJsDbxWZuotD5H4iELNG61kS4fb9"),
      spl: address("9YEGpFKedz7i8hMB7gDWQGuAfCRHUKBMCbTjnMi8vtUc"),
      wEth: address("2ZCFyWM6WthDLBo41zJsMQmjJ4Kvb6yumvrbLpVh9LMX"),
      wErc20: address("7qxnUBBmW8oiuz9skKkGQFvY1qRUP6zF3emA5bneyGaJ"),
    },
    base: {
      chain: base,
      bridgeContract: "0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188",
      wSol: "0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82",
      wSpl: "0xcd9E97cf45BC53acC35A5aFb70458c47c214E7C7",
    },
  },
};
