"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Code,
  Palette,
  Users,
  Heart,
  Globe,
  Star,
  Award,
  MessageSquare,
  Bug,
  Wrench,
  Check,
  X,
  Loader2,
  Calendar,
  Twitter,
  Github,
  MessageCircle,
} from "lucide-react"

interface Contributor {
  id: string
  displayName: string
  username: string
  avatar: string | null
  role: string
  roleLabel: string
  roleColor: string
  contributionDescription: string | null
  socialLinks: {
    twitter?: string
    github?: string
    discord?: string
    website?: string
  }
  startDate: string
  endDate: string | null
  isCurrent: boolean
  isFounder: boolean
  isFormer: boolean
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  FOUNDER: { label: "Founder", color: "amber", icon: Shield },
  DEVELOPER: { label: "Developer", color: "blue", icon: Code },
  DESIGNER: { label: "Designer", color: "pink", icon: Palette },
  MODERATOR: { label: "Moderator", color: "purple", icon: Users },
  SUPPORT: { label: "Support Team", color: "green", icon: Heart },
  COMMUNITY: { label: "Community Contributor", color: "indigo", icon: Globe },
  ARTIST: { label: "Artist", color: "rose", icon: Palette },
  TRANSLATOR: { label: "Translator", color: "cyan", icon: Globe },
  TESTER: { label: "Tester", color: "orange", icon: Bug },
  SPECIAL_THANKS: { label: "Special Thanks", color: "yellow", icon: Star },
}

export default function CreditsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/credits")
        if (!res.ok) throw new Error("Failed to load credits")
        const data = await res.json()
        setContributors(data.contributors || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredContributors = contributors.filter((c) => {
    if (activeFilter === "all") return true
    if (activeFilter === "current") return c.isCurrent && !c.isFormer
    if (activeFilter === "former") return c.isFormer
    if (activeFilter === "founder") return c.isFounder
    return c.role === activeFilter
  })

  const roles = [...new Set(contributors.map((c) => c.role))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
          <p className="mt-4 text-text-secondary">Loading credits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-red-600">{error}</p>
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
              <Award className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">PawVault Credits</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Thank you to everyone who has helped build PawVault into what it is today.
              This page honors all contributors — past and present — who have dedicated their time,
              skills, and passion to this community.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center" role="group" aria-label="Filter contributors by role">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
            >
              All ({contributors.length})
            </Button>
            <Button
              variant={activeFilter === "current" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("current")}
            >
              Current Team ({contributors.filter((c) => c.isCurrent && !c.isFormer).length})
            </Button>
            <Button
              variant={activeFilter === "former" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("former")}
            >
              Former Contributors ({contributors.filter((c) => c.isFormer).length})
            </Button>
            <Button
              variant={activeFilter === "founder" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("founder")}
            >
              Founder ({contributors.filter((c) => c.isFounder).length})
            </Button>
            {roles.map((role) => (
              <Button
                key={role}
                variant={activeFilter === role ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(role)}
              >
                {ROLE_CONFIG[role]?.label || role} ({contributors.filter((c) => c.role === role).length})
              </Button>
            ))}
          </div>

          {filteredContributors.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">No contributors match the selected filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredContributors.map((contributor) => {
                const roleConfig = ROLE_CONFIG[contributor.role] || {
                  label: contributor.roleLabel,
                  color: "gray",
                  icon: Users,
                }
                const RoleIcon = roleConfig.icon

                return (
                  <Card
                    key={contributor.id}
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      contributor.isFounder
                        ? "border-amber-200 dark:border-amber-800 shadow-amber-100/50 dark:shadow-amber-900/20"
                        : contributor.isCurrent
                        ? "border-green-200 dark:border-green-800"
                        : "border-border"
                    }`}
                  >
                    {contributor.isFounder && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                    )}
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <Avatar className="h-20 w-20 md:h-24 md:w-24 shrink-0">
                          <AvatarImage src={contributor.avatar || ""} alt={contributor.displayName} />
                          <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                            {contributor.displayName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                            <h2 className="text-xl font-bold text-text-primary">{contributor.displayName}</h2>
                            <span className="text-text-muted">@{contributor.username}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                            <Badge
                              variant="outline"
                              className={`gap-1 ${getRoleBadgeClass(roleConfig.color)}`}
                            >
                              <RoleIcon className="h-3 w-3" />
                              {roleConfig.label}
                            </Badge>
                            {contributor.isFounder && (
                              <Badge variant="default" className="bg-amber-500 text-amber-foreground gap-1">
                                <Shield className="h-3 w-3" />
                                Founder
                              </Badge>
                            )}
                            {contributor.isCurrent && !contributor.isFormer && (
                              <Badge variant="default" className="bg-green-500 text-green-foreground gap-1">
                                <Check className="h-3 w-3" />
                                Current Team
                              </Badge>
                            )}
                            {contributor.isFormer && (
                              <Badge variant="secondary" className="gap-1">
                                <X className="h-3 w-3" />
                                Former Contributor
                              </Badge>
                            )}
                          </div>

                          {contributor.contributionDescription && (
                            <p className="text-text-secondary mb-3">{contributor.contributionDescription}</p>
                          )}

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateRange(contributor.startDate, contributor.endDate, contributor.isCurrent)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0">
                          {contributor.socialLinks.twitter && (
                            <a
                              href={contributor.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-muted hover:text-text-primary transition-colors"
                              aria-label="Twitter"
                            >
                              <Twitter className="h-5 w-5" />
                            </a>
                          )}
                          {contributor.socialLinks.github && (
                            <a
                              href={contributor.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-muted hover:text-text-primary transition-colors"
                              aria-label="GitHub"
                            >
                              <Github className="h-5 w-5" />
                            </a>
                          )}
                          {contributor.socialLinks.discord && (
                            <a
                              href={contributor.socialLinks.discord}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-muted hover:text-text-primary transition-colors"
                              aria-label="Discord"
                            >
                              <MessageCircle className="h-5 w-5" />
                            </a>
                          )}
                          {contributor.socialLinks.website && (
                            <a
                              href={contributor.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-muted hover:text-text-primary transition-colors"
                              aria-label="Website"
                            >
                              <Globe className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 text-accent-foreground">
              <Heart className="h-5 w-5" />
              <span className="font-medium">Built with love for the creator community</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getRoleBadgeClass(color: string) {
  const classes: Record<string, string> = {
    amber: "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300",
    blue: "border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    pink: "border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300",
    purple: "border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300",
    green: "border-green-300 dark:border-green-700 text-green-700 dark:text-green-300",
    indigo: "border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300",
    rose: "border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300",
    cyan: "border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300",
    orange: "border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300",
    yellow: "border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300",
    gray: "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300",
  }
  return classes[color] || classes.gray
}

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean) {
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
  if (isCurrent && !endDate) {
    return `${start} – Present`
  }
  const end = endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present"
  return `${start} – ${end}`
}