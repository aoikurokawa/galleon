import { WalletProvider } from "./WalletProvider";
import { BridgeWidget } from "./BridgeWidget";

export const metadata = {
  title: "Bridge SPL → Base",
};

export default function BridgePage() {
  return (
    <WalletProvider>
      <main className="flex flex-col items-center py-16 px-4 min-h-screen">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Bridge SPL → Base</h1>
          <p className="text-sm text-zinc-500 mb-8">
            Bridge SPL tokens from Solana to Base using your wallet.
          </p>
          <BridgeWidget />
        </div>
      </main>
    </WalletProvider>
  );
}
