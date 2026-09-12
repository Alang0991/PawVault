"use client"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { getActiveSeasonalTheme } from "@/lib/seasonal-themes"
import type { SeasonalThemeConfig, SeasonalEffectConfig } from "@/lib/seasonal-themes"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  symbol?: string
}

interface SeasonalEffectsProps {
  reduceMotionOverride?: boolean
}

const EFFECT_SYMBOLS: Record<string, string[]> = {
  snow: ["❅", "❆", "•"],
  confetti: ["🎉", "🎊", "✨", "⭐"],
  fallingLeaves: ["🍂", "🍁",],
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
  const color = effect.color || EFFECT_COLORS[effect.id] || "#FFFFFF"

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (effect.size === "large" ? 6 : effect.size === "small" ? 2 : 4) + 1,
      speed: Math.random() * 0.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.3,
      symbol: effect.id === "snow" || effect.id === "fallingLeaves"
        ? symbols[Math.floor(Math.random() * symbols.length)]
        : undefined,
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
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduceMotion) return

    const count = getParticleDensity(effect)
    setParticles(createParticles(count, effect))
  }, [effect, reduceMotion])

  useEffect(() => {
    if (reduceMotion || particles.length === 0) return

    const symbols = EFFECT_SYMBOLS[effect.id] || ["•"]
    const color = effect.color || EFFECT_COLORS[effect.id] || "#FFFFFF"

    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => {
          const newPos = { ...p }
          newPos.y += p.speed * 0.15
          if (newPos.y > 100) {
            newPos.y = -5
            newPos.x = Math.random() * 100
          }
          newPos.x += (Math.sin(Date.now() * 0.001 + p.id) * 0.02)
          return newPos
        }),
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationRef.current)
  }, [effect, particles, reduceMotion])

  if (reduceMotion || particles.length === 0) return null

  const symbols = EFFECT_SYMBOLS[effect.id] || ["•"]
  const color = effect.color || EFFECT_COLORS[effect.id] || "#FFFFFF"

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)]
        return (
          <div
            key={p.id}
            className="absolute will-change-transform"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              color: color,
            }}
          >
            {p.symbol ?? symbol}
          </div>
        )
      })}
    </div>
  )
}

export function SeasonalEffects({ reduceMotionOverride }: SeasonalEffectsProps) {
  const { reduceMotion } = useTheme()
  const prefersReduced = useReducedMotion()
  const seasonalTheme = useSeasonalTheme()

  const shouldReduceMotion = reduceMotionOverride ?? (reduceMotion || prefersReduced)

  if (!seasonalTheme || seasonalTheme.effects.length === 0) return null

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
