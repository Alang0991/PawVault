"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    signOut({ callbackUrl: "/auth/signin" })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-blue-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold mb-4">Signing out...</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Please wait while we sign you out.
        </p>
      </div>
    </div>
  )
}
