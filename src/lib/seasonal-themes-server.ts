import { prisma } from "@/lib/prisma"
import { getAllSeasonalThemes, getActiveSeasonalTheme } from "@/lib/seasonal-themes"
import type { SeasonalThemeConfig, SeasonalEffectConfig } from "@/lib/seasonal-themes"

export interface DBRestSeasonalTheme {
  id: string
  name: string
  slug: string
  description: string | null
  isEnabled: boolean
  startDate: Date | null
  endDate: Date | null
  config: any
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

export async function getActiveSeasonalThemeFromDb(date: Date = new Date()): Promise<SeasonalThemeConfig | null> {
  try {
    const dbThemes = await prisma.seasonalTheme.findMany({
      where: {
        isEnabled: true,
        OR: [
          { startDate: { lte: date }, endDate: { gte: date } },
          { startDate: { lte: date }, endDate: null },
          { startDate: null, endDate: { gte: date } },
          { startDate: null, endDate: null },
        ],
      },
      orderBy: { displayOrder: "asc" },
    })

    if (dbThemes.length > 0) {
      const active = dbThemes[0]
      const config = (active.config as any) || {}
      return {
        id: active.id,
        name: active.name,
        slug: active.slug,
        description: active.description ?? "",
        startDate: { month: active.startDate ? active.startDate.getMonth() : 0, day: active.startDate ? active.startDate.getDate() : 1 },
        endDate: { month: active.endDate ? active.endDate.getMonth() : 0, day: active.endDate ? active.endDate.getDate() : 1 },
        effects: config.effects || [],
        colors: config.colors || {
          primary: "#8B5CF6",
          secondary: "#0EA5E9",
          accent: "#8B5CF6",
          background: "#0F172A",
        },
        logoVariant: config.logoVariant as string | undefined,
        bannerVariant: config.bannerVariant as string | undefined,
        enabled: active.isEnabled,
      }
    }

    return getActiveSeasonalTheme(date)
  } catch (error) {
    console.error("Failed to fetch seasonal theme:", error)
    return getActiveSeasonalTheme(date)
  }
}

export async function getSeasonalThemeForDisplay(date: Date = new Date()): Promise<SeasonalThemeConfig | null> {
  return getActiveSeasonalThemeFromDb(date)
}
