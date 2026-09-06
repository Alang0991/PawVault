import { ReactNode } from "react"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Crown,
  Flag,
  Megaphone,
  Package,
  Percent,
  Settings,
  Shield,
  Star,
  Tag,
  Users,
  ScrollText,
} from "lucide-react"

export const dynamic = "force-dynamic"

const NAV = [
  { href: "/admin/founder", label: "Overview", icon: Activity, exact: true },
  { href: "/admin/founder/users", label: "Users", icon: Users },
  { href: "/admin/founder/creators", label: "Creators", icon: Crown },
  { href: "/admin/founder/products", label: "Products", icon: Package },
  { href: "/admin/founder/orders", label: "Orders", icon: BarChart3 },
  { href: "/admin/founder/reviews", label: "Reviews", icon: Star },
  { href: "/admin/founder/reports", label: "Reports", icon: AlertTriangle },
  { href: "/admin/founder/categories", label: "Categories", icon: Tag },
  { href: "/admin/founder/featured", label: "Featured", icon: Flag },
  { href: "/admin/founder/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/founder/staff", label: "Staff", icon: Shield },
  { href: "/admin/founder/permissions", label: "Permissions", icon: ScrollText },
  { href: "/admin/founder/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/founder/settings", label: "Settings", icon: Settings },
  { href: "/admin/founder/audit", label: "Audit Logs", icon: ScrollText },
]

export default async function FounderLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        <aside className="hidden md:block w-64 border-r bg-white dark:bg-gray-900 min-h-screen sticky top-0 self-start">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg gradient-bg flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Founder</p>
                <p className="text-xs text-muted-foreground truncate">{user.displayName || user.username}</p>
              </div>
            </div>
          </div>
          <nav className="p-2 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="md:hidden border-b bg-white dark:bg-gray-900 px-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">Founder</span>
              <span className="text-muted-foreground">·</span>
              {NAV.slice(0, 6).map((n) => (
                <Link key={n.href} href={n.href} className="text-xs underline-offset-4 hover:underline">
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
