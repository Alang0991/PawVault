export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AccountSettingsForm from "@/app/account/settings/account-settings-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store, Shield } from "lucide-react"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        avatar: true,
        displayName: true,
        username: true,
        bio: true,
        website: true,
        location: true,
        role: true,
      },
    })
  } catch (error) {
    console.error("Settings data error:", error)
    redirect("/auth/signin")
  }

  if (!user) {
    redirect("/auth/signin")
  }

  const initial = {
    avatar: user.avatar || "",
    displayName: user.displayName || "",
    username: user.username,
    bio: user.bio || "",
    website: user.website || "",
    location: user.location || "",
  }

  const isCreator = ["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)
  const isAdmin = ["ADMIN", "OWNER"].includes(user.role)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <div className="flex gap-2">
            {isCreator && (
              <Button asChild variant="outline">
                <Link href="/creator/dashboard">
                  <Store className="h-4 w-4 mr-2" />
                  Creator Hub
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button asChild variant="outline">
                <Link href="/moderation">
                  <Shield className="h-4 w-4 mr-2" />
                  Moderation
                </Link>
              </Button>
            )}
          </div>
        </div>
        <AccountSettingsForm initial={initial} />
      </div>
    </div>
  )
}
