"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"
const discordEnabled = process.env.NEXT_PUBLIC_DISCORD_AUTH_ENABLED === "true"

export default function OAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-slate-900/80">
        <h1 className="text-3xl font-bold mb-4">Continue with social login</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use one of the supported OAuth providers to sign in quickly.
        </p>

        <div className="grid gap-3">
          {googleEnabled ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Continue with Google
            </Button>
          ) : null}

          {discordEnabled ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            >
              Continue with Discord
            </Button>
          ) : null}

          {!googleEnabled && !discordEnabled ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
              No social providers are configured. Enable them in the environment and restart the app.
            </div>
          ) : null}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/auth/signin" className="text-purple-600 hover:underline">
            Back to email sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
