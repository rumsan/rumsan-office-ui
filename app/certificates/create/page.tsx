"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { CreateCertificateForm } from "@/components/create-certificate-form"

export default function CreateCertificatePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const initialKeyId = searchParams.get("key_id") || ""
  const initialHostId = searchParams.get("host_id") || ""

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <CreateCertificateForm initialKeyId={initialKeyId} initialHostId={initialHostId} />
      </div>
    </div>
  )
}