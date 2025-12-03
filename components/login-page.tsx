"use client"

import { useEffect, useCallback } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Server, Key, AlertCircle, Users, Award } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Script from "next/script"

interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              type?: "standard" | "icon"
              text?: "signin_with" | "signup_with" | "continue_with" | "signin"
              shape?: "rectangular" | "pill" | "circle" | "square"
              logo_alignment?: "left" | "center"
              width?: number
            },
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

export function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user, isLoading } = useAuth()
  const sessionExpired = searchParams.get("expired") === "true"

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        await signIn(response.credential)
        router.push("/dashboard")
      } catch (error) {
        console.error("Sign in failed:", error)
      }
    },
    [signIn, router],
  )

  const initializeGoogleSignIn = useCallback(() => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      const buttonElement = document.getElementById("google-signin-button")
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
        })
      }
    }
  }, [handleCredentialResponse])

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn()
    }
  }, [initializeGoogleSignIn])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    )
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGoogleSignIn}
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
        {/* Left side - Hero/Background */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 lg:py-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-md mx-auto text-center text-white">
            <div className="mb-8">
              <Shield className="w-16 h-16 mx-auto mb-4 text-white/90" />
              <h1 className="text-4xl font-bold mb-4">Welcome to Rumsan</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Your gateway to seamless employee management and server access
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Server className="w-8 h-8 mx-auto mb-2 text-white/90" />
                <p className="font-medium">Server Access</p>
                <p className="text-white/70">Manage SSH keys</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Key className="w-8 h-8 mx-auto mb-2 text-white/90" />
                <p className="font-medium">Secure Login</p>
                <p className="text-white/70">Google SSO</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-white/90" />
                <p className="font-medium">HR Portal</p>
                <p className="text-white/70">Employee data</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Award className="w-8 h-8 mx-auto mb-2 text-white/90" />
                <p className="font-medium">Benefits</p>
                <p className="text-white/70">Rewards & more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex flex-col px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
          <div className="flex-1 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-sm lg:max-w-md">
              <div className="text-center mb-8">
                <div className="lg:hidden mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Access your Rumsan Employee Portal
                </p>
              </div>

              {sessionExpired && (
                <Alert className="mb-6 bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <div id="google-signin-button" className="min-h-[44px] w-full max-w-xs" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
