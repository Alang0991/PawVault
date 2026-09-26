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
  User,
  Star,
  Shield,
  ArrowRight,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Clock,
  DollarSign,
  MessageSquare,
} from "lucide-react"

interface Commissioner {
  id: string
  displayName: string
  username: string
  avatar: string | null
  bio: string
  profileImage: string
  bannerImage: string
  commissionTypes: string[]
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
  completedCommissions: number
  socialLinks: {
    twitter?: string
    discord?: string
    portfolio?: string
    vrc?: string
  }
  contactLinks: {
    email?: string
    form?: string
    discord?: string
  }
}

const COMMISSION_TYPES = [
  "Full Avatar",
  "Avatar Optimization",
  "Custom Outfit",
  "Props & Accessories",
  "Gestures & Expressions",
  "Animation Override",
  "Shader Work",
  "Physics Setup",
  "Quest Conversion",
  "Base Model Provided",
  "From Scratch",
  "Reference Sheet",
]

const CATEGORIES = [
  "Furry",
  "Human",
  "Anime",
  "Stylized",
  "Realistic",
  "Chibi",
  "NSFW",
  "SFW",
  "VRChat",
  "Neos",
  "ChilloutVR",
  "Resonite",
  "Unity",
  "Blender",
]

const AVAILABILITY_CONFIG = {
  open: { label: "Open", variant: "default" as const, color: "green" },
  limited: { label: "Limited Slots", variant: "secondary" as const, color: "amber" },
  closed: { label: "Closed", variant: "destructive" as const, color: "red" },
}

export default function AvatarCommissionsPage() {
  const [commissioners, setCommissioners] = useState<Commissioner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("featured")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams()
        if (activeTab !== "all") params.set("category", activeTab)
        if (categoryFilter) params.set("category", categoryFilter)
        if (availabilityFilter) params.set("availability", availabilityFilter)
        if (typeFilter) params.set("type", typeFilter)
        if (searchQuery) params.set("q", searchQuery)
        params.set("sort", sortBy)
        params.set("minPrice", priceRange[0].toString())
        params.set("maxPrice", priceRange[1].toString())
        params.set("limit", "20")

        const res = await fetch(`/api/commissioners/avatar?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to load commissioners")
        const data = await res.json()
        setCommissioners(data.commissioners || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab, categoryFilter, availabilityFilter, typeFilter, searchQuery, sortBy, priceRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-text-primary mb-4">Avatar Commissioners Directory</h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Find talented avatar commissioners for VRChat, Neos, Resonite, and other platforms.
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
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">Avatar Commissioners Directory</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Find talented avatar commissioners for VRChat, Neos, Resonite, and other platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-text-primary mb-4">Commission Types</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {COMMISSION_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={typeFilter === type}
                          onChange={(e) => setTypeFilter(e.target.checked ? type : null)}
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
                  <h3 className="font-semibold text-text-primary mb-4">Categories</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
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
                        step="100"
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
                        step="100"
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value) || 5000, priceRange[0])])}
                        min="0"
                        max="5000"
                        step="100"
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
                    placeholder="Search commissioners..."
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
                  {commissioners.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                        <p className="text-text-secondary">No commissioners match your filters.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {commissioners.map((commissioner) => (
                        <CommissionerCard key={commissioner.id} commissioner={commissioner} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {["featured", "verified", "open"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {commissioners.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <User className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                          <p className="text-text-secondary">No {tab} commissioners at the moment.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {commissioners.map((commissioner) => (
                          <CommissionerCard key={commissioner.id} commissioner={commissioner} />
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

function CommissionerCard({ commissioner }: { commissioner: Commissioner }) {
  const availabilityConfig = AVAILABILITY_CONFIG[commissioner.availability]
  const minPrice = Math.min(...commissioner.pricing.map((p) => p.minPrice))
  const maxPrice = Math.max(...commissioner.pricing.map((p) => p.maxPrice))
  const currency = commissioner.pricing[0]?.currency || "USD"

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-xl ${commissioner.isFeatured ? "border-amber-200 dark:border-amber-800 shadow-amber-100/50 dark:shadow-amber-900/20" : ""}`}>
      {commissioner.isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
      )}
      {commissioner.bannerImage && (
        <div className="h-24 w-full relative overflow-hidden">
          <img
            src={commissioner.bannerImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0 ring-2 ring-background -mt-7">
            <AvatarImage src={commissioner.avatar || ""} alt={commissioner.displayName} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
              {commissioner.displayName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 mt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text-primary truncate">{commissioner.displayName}</h3>
              {commissioner.isVerified && (
                <Badge variant="default" className="bg-green-500 text-green-foreground gap-1 shrink-0">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {commissioner.isFeatured && (
                <Badge variant="default" className="bg-amber-500 text-amber-foreground gap-1 shrink-0">
                  <Star className="h-3 w-3" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-muted">@{commissioner.username}</p>
            {commissioner.bio && (
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">{commissioner.bio}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {commissioner.categories.slice(0, 4).map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
              {commissioner.categories.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{commissioner.categories.length - 4}
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
              {commissioner.turnaroundDays}d
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Slots
            </div>
            <div className="font-semibold text-text-primary">
              {commissioner.openSlots}/{commissioner.maxSlots}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t">
          <Badge variant={availabilityConfig.variant} className="gap-1">
            {availabilityConfig.label}
          </Badge>
          <Link
            href={`/commissioners/avatar/${commissioner.id}`}
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