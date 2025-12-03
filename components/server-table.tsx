"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Server } from "lucide-react"
import type { ServerInfo } from "./dashboard"

interface ServerTableProps {
  servers: ServerInfo[]
  loading: boolean
}

export function ServerTable({ servers, loading }: ServerTableProps) {
  const getStatusColor = (status: ServerInfo["status"]) => {
    switch (status) {
      case "online":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "offline":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "maintenance":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Your Servers</CardTitle>
            <CardDescription>Servers you have been granted access to</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Server Name</TableHead>
                <TableHead className="font-semibold">Hostname</TableHead>
                <TableHead className="font-semibold">IP Address</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Last Accessed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  </TableRow>
                ))
              ) : servers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No servers found. Contact your administrator to request access.
                  </TableCell>
                </TableRow>
              ) : (
                servers.map((server) => (
                  <TableRow key={server.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium font-mono">{server.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-sm">{server.hostname}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-sm">{server.ip}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(server.status)}>
                        {server.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {server.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(server.lastAccessed)}</TableCell>
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
