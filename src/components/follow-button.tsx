"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, LogIn } from "lucide-react"

interface FollowButtonProps {
  creatorId: string
  creatorName?: string
  compact?: boolean
}

export function FollowButton({ creatorId, creatorName, compact = false }: FollowButtonProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch(`/api/follows?userId=${creatorId}`)
        if (res.ok) {
          const data = await res.json()
          setIsFollowing(data.following)
        }
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [creatorId])

  async function handleFollow() {
    if (!session) {
      window.location.href = "/auth/signin"
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: creatorId }),
      })

      if (res.status === 401) {
        window.location.href = "/auth/signin"
        return
      }

      if (res.ok) {
        setIsFollowing(true)
      } else {
        const data = await res.json()
      }
    } catch (e) {
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUnfollow() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/follows/${creatorId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        setIsFollowing(false)
      } else {
        const data = await res.json()
      }
    } catch (e) {
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled={compact}>
        ...
      </Button>
    )
  }

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        onClick={handleUnfollow}
        disabled={actionLoading}
        className={compact ? "h-8 px-3 text-xs" : ""}
      >
        <UserCheck className="h-4 w-4 mr-2" />
        Following
      </Button>
    )
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={actionLoading}
      className={compact ? "h-8 px-3 text-xs" : ""}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Follow
    </Button>
  )
}
