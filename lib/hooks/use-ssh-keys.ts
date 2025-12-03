import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiCall } from "@/lib/api"

interface SSHKey {
  id: string
  title: string
  public_key: string
  fingerprint: string
  created_at: string
}

interface AddSSHKeyPayload {
  title: string
  public_key: string
  id_token: string
}

interface DownloadCertificateResponse {
  certificate: string
}

const SSH_KEYS_QUERY_KEY = ["ssh-keys"]
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export function useSSHKeys(token: string | null) {
  return useQuery({
    queryKey: SSH_KEYS_QUERY_KEY,
    queryFn: async () => {
      if (!token) {
        throw new Error("No valid token")
      }

      const data = await apiCall<{ data: SSHKey[] }>(
        `${API_BASE}/functions/v1/ssh-cert/get-keys`,
        {
          token,
        }
      )
      return data.data
    },
    enabled: !!token,
  })
}

export function useAddSSHKey(token: string | null, onUnauthorized: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddSSHKeyPayload) => {
      if (!token) {
        throw new Error("No valid token")
      }

      return await apiCall<{ id: string }>(
        `${API_BASE}/functions/v1/ssh-cert/add-key`,
        {
          method: "POST",
          body: payload,
          token,
          onUnauthorized,
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SSH_KEYS_QUERY_KEY })
    },
  })
}

export function useDownloadCertificate(
  token: string | null,
  onUnauthorized: () => void
) {
  return useMutation({
    mutationFn: async (keyId: string) => {
      if (!token) {
        throw new Error("No valid token")
      }

      return await apiCall<DownloadCertificateResponse>(
        `${API_BASE}/functions/v1/ssh-key/${keyId}/certificate`,
        {
          token,
          onUnauthorized,
        }
      )
    },
  })
}

export function useDeleteSSHKey(token: string | null, onUnauthorized: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (keyId: string) => {
      if (!token) {
        throw new Error("No valid token")
      }

      return await apiCall(
        `${API_BASE}/functions/v1/ssh-key/${keyId}`,
        {
          method: "DELETE",
          token,
          onUnauthorized,
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SSH_KEYS_QUERY_KEY })
    },
  })
}
