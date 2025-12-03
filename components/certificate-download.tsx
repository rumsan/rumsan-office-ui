"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, FileKey, CheckCircle2, Clock, Terminal, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function CertificateDownload() {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getValidToken, signOut } = useAuth()
  const router = useRouter()

  const handleUnauthorized = () => {
    signOut()
    router.push("/?expired=true")
  }

  const handleDownload = async () => {
    const token = getValidToken()
    if (!token) {
      handleUnauthorized()
      return
    }

    setDownloading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockCertificate = `ssh-ed25519-cert-v01@openssh.com AAAAIHNzaC1lZDI1NTE5LWNlcnQtdjAxQG9wZW5zc2guY29tAAAAIGV4YW1wbGVjZXJ0aWZpY2F0ZWRhdGFoZXJlAAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJlAAAAAAAAE4gAAAABAAAADWpvaG5AZXhhbXBsZQAAAAoAAAAGdWJ1bnR1AAAAAGVEwlAAAAAAZUaD0AAAAAAAAACCAAAAFXBlcm1pdC1YMTEtZm9yd2FyZGluZwAAAAAAAAAXcGVybWl0LWFnZW50LWZvcndhcmRpbmcAAAAAAAAAFnBlcm1pdC1wb3J0LWZvcndhcmRpbmcAAAAAAAAACnBlcm1pdC1wdHkAAAAAAAAADnBlcm1pdC11c2VyLXJjAAAAAAAAAAAAAAEXAAAAB3NzaC1yc2EAAAADAQABAAABAQC... user-certificate`

      const blob = new Blob([mockCertificate], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "id_ed25519-cert.pub"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setDownloaded(true)
    } catch {
      setError("Failed to generate certificate. Please ensure you have saved your SSH public key first.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileKey className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>SSH Certificate</CardTitle>
            <CardDescription>Download a signed certificate to access your servers</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Certificate Validity</p>
              <p className="text-xs text-muted-foreground">Valid for 24 hours after generation</p>
            </div>
          </div>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2 w-full sm:w-auto">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Generating..." : "Download Certificate"}
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {downloaded && (
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Certificate Downloaded</AlertTitle>
            <AlertDescription>
              Your signed certificate has been downloaded. Follow the instructions below to use it.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">How to Use Your Certificate</h4>
          </div>

          <div className="space-y-4 text-sm">
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-muted-foreground mb-2 font-medium">
                  Step 1: Move the certificate to your SSH directory
                </p>
                <code className="block bg-background/50 p-3 rounded font-mono text-primary text-xs sm:text-sm break-all">
                  mv ~/Downloads/id_ed25519-cert.pub ~/.ssh/
                </code>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 font-medium">Step 2: Set correct permissions</p>
                <code className="block bg-background/50 p-3 rounded font-mono text-primary text-xs sm:text-sm">
                  chmod 600 ~/.ssh/id_ed25519-cert.pub
                </code>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 font-medium">Step 3: Connect to your server</p>
                <code className="block bg-background/50 p-3 rounded font-mono text-primary text-xs sm:text-sm break-all">
                  ssh -i ~/.ssh/id_ed25519 -o CertificateFile=~/.ssh/id_ed25519-cert.pub user@hostname
                </code>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 font-medium">
                  Or add to SSH config (~/.ssh/config) for easier access:
                </p>
                <pre className="bg-background/50 p-3 rounded font-mono text-primary text-xs sm:text-sm overflow-x-auto">
                  {`Host myserver
    HostName server.example.com
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    CertificateFile ~/.ssh/id_ed25519-cert.pub`}
                </pre>
              </div>
            </div>

            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-500">
                <strong>Important:</strong> The certificate file must be in the same directory as your private key, and
                the names must match (e.g., <code className="bg-background/50 px-1 rounded">id_ed25519</code> and{" "}
                <code className="bg-background/50 px-1 rounded">id_ed25519-cert.pub</code>).
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
