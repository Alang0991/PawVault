"use client"

import { useEffect, useState } from "react"
import type { SeasonalThemeConfig } from "@/lib/seasonal-themes"
import { getActiveSeasonalTheme } from "@/lib/seasonal-themes"

export function useSeasonalTheme(dateInput?: Date) {
  const [theme, setTheme] = useState<SeasonalThemeConfig | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const activeTheme = getActiveSeasonalTheme(dateInput ?? new Date())
    setTheme(activeTheme)
  }, [dateInput])

  return { theme, mounted }
}
