"use client";

import { createContext, useContext, useState } from "react";
import type { UiWallet, UiWalletAccount } from "@wallet-standard/react";

export type ConnectedWallet = {
  wallet: UiWallet;
  account: UiWalletAccount;
};

type WalletContextValue = {
  connected: ConnectedWallet | null;
  setConnected: (w: ConnectedWallet | null) => void;
};

export const WalletContext = createContext<WalletContextValue>({
  connected: null,
  setConnected: () => {},
});

export function useWalletContext() {
  return useContext(WalletContext);
}
