"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useSession } from "next-auth/react"

export interface AccountState {
  authenticated: boolean
  user: {
    id: string
    email: string
    username: string
    displayName: string | null
    role: string
    status: string
    isVerified: boolean
    avatar: string | null
    bio: string | null
    creatorStatus: string
    creatorTermsAcceptedAt: string | null
    customPermissions: string | null
    suspendedUntil: string | null
    isFeatured: boolean
    store: { id: string; slug: string; name: string; visibility: string } | null
  }
  permissions: string[]
  features: {
    canCreateProducts: boolean
    canManageStore: boolean
    isStaff: boolean
  }
}

export interface UseAccountStateReturn {
  account: AccountState | null
  isLoading: boolean
  error: string | null
  refreshCurrentAccount: () => Promise<void>
}

export function useAccountState(): UseAccountStateReturn {
  const { data: session, status: sessionStatus } = useSession()
  const [account, setAccount] = useState<AccountState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshToken = useRef(0)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const fetchAccountState = useCallback(async () => {
    refreshToken.current += 1
    const currentToken = refreshToken.current

    try {
      setError(null)
      const res = await fetch("/api/account/state", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!res.ok) {
        if (res.status === 401) {
          if (currentToken === refreshToken.current) {
            setAccount(null)
            setIsLoading(false)
          }
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const data = (await res.json()) as AccountState

      if (currentToken !== refreshToken.current) return

      setAccount(data)
      setError(data.authenticated ? null : null)
    } catch (err) {
      if (currentToken !== refreshToken.current) return
      setError(err instanceof Error ? err.message : "Failed to load account state")
      setAccount(null)
    } finally {
      if (currentToken === refreshToken.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === "loading") return

    if (sessionStatus === "unauthenticated") {
      setAccount(null)
      setIsLoading(false)
      setError(null)
      return
    }

    fetchAccountState()

    const interval = setInterval(fetchAccountState, 60_000)

    return () => clearInterval(interval)
  }, [sessionStatus, fetchAccountState])

  useEffect(() => {
    const bc = new BroadcastChannel("pawvault-account-sync")
    channelRef.current = bc

    bc.onmessage = (event) => {
      if (event.data?.type === "account-updated") {
        fetchAccountState()
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "pawvault-account-sync") {
        fetchAccountState()
      }
    }

    window.addEventListener("storage", onStorage)

    const onFocus = () => {
      if (sessionStatus === "authenticated") {
        fetchAccountState()
      }
    }

    window.addEventListener("focus", onFocus)

    return () => {
      bc.close()
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", onFocus)
    }
  }, [sessionStatus, fetchAccountState])

  return { account, isLoading, error, refreshCurrentAccount: fetchAccountState }
}
