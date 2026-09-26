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
     language: string | null
     currency: string | null
     theme: string | null
     accentColor: string | null
     reduceMotion: boolean | null
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

function createEmptyAccountState(): AccountState {
  return {
    authenticated: false,
    user: {
      id: "",
      email: "",
      username: "",
      displayName: null,
      role: "",
      status: "",
      isVerified: false,
      avatar: null,
      bio: null,
      creatorStatus: "",
      creatorTermsAcceptedAt: null,
      customPermissions: null,
      suspendedUntil: null,
      isFeatured: false,
      language: null,
      currency: null,
      theme: null,
      accentColor: null,
      reduceMotion: null,
      store: null,
    },
    permissions: [],
    features: {
      canCreateProducts: false,
      canManageStore: false,
      isStaff: false,
    },
  }
}

export function useAccountState(): UseAccountStateReturn {
  const { data: session, status: sessionStatus, update: updateSession } = useSession()
  const [account, setAccount] = useState<AccountState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshToken = useRef(0)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const isMountedRef = useRef(true)

  // Create a fallback account state from session data (available immediately)
  const sessionAccountState = session?.user ? {
    authenticated: true,
    user: {
      id: session.user.id || "",
      email: session.user.email || "",
      username: session.user.name || "",
      displayName: session.user.name || null,
      role: (session.user as any).role || "",
      status: "ACTIVE",
      isVerified: false,
      avatar: session.user.image || null,
      bio: null,
      creatorStatus: "",
      creatorTermsAcceptedAt: null,
      customPermissions: null,
      suspendedUntil: null,
      isFeatured: false,
      language: "en",
      currency: "USD",
      theme: "system",
      accentColor: "#8B5CF6",
      reduceMotion: false,
      store: null,
    },
    permissions: (session.user as any).permissions || [],
    features: (session.user as any).features || {
      canCreateProducts: false,
      canManageStore: false,
      isStaff: false,
    },
  } : null

  const fetchAccountState = useCallback(async (isBackground = false) => {
    refreshToken.current += 1
    const currentToken = refreshToken.current

    try {
      if (!isBackground) setError(null)
      
      const res = await fetch("/api/account/state", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (!res.ok) {
        if (res.status === 401) {
          if (currentToken === refreshToken.current && isMountedRef.current) {
            setAccount(null)
            setIsLoading(false)
          }
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const data = (await res.json()) as AccountState

      if (currentToken !== refreshToken.current || !isMountedRef.current) return

      setAccount(data)
      setError(data.authenticated ? null : null)

      // If session was updated with new permissions/features, refresh it
      const sessionUpdate = res.headers.get("x-session-update")
      if (sessionUpdate && session) {
        try {
          const updateData = JSON.parse(sessionUpdate)
          await updateSession(updateData)
        } catch {
          // Ignore update errors
        }
      }
    } catch (err) {
      if (currentToken !== refreshToken.current || !isMountedRef.current) return
      if (!isBackground) {
        setError(err instanceof Error ? err.message : "Failed to load account state")
      }
      // Don't clear account on background refresh errors
      if (!isBackground) {
        setAccount(null)
      }
    } finally {
      if (currentToken === refreshToken.current && isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [session, updateSession])

  useEffect(() => {
    isMountedRef.current = true

    if (sessionStatus === "loading") {
      // While session is loading, use session data as fallback if available
      if (sessionAccountState && !account) {
        setAccount(sessionAccountState)
        setIsLoading(false)
      }
      return
    }

    if (sessionStatus === "unauthenticated") {
      setAccount(null)
      setIsLoading(false)
      setError(null)
      return
    }

    // Session is authenticated - fetch full account state
    // Use session data immediately as fallback
    if (sessionAccountState && !account) {
      setAccount(sessionAccountState)
    }

    fetchAccountState()

    const interval = setInterval(() => fetchAccountState(true), 60_000)

    return () => {
      clearInterval(interval)
      isMountedRef.current = false
    }
  }, [sessionStatus, sessionAccountState, account, fetchAccountState])

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