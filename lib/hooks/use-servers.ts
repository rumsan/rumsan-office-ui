import { useQuery } from "@tanstack/react-query"
import { apiCall } from "@/lib/api"

interface Server {
  id: string
  principal: string
  name: string
  status: "online" | "offline" | "maintenance"
  created_at: string
  allowed: boolean
}

const SERVERS_QUERY_KEY = ["servers"]
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export function useServers(token: string | null) {
  return useQuery({
    queryKey: SERVERS_QUERY_KEY,
    queryFn: async () => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ success: boolean; data: Server[] }>(
        `${API_BASE}/functions/v1/user-query/my-hosts`,
        {
          token,
        }
      )
      return data.data
    },
    enabled: !!token,
  })
}