import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { ContentPreferencesForm } from "./content-preferences-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ContentSettingsPage() {
  const user = await getServerUser()
  if (!user) redirect("/auth/signin")

  const prefs = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/account/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to account settings
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Content preferences</CardTitle>
          <CardDescription>
            Control how mature and adult content is shown across PawVault. These settings apply only to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentPreferencesForm
            initial={{
              showAdultContent: prefs.showAdultContent,
              blurNsfwPreviews: prefs.blurNsfwPreviews,
              adultConfirmedAt: prefs.adultConfirmedAt?.toISOString() ?? null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
