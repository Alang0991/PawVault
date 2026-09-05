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
import { Search, ShoppingCart, User, Menu, Heart, Settings, LogOut, LayoutDashboard, Bell, Store, Shield, ShoppingBag, Compass } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Pawvault</span>
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1.5 p-2">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {session.user?.role && ["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(session.user.role) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/creator/dashboard">
                          <Store className="h-4 w-4 mr-2" />
                          Creator Hub
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {session.user?.role && ["ADMIN", "OWNER"].includes(session.user.role) && (
                    <DropdownMenuItem asChild>
                      <Link href="/moderation">
                        <Shield className="h-4 w-4 mr-2" />
                        Moderation
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90 transition-opacity">
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
            <Link href="/browse" className="block text-sm font-medium hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/categories" className="block text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/creators" className="block text-sm font-medium hover:text-primary transition-colors">
              Creators
            </Link>
            <div className="flex space-x-2 pt-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist"><Heart className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart"><ShoppingCart className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
