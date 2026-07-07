export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AccountSettingsForm from "@/app/account/settings/account-settings-form"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      avatar: true,
      displayName: true,
      username: true,
      bio: true,
      website: true,
      location: true,
    },
  })

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <AccountSettingsForm initial={initial} />
      </div>
    </div>
  )
}
