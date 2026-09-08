"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, Package, Shield } from "lucide-react"

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
              <Link href="/moderation" className="block p-4 border rounded hover:shadow">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Moderation Dashboard</span>
                </div>
              </Link>
              <Link href="/moderation/users" className="block p-4 border rounded hover:shadow">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>User Management</span>
                </div>
              </Link>
              <Link href="/moderation/products" className="block p-4 border rounded hover:shadow">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-green-500" />
                  <span>Product Moderation</span>
                </div>
              </Link>
              <Link href="/moderation/reports" className="block p-4 border rounded hover:shadow">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Reports</span>
                </div>
              </Link>
              <Link href="/admin/founder" className="block p-4 border rounded hover:shadow">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-amber-500" />
                  <span>Admin Dashboard</span>
                </div>
              </Link>
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
