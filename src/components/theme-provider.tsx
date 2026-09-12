"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react"
import { Moon, Sun, Monitor } from "lucide-react"

export type ThemeMode = "light" | "dark" | "system"

export const THEME_COOKIE_NAME = "pawvault-theme"
export const ACCENT_COLOR_COOKIE_NAME = "pawvault-accent"
export const REDUCE_MOTION_COOKIE_NAME = "pawvault-reduce-motion"

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: "light" | "dark"
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  accentColor: string
  setAccentColor: (color: string) => void
  reduceMotion: boolean
  setReduceMotion: (reduce: boolean) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const THEME_INIT_SCRIPT = `
(function(){try{
  var t=localStorage.getItem('pawvault-theme');
  var s=typeof window!=='undefined'&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  var resolved = t === 'light' ? false : (t === 'dark' ? true : (t === 'system' ? s : s));
  document.documentElement.classList.toggle('dark', resolved);
  var accent=localStorage.getItem('pawvault-accent');
  if(accent){document.documentElement.style.setProperty('--pv-accent-override',accent.replace('#','')+' 83% 55%');document.documentElement.style.setProperty('--accent',accent.replace('#','')+' 83% 55%');document.documentElement.style.setProperty('--ring',accent.replace('#','')+' 83% 55%');document.documentElement.style.setProperty('--primary',accent.replace('#','')+' 83% 55%');}
  var rm=localStorage.getItem('pawvault-reduce-motion');
  if(rm==='true'){document.documentElement.classList.add('reduce-motion');}
}catch(e){}})();
`

export function applyThemeToDOM(theme: ThemeMode, accentColor?: string, reduceMotion?: boolean) {
  const root = document.documentElement
  const resolved = resolveTheme(theme)

  root.classList.toggle("dark", resolved === "dark")

  if (accentColor) {
    const hsl = hexToHsl(accentColor)
    root.style.setProperty("--pv-accent", hsl)
    root.style.setProperty("--pv-accent-hover", hslHover(hsl))
    root.style.setProperty("--accent", hsl)
    root.style.setProperty("--ring", hsl)
  }

  root.classList.toggle("reduce-motion", !!reduceMotion)
}

export function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme === "light") return "light"
  if (theme === "dark") return "dark"
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }
  return "light"
}

export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "262 83% 55%"

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function hslHover(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  if (!parts) return hsl
  const h = parseInt(parts[1])
  const s = parseInt(parts[2])
  const l = parseInt(parts[3])
  const newL = Math.min(100, l - 5)
  return `${h} ${s}% ${newL}%`
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system"
  const stored = localStorage.getItem("pawvault-theme") as ThemeMode | null
  return stored ?? "system"
}

export function getStoredAccentColor(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("pawvault-accent") ?? ""
}

export function getStoredReduceMotion(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("pawvault-reduce-motion") === "true"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [accentColor, setAccentColorState] = useState<string>("")
  const [reduceMotion, setReduceMotionState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const storedTheme = getStoredTheme()
    const storedAccent = getStoredAccentColor()
    const storedReduceMotion = getStoredReduceMotion()

    setThemeState(storedTheme)
    const resolved = resolveTheme(storedTheme)
    setResolvedTheme(resolved)
    applyThemeToDOM(storedTheme, storedAccent || undefined, storedReduceMotion)

    if (storedAccent) setAccentColorState(storedAccent)
    setReduceMotionState(storedReduceMotion)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        const next = resolveTheme("system")
        setResolvedTheme(next)
        applyThemeToDOM("system", storedAccent || undefined, storedReduceMotion)
      }
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme)
    localStorage.setItem("pawvault-theme", nextTheme)
    document.cookie = `${THEME_COOKIE_NAME}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`
    const resolved = resolveTheme(nextTheme)
    setResolvedTheme(resolved)
    applyThemeToDOM(nextTheme, accentColor || undefined, reduceMotion)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const setAccentColor = (color: string) => {
    setAccentColorState(color)
    localStorage.setItem("pawvault-accent", color)
    document.cookie = `${ACCENT_COLOR_COOKIE_NAME}=${encodeURIComponent(color)}; path=/; max-age=31536000; SameSite=Lax`
    applyThemeToDOM(theme, color, reduceMotion)
  }

  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce)
    localStorage.setItem("pawvault-reduce-motion", String(reduce))
    document.cookie = `${REDUCE_MOTION_COOKIE_NAME}=${String(reduce)}; path=/; max-age=31536000; SameSite=Lax`
    applyThemeToDOM(theme, accentColor || undefined, reduce)
  }

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    accentColor,
    setAccentColor,
    reduceMotion,
    setReduceMotion,
    mounted,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}

interface ThemeToggleProps {
  showSystemOption?: boolean
}

export function ThemeToggle({ showSystemOption = true }: ThemeToggleProps) {
  const { resolvedTheme, theme, setTheme, toggleTheme, mounted } = useTheme()

  const handleToggle = () => {
    if (showSystemOption && theme === "system") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme(showSystemOption ? "system" : "dark")
    } else {
      toggleTheme()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {!mounted ? (
        <Sun className="h-5 w-5" />
      ) : resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )
}

ThemeToggle.displayName = "ThemeToggle"

export function ThemeModeSelector() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) return null

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`p-2 rounded transition-all ${
          theme === "light"
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`p-2 rounded transition-all ${
          theme === "dark"
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`p-2 rounded transition-all ${
          theme === "system"
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}

ThemeModeSelector.displayName = "ThemeModeSelector"
