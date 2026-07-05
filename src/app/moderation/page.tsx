import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ModerationClient from "@/components/moderation/ModerationClient"

export default async function ModerationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/moderation`)
  }

  const role = (session.user as any)?.role
  const allowedRoles = ["ADMIN", "MODERATOR"]
  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-2xl font-bold mb-4">Access denied</h1>
          <p className="text-muted-foreground">You do not have permission to access the moderation console.</p>
        </div>
      </div>
    )
  }

  return <ModerationClient />
}
