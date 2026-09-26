"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  KeyRound,
  DollarSign,
  TrendingUp,
  Star,
  Tag,
  Percent,
  Settings,
  Store,
  Plus,
  Menu,
  X,
  CreditCard,
  FolderOpen,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StoreInfo {
  id: string
  slug: string
  name: string
}

const items = [
  { href: "/creator/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/creator/products", label: "Products", icon: Package },
  { href: "/creator/orders", label: "Orders", icon: ShoppingBag },
  { href: "/creator/customers", label: "Customers", icon: Users },
  { href: "/creator/licenses", label: "Licenses", icon: KeyRound },
  { href: "/creator/payouts", label: "Payouts", icon: DollarSign },
  { href: "/creator/payments", label: "Payments", icon: CreditCard },
  { href: "/creator/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/creator/reviews", label: "Reviews", icon: Star },
  { href: "/creator/coupons", label: "Promotions", icon: Tag },
  { href: "/creator/discounts", label: "Discounts", icon: Percent },
  { href: "/creator/posts", label: "Posts", icon: FileText },
  { href: "/creator/collections", label: "Collections", icon: FolderOpen },
  { href: "/creator/store/settings", label: "Store Settings", icon: Settings },
]

export function CreatorSidebar({ user }: { user?: { avatar?: string | null; displayName?: string | null; username?: string; role?: string } }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [storeLoading, setStoreLoading] = useState(true)

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch("/api/creator/store")
        if (res.ok) {
          const data = await res.json()
          if (data.store) {
            setStoreInfo(data.store)
          }
        }
      } catch (error) {
        console.error("Failed to fetch store info:", error)
      } finally {
        setStoreLoading(false)
      }
    }
    fetchStore()
  }, [])

  return (
    <>
      <div className="lg:hidden mb-4 flex items-center justify-between gap-2 sticky top-2 z-20">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-4 w-4 mr-2" /> Menu
        </Button>
        <Button asChild size="sm" className="gradient-bg text-white">
          <Link href="/creator/products/new"><Plus className="h-4 w-4 mr-1" /> New</Link>
        </Button>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "shrink-0 z-40",
          "lg:static lg:block lg:w-64",
          open
            ? "fixed inset-y-0 left-0 w-72 bg-background overflow-y-auto p-4"
            : "hidden lg:block",
        )}
      >
        <div className="lg:hidden flex justify-end mb-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {user && (
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || undefined} alt={user.displayName || ""} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-purple-600 to-rose-500 text-white">
                    {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">{user.displayName || user.username}</p>
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
            )}
            <Button asChild className="w-full mb-4 gradient-bg text-white">
              <Link href="/creator/products/new" onClick={() => setOpen(false)}>
                <Plus className="h-4 w-4 mr-2" /> Create Product
              </Link>
            </Button>
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-rose-500 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              <Link
                href={storeInfo ? `/store/${storeInfo.slug}` : "/store/create"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Store className="h-4 w-4" />
                View Store
              </Link>
            </nav>
          </CardContent>
        </Card>
      </aside>
    </>
  )
}
