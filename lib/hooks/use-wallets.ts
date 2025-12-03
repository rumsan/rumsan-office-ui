import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiCall } from "@/lib/api"

interface Wallet {
  address: string
  user_id: string
  cuid: string
  name: string
  email: string
  created_at: string
}

interface AddWalletPayload {
  id_token: string
  signature: string
}

const WALLETS_QUERY_KEY = ["wallets"]
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export function useWallets(token: string | null) {
  return useQuery({
    queryKey: WALLETS_QUERY_KEY,
    queryFn: async () => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ data: Wallet[] }>(
        `${API_BASE}/functions/v1/user-query/my-wallets`,
        {
          token,
        }
      )
      return data.data
    },
    enabled: !!token,
  })
}

export function useAddWallet(token: string | null, onUnauthorized: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (signature: string) => {
      if (!token) {
        throw new Error("No valid token")
      }

      // Note: This API uses a different base URL
      const response = await fetch(`${API_BASE}/functions/v1/google-add-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: token,
          signature,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }))
        throw new Error(error.message || "Request failed")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY })
    },
  })
}
