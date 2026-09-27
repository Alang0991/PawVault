export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AccountSettingsForm from "@/app/account/settings/account-settings-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store, Shield } from "lucide-react"
import { SettingsSection } from "@/components/settings-section"
import { NotificationPreferencesSection } from "@/components/notification-preferences-section"
import { SessionsSection } from "@/components/sessions-section"
import { DeleteAccountSection } from "@/components/delete-account-section"
import { PrivacySettingsSection } from "@/components/privacy-settings-section"
import { DisplaySettingsSection } from "@/app/account/settings/display-settings-section"

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

  const isCreator = ["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(user.role)
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)

  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-10">
        <div className="max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
              Settings
            </h1>
            <div className="flex flex-wrap gap-2">
              {isCreator && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/creator/dashboard">
                    <Store className="mr-2 h-4 w-4" />
                    Creator dashboard
                  </Link>
                </Button>
              )}
              {isStaff && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/moderation">
                    <Shield className="mr-2 h-4 w-4" />
                    Moderation
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <SettingsSection title="Profile">
              <AccountSettingsForm initial={initial} />
            </SettingsSection>

            <SettingsSection
              title="Display"
              description="Language, currency, theme and appearance. Your choice is remembered across sessions."
            >
              <DisplaySettingsSection />
            </SettingsSection>

            <SettingsSection title="Notifications">
              <NotificationPreferencesSection />
            </SettingsSection>

            <SettingsSection
              title="Active sessions"
              description="Devices currently signed in to your account."
            >
              <SessionsSection />
            </SettingsSection>

            <SettingsSection title="Privacy">
              <PrivacySettingsSection />
            </SettingsSection>

            <SettingsSection
              tone="danger"
              title="Delete account"
              description="This permanently removes your account, products and purchases."
            >
              <DeleteAccountSection />
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  )
}
