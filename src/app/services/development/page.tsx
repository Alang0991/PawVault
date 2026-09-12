"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Code,
  Star,
  Shield,
  ArrowRight,
  Filter,
  Clock,
  DollarSign,
  MessageSquare,
  Terminal,
  Database,
  Globe,
  Server,
  Smartphone,
  Layers,
} from "lucide-react"

interface DevServiceProvider {
  id: string
  displayName: string
  username: string
  avatar: string | null
  bio: string
  profileImage: string
  bannerImage: string
  serviceTypes: string[]
  technologies: string[]
  pricing: {
    type: string
    minPrice: number
    maxPrice: number
    currency: string
  }[]
  availability: "open" | "limited" | "closed"
  openSlots: number
  maxSlots: number
  turnaroundDays: number
  portfolioImages: string[]
  tags: string[]
  categories: string[]
  isVerified: boolean
  isFeatured: boolean
  rating: number
  reviewCount: number
  completedOrders: number
  socialLinks: {
    twitter?: string
    discord?: string
    portfolio?: string
    github?: string
    gitlab?: string
  }
  contactLinks: {
    email?: string
    form?: string
    discord?: string
  }
}

const SERVICE_TYPES_DEV = [
  "VRChat/Udon Scripting",
  "Unity C# Development",
  "Custom Tools & Editors",
  "Shader Development",
  "Avatar Systems & Gimmicks",
  "World Scripting & Logic",
  "SDK Development",
  "API Integration",
  "Database & Backend",
  "Web Development",
  "Discord Bots",
  "Automation & CI/CD",
  "Performance Optimization",
  "Code Review & Consulting",
  "Legacy Code Migration",
]

const TECHNOLOGIES = [
  "C#",
  "Udon",
  "UdonSharp",
  "Unity",
  "VRChat SDK",
  ".NET",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "React",
  "Python",
  "Go",
  "Rust",
  "C++",
  "HLSL/GLSL",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "GitHub Actions",
  "GitLab CI",
]

const CATEGORIES_DEV = [
  "VRChat",
  "Unity",
  "Game Development",
  "Web Development",
  "Backend/API",
  "Tools & Automation",
  "Shaders/Graphics",
  "Performance",
  "Security",
  "DevOps",
]

const AVAILABILITY_CONFIG = {
  open: { label: "Open", variant: "default" as const },
  limited: { label: "Limited Slots", variant: "secondary" as const },
  closed: { label: "Closed", variant: "destructive" as const },
}

export default function DevelopmentPage() {
  const [providers, setProviders] = useState<DevServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null)
  const [techFilter, setTechFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("featured")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams()
        if (categoryFilter) params.set("category", categoryFilter)
        if (availabilityFilter) params.set("availability", availabilityFilter)
        if (techFilter) params.set("technology", techFilter)
        if (searchQuery) params.set("q", searchQuery)
        params.set("sort", sortBy)
        params.set("minPrice", priceRange[0].toString())
        params.set("maxPrice", priceRange[1].toString())
        params.set("limit", "20")

        const res = await fetch(`/api/services/development?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to load development services")
        const data = await res.json()
        setProviders(data.providers || [])
      } catch (err) {
        console.error("Failed to load development services:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categoryFilter, availabilityFilter, techFilter, searchQuery, sortBy, priceRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-text-primary mb-4">Development Services</h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Custom scripting, tools, shaders, and full-stack development for VRChat, Unity, and web.
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
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">Development Services</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Custom scripting, tools, shaders, and full-stack development for VRChat, Unity, and web.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Service Types</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {SERVICE_TYPES_DEV.map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => {}}
                          className="rounded border-input text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-text-secondary">{type}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Technologies</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {TECHNOLOGIES.map((tech) => (
                      <label key={tech} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={techFilter === tech}
                          onChange={(e) => setTechFilter(e.target.checked ? tech : null)}
                          className="rounded border-input text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-text-secondary">{tech}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Categories</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {CATEGORIES_DEV.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryFilter === cat}
                          onChange={(e) => setCategoryFilter(e.target.checked ? cat : null)}
                          className="rounded border-input text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-text-secondary">{cat}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Availability</h3>
                  <div className="space-y-2">
                    {Object.entries(AVAILABILITY_CONFIG).map(([key, config]) => (
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
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-16">${priceRange[0]}</span>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1]), priceRange[1]])}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-accent"
                      />
                      <span className="w-16 text-right">${priceRange[1]}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value) || 0, priceRange[1]), priceRange[1]])}
                        min="0"
                        max="5000"
                        step="50"
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value) || 5000, priceRange[0])])}
                        min="0"
                        max="5000"
                        step="50"
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Sort by</h3>
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
                    <option value="slots">Most Slots Available</option>
                  </select>
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
                    placeholder="Search development services..."
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {providers.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                        <p className="text-text-secondary">No development service providers match your filters.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {providers.map((provider) => (
                        <DevServiceCard key={provider.id} provider={provider} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {["featured", "verified", "open"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {providers.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                          <p className="text-text-secondary">No {tab} providers at the moment.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map((provider) => (
                          <DevServiceCard key={provider.id} provider={provider} />
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

function DevServiceCard({ provider }: { provider: DevServiceProvider }) {
  const availabilityConfig = AVAILABILITY_CONFIG[provider.availability]
  const minPrice = Math.min(...provider.pricing.map((p) => p.minPrice))
  const maxPrice = Math.max(...provider.pricing.map((p) => p.maxPrice))
  const currency = provider.pricing[0]?.currency || "USD"

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-xl ${provider.isFeatured ? "border-amber-200 dark:border-amber-800 shadow-amber-100/50 dark:shadow-amber-900/20" : ""}`}>
      {provider.isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
      )}
      {provider.bannerImage && (
        <div className="h-24 w-full relative overflow-hidden">
          <img
            src={provider.bannerImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0 ring-2 ring-background -mt-7">
            <AvatarImage src={provider.avatar || ""} alt={provider.displayName} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-green-600 to-emerald-500 text-white">
              {provider.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 mt-1">
            <div className="flex items-center gap-2 mb-1">
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
            {provider.bio && (
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">{provider.bio}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {provider.technologies.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {provider.technologies.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.technologies.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Price
            </div>
            <div className="font-semibold text-text-primary">
              {minPrice === maxPrice ? `${currency} ${minPrice}` : `${currency} ${minPrice}–${maxPrice}`}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
              <Clock className="h-3.5 w-3.5" />
              Turnaround
            </div>
            <div className="font-semibold text-text-primary">
              {provider.turnaroundDays}d
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Slots
            </div>
            <div className="font-semibold text-text-primary">
              {provider.openSlots}/{provider.maxSlots}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t">
          <Badge variant={availabilityConfig.variant} className="gap-1">
            {availabilityConfig.label}
          </Badge>
          <Link
            href={`/services/development/${provider.id}`}
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