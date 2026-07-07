"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

const items = [
  { href: "/creator/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/creator/products", label: "Products", icon: Package },
  { href: "/creator/orders", label: "Orders", icon: ShoppingBag },
  { href: "/creator/customers", label: "Customers", icon: Users },
  { href: "/creator/licenses", label: "Licenses", icon: KeyRound },
  { href: "/creator/payouts", label: "Payouts", icon: DollarSign },
  { href: "/creator/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/creator/reviews", label: "Reviews", icon: Star },
  { href: "/creator/coupons", label: "Promotions", icon: Tag },
  { href: "/creator/discounts", label: "Discounts", icon: Percent },
  { href: "/creator/store/settings", label: "Store Settings", icon: Settings },
]

export function CreatorSidebar({ user }: { user?: { avatar?: string | null; displayName?: string | null; username?: string; role?: string } }) {
  const pathname = usePathname()

  return (
    <Card className="border-0 shadow-lg sticky top-4">
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
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
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
            href="/store/create"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Store className="h-4 w-4" />
            View Store
          </Link>
        </nav>
      </CardContent>
    </Card>
  )
}
