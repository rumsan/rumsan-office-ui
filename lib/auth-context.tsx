"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  name: string
  email: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  idToken: string | null
  isLoading: boolean
  signIn: (credential: string) => Promise<void>
  signOut: () => void
  isTokenExpired: () => boolean
  getValidToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeJwt(token: string): { payload: Record<string, unknown>; exp: number } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return { payload, exp: payload.exp }
  } catch {
    return null
  }
}

function isExpired(token: string): boolean {
  const decoded = decodeJwt(token)
  if (!decoded) return true
  // exp is in seconds, Date.now() is in milliseconds
  // Add 60 second buffer to refresh before actual expiration
  return decoded.exp * 1000 < Date.now() + 60000
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const clearSession = useCallback(() => {
    sessionStorage.removeItem("id_token")
    sessionStorage.removeItem("user")
    setIdToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = sessionStorage.getItem("id_token")
    const storedUser = sessionStorage.getItem("user")

    if (storedToken && storedUser) {
      if (isExpired(storedToken)) {
        clearSession()
        router.push("/")
      } else {
        setIdToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    }
    setIsLoading(false)
  }, [clearSession, router])

  useEffect(() => {
    if (!idToken) return

    const checkExpiration = () => {
      if (idToken && isExpired(idToken)) {
        clearSession()
        router.push("/?expired=true")
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30000)
    return () => clearInterval(interval)
  }, [idToken, clearSession, router])

  const signIn = async (credential: string) => {
    const decoded = decodeJwt(credential)
    if (!decoded) throw new Error("Invalid token")

    const payload = decoded.payload

    const userData: User = {
      name: payload.name as string,
      email: payload.email as string,
      avatar: payload.picture as string,
    }

    // Store in session
    sessionStorage.setItem("id_token", credential)
    sessionStorage.setItem("user", JSON.stringify(userData))

    setIdToken(credential)
    setUser(userData)
  }

  const signOut = () => {
    clearSession()
    router.push("/")
  }

  const isTokenExpired = useCallback(() => {
    return !idToken || isExpired(idToken)
  }, [idToken])

  const getValidToken = useCallback(() => {
    if (!idToken || isExpired(idToken)) {
      return null
    }
    return idToken
  }, [idToken])

  return (
    <AuthContext.Provider value={{ user, idToken, isLoading, signIn, signOut, isTokenExpired, getValidToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
