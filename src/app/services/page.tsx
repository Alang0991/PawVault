"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  User,
  Palette,
  Box,
  Code,
  Video,
  Grid,
  Star,
  Shield,
  ArrowRight,
  Filter,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react"

interface ServiceProvider {
  id: string
  displayName: string
  username: string
  avatar: string | null
  serviceType: string
  serviceCategory: string
  title: string
  description: string
  startingPrice: number
  currency: string
  availability: "open" | "limited" | "closed"
  turnaroundDays: number
  tags: string[]
  isVerified: boolean
  isFeatured: boolean
  rating: number
  reviewCount: number
  completedOrders: number
  portfolioImages: string[]
  socialLinks: {
    twitter?: string
    discord?: string
    portfolio?: string
  }
}

const SERVICE_CATEGORIES = [
  { id: "avatar-commissions", label: "Avatar Commissions", icon: User, href: "/services/avatar-commissions" },
  { id: "art-commissions", label: "Art Commissions", icon: Palette, href: "/services/art-commissions" },
  { id: "3d-services", label: "3D Services", icon: Box, href: "/services/3d-services" },
  { id: "development", label: "Development", icon: Code, href: "/services/development" },
  { id: "video-editing", label: "Video Editing", icon: Video, href: "/services/video-editing" },
]

const AVAILABILITY_BADGES = {
  open: { variant: "default" as const, label: "Open", color: "green" },
  limited: { variant: "secondary" as const, label: "Limited Slots", color: "amber" },
  closed: { variant: "destructive" as const, label: "Closed", color: "red" },
}

export default function ServicesPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("featured")

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams()
        if (activeTab !== "all") params.set("category", activeTab)
        if (categoryFilter) params.set("category", categoryFilter)
        if (availabilityFilter) params.set("availability", availabilityFilter)
        if (searchQuery) params.set("q", searchQuery)
        params.set("sort", sortBy)
        params.set("limit", "20")

        const res = await fetch(`/api/services?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to load services")
        const data = await res.json()
        setProviders(data.providers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab, categoryFilter, availabilityFilter, searchQuery, sortBy])

  const filteredProviders = providers

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
                <Grid className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-text-primary mb-4">Creator Services Hub</h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Find talented creators for your next project. From avatar commissions to custom development.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-full bg-muted mb-4" />
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-4 w-1/2 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
              <Grid className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">Creator Services Hub</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Find talented creators for your next project. From avatar commissions to custom development.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Categories</h3>
                  <div className="space-y-2">
                    {SERVICE_CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Link
                          key={cat.id}
                          href={cat.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            activeTab === cat.id
                              ? "bg-accent/10 text-accent-foreground"
                              : "text-text-secondary hover:text-text-primary hover:bg-accent/5"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="font-medium">{cat.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Filters</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-2 block">Availability</label>
                      <div className="space-y-2">
                        {Object.entries(AVAILABILITY_BADGES).map(([key, config]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="availability"
                              value={key}
                              checked={availabilityFilter === key}
                              onChange={(e) => setAvailabilityFilter(e.target.value === "all" ? null : e.target.value)}
                              className="sr-only peer"
                            />
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                              availabilityFilter === key
                                ? "border-accent bg-accent/10 text-accent-foreground"
                                : "border-border hover:border-accent/50"
                            }`}>
                              <Badge variant={config.variant} size="sm" className="shrink-0">
                                {config.label}
                              </Badge>
                            </div>
                          </label>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="availability"
                            value="all"
                            checked={!availabilityFilter}
                            onChange={() => setAvailabilityFilter(null)}
                            className="sr-only peer"
                          />
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent/50">
                            <span className="text-sm text-text-secondary">All</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-secondary mb-2 block">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="featured">Featured First</option>
                        <option value="rating">Highest Rated</option>
                        <option value="reviews">Most Reviews</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest</option>
                        <option value="turnaround">Fastest Turnaround</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <main className="lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="all">All Services</TabsTrigger>
                  <TabsTrigger value="avatar-commissions">Avatar Commissions</TabsTrigger>
                  <TabsTrigger value="art-commissions">Art Commissions</TabsTrigger>
                  <TabsTrigger value="3d-services">3D Services</TabsTrigger>
                  <TabsTrigger value="development">Development</TabsTrigger>
                  <TabsTrigger value="video-editing">Video Editing</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {filteredProviders.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                        <p className="text-text-secondary">No services match your filters.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProviders.map((provider) => (
                        <ServiceCard key={provider.id} provider={provider} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {SERVICE_CATEGORIES.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="space-y-4">
                    {filteredProviders.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <cat.icon className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                          <p className="text-text-secondary">No {cat.label.toLowerCase()} available at the moment.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProviders.map((provider) => (
                          <ServiceCard key={provider.id} provider={provider} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ provider }: { provider: ServiceProvider }) {
  const availabilityConfig = AVAILABILITY_BADGES[provider.availability]

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-xl ${provider.isFeatured ? "border-amber-200 dark:border-amber-800 shadow-amber-100/50 dark:shadow-amber-900/20" : ""}`}>
      {provider.isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={provider.avatar || ""} alt={provider.displayName} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
              {provider.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-text-primary truncate">{provider.displayName}</h3>
              {provider.isVerified && (
                <Badge variant="default" className="bg-green-500 text-green-foreground gap-1 shrink-0">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {provider.isFeatured && (
                <Badge variant="default" className="bg-amber-500 text-amber-foreground gap-1 shrink-0">
                  <Star className="h-3 w-3" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-muted">@{provider.username}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {provider.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {provider.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-text-primary mb-1 line-clamp-1">{provider.title}</h4>
          <p className="text-sm text-text-secondary line-clamp-2 mb-4">{provider.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {provider.rating.toFixed(1)} ({provider.reviewCount})
          </span>
          <span className="flex items-center gap-1">
            <Box className="h-3.5 w-3.5" />
            {provider.completedOrders} completed
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant={availabilityConfig.variant} className="gap-1">
              {availabilityConfig.label}
            </Badge>
            <span className="text-sm font-medium text-text-primary">
              From {provider.currency} {provider.startingPrice}
            </span>
          </div>
          <Link
            href={`/services/${provider.serviceType}/${provider.id}`}
            className="text-sm font-medium text-accent-foreground hover:underline flex items-center gap-1"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}