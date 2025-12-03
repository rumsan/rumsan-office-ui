"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { ServerTable } from "./server-table"
import { SSHKeyManager } from "./ssh-key-manager"
import { CertificateDownload } from "./certificate-download"
import { WalletManager } from "./wallet-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Server, Key, Download, Wallet } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export interface ServerInfo {
  id: string
  name: string
  hostname: string
  ip: string
  status: "online" | "offline" | "maintenance"
  lastAccessed: string
  role: string
}

// Mock servers data - replace with your API call
const mockServers: ServerInfo[] = [
  {
    id: "1",
    name: "prod-web-01",
    hostname: "web01.prod.example.com",
    ip: "10.0.1.10",
    status: "online",
    lastAccessed: "2025-11-24T10:30:00Z",
    role: "admin",
  },
  {
    id: "2",
    name: "prod-web-02",
    hostname: "web02.prod.example.com",
    ip: "10.0.1.11",
    status: "online",
    lastAccessed: "2025-11-23T14:20:00Z",
    role: "developer",
  },
  {
    id: "3",
    name: "prod-db-01",
    hostname: "db01.prod.example.com",
    ip: "10.0.2.10",
    status: "online",
    lastAccessed: "2025-11-22T09:15:00Z",
    role: "admin",
  },
  {
    id: "4",
    name: "staging-web-01",
    hostname: "web01.staging.example.com",
    ip: "10.1.1.10",
    status: "maintenance",
    lastAccessed: "2025-11-20T16:45:00Z",
    role: "developer",
  },
  {
    id: "5",
    name: "dev-server-01",
    hostname: "dev01.example.com",
    ip: "10.2.1.10",
    status: "online",
    lastAccessed: "2025-11-24T08:00:00Z",
    role: "developer",
  },
]

export function Dashboard() {
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const { user, idToken, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchServers = async () => {
      if (!idToken) return

      setLoading(true)
      try {
        // TODO: Replace with your actual API call using idToken
        // const response = await fetch('/api/servers', {
        //   headers: { Authorization: `Bearer ${idToken}` }
        // })
        // const data = await response.json()
        // setServers(data)

        // Mock delay for demo
        await new Promise((resolve) => setTimeout(resolve, 500))
        setServers(mockServers)
      } catch (error) {
        console.error("Failed to fetch servers:", error)
      } finally {
        setLoading(false)
      }
    }

    if (idToken) {
      fetchServers()
    }
  }, [idToken])

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
              <Download className="w-4 h-4" />
              My Certificate
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
            <CertificateDownload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
