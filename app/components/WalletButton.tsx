"use client";

import { useState, useRef, useEffect } from "react";
import { useWallets, useConnect, useDisconnect } from "@wallet-standard/react";
import type { UiWallet } from "@wallet-standard/react";
import { useWalletContext, type ConnectedWallet } from "@/app/bridge/WalletContext";

// Rendered only when a wallet is connected — calls useDisconnect unconditionally.
function DisconnectButton({ connected }: { connected: ConnectedWallet }) {
  const [, disconnect] = useDisconnect(connected.wallet);
  const { setConnected } = useWalletContext();
  const short = `${connected.account.address.slice(0, 4)}…${connected.account.address.slice(-4)}`;

  return (
    <button
      onClick={async () => { await disconnect(); setConnected(null); }}
      className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={connected.wallet.icon} alt="" aria-hidden className="w-4 h-4 rounded" />
      <span className="font-mono">{short}</span>
    </button>
  );
}

// Rendered per wallet option in the dropdown — calls useConnect unconditionally.
function WalletOption({
  wallet,
  onConnected,
}: {
  wallet: UiWallet;
  onConnected: (w: ConnectedWallet) => void;
}) {
  const [, connect] = useConnect(wallet);

  async function handleClick() {
    try {
      const accounts = await connect();
      const account = accounts[0];
      if (!account) throw new Error("No accounts returned");
      onConnected({ wallet, account });
    } catch (e) {
      console.error("Connect failed:", e);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={wallet.icon} alt="" aria-hidden className="w-5 h-5 rounded" />
      <span className="font-medium">{wallet.name}</span>
    </button>
  );
}

export function WalletButton() {
  const { connected, setConnected } = useWalletContext();
  const wallets = useWallets();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (connected) {
    return <DisconnectButton connected={connected} />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-black text-white text-sm font-medium px-4 py-2 hover:opacity-80 transition-opacity dark:bg-white dark:text-black"
      >
        Connect Wallet
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-white dark:bg-zinc-900 shadow-lg overflow-hidden z-50">
          {wallets.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-400">
              No wallets detected.
            </p>
          ) : (
            wallets.map((wallet) => (
              <WalletOption
                key={wallet.name}
                wallet={wallet}
                onConnected={(w) => { setConnected(w); setOpen(false); }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
