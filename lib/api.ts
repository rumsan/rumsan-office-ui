type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  token: string | null
  onUnauthorized?: () => void
}

export async function apiCall<T>(url: string, options: ApiOptions): Promise<T> {
  const { method = "GET", body, token, onUnauthorized } = options

  if (!token) {
    onUnauthorized?.()
    throw new Error("No valid token")
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "rs-google-token": `${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // Handle expired/invalid token from server
  if (response.status === 401) {
    onUnauthorized?.()
    throw new Error("Token expired or invalid")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || "Request failed")
  }

  return response.json()
}
