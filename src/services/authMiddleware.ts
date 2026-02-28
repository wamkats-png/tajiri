import { tokenManager } from './tokenManager'

// ─── Configuration ───────────────────────────────────────────────────────────

/** Max retries when a request fails with 401 (token may have been revoked) */
const MAX_AUTH_RETRIES = 1

// ─── Authenticated fetch ─────────────────────────────────────────────────────

/**
 * Drop-in replacement for `fetch` that injects a valid Firebase ID token as a
 * Bearer token in the Authorization header.  On a 401 response the token is
 * rotated and the request is retried once.
 *
 * Use this for any API call that requires user authentication.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_AUTH_RETRIES; attempt++) {
    try {
      const token = await tokenManager.getValidToken()

      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${token}`)

      const response = await fetch(input, { ...init, headers })

      // If unauthorized and we haven't exhausted retries, force-rotate and retry
      if (response.status === 401 && attempt < MAX_AUTH_RETRIES) {
        await tokenManager.forceRotate()
        continue
      }

      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt >= MAX_AUTH_RETRIES) break
    }
  }

  throw lastError ?? new Error('authenticatedFetch failed')
}

// ─── Helpers for common patterns ─────────────────────────────────────────────

/** Authenticated JSON GET */
export async function authGet<T>(url: string): Promise<T> {
  const res = await authenticatedFetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error?.message ?? `GET ${url} failed with ${res.status}`)
  }
  return res.json()
}

/** Authenticated JSON POST */
export async function authPost<T>(url: string, body: unknown): Promise<T> {
  const res = await authenticatedFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message ?? `POST ${url} failed with ${res.status}`)
  }
  return res.json()
}
