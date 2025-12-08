"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Save, CheckCircle2, AlertCircle, Loader2, Plus, Download, Trash2, FileText, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CopyButton } from "@/components/ui/copy-button"
import { useSSHKeys, useAddSSHKey, useDeleteSSHKey } from "@/lib/hooks/use-ssh-keys"
import { format } from "date-fns"

export function SSHKeyManager() {
  const [keyTitle, setKeyTitle] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { getValidToken, signOut } = useAuth()
  const router = useRouter()

  const handleUnauthorized = () => {
    signOut()
    router.push("/?expired=true")
  }

  const token = getValidToken()

  // Query to fetch SSH keys
  const { data: sshKeys = [], isLoading } = useSSHKeys(token)

  // Mutations
  const addMutation = useAddSSHKey(token, handleUnauthorized)
  const deleteMutation = useDeleteSSHKey(token, handleUnauthorized)

  const handleSave = async () => {
    if (!keyTitle.trim()) {
      setStatus("error")
      setErrorMessage("Please enter a title for your SSH key.")
      return
    }

    if (!publicKey.trim()) {
      setStatus("error")
      setErrorMessage("Please enter your SSH public key.")
      return
    }

    const validPrefixes = ["ssh-rsa", "ssh-ed25519", "ssh-dss", "ecdsa-sha2"]
    const isValidFormat = validPrefixes.some((prefix) => publicKey.trim().startsWith(prefix))

    if (!isValidFormat) {
      setStatus("error")
      setErrorMessage(
        "Invalid SSH public key format. Key must start with ssh-rsa, ssh-ed25519, ssh-dss, or ecdsa-sha2.",
      )
      return
    }

    if (!token) {
      handleUnauthorized()
      return
    }

    setStatus("idle")
    setErrorMessage("")

    try {
      await addMutation.mutateAsync({
        title: keyTitle,
        public_key: publicKey,
        id_token: token,
      })

      // Reset form
      setKeyTitle("")
      setPublicKey("")
      setShowAddForm(false)
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (error) {
      setStatus("error")
      setErrorMessage("Failed to save SSH key. Please try again.")
      console.error("Failed to save SSH key:", error)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!token) {
      handleUnauthorized()
      return
    }

    try {
      await deleteMutation.mutateAsync(keyId)
    } catch (error) {
      console.error("Failed to delete SSH key:", error)
      setErrorMessage("Failed to delete SSH key")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  return (
    <div className="space-y-4">
      {/* SSH Keys List Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>SSH Public Keys</CardTitle>
                <CardDescription>Manage your SSH keys for certificate-based authentication</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add SSH Key
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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sshKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Title</TableHead>
                  <TableHead>Fingerprint</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sshKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.title}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="break-all">{key.fingerprint}</span>
                        <CopyButton textToCopy={key.public_key} tooltip="Copy public key" />
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(key.created_at), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/certificates/create?key_id=${key.id}`)}
                          title="Create Certificate"
                          className="h-8 w-8 p-0"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteKey(key.id)}
                          disabled={deleteMutation.isPending}
                          className="gap-2"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {deleteMutation.isPending ? "..." : ""}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No SSH keys yet. Click "Add SSH Key" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add SSH Key Form */}
      {showAddForm && (
        <Card className="border-border/50 border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Add New SSH Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-title">Key Title</Label>
              <input
                id="key-title"
                type="text"
                placeholder="e.g., Work Laptop, Personal Desktop"
                value={keyTitle}
                onChange={(e) => setKeyTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-key">Public Key</Label>
              <Textarea
                id="public-key"
                placeholder="ssh-ed25519 AAAA... or ssh-rsa AAAA..."
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="font-mono text-sm min-h-[120px] resize-none bg-muted/30"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384, ecdsa-sha2-nistp521
              </p>
            </div>

            {status === "success" && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Your SSH public key has been saved successfully.</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium mb-2">How to generate an SSH key</h4>
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-2">
                <p className="text-muted-foreground"># Generate a new ED25519 key (recommended)</p>
                <code className="text-primary">ssh-keygen -t ed25519 -C "your_email@example.com"</code>
                <p className="text-muted-foreground mt-3"># Copy your public key</p>
                <code className="text-primary">cat ~/.ssh/id_ed25519.pub</code>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setKeyTitle("")
                  setPublicKey("")
                  setStatus("idle")
                  setErrorMessage("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={addMutation.isPending} className="gap-2">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {addMutation.isPending ? "Saving..." : "Save Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
