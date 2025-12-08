import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiCall } from "@/lib/api"

interface Certificate {
  id: string
  user_id: string
  key_id: string
  host_id: string
  valid_at: string
  expires_at: string
  principal: string
  cert: string
  created_at: string
  hosts: {
    id: string
    name: string
    principal: string
    created_at: string
  }
  ssh_keys: {
    id: string
    title: string
    created_at: string
    public_key: string
  }
}

const CERTIFICATES_QUERY_KEY = ["certificates"]
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export function useCertificates(token: string | null) {
  return useQuery({
    queryKey: CERTIFICATES_QUERY_KEY,
    queryFn: async () => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ success: boolean; data: Certificate[] }>(
        `${API_BASE}/functions/v1/user-query/my-certificates`,
        {
          token,
        }
      )
      return data.data
    },
    enabled: !!token,
  })
}

export function useGetCertificate(certId: string, token: string | null) {
  return useQuery({
    queryKey: ["certificate", certId],
    queryFn: async () => {
      if (!token || !certId) {
        throw new Error("No valid token or certId")
      }

      const data = await apiCall<{ success: boolean; data: Certificate }>(
        `${API_BASE}/functions/v1/user-query/get-certificate`,
        {
          method: "POST",
          body: { cert_id: certId },
          token,
        }
      )
      return data.data
    },
    enabled: !!token && !!certId,
  })
}

export function useCreateCertificate(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { key_id: string; host_id: string }) => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ success: boolean; data: Certificate }>(
        `${API_BASE}/functions/v1/ssh-cert/create-cert`,
        {
          method: "POST",
          body: payload,
          token,
        }
      )
      if (data.success) {
        return data.data
      }
      throw new Error("Failed to create certificate")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_QUERY_KEY })
    },
  })
}