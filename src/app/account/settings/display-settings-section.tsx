"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ThemeModeSelector } from "@/components/theme-provider"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/hooks/use-translation"
import { useCurrency } from "@/components/providers/currency-provider"
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "@/lib/i18n/localization"
import type { Language } from "@/lib/i18n/localization"
import { SUPPORTED_CURRENCIES, getCurrencyInfo } from "@/lib/currency"
import type { CurrencyInfo } from "@/lib/currency"
import { Monitor, Globe, DollarSign, Palette, Eye } from "lucide-react"

interface DisplaySettings {
  language: string
  currency: string
  theme: string
  accentColor: string | null
  reduceMotion: boolean
}

export function DisplaySettingsSection() {
  const [settings, setSettings] = useState<DisplaySettings>({
    language: "en",
    currency: "USD",
    theme: "system",
    accentColor: "#8B5CF6",
    reduceMotion: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyInfo[]>(
    SUPPORTED_CURRENCIES
  )
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(
    SUPPORTED_LANGUAGES
  )

  const { syncDisplayCurrency } = useCurrency()
  const { t, setLocale } = useTranslation()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/account/display-settings")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setLoadError(data.error || "Unable to load preferences.")
        return
      }
      const data = await res.json()
      const apiSettings = data.settings || {}
      const merged: DisplaySettings = {
        language: apiSettings.language || "en",
        currency: apiSettings.currency || "USD",
        theme: apiSettings.theme || "system",
        accentColor: apiSettings.accentColor || "#8B5CF6",
        reduceMotion: apiSettings.reduceMotion ?? false,
      }
      setSettings(merged)

      const supported: CurrencyInfo[] =
        data.supportedCurrencies && data.supportedCurrencies.length > 0
          ? data.supportedCurrencies.map((c: any) => ({
              code: c.code,
              name: c.name,
              symbol: c.symbol,
              decimalDigits: c.decimalDigits ?? 2,
              locale: getCurrencyInfo(c.code)?.locale || "en-US",
              flag: c.symbol,
            }))
          : SUPPORTED_CURRENCIES
      setAvailableCurrencies(supported)

      const langs: Language[] =
        data.supportedLanguages && data.supportedLanguages.length > 0
          ? data.supportedLanguages
              .map((l: any) => getLanguageByCode(l.code))
              .filter((l: Language | undefined): l is Language => Boolean(l))
          : SUPPORTED_LANGUAGES
      setAvailableLanguages(langs)
    } catch {
      setLoadError("Unable to load preferences. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const res = await fetch("/api/account/display-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error || "Could not save preferences. Please try again.")
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setLocale(settings.language)
      syncDisplayCurrency(settings.currency)
      if (settings.accentColor) {
        document.cookie = `pawvault-accent=${encodeURIComponent(settings.accentColor)}; path=/; max-age=31536000; SameSite=Lax`
        const root = document.documentElement
        const { hexToHsl } = await import("@/components/theme-provider")
        const hsl = hexToHsl(settings.accentColor)
        root.style.setProperty("--pv-accent-override", hsl)
        root.style.setProperty("--accent", hsl)
        root.style.setProperty("--ring", hsl)
      }
      if (settings.reduceMotion !== undefined) {
        document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion)
        document.cookie = `pawvault-reduce-motion=${String(settings.reduceMotion)}; path=/; max-age=31536000; SameSite=Lax`
      }
    } catch {
      setSaveError("Could not save preferences. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>{t("account.displaySettings")}</CardTitle>
            <CardDescription>
              Language, currency, theme and appearance settings.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive mb-4">{loadError}</p>
          <Button variant="outline" onClick={loadSettings}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Monitor className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">{t("account.displaySettings")}</CardTitle>
            <CardDescription>
              Language, currency, and appearance settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" /> {t("navigation.language")}
              </label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                          <span className="text-xs text-muted-foreground">
                            ({lang.code})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted mt-1">
                Browser language is detected automatically. Your choice is remembered.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" /> {t("navigation.currency")}
              </label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((cur) => (
                    <SelectItem key={cur.code} value={cur.code}>
                      <span className="flex items-center gap-2">
                        <span>{cur.symbol}</span>
                        <span>{cur.code} — {cur.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted mt-1">
                Product prices are stored in their base currency and converted for display.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4" /> {t("navigation.theme")}
              </label>
              <ThemeModeSelector />
              <p className="text-xs text-text-muted mt-1">
                "System" follows your operating system preference.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4" /> {t("theme.accentColor")}
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg border-2 cursor-pointer"
                  style={{ backgroundColor: settings.accentColor || "#8B5CF6" }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute z-50 bg-popover border rounded-lg p-4 shadow-xl">
                    <input
                      type="color"
                      value={settings.accentColor || "#8B5CF6"}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-48 h-48 p-0 border rounded cursor-pointer"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={settings.accentColor || "#8B5CF6"}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="text-sm font-mono border rounded px-2 py-1 w-24"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Eye className="h-4 w-4" /> {t("theme.reduceMotion")}
                </label>
                <p className="text-xs text-text-muted mt-1">
                  Disable animations for accessibility.
                </p>
              </div>
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reduceMotion: checked })
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          {saved && <span className="text-sm text-green-600">{t("common.saved")}</span>}
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
