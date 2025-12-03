import { WalletManager } from "@/components/wallet-manager"

export default function WalletsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <WalletManager />
      </main>
    </div>
  )
}
