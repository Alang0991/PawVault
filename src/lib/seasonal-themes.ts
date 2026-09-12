export interface SeasonalEffectConfig {
  id: string
  name: string
  description: string
  density: "light" | "medium" | "heavy"
  color?: string
  size?: "small" | "medium" | "large"
  speed?: "slow" | "medium" | "fast"
}

export interface SeasonalThemeConfig {
  id: string
  name: string
  slug: string
  description: string
  startDate: { month: number; day: number }
  endDate: { month: number; day: number }
  effects: SeasonalEffectConfig[]
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  logoVariant?: string
  bannerVariant?: string
  enabled: boolean
}

const SEASONAL_THEME_DEFINITIONS: Record<string, SeasonalThemeConfig> = {
  christmas: {
    id: "christmas",
    name: "Christmas",
    slug: "christmas",
    description: "Festive holiday decorations with snow and lights",
    startDate: { month: 11, day: 1 },
    endDate: { month: 12, day: 26 },
    enabled: true,
    effects: [
      { id: "snow", name: "Snow", description: "Gentle snowfall", density: "light", color: "#ffffff" },
      { id: "christmasLights", name: "Christmas Lights", description: "Twinkling string lights", density: "medium", color: "#ff0000" },
    ],
    colors: {
      primary: "#DC2626",
      secondary: "#059669",
      accent: "#F59E0B",
      background: "#0F172A",
    },
  },

  halloween: {
    id: "halloween",
    name: "Halloween",
    slug: "halloween",
    description: "Spooky autumn atmosphere with falling leaves and bats",
    startDate: { month: 9, day: 15 },
    endDate: { month: 10, day: 31 },
    enabled: true,
    effects: [
      { id: "fallingLeaves", name: "Falling Leaves", description: "Autumn leaves drifting down", density: "medium", color: "#D97706" },
      { id: "confetti", name: "Confetti", description: "Floating paper scraps", density: "light", color: "#DC2626" },
    ],
    colors: {
      primary: "#991F1F",
      secondary: "#78350F",
      accent: "#D97706",
      background: "#020617",
    },
  },

  valentines: {
    id: "valentines",
    name: "Valentine's Day",
    slug: "valentines",
    description: "Romantic pink and red theme with floating hearts",
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 15 },
    enabled: true,
    effects: [
      { id: "confetti", name: "Floating Hearts", description: "Pink heart confetti", density: "medium", color: "#EC4899" },
    ],
    colors: {
      primary: "#DB2777",
      secondary: "#F59E0B",
      accent: "#EC4899",
      background: "#FFFFFF",
    },
  },

  pride: {
    id: "pride",
    name: "Pride",
    slug: "pride",
    description: "Celebration of Pride Month with rainbow colors",
    startDate: { month: 5, day: 1 },
    endDate: { month: 6, day: 30 },
    enabled: true,
    effects: [
      { id: "floatingParticles", name: "Rainbow Particles", description: "Floating rainbow particles", density: "medium", color: "#10B981" },
    ],
    colors: {
      primary: "#10B981",
      secondary: "#3B82F6",
      accent: "#EC4899",
      background: "#0F172A",
    },
  },

  easter: {
    id: "easter",
    name: "Easter",
    slug: "easter",
    description: "Spring pastels with floating eggs",
    startDate: { month: 3, day: 15 },
    endDate: { month: 4, day: 30 },
    enabled: true,
    effects: [
      { id: "confetti", name: "Floating Eggs", description: "Pastel Easter eggs", density: "light", color: "#FBBF24" },
    ],
    colors: {
      primary: "#FBBF24",
      secondary: "#6EE7B7",
      accent: "#FBBF24",
      background: "#FFFFFF",
    },
  },

  newYear: {
    id: "newYear",
    name: "New Year",
    slug: "newYear",
    description: "Celebration with fireworks and sparkles",
    startDate: { month: 11, day: 28 },
    endDate: { month: 1, day: 15 },
    enabled: true,
    effects: [
      { id: "confetti", name: "Fireworks", description: "New Year fireworks confetti", density: "heavy", color: "#FBBF24" },
    ],
    colors: {
      primary: "#FBBF24",
      secondary: "#60A5FA",
      accent: "#FBBF24",
      background: "#020617",
    },
  },

  summer: {
    id: "summer",
    name: "Summer",
    slug: "summer",
    description: "Bright summer vibes with floating particles",
    startDate: { month: 5, day: 1 },
    endDate: { month: 8, day: 31 },
    enabled: true,
    effects: [
      { id: "floatingParticles", name: "Sun Particles", description: "Warm floating particles", density: "light", color: "#FCD34D" },
    ],
    colors: {
      primary: "#F59E0B",
      secondary: "#0EA5E9",
      accent: "#F97316",
      background: "#FFFFFF",
    },
  },

  autumn: {
    id: "autumn",
    name: "Autumn",
    slug: "autumn",
    description: "Fall colors with falling leaves",
    startDate: { month: 9, day: 1 },
    endDate: { month: 11, day: 30 },
    enabled: true,
    effects: [
      { id: "fallingLeaves", name: "Falling Leaves", description: "Autumn leaves", density: "medium", color: "#D97706" },
    ],
    colors: {
      primary: "#EA580C",
      secondary: "#D97706",
      accent: "#CA8A04",
      background: "#FFFFFF",
    },
  },

  winter: {
    id: "winter",
    name: "Winter",
    slug: "winter",
    description: "Winter wonderland with snow and sparkles",
    startDate: { month: 11, day: 15 },
    endDate: { month: 3, day: 15 },
    enabled: true,
    effects: [
      { id: "snow", name: "Snow", description: "Winter snowfall", density: "light", color: "#FFFFFF" },
      { id: "floatingParticles", name: "Sparkles", description: "Winter sparkles", density: "light", color: "#93C5FD" },
    ],
    colors: {
      primary: "#93C5FD",
      secondary: "#BFDBFE",
      accent: "#60A5FA",
      background: "#0F172A",
    },
  },

  spring: {
    id: "spring",
    name: "Spring",
    slug: "spring",
    description: "Fresh spring with flowers and floating petals",
    startDate: { month: 2, day: 1 },
    endDate: { month: 5, day: 31 },
    enabled: true,
    effects: [
      { id: "floatingParticles", name: "Floating Petals", description: "Spring flower petals", density: "light", color: "#FBBF24" },
    ],
    colors: {
      primary: "#10B981",
      secondary: "#6EE7B7",
      accent: "#10B981",
      background: "#FFFFFF",
    },
  },
}

export function getAllSeasonalThemes(): SeasonalThemeConfig[] {
  return Object.values(SEASONAL_THEME_DEFINITIONS)
}

export function getSeasonalTheme(slug: string): SeasonalThemeConfig | undefined {
  return SEASONAL_THEME_DEFINITIONS[slug]
}

export function getActiveSeasonalTheme(date: Date = new Date()): SeasonalThemeConfig | null {
  const month = date.getMonth()
  const day = date.getDate()

  for (const theme of getAllSeasonalThemes()) {
    if (!theme.enabled) continue

    const { startDate, endDate } = theme

    const startIsLater =
      startDate.month > endDate.month ||
      (startDate.month === endDate.month && startDate.day > endDate.day)

    if (startIsLater) {
      if (
        (month === startDate.month && day >= startDate.day) ||
        (month === endDate.month && day <= endDate.day) ||
        (month > startDate.month) ||
        (month < endDate.month)
      ) {
        return theme
      }
    } else {
      if (
        (month === startDate.month && day >= startDate.day) ||
        (month === endDate.month && day <= endDate.day) ||
        (month > startDate.month && month < endDate.month)
      ) {
        return theme
      }
    }
  }

  return null
}

export function isSeasonalThemeActive(themeSlug: string, date: Date = new Date()): boolean {
  const theme = getSeasonalTheme(themeSlug)
  if (!theme) return false
  return getActiveSeasonalTheme(date)?.slug === themeSlug
}
