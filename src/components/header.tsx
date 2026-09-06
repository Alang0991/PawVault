"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ShoppingCart, User, Menu, Heart, Settings, LogOut, LayoutDashboard, Bell, Store, Shield, ShoppingBag, Compass, Package, Users, Crown, AlertTriangle, Tag, Flag, Percent, Megaphone, ScrollText } from "lucide-react"
import { useState } from "react"
import { ROLES } from "@/lib/roles"

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isFounder = session?.user?.role === ROLES.FOUNDER
  const isAdmin = session?.user?.role === ROLES.ADMIN
  const isCreator = ["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(session?.user?.role || "")
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(session?.user?.role || "")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">PawVault</span>
          </Link>

          {/* Search Bar - Desktop */}
          <Link href="/browse" className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products, creators, tags..."
                className="pl-10 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-5">
            <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="/creators" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Creators
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/cart" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image || undefined} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="flex flex-col space-y-1.5 p-3">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    {isFounder && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded px-1.5 py-0.5 w-fit">
                        <Shield className="h-3 w-3" />
                        Founder
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator />

                  {isFounder && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/founder">
                          <Shield className="h-4 w-4 mr-2 text-amber-600" />
                          <span className="font-semibold text-amber-700 dark:text-amber-400">Founder Control Center</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-amber-200 dark:bg-amber-800" />
                    </>
                  )}

                  {isCreator && (
                    <DropdownMenuItem asChild>
                      <Link href="/creator/dashboard">
                        <Store className="h-4 w-4 mr-2" />
                        Creator Hub
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <Compass className="h-4 w-4 mr-2" />
                      Orders
                    </Link>
                  </DropdownMenuItem>

                  {isStaff && (
                    <DropdownMenuItem asChild>
                      <Link href="/moderation">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Moderation
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-foreground text-background hover:bg-foreground/90 transition-opacity">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products, creators..."
                className="pl-10 h-9 bg-muted/50 border-0"
              />
            </div>
            <Link href="/browse" className="block text-sm font-medium hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="block text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/creators" className="block text-sm font-medium hover:text-primary transition-colors">
              Creators
            </Link>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wishlist"><Heart className="h-4 w-4 mr-1" /> Wishlist</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/cart"><ShoppingCart className="h-4 w-4 mr-1" /> Cart</Link>
              </Button>
              {isCreator && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/creator/dashboard"><Store className="h-4 w-4 mr-1" /> Creator Hub</Link>
                </Button>
              )}
              {isFounder && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/founder"><Shield className="h-4 w-4 mr-1" /> Founder Control Center</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
