import { ReactNode } from "react"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  Code,
  Crown,
  Database,
  FileText,
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
  LogOut,
  Store,
  Box,
  UserCheck,
  Palette,
  Sparkles,
  Globe,
  Languages,
  Scale,
  Gavel,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { href: "/admin/founder", label: "Dashboard", icon: Activity, exact: true },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { href: "/admin/founder/products", label: "Products", icon: Package },
      { href: "/admin/founder/categories", label: "Categories", icon: Tag },
      { href: "/admin/founder/featured", label: "Featured", icon: Flag },
      { href: "/admin/founder/discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/admin/founder/users", label: "Users", icon: Users },
      { href: "/admin/founder/creators", label: "Creators", icon: Crown },
      { href: "/admin/founder/news", label: "News", icon: FileText },
      { href: "/admin/founder/events", label: "Events", icon: Calendar },
      { href: "/admin/founder/badges", label: "Badges", icon: Star },
      { href: "/admin/founder/reviews", label: "Reviews", icon: Star },
      { href: "/admin/founder/reports", label: "Reports", icon: AlertTriangle },
    ],
  },
  {
    title: "Moderation",
    items: [
      { href: "/admin/founder/moderation", label: "Moderation Queue", icon: Shield },
      { href: "/admin/founder/users", label: "User Moderation", icon: UserCheck },
      { href: "/admin/founder/products", label: "Product Moderation", icon: Box },
    ],
  },
  {
    title: "Staff",
    items: [
      { href: "/admin/founder/staff", label: "Moderators", icon: Shield },
      { href: "/admin/founder/staff", label: "Administrators", icon: Users },
      { href: "/admin/founder/permissions", label: "Permissions", icon: ScrollText },
    ],
  },
  {
    title: "Appearance",
    items: [
      { href: "/admin/founder/appearance", label: "Branding", icon: Palette },
      { href: "/admin/founder/seasonal-themes", label: "Seasonal Themes", icon: Sparkles },
    ],
  },
{
    title: "Community",
    items: [
      { href: "/admin/founder/users", label: "Users", icon: Users },
      { href: "/admin/founder/creators", label: "Creators", icon: Crown },
      { href: "/admin/founder/news", label: "News", icon: FileText },
      { href: "/admin/founder/events", label: "Events", icon: Calendar },
      { href: "/admin/founder/badges", label: "Badges", icon: Star },
      { href: "/admin/founder/reviews", label: "Reviews", icon: Star },
      { href: "/admin/founder/reports", label: "Reports", icon: AlertTriangle },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/founder/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/founder/monitoring", label: "Monitoring", icon: Activity },
      { href: "/admin/founder/publishing", label: "Publishing", icon: ScrollText },
      { href: "/admin/founder/error-logs", label: "Error logs", icon: AlertTriangle },
      { href: "/admin/founder/backups", label: "Backups", icon: Database },
      { href: "/admin/founder/settings", label: "Settings", icon: Settings },
      { href: "/admin/founder/audit", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/founder/feature-flags", label: "Feature Flags", icon: Flag },
      { href: "/admin/founder/financials", label: "Financials", icon: DollarSign },
      { href: "/admin/founder/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/founder/security", label: "Security", icon: Shield },
    ],
  },
  {
    title: "Marketplace Controls",
    items: [
      { href: "/admin/founder/currencies", label: "Currencies", icon: Globe },
      { href: "/admin/founder/languages", label: "Languages", icon: Languages },
      { href: "/admin/founder/tags", label: "Tags", icon: Tag },
      { href: "/admin/founder/rules", label: "Marketplace Rules", icon: Scale },
      { href: "/admin/founder/appeals", label: "Appeals", icon: Gavel },
      { href: "/admin/founder/staff-picks", label: "Staff Picks", icon: Star },
    ],
  },
  {
    title: "Documentation",
    items: [
      { href: "/admin/founder/tutorials", label: "Tutorials", icon: BookOpen },
      { href: "/admin/founder/api-docs", label: "API Docs", icon: Code },
    ],
  },
]

export default async function FounderLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    if (user?.role === "ADMIN") {
      redirect("/admin")
    }
    if (user?.role === "MODERATOR") {
      redirect("/moderation")
    }
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        <aside className="hidden md:flex w-64 border-r bg-white dark:bg-gray-900 flex-col sticky top-0 h-screen">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-sm">P</span>
              </div>
              <span className="text-sm font-bold">PawVault</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-semibold">Founder Control Center</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {group.title}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      (item as any).exact || item.href === "/admin/founder"
                        ? "bg-gray-100 dark:bg-gray-800 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-3 border-t">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                {(user.displayName || user.username)[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName || user.username}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Founder</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Link>
            </Button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="md:hidden border-b bg-white dark:bg-gray-900 px-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
                  <span className="text-background font-bold text-xs">P</span>
                </div>
                <span className="text-sm font-bold">PawVault</span>
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Founder</span>
              <span className="text-muted-foreground">·</span>
              {NAV_GROUPS.slice(0, 3).flatMap((g) =>
                g.items.slice(0, 2).map((n) => (
                  <Link key={n.href} href={n.href} className="text-xs underline-offset-4 hover:underline">
                    {n.label}
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
