"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSSHKeys } from "@/lib/hooks/use-ssh-keys"
import { useServers } from "@/lib/hooks/use-servers"
import { useCreateCertificate } from "@/lib/hooks/use-certificates"

export function CreateCertificateForm({ initialKeyId = "", initialHostId = "" }: { initialKeyId?: string; initialHostId?: string }) {
  const [selectedKeyId, setSelectedKeyId] = useState<string>(initialKeyId)
  const [selectedHostId, setSelectedHostId] = useState<string>(initialHostId)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { idToken } = useAuth()
  const { data: sshKeys = [], isLoading: keysLoading } = useSSHKeys(idToken)
  const { data: servers = [], isLoading: serversLoading } = useServers(idToken)
  const createCertificateMutation = useCreateCertificate(idToken)

  // Auto-select if only one option and no initial value
  useEffect(() => {
    if (!keysLoading && sshKeys.length === 1 && !initialKeyId) {
      setSelectedKeyId(sshKeys[0].id)
    }
  }, [sshKeys, keysLoading, initialKeyId])

  useEffect(() => {
    if (!serversLoading && servers.length === 1 && !initialHostId) {
      setSelectedHostId(servers[0].id)
    }
  }, [servers, serversLoading, initialHostId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedKeyId || !selectedHostId) {
      setError("Please select both a SSH key and a host.")
      return
    }

    try {
      const newCertificate = await createCertificateMutation.mutateAsync({
        key_id: selectedKeyId,
        host_id: selectedHostId,
      })

      // Redirect to the newly created certificate details page
      router.push(`/certificates/${newCertificate.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create certificate")
    }
  }

  const isLoading = keysLoading || serversLoading || createCertificateMutation.isPending

  return (
    <Card className="border-border/50 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Create SSH Certificate</CardTitle>
            <CardDescription>
              Generate a new SSH certificate by selecting a key and host
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ssh-key">SSH Key</Label>
            <Select value={selectedKeyId} onValueChange={setSelectedKeyId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select an SSH key" />
              </SelectTrigger>
              <SelectContent>
                {sshKeys.map((key) => (
                  <SelectItem key={key.id} value={key.id}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{key.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {key.fingerprint}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {keysLoading && (
              <p className="text-sm text-muted-foreground">Loading SSH keys...</p>
            )}
            {!keysLoading && sshKeys.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No SSH keys found. Please add an SSH key first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Select value={selectedHostId} onValueChange={setSelectedHostId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a host" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{server.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Principal: {server.principal}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {serversLoading && (
              <p className="text-sm text-muted-foreground">Loading hosts...</p>
            )}
            {!serversLoading && servers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hosts found. Please contact your administrator.
              </p>
            )}
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !selectedKeyId || !selectedHostId}
            className="w-full"
          >
            {createCertificateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Certificate...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Certificate
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}