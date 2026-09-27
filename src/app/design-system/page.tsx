import { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Code, Palette, MousePointer, Layout, Box, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, ToastTitle, ToastDescription, ToastAction } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FadeIn,
  Stagger,
  Modal,
  Drawer,
  Dropdown,
  Tooltip as AnimatedTooltip,
  PageTransition,
  AnimatedList,
  CardHover,
  IconButton,
  WishButton,
  Skeleton as AnimatedSkeleton,
  Pulse,
} from "@/components/ui/animated"

export const metadata: Metadata = {
  title: "Design System | PawVault",
  description: "PawVault design system component catalog and documentation",
}

const sections = [
  {
    id: "foundations",
    title: "Foundations",
    icon: Palette,
    items: [
      { name: "Colors", href: "#colors", description: "Semantic color tokens for light and dark modes" },
      { name: "Typography", href: "#typography", description: "Font families, sizes, and hierarchy" },
      { name: "Spacing", href: "#spacing", description: "Consistent spacing scale and layout rhythm" },
      { name: "Shadows", href: "#shadows", description: "Elevation and depth tokens" },
      { name: "Border Radius", href: "#radius", description: "Consistent rounding scale" },
      { name: "Transitions", href: "#transitions", description: "Duration and easing tokens" },
    ],
  },
  {
    id: "components",
    title: "Components",
    icon: Box,
    items: [
      { name: "Button", href: "#button", description: "Primary, secondary, outline, ghost, destructive" },
      { name: "Input", href: "#input", description: "Text, email, password, search inputs" },
      { name: "Textarea", href: "#textarea", description: "Multi-line text input" },
      { name: "Select", href: "#select", description: "Dropdown selection" },
      { name: "Checkbox", href: "#checkbox", description: "Boolean input" },
      { name: "Switch", href: "#switch", description: "Toggle control" },
      { name: "Label", href: "#label", description: "Form field labels" },
      { name: "Card", href: "#card", description: "Content containers" },
      { name: "Badge", href: "#badge", description: "Status and count indicators" },
      { name: "Avatar", href: "#avatar", description: "User/profile images" },
      { name: "Separator", href: "#separator", description: "Visual dividers" },
      { name: "Progress", href: "#progress", description: "Progress bars" },
      { name: "Slider", href: "#slider", description: "Range input" },
      { name: "Pagination", href: "#pagination", description: "Page navigation" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback & Overlays",
    icon: MousePointer,
    items: [
      { name: "Toast", href: "#toast", description: "Transient notifications" },
      { name: "Alert", href: "#alert", description: "Important messages" },
      { name: "Dialog", href: "#dialog", description: "Modal dialogs" },
      { name: "Drawer", href: "#drawer", description: "Side panels" },
      { name: "Dropdown", href: "#dropdown", description: "Context menus" },
      { name: "Tooltip", href: "#tooltip", description: "Hover hints" },
      { name: "HoverCard", href: "#hovercard", description: "Rich hover previews" },
      { name: "Skeleton", href: "#skeleton", description: "Loading placeholders" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    icon: Layout,
    items: [
      { name: "Tabs", href: "#tabs", description: "Tabbed interfaces" },
      { name: "Breadcrumb", href: "#breadcrumb", description: "Location hierarchy" },
      { name: "Pagination", href: "#pagination", description: "Page navigation" },
    ],
  },
  {
    id: "marketplace",
    title: "Marketplace-Specific",
    icon: Code,
    items: [
      { name: "ProductCard", href: "#productcard", description: "Product grid items" },
      { name: "CreatorCard", href: "#creatorcard", description: "Creator grid items" },
      { name: "CategoryChip", href: "#categorychip", description: "Category filters" },
      { name: "Price", href: "#price", description: "Price display with currency" },
      { name: "Rating", href: "#rating", description: "Star ratings" },
    ],
  },
  {
    id: "animation",
    title: "Animation System",
    icon: Type,
    items: [
      { name: "FadeIn", href: "#fadein", description: "Entrance animations" },
      { name: "Stagger", href: "#stagger", description: "Staggered list animations" },
      { name: "Modal/Drawer", href: "#modal-drawer", description: "Overlay animations" },
      { name: "Dropdown/Tooltip", href: "#dropdown-tooltip", description: "Popover animations" },
      { name: "PageTransition", href: "#pagetransition", description: "Route transitions" },
      { name: "CardHover", href: "#cardhover", description: "Interactive card hover" },
      { name: "IconButton", href: "#iconbutton", description: "Icon button interactions" },
      { name: "WishButton", href: "#wishbutton", description: "Heart button pop animation" },
      { name: "AnimatedSkeleton", href: "#animatedskeleton", description: "Shimmer loading" },
      { name: "Pulse", href: "#pulse", description: "Attention animation" },
    ],
  },
]

function SectionCard({ section }: { section: typeof sections[0] }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <section.icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{section.title}</CardTitle>
        </div>
        <CardDescription>
          {section.items.length} components
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2" role="list">
          {section.items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center justify-between text-sm text-foreground hover:text-primary transition-colors"
              >
                <span>{item.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-12">
        <div className="max-w-5xl">
          <FadeIn variant="slideUp" className="mb-10">
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                Design System
              </h1>
              <p className="mt-2 max-w-2xl text-lg leading-relaxed text-text-secondary">
                Reusable components, design tokens, and patterns for building consistent
                PawVault interfaces. Every page uses this system — no one-off styles.
              </p>
            </header>

            <nav className="mb-10" aria-label="Design system sections">
              <ul className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary bg-muted hover:bg-muted/80 hover:text-text-primary transition-colors"
                    >
                      {section.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Stagger stagger={0.08}>
              {sections.map((section) => (
                <FadeIn key={section.id} variant="slideUp">
                  <section id={section.id} className="mb-16">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                      <section.icon className="h-6 w-6 text-muted-foreground" />
                      <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                        {section.title}
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {section.items.map((item) => (
                        <SectionCard key={item.name} section={{ ...section, items: [item] }} />
                      ))}
                    </div>
                  </section>
                </FadeIn>
              ))}
            </Stagger>
          </FadeIn>

          <div className="mt-14 rounded-xl border border-border bg-surface px-6 py-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Usage Guidelines
            </h2>
            <ul className="mx-auto mt-4 max-w-2xl space-y-2 text-sm leading-relaxed text-text-secondary text-left">
              <li>• Import from <code className="bg-muted px-1.5 rounded">@/components/ui/*</code> — never copy styles</li>
              <li>• Use semantic tokens (<code className="bg-muted px-1.5 rounded">bg-surface</code>, <code className="bg-muted px-1.5 rounded">text-primary</code>) not raw colors</li>
              <li>• Prefer <code className="bg-muted px-1.5 rounded">FadeIn</code> / <code className="bg-muted px-1.5 rounded">Stagger</code> for entrances</li>
              <li>• Respect <code className="bg-muted px-1.5 rounded">prefers-reduced-motion</code> — all animations auto-disable</li>
              <li>• Dark mode is automatic via CSS variables — no manual overrides</li>
              <li>• Mobile-first: test at 375px, 414px, 768px breakpoints</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}