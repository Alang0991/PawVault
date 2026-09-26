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
  ChevronDown,
  Palette,
  Box,
  Code,
  Video,
  Grid,
} from "lucide-react"

const NavLinks = [
  { href: "/browse", labelKey: "navigation.browse" },
  { href: "/creators", labelKey: "navigation.creators" },
  { href: "/services", labelKey: "header.services", hasDropdown: true },
  { href: "/tutorials", labelKey: "header.tutorials" },
  { href: "/community", labelKey: "header.community" },
  { href: "/help", labelKey: "navigation.help" },
  { href: "/feedback", labelKey: "navigation.feedback" },
  { href: "/credits", labelKey: "header.credits" },
]

function ServicesDropdown() {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-accent/10 transition-colors flex items-center gap-1">
          {t("header.services")}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("header.services")}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/services/avatar-commissions" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("header.avatarCommissions")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/services/art-commissions" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("header.artCommissions")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("header.otherServices")}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/services/3d-services" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            {t("header.threeDServices")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/services/development" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            {t("header.development")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/services/video-editing" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {t("header.videoEditing")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/services" className="flex items-center gap-2 font-medium">
            <Grid className="h-4 w-4" />
            {t("header.allServices")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ServicesDropdownMobile({ onSelect }: { onSelect: () => void }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md flex items-center justify-between"
      >
        {t("header.services")}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-accent/20 pl-3 animate-slide-down">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{t("header.commissionServices")}</p>
          <Link
            href="/services/avatar-commissions"
            className="block px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
            onClick={onSelect}
          >
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("header.avatarCommissions")}
            </span>
          </Link>
          <Link
            href="/services/art-commissions"
            className="block px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
            onClick={onSelect}
          >
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t("header.artCommissions")}
            </span>
          </Link>
          <div className="my-1 border-t border-border" />
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{t("header.otherServices")}</p>
          <Link
            href="/services/3d-services"
            className="block px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
            onClick={onSelect}
          >
            <span className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              {t("header.threeDServices")}
            </span>
          </Link>
          <Link
            href="/services/development"
            className="block px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
            onClick={onSelect}
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              {t("header.development")}
            </span>
          </Link>
          <Link
            href="/services/video-editing"
            className="block px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
            onClick={onSelect}
          >
            <span className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              {t("header.videoEditing")}
            </span>
          </Link>
          <div className="my-1 border-t border-border" />
          <Link
            href="/services"
            className="block px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
            onClick={onSelect}
          >
            <span className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              {t("header.allServices")}
            </span>
          </Link>
        </div>
      )}
    </div>
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
      <div className="pv-header-glow" />
      <div className="container mx-auto px-4">
        <div className="flex min-h-[72px] items-center gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="PawVault home">
            <div className="pv-logo-mark">
              <span>P</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-[17px] font-black tracking-tight text-text-primary">PawVault</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Creator marketplace</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-5" aria-label="Primary navigation">
            {NavLinks.slice(0, 5).map((link) => (
              link.hasDropdown ? <ServicesDropdown key={link.href} /> : (
                <Link key={link.href} href={link.href} className="pv-nav-link">{t(link.labelKey)}</Link>
              )
            ))}
          </nav>

          <div className="hidden md:block flex-1 max-w-[440px] mx-auto">
            <div className="pv-search-shell"><SearchBar /></div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <LanguageSelector compact />
            <IconButton variant="ghost" size="sm" asChild aria-label="Wishlist" className="relative hidden sm:inline-flex pv-icon-button">
              <Link href="/wishlist"><Heart className="h-[18px] w-[18px]" />{wishlist > 0 && <Badge variant="sale" size="sm" className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[9px]">{wishlist > 99 ? "99+" : wishlist}</Badge>}</Link>
            </IconButton>
            <IconButton variant="ghost" size="sm" asChild aria-label="Cart" className="relative hidden sm:inline-flex pv-icon-button">
              <Link href="/cart"><ShoppingCart className="h-[18px] w-[18px]" />{cart > 0 && <Badge variant="default" size="sm" className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[9px]">{cart > 99 ? "99+" : cart}</Badge>}</Link>
            </IconButton>
            {isCreator && (
              <Button variant="secondary" size="sm" className="hidden lg:inline-flex rounded-xl px-4" asChild>
                <Link href="/creator/dashboard"><Store className="h-4 w-4 mr-1.5" />{t("header.creatorHub")}</Link>
              </Button>
            )}
            {isAuthenticated ? (
              <AccountMenu isFounder={isFounder} isStaff={isStaff} isCreator={isCreator} avatar={account?.user?.avatar || session?.user?.image || ""} initials={initials} name={displayName} email={account?.user?.email || session?.user?.email || ""} />
            ) : (
              <Button size="sm" className="hidden sm:inline-flex rounded-xl px-4" asChild><Link href="/auth/signin"><User className="h-4 w-4 mr-1.5" />{t("auth.signIn")}</Link></Button>
            )}
            <IconButton variant="ghost" size="sm" className="lg:hidden pv-icon-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="pv-search-shell"><SearchBar /></div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border/60 bg-surface/95 backdrop-blur-xl shadow-card-hover animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {NavLinks.map((link) => link.hasDropdown ? <ServicesDropdownMobile key={link.href} onSelect={() => setIsMobileMenuOpen(false)} /> : (
              <Link key={link.href} href={link.href} className="pv-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>{t(link.labelKey)}</Link>
            ))}
            {isAuthenticated ? (
              <div className="mt-3 border-t border-border/60 pt-3 space-y-1">
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
            ) : <Link href="/auth/signin" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground" onClick={() => setIsMobileMenuOpen(false)}><User className="h-4 w-4" />{t("auth.signIn")}</Link>}
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
            <AvatarFallback className="text-sm bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
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
