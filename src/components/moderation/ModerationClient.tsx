"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function ModerationClient() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Moderation Console</h1>

        {!session ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">You must sign in to access moderation tools.</p>
            <div className="flex items-center gap-2">
              <Button onClick={() => signIn(undefined, { callbackUrl: '/moderation' })} className="gradient-bg text-white">Sign In</Button>
              <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline">Open full sign-in page</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">Signed in as <strong>{session.user?.email || session.user?.name}</strong></p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/moderation" className="block p-4 border rounded hover:shadow">Moderation Queue</Link>
              <Link href="/admin/users" className="block p-4 border rounded hover:shadow">User Management</Link>
              <Link href="/admin" className="block p-4 border rounded hover:shadow">Admin Dashboard</Link>
              <Link href="/admin/reports" className="block p-4 border rounded hover:shadow">Reports</Link>
            </div>

            <div className="pt-4">
              <Button variant="ghost" onClick={() => signOut()}>Sign Out</Button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
