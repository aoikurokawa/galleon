import { BridgeWidget } from "./bridge/BridgeWidget";

export const metadata = {
  title: "Bridge SPL → Base",
};

export default function Home() {
  return (
    <main className="flex flex-col items-center py-16 px-4 flex-1">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Bridge SPL → Base</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Bridge SPL tokens from Solana to Base using your wallet.
        </p>
        <BridgeWidget />
      </div>
    </main>
  );
}
