import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiCall } from "@/lib/api"

interface ProfileData {
  user_id: string
  cuid: string
  name: string
  type: string
  api_key: string
  email: string
}

const PROFILE_QUERY_KEY = ["profile"]
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export function useProfile(token: string | null) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ success: boolean; data: ProfileData }>(
        `${API_BASE}/functions/v1/user-query/my-profile`,
        {
          token,
        }
      )
      if (data.success) {
        return data.data
      }
      throw new Error("Failed to fetch profile")
    },
    enabled: !!token,
  })
}

export function useChangeApiKey(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ success: boolean; data: { api_key: string } }>(
        `${API_BASE}/functions/v1/user-query/change-api-key`,
        {
          method: "GET",
          token,
        }
      )
      if (data.success) {
        return data.data.api_key
      }
      throw new Error("Failed to change API key")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}
