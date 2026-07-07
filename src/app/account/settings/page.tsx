import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import AccountSettingsForm from "./account-settings-form"

export const dynamic = "force-dynamic"

export default async function AccountSettingsPage() {
  const sessionUser = await getServerUser()
  if (!sessionUser) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      avatar: true,
      displayName: true,
      username: true,
      bio: true,
      website: true,
      location: true,
    },
  })

  const initial = {
    avatar: user?.avatar || "",
    displayName: user?.displayName || "",
    username: user?.username || "",
    bio: user?.bio || "",
    website: user?.website || "",
    location: user?.location || "",
  }

  return <AccountSettingsForm initial={initial} />
}
