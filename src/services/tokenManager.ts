import { type User } from 'firebase/auth'

// ─── Configuration ───────────────────────────────────────────────────────────

/** Rotate token when it will expire within this many milliseconds */
const ROTATION_BUFFER_MS = 5 * 60 * 1000 // 5 minutes before expiry

/** Minimum interval between rotation attempts to prevent tight loops */
const MIN_ROTATION_INTERVAL_MS = 30 * 1000 // 30 seconds

/** Firebase ID tokens live for 1 hour */
const TOKEN_LIFETIME_MS = 60 * 60 * 1000

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TokenInfo {
  token: string
  issuedAt: number
  expiresAt: number
}

type TokenListener = (info: TokenInfo | null) => void

// ─── Token Manager ───────────────────────────────────────────────────────────

class TokenManager {
  private currentUser: User | null = null
  private tokenInfo: TokenInfo | null = null
  private rotationTimer: ReturnType<typeof setTimeout> | null = null
  private rotationCount = 0
  private lastRotationAt = 0
  private rotating = false
  private listeners = new Set<TokenListener>()

  /** Pending callers waiting for a rotation to complete */
  private pendingResolvers: Array<{
    resolve: (token: string) => void
    reject: (err: Error) => void
  }> = []

  // ── Public API ───────────────────────────────────────────────────────────

  /** Bind to the currently authenticated Firebase user. Call with null on logout. */
  async setUser(user: User | null): Promise<void> {
    this.cleanup()
    this.currentUser = user

    if (!user) {
      this.tokenInfo = null
      this.rotationCount = 0
      this.notify()
      return
    }

    // Acquire the initial token
    await this.rotate(/* force */ true)
    this.scheduleNextRotation()
  }

  /**
   * Returns a valid token string, rotating first if the current token is
   * stale or about to expire.  Queues callers if a rotation is already in
   * flight so we don't fire duplicate refresh requests.
   */
  async getValidToken(): Promise<string> {
    if (!this.currentUser) {
      throw new Error('No authenticated user — cannot provide token')
    }

    // If we already have a fresh token, return it immediately
    if (this.tokenInfo && !this.isExpiringSoon()) {
      return this.tokenInfo.token
    }

    // If a rotation is already in progress, wait for it
    if (this.rotating) {
      return new Promise<string>((resolve, reject) => {
        this.pendingResolvers.push({ resolve, reject })
      })
    }

    // Otherwise kick off a rotation
    await this.rotate()
    return this.tokenInfo!.token
  }

  /** Read-only snapshot of the current token metadata (no secret exposed). */
  getState() {
    return {
      isAuthenticated: this.tokenInfo !== null,
      issuedAt: this.tokenInfo ? new Date(this.tokenInfo.issuedAt).toISOString() : null,
      expiresAt: this.tokenInfo ? new Date(this.tokenInfo.expiresAt).toISOString() : null,
      isRotating: this.rotating,
      rotationCount: this.rotationCount,
    }
  }

  /** Subscribe to token change events. Returns an unsubscribe function. */
  subscribe(listener: TokenListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Force a token rotation — use when the server rejects the current token
   * (e.g. 401 response) even though it hasn't expired client-side.
   */
  async forceRotate(): Promise<string> {
    if (!this.currentUser) {
      throw new Error('No authenticated user — cannot rotate token')
    }

    // If a rotation is already in progress, wait for it
    if (this.rotating) {
      return new Promise<string>((resolve, reject) => {
        this.pendingResolvers.push({ resolve, reject })
      })
    }

    await this.rotate(/* force */ true)
    return this.tokenInfo!.token
  }

  /** Tear down timers and state. Safe to call multiple times. */
  cleanup(): void {
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer)
      this.rotationTimer = null
    }
    this.flushPending(new Error('Token manager cleaned up'))
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private async rotate(force = false): Promise<void> {
    if (!this.currentUser) return

    // Throttle to avoid tight loops
    const now = Date.now()
    if (!force && now - this.lastRotationAt < MIN_ROTATION_INTERVAL_MS) {
      return
    }

    this.rotating = true

    try {
      // forceRefresh=true tells Firebase to mint a new token from the server
      const token = await this.currentUser.getIdToken(/* forceRefresh */ true)

      const issuedAt = now
      const expiresAt = now + TOKEN_LIFETIME_MS

      this.tokenInfo = { token, issuedAt, expiresAt }
      this.rotationCount++
      this.lastRotationAt = now

      // Resolve any callers that were waiting
      for (const { resolve } of this.pendingResolvers) {
        resolve(token)
      }
      this.pendingResolvers = []

      this.notify()
      this.scheduleNextRotation()
    } catch (err) {
      this.flushPending(
        err instanceof Error ? err : new Error('Token rotation failed')
      )
      throw err
    } finally {
      this.rotating = false
    }
  }

  private isExpiringSoon(): boolean {
    if (!this.tokenInfo) return true
    return Date.now() >= this.tokenInfo.expiresAt - ROTATION_BUFFER_MS
  }

  private scheduleNextRotation(): void {
    if (this.rotationTimer) clearTimeout(this.rotationTimer)
    if (!this.tokenInfo) return

    // Schedule rotation for ROTATION_BUFFER_MS before expiry
    const delay = this.tokenInfo.expiresAt - Date.now() - ROTATION_BUFFER_MS
    if (delay <= 0) return // already past, rotate will happen on next getValidToken

    this.rotationTimer = setTimeout(() => {
      this.rotate().catch(() => {
        // Rotation failed — next getValidToken call will retry
      })
    }, delay)
  }

  private notify(): void {
    const info = this.tokenInfo ? { ...this.tokenInfo } : null
    for (const listener of this.listeners) {
      try {
        listener(info)
      } catch {
        // listener errors should not break the manager
      }
    }
  }

  private flushPending(err: Error): void {
    for (const { reject } of this.pendingResolvers) {
      reject(err)
    }
    this.pendingResolvers = []
  }
}

// Singleton
export const tokenManager = new TokenManager()
