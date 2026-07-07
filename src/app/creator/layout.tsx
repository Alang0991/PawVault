import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { CreatorSidebar } from "@/components/creator-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  if (!user) {
    redirect("/auth/signin")
  }

  if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Become a Creator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You need a creator account to access the Creator Hub. Set up your
                storefront to start selling digital products on PawVault.
              </p>
              <Button asChild className="w-full gradient-bg text-white">
                <Link href="/store/create">Create your store</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <CreatorSidebar
            user={{
              avatar: user.avatar,
              displayName: user.displayName,
              username: user.username,
              role: user.role,
            }}
          />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
