import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calendar, Snowflake, Sparkles } from "lucide-react"
import Link from "next/link"
import { getAllSeasonalThemes } from "@/lib/seasonal-themes"

export const dynamic = "force-dynamic"

export default async function SeasonalThemesPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let dbThemes: any[] = []
  try {
    dbThemes = await prisma.seasonalTheme.findMany({
      orderBy: { displayOrder: "asc" },
    })
  } catch {
    dbThemes = []
  }

  const builtInThemes = getAllSeasonalThemes()
  const dbSlugs = new Set(dbThemes.map((t) => t.slug))
  const availableBuiltIn = builtInThemes.filter((t) => !dbSlugs.has(t.slug))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seasonal Themes</h1>
        <p className="text-sm text-muted-foreground">
          Manage seasonal themes that automatically activate based on dates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Built-in Themes</CardTitle>
          <CardDescription>Pre-configured seasonal themes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBuiltIn.map((theme) => (
              <ThemeCard key={theme.slug} theme={theme} isBuiltIn={true} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Themes</CardTitle>
          <CardDescription>Your custom seasonal themes</CardDescription>
        </CardHeader>
        <CardContent>
          {dbThemes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom themes yet. Create one below.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbThemes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </div>
          )}
          <Button className="mt-4" asChild>
            <Link href="/admin/founder/seasonal-themes/new">Create Custom Theme</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ThemeCard({ theme, isBuiltIn = false }: { theme: any; isBuiltIn?: boolean }) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{theme.name}</CardTitle>
          {isBuiltIn && <Sparkles className="h-5 w-5 text-muted-foreground" />}
        </div>
        <CardDescription className="text-sm">
          {theme.description || `${theme.slug} seasonal theme`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          {theme.startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Starts: {new Date(theme.startDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {theme.endDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Ends: {new Date(theme.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        {isBuiltIn && (
          <div className="mt-3 pt-3 border-t">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Switch defaultChecked={theme.enabled} />
              <span className="text-sm">Enabled</span>
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
