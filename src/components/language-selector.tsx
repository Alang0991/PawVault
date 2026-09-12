"use client"

import { Globe } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { useCurrency } from "@/components/providers/currency-provider"
import { useTheme } from "@/components/theme-provider"
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "@/lib/i18n/localization"
import { SUPPORTED_CURRENCIES, getCurrencyInfo } from "@/lib/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface LanguageSelectorProps {
  compact?: boolean
  showCurrency?: boolean
  showTheme?: boolean
}

export function LanguageSelector({ compact = false, showCurrency = true, showTheme = true }: LanguageSelectorProps) {
  const { locale, setLocale, language, t } = useTranslation()
  const { currency, setCurrency, displayCurrency, setDisplayCurrency } = useCurrency()
  const { theme, setTheme } = useTheme()

  const currentLanguage = getLanguageByCode(locale) || SUPPORTED_LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Globe className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            <span>{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t("navigation.language")}</DropdownMenuLabel>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={lang.code === locale ? "bg-accent/10 font-medium" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.nativeName}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {lang.code}
            </span>
          </DropdownMenuItem>
        ))}

        {showCurrency && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("navigation.currency")}</DropdownMenuLabel>
            {SUPPORTED_CURRENCIES.map((cur) => (
              <DropdownMenuItem
                key={cur.code}
                onClick={() => {
                  setCurrency(cur.code)
                  setDisplayCurrency(cur.code)
                }}
                className={
                  displayCurrency === cur.code ? "bg-accent/10 font-medium" : ""
                }
              >
                <span className="mr-2">{cur.symbol}</span>
                <span>{cur.code} — {cur.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {showTheme && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("navigation.theme")}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={theme === "light" ? "bg-accent/10 font-medium" : ""}
            >
              {t("theme.light")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={theme === "dark" ? "bg-accent/10 font-medium" : ""}
            >
              {t("theme.dark")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={theme === "system" ? "bg-accent/10 font-medium" : ""}
            >
              {t("theme.system")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

LanguageSelector.displayName = "LanguageSelector"
