"use client";

import { useState } from "react";
import { WalletContext, type ConnectedWallet } from "./WalletContext";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState<ConnectedWallet | null>(null);
  return (
    <WalletContext.Provider value={{ connected, setConnected }}>
      {children}
    </WalletContext.Provider>
  );
}
