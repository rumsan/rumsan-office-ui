"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface Certificate {
  id: string
  user_id: string
  key_id: string
  host_id: string
  valid_at: string
  expires_at: string
  principal: string
  cert: string
  created_at: string
  hosts: {
    id: string
    name: string
    principal: string
    created_at: string
  }
  ssh_keys: {
    id: string
    title: string
    created_at: string
    public_key: string
  }
}

interface CertificateTableProps {
  certificates: Certificate[]
  loading: boolean
}

export function CertificateTable({ certificates, loading }: CertificateTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const handleDownload = (certificate: Certificate) => {
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

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your Certificates</CardTitle>
              <CardDescription>SSH certificates issued for your keys</CardDescription>
            </div>
          </div>
          <Button onClick={() => router.push("/certificates/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Certificate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Server Name</TableHead>
                <TableHead className="font-semibold">Principal</TableHead>
                <TableHead className="font-semibold">SSH Key</TableHead>
                <TableHead className="font-semibold">Expiry Date</TableHead>
                <TableHead className="font-semibold">Created At</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No certificates found.
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((certificate) => (
                  <TableRow
                    key={certificate.id}
                    className="hover:bg-muted/20 cursor-pointer"
                    onClick={() => router.push(`/certificates/${certificate.id}`)}
                  >
                    <TableCell className="font-mono text-muted-foreground text-sm">
                      {certificate.hosts.name}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground text-sm">
                      {certificate.principal}
                    </TableCell>
                    <TableCell className="text-sm">{certificate.ssh_keys.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isExpired(certificate.expires_at)
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }
                      >
                        {formatDate(certificate.expires_at)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(certificate.created_at)}
                    </TableCell>
                    <TableCell>
                      { !isExpired(certificate.expires_at) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(certificate);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      ) }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}