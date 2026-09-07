"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-provider"
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
} from "lucide-react"
import { useState } from "react"

const NavLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/creators", label: "Creators" },
]

export default function Header() {
  const { data: session } = useSession()
  const { wishlist, cart } = useHeaderCounts()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const role = session?.user?.role
  const isFounder = role === ROLES.FOUNDER
  const isAdmin = role === ROLES.ADMIN
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(role || "")
  const isCreator = ["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(
    role || ""
  )

  const displayName = session?.user?.name || ""
  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-surface/80 backdrop-blur-sm supports-backdrop-filter:bg-surface/60">
      <div className="container mx-auto">
        <div className="flex h-15 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary">
              PawVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            {NavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-accent/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <IconButton
              variant="ghost"
              size="sm"
              asChild
              aria-label="Wishlist"
              className="hidden md:inline-flex relative"
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlist > 0 && (
                  <Badge
                    variant="sale"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full px-1"
                  >
                    {wishlist > 99 ? "99+" : wishlist}
                  </Badge>
                )}
              </Link>
            </IconButton>

            <IconButton
              variant="ghost"
              size="sm"
              asChild
              aria-label="Cart"
              className="hidden md:inline-flex relative"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cart > 0 && (
                  <Badge
                    variant="default"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full px-1"
                  >
                    {cart > 99 ? "99+" : cart}
                  </Badge>
                )}
              </Link>
            </IconButton>

            {isCreator && (
              <Button
                variant="secondary"
                size="sm"
                className="hidden md:inline-flex"
                asChild
              >
                <Link href="/creator/dashboard">
                  <Store className="h-4 w-4 mr-1" />
                  Sell
                </Link>
              </Button>
            )}

            {session ? (
              <AccountMenu
                isFounder={isFounder}
                isStaff={isStaff}
                isCreator={isCreator}
                avatar={session.user?.image || ""}
                initials={initials}
                name={displayName}
                email={session.user?.email || ""}
              />
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">
                  <User className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
              </Button>
            )}

            <IconButton
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </IconButton>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-surface animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="flex flex-col gap-1">
              {NavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-accent/10 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 pb-4 space-y-2 border-t">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image || ""} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{displayName}</p>
                      <p className="text-xs text-text-muted">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  {isFounder && (
                    <Link
                      href="/admin/founder"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-amber-500" />
                      Founder Control Center
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/library"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Library
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-medium rounded-md hover:bg-accent/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
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
                Founder Control Center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-900/30" />
          </>
        )}

        {isCreator && (
          <DropdownMenuItem asChild>
            <Link href="/creator/dashboard" className="focus:bg-accent/10">
              <Store className="h-4 w-4 mr-2" />
              Creator Hub
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="focus:bg-accent/10">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/library" className="focus:bg-accent/10">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Library
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="focus:bg-accent/10">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </Link>
        </DropdownMenuItem>
        {isStaff && (
          <DropdownMenuItem asChild>
            <Link href="/moderation" className="focus:bg-accent/10">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Moderation
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="focus:bg-accent/10">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="focus:bg-accent/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
