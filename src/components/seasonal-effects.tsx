"use client"

import { useEffect, useState, useMemo } from "react"
import { useTheme } from "@/components/theme-provider"
import { getActiveSeasonalTheme } from "@/lib/seasonal-themes"
import type { SeasonalThemeConfig, SeasonalEffectConfig } from "@/lib/seasonal-themes"

interface Particle {
  id: number
  x: number
  size: number
  speed: number
  opacity: number
  symbol: string
}

interface SeasonalEffectsProps {
  reduceMotionOverride?: boolean
  serverTheme?: SeasonalThemeConfig | null
}

const EFFECT_SYMBOLS: Record<string, string[]> = {
  snow: ["❅", "❆", "•"],
  confetti: ["🎉", "🎊", "✨", "⭐"],
  fallingLeaves: ["🍂", "🍁"],
  fireflies: ["✨", "🔹", "🔸"],
  floatingParticles: ["✨", "★", "◆"],
  christmasLights: ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠"],
}

const EFFECT_COLORS: Record<string, string> = {
  snow: "#FFFFFF",
  confetti: "#FFD700",
  fallingLeaves: "#D97706",
  fireflies: "#10B981",
  floatingParticles: "#93C5FD",
  christmasLights: "#FF0000",
}

function useSeasonalTheme(dateInput?: Date) {
  const [theme, setTheme] = useState<SeasonalThemeConfig | null>(null)

  useEffect(() => {
    const active = getActiveSeasonalTheme(dateInput ?? new Date())
    setTheme(active)
  }, [dateInput])

  return theme
}

function useReducedMotion(): boolean {
  const { reduceMotion } = useTheme()
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mediaQuery.addEventListener?.("change", handler)

    return () => mediaQuery.removeEventListener?.("change", handler)
  }, [])

  return reduceMotion || prefersReduced
}

function createParticles(
  count: number,
  effect: SeasonalEffectConfig,
): Particle[] {
  const particles: Particle[] = []
  const symbols = EFFECT_SYMBOLS[effect.id] || ["•"]

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * (effect.size === "large" ? 6 : effect.size === "small" ? 2 : 4) + 1,
      speed: Math.random() * 0.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.3,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
    })
  }

  return particles
}

function getParticleDensity(effect: SeasonalEffectConfig): number {
  const base = effect.density === "heavy" ? 60 : effect.density === "medium" ? 40 : 25
  return base
}

function SeasonalEffectRenderer({
  effect,
  reduceMotion,
}: {
  effect: SeasonalEffectConfig
  reduceMotion: boolean
}) {
  // Particles are generated once per effect and animated purely with CSS
  // (compositor-only transforms). This keeps the decorative layer off the
  // main thread so it can never block clicks or page interactivity.
  const particles = useMemo(
    () => createParticles(getParticleDensity(effect), effect),
    [effect],
  )

  if (reduceMotion) return null

  const color = effect.color || EFFECT_COLORS[effect.id] || "#FFFFFF"

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute will-change-transform pawvault-fall pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: 0,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            color,
            animationDuration: `${3 + p.speed * 5}s`,
            animationDelay: `${(p.id * 13) % 23}s`,
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  )
}

export function SeasonalEffects({ reduceMotionOverride, serverTheme }: SeasonalEffectsProps) {
  const { reduceMotion, mounted } = useTheme()
  const prefersReduced = useReducedMotion()
  const hookTheme = useSeasonalTheme()
  const seasonalTheme = serverTheme ?? hookTheme

  const shouldReduceMotion = reduceMotionOverride ?? (reduceMotion || prefersReduced)

  if (!mounted || !seasonalTheme || seasonalTheme.effects.length === 0) return null

  return (
    <>
      {seasonalTheme.effects.map((effect) => (
        <SeasonalEffectRenderer
          key={effect.id}
          effect={effect}
          reduceMotion={shouldReduceMotion}
        />
      ))}
    </>
  )
}
