"use client"

export const runtime = 'edge'

import { useParams, useRouter } from "next/navigation"
import { useGetCertificate } from "@/lib/hooks/use-certificates"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function CertificateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { idToken } = useAuth()
  const { data: certificate, isLoading } = useGetCertificate(params.id as string, idToken)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const handleDownload = () => {
    const blob = new Blob([certificate.cert], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificate.id}.pub`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading certificate details...</div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Certificate Not Found</h1>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>
                SSH Certificate for {certificate.ssh_keys.title} on {certificate.hosts.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Certificate ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {certificate.id}
                    </code>
                    <CopyButton textToCopy={certificate.id} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Principal</label>
                  <p className="text-sm font-mono mt-1">{certificate.principal}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid From</label>
                  <p className="text-sm mt-1">{formatDate(certificate.valid_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expires At</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm">{formatDate(certificate.expires_at)}</p>
                    <Badge
                      variant="outline"
                      className={
                        isExpired(certificate.expires_at)
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }
                    >
                      {isExpired(certificate.expires_at) ? "Expired" : "Valid"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm mt-1">{formatDate(certificate.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Host Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Host Name</label>
                  <p className="text-sm mt-1">{certificate.hosts.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Host Principal</label>
                  <p className="text-sm font-mono mt-1">{certificate.hosts.principal}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Host ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {certificate.hosts.id}
                    </code>
                    <CopyButton textToCopy={certificate.hosts.id} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Key Title</label>
                  <p className="text-sm mt-1">{certificate.ssh_keys.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Key ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {certificate.ssh_keys.id}
                    </code>
                    <CopyButton textToCopy={certificate.ssh_keys.id} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Key Created At</label>
                  <p className="text-sm mt-1">{formatDate(certificate.ssh_keys.created_at)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Public Key</label>
                <div className="flex items-start gap-2 mt-1">
                  <code className="text-xs bg-muted px-3 py-2 rounded font-mono break-all flex-1">
                    {certificate.ssh_keys.public_key}
                  </code>
                  <CopyButton textToCopy={certificate.ssh_keys.public_key} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificate Content</CardTitle>
              <CardDescription>The full SSH certificate string</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <textarea
                  readOnly
                  value={certificate.cert}
                  className="w-full h-32 text-xs font-mono bg-muted px-3 py-2 rounded resize-none"
                />
                <CopyButton textToCopy={certificate.cert} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}