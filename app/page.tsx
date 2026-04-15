"use client";

import { useState } from "react";
import { BridgeWidget } from "./bridge/BridgeWidget";
import { BaseBridgeWidget } from "./bridge/BaseBridgeWidget";

type Tab = "sol-to-base" | "base-to-sol";

export default function Home() {
  const [tab, setTab] = useState<Tab>("sol-to-base");

  return (
    <main className="flex flex-col items-center py-16 px-4 flex-1">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Bridge</h1>

        {/* Tab switcher */}
        <div className="flex border rounded-lg overflow-hidden mb-8 text-sm font-medium">
          <button
            onClick={() => setTab("sol-to-base")}
            className={`flex-1 py-2.5 transition-colors ${
              tab === "sol-to-base"
                ? "bg-black text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Solana → Base
          </button>
          <button
            onClick={() => setTab("base-to-sol")}
            className={`flex-1 py-2.5 transition-colors ${
              tab === "base-to-sol"
                ? "bg-black text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Base → Solana
          </button>
        </div>

        {tab === "sol-to-base" && <BridgeWidget />}
        {tab === "base-to-sol" && <BaseBridgeWidget />}
      </div>
    </main>
  );
}
