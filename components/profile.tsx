"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProfile, useChangeApiKey } from "@/lib/hooks/use-profile"
import { CopyButton } from "@/components/ui/copy-button"

export function Profile() {
  const { user, idToken, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data: profile, isLoading: profileLoading } = useProfile(idToken)
  const changeApiKeyMutation = useChangeApiKey(idToken)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleChangeApiKey = async () => {
    if (!window.confirm("Are you sure you want to change your API key? This action cannot be undone.")) {
      return
    }

    changeApiKeyMutation.mutate()
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
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile?.name || user.name}</h1>
                <p className="text-muted-foreground">{profile?.email || user.email}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profileLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ) : profile ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-sm font-mono">{profile.user_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CUID</label>
                    <p className="text-sm font-mono">{profile.cuid}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <Badge variant="secondary">{profile.type}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">API Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                      {profile.api_key}
                    </code>
                    <CopyButton textToCopy={profile.api_key} tooltip="Copy API key" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChangeApiKey}
                      disabled={changeApiKeyMutation.isPending}
                    >
                      <RefreshCw className={`w-4 h-4 ${changeApiKeyMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Failed to load profile data.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
