"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { ServerTable } from "./server-table"
import { SSHKeyManager } from "./ssh-key-manager"
import { CertificateTable } from "./certificate-table"
import { WalletManager } from "./wallet-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Server, Key, FileText, Wallet } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useServers } from "@/lib/hooks/use-servers"
import { useCertificates } from "@/lib/hooks/use-certificates"

export interface ServerInfo {
  id: string
  name: string
  hostname: string
  ip: string
  status: "online" | "offline" | "maintenance"
  lastAccessed: string
  role: string
  principal: string
  allowed: boolean
  created_at: string
}

export function Dashboard() {
  const { user, idToken, isLoading: authLoading } = useAuth()
  const { data: apiServers = [], isLoading: serversLoading } = useServers(idToken)
  const { data: certificates = [], isLoading: certificatesLoading } = useCertificates(idToken)
  const router = useRouter()

  // Map API data to ServerInfo format
  const servers: ServerInfo[] = apiServers.map(server => ({
    id: server.id,
    name: server.name,
    hostname: server.name, // Using name as hostname
    ip: "", // No IP in API response
    status: server.status,
    lastAccessed: server.created_at,
    role: server.allowed ? "admin" : "user", // Assuming allowed means admin
    principal: server.principal,
    allowed: server.allowed,
    created_at: server.created_at,
  }))

  const loading = serversLoading

  // Show loading while checking auth
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="wallets" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="wallets" className="gap-2">
              <Wallet className="w-4 h-4" />
              My Wallets
            </TabsTrigger>
            <TabsTrigger value="ssh-key" className="gap-2">
              <Key className="w-4 h-4" />
              My SSH Keys
            </TabsTrigger>
            <TabsTrigger value="servers" className="gap-2">
              <Server className="w-4 h-4" />
              My Servers
            </TabsTrigger>
            <TabsTrigger value="certificate" className="gap-2">
              <FileText className="w-4 h-4" />
              My Certificates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ssh-key" className="space-y-4">
            <SSHKeyManager />
          </TabsContent>

          <TabsContent value="servers" className="space-y-4">
            <ServerTable servers={servers} loading={loading} />
          </TabsContent>

          <TabsContent value="wallets" className="space-y-4">
            <WalletManager />
          </TabsContent>

          <TabsContent value="certificate" className="space-y-4">
            <CertificateTable certificates={certificates} loading={certificatesLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
