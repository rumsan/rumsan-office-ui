"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/ui/copy-button"
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function SignMessagePage() {
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [recoveredAddress, setRecoveredAddress] = useState("")
  const [status, setStatus] = useState<"idle" | "signing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleSignMessage = async () => {
    if (!window.ethereum) {
      setStatus("error")
      setErrorMessage("MetaMask is not installed. Please install MetaMask to sign messages.")
      return
    }

    if (!message.trim()) {
      setStatus("error")
      setErrorMessage("Please enter a message to sign.")
      return
    }

    setStatus("signing")
    setErrorMessage("")

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Get the current account
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      const account = accounts[0]

      // Sign the message
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      })

      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature)

      setSignature(signature)
      setRecoveredAddress(recoveredAddress)
      setStatus("success")
    } catch (error: any) {
      if (error.code === 4001) {
        // User rejected the request
        setStatus("error")
        setErrorMessage("Signature request was rejected.")
      } else {
        setStatus("error")
        setErrorMessage("Failed to sign message. Please try again.")
        console.error("Failed to sign message:", error)
      }
    }
  }

  const handleReset = () => {
    setMessage("")
    setSignature("")
    setRecoveredAddress("")
    setStatus("idle")
    setErrorMessage("")
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Wallets
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Sign Message</CardTitle>
            <CardDescription>
              Enter a message to sign with your MetaMask wallet. The signature and recovered address will be displayed below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter the message you want to sign..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="field-sizing-fixed"
                disabled={status === "signing"}
              />
            </div>

            {errorMessage && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Message signed successfully!</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSignMessage}
                disabled={status === "signing" || !message.trim()}
                className="gap-2"
              >
                {status === "signing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  "Sign Message"
                )}
              </Button>
              {status === "success" && (
                <Button variant="outline" onClick={handleReset}>
                  Sign Another Message
                </Button>
              )}
            </div>

            {signature && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Signature</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <code className="text-sm break-all flex-1">{signature}</code>
                    <CopyButton textToCopy={signature} tooltip="Copy signature" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recovered Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <code className="text-sm break-all flex-1">{recoveredAddress}</code>
                    <CopyButton textToCopy={recoveredAddress} tooltip="Copy recovered address" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}