"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSelector } from "@/components/language-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { useHeaderCounts } from "@/components/header-counts"
import { ROLES } from "@/lib/roles"
import { useAccountState } from "@/hooks/use-account-state"
import { useAuthStatus } from "@/hooks/use-auth-status"
import { useTranslation } from "@/hooks/use-translation"
import {
  ShoppingCart,
  Heart,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Shield,
  AlertTriangle,
  Store,
  X,
  MoreHorizontal,
} from "lucide-react"

/**
 * Primary navigation stays short so the marketplace reads first:
 * Explore, Creators, Commissions, Free. Everything else the platform
 * offers lives under More rather than crowding the bar — see the
 * design direction §11.
 */
const PrimaryNavLinks = [
  { href: "/browse", labelKey: "navigation.browse" },
  { href: "/creators", labelKey: "navigation.creators" },
  { href: "/services", labelKey: "home.commissions" },
  { href: "/browse?free=true", labelKey: "home.free" },
]

const OverflowNavLinks = [
  { href: "/tutorials", labelKey: "header.tutorials" },
  { href: "/community", labelKey: "header.community" },
  { href: "/categories", labelKey: "navigation.categories" },
  { href: "/bundles", labelKey: "home.bundles" },
  { href: "/help", labelKey: "navigation.help" },
  { href: "/feedback", labelKey: "navigation.feedback" },
]

const MobileNavLinks = [...PrimaryNavLinks, ...OverflowNavLinks]

function MoreMenu() {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="pv-nav-link" aria-label={t("common.more") as string}>
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t("common.more")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {OverflowNavLinks.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{t(link.labelKey)}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const { session, isAuthenticated } = useAuthStatus()
  const { wishlist, cart } = useHeaderCounts()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { account } = useAccountState()
  const { t } = useTranslation()

  const role = account?.user?.role || session?.user?.role
  const isFounder = role === ROLES.FOUNDER
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(role || "")
  const isCreator = ["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(role || "")
  const displayName = account?.user?.displayName || session?.user?.name || ""
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"

  return (
    <header className="pv-header sticky top-0 z-50 w-full">
      <div className="pv-shell">
        <div className="flex min-h-[64px] items-center gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="PawVault home">
            <div className="pv-logo-mark">
              <span>P</span>
            </div>
            <span className="hidden text-[17px] font-bold tracking-tight text-text-primary sm:block">
              PawVault
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
            {PrimaryNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="pv-nav-link">
                {t(link.labelKey)}
              </Link>
            ))}
            <MoreMenu />
          </nav>

          <div className="mx-auto hidden max-w-[420px] flex-1 md:block">
            <div className="pv-search-shell"><SearchBar /></div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <LanguageSelector compact />
            <IconButton variant="ghost" size="sm" asChild aria-label={t("navigation.wishlist") as string} className="pv-icon-button relative hidden sm:inline-flex">
              <Link href="/wishlist"><Heart className="h-[18px] w-[18px]" />{wishlist > 0 && <Badge variant="sale" size="sm" className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[9px]">{wishlist > 99 ? "99+" : wishlist}</Badge>}</Link>
            </IconButton>
            <IconButton variant="ghost" size="sm" asChild aria-label={t("navigation.cart") as string} className="pv-icon-button relative hidden sm:inline-flex">
              <Link href="/cart"><ShoppingCart className="h-[18px] w-[18px]" />{cart > 0 && <Badge variant="default" size="sm" className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[9px]">{cart > 99 ? "99+" : cart}</Badge>}</Link>
            </IconButton>
            {isCreator && (
              <Button variant="secondary" size="sm" className="hidden rounded-lg px-3.5 lg:inline-flex" asChild>
                <Link href="/creator/dashboard"><Store className="h-4 w-4" />{t("header.creatorHub")}</Link>
              </Button>
            )}
            {isAuthenticated ? (
              <AccountMenu isFounder={isFounder} isStaff={isStaff} isCreator={isCreator} avatar={account?.user?.avatar || session?.user?.image || ""} initials={initials} name={displayName} email={account?.user?.email || session?.user?.email || ""} />
            ) : (
              <Button size="sm" className="hidden rounded-lg px-3.5 sm:inline-flex" asChild><Link href="/auth/signin">{t("auth.signIn")}</Link></Button>
            )}
            <IconButton variant="ghost" size="sm" className="pv-icon-button lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <div className="pv-search-shell"><SearchBar /></div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="animate-slide-down border-t border-border bg-surface lg:hidden">
          <div className="pv-shell space-y-1 py-4">
            {MobileNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>{t(link.labelKey)}</Link>
            ))}
            {isAuthenticated ? (
              <div className="mt-3 space-y-1 border-t border-border pt-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-10 w-10"><AvatarImage src={account?.user?.avatar || session?.user?.image || ""} alt={displayName} /><AvatarFallback>{initials}</AvatarFallback></Avatar>
                  <div className="min-w-0"><p className="font-semibold text-sm truncate">{displayName}</p><p className="text-xs text-text-muted truncate">{account?.user?.email || session?.user?.email}</p></div>
                </div>
                {isFounder && <Link href="/admin/founder" className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}><Shield className="h-4 w-4 text-amber-500" />{t("header.founderControlCenter")}</Link>}
                {isCreator && <Link href="/creator/dashboard" className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}><Store className="h-4 w-4" />{t("header.creatorHub")}</Link>}
                <Link href="/dashboard" className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}><LayoutDashboard className="h-4 w-4" />{t("navigation.dashboard")}</Link>
                <Link href="/library" className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}><ShoppingBag className="h-4 w-4" />{t("navigation.library")}</Link>
                <Link href="/orders" className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}><Package className="h-4 w-4" />{t("navigation.orders")}</Link>
                <Link href="/settings" className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}><Settings className="h-4 w-4" />{t("navigation.settings")}</Link>
                <button onClick={() => signOut()} className="pv-mobile-link w-full text-left"><LogOut className="h-4 w-4" />{t("auth.signOut")}</button>
              </div>
            ) : <Link href="/auth/signin" className="pv-mobile-link mt-3 justify-center rounded-lg bg-accent font-medium text-accent-foreground" onClick={() => setIsMobileMenuOpen(false)}><User className="h-4 w-4" />{t("auth.signIn")}</Link>}
          </div>
        </div>
      )}
    </header>
  )
}

interface AccountMenuProps {
  isFounder: boolean
  isStaff: boolean
  isCreator: boolean
  avatar: string
  initials: string
  name: string
  email: string
}

function AccountMenu({
  isFounder,
  isStaff,
  isCreator,
  avatar,
  initials,
  name,
  email,
}: AccountMenuProps) {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-muted text-sm font-semibold text-text-secondary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-text-muted">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isFounder && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/founder" className="font-semibold text-amber-600 dark:text-amber-400 focus:bg-accent/10">
                <Shield className="h-4 w-4 mr-2 text-amber-500" />
                {t("header.founderControlCenter")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-900/30" />
          </>
        )}

        {isCreator && (
          <DropdownMenuItem asChild>
            <Link href="/creator/dashboard" className="focus:bg-accent/10">
              <Store className="h-4 w-4 mr-2" />
              {t("header.creatorHub")}
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="focus:bg-accent/10">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {t("navigation.dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/library" className="focus:bg-accent/10">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t("navigation.library")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="focus:bg-accent/10">
            <Package className="h-4 w-4 mr-2" />
            {t("navigation.orders")}
          </Link>
        </DropdownMenuItem>
        {isStaff && (
          <DropdownMenuItem asChild>
            <Link href="/moderation" className="focus:bg-accent/10">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t("admin.moderation")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="focus:bg-accent/10">
            <Settings className="h-4 w-4 mr-2" />
            {t("navigation.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="focus:bg-accent/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
