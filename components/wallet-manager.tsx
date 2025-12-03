"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CopyButton } from "@/components/ui/copy-button"
import { useWallets, useAddWallet } from "@/lib/hooks/use-wallets"
import { format } from "date-fns"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function WalletManager() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { getValidToken, signOut } = useAuth()
  const router = useRouter()

  const handleUnauthorized = () => {
    signOut()
    router.push("/?expired=true")
  }

  const token = getValidToken()

  // Query to fetch wallets
  const { data: wallets = [], isLoading } = useWallets(token)

  // Mutation
  const addMutation = useAddWallet(token, handleUnauthorized)

  const handleAddWallet = async () => {
    if (!window.ethereum) {
      setStatus("error")
      setErrorMessage("MetaMask is not installed. Please install MetaMask to add a wallet.")
      return
    }

    if (!token) {
      handleUnauthorized()
      return
    }

    setStatus("idle")
    setErrorMessage("")

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Sign the token
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      const account = accounts[0]

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [token, account],
      })

      // Add the wallet
      await addMutation.mutateAsync(signature)

      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (error: any) {
      if (error.code === 4001) {
        // User rejected the request
        setStatus("error")
        setErrorMessage("Signature request was rejected.")
      } else {
        setStatus("error")
        setErrorMessage("Failed to add wallet. Please try again.")
        console.error("Failed to add wallet:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Wallets List Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Wallets</CardTitle>
                <CardDescription>Manage your connected wallets</CardDescription>
              </div>
            </div>
            <Button onClick={handleAddWallet} disabled={addMutation.isPending} className="gap-2">
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {addMutation.isPending ? "Adding..." : "Add Wallet"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/20 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="mb-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Wallet added successfully.</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : wallets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.address}>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="break-all">{wallet.address}</span>
                        <CopyButton textToCopy={wallet.address} tooltip="Copy wallet address" />
                      </div>
                    </TableCell>
                    <TableCell>{wallet.name}</TableCell>
                    <TableCell>{wallet.email}</TableCell>
                    <TableCell>{format(new Date(wallet.created_at), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No wallets connected yet. Click "Add Wallet" to connect one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
