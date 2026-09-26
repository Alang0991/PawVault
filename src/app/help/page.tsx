import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpSearch } from "@/components/help-center-search"
import {
  publishedHelpArticles,
  helpSectionOrder,
  helpSectionLabels,
  getHelpSectionArticles,
} from "@/lib/help-center-content"
import type { HelpSection } from "@/lib/help-center-content"
import type { LucideIcon } from "lucide-react"
import {
  User,
  ShoppingCart,
  Store,
  Shield,
  Gavel,
  Monitor,
  LifeBuoy,
} from "lucide-react"

export const metadata = {
  title: "Help Center | PawVault",
  description:
    "Answers to common questions about buying, selling, licenses, payments, and your PawVault account.",
}

interface HelpSectionConfig {
  id: HelpSection
  icon: LucideIcon
  title: string
  desc: string
  color: string
}

const helpSections: HelpSectionConfig[] = [
  {
    id: "getting-started",
    icon: User,
    title: "Getting Started",
    desc: "Accounts, verification, profiles, and understanding roles.",
    color: "blue",
  },
  {
    id: "buying",
    icon: ShoppingCart,
    title: "Buying & Downloads",
    desc: "Purchasing, accessing files, and managing orders.",
    color: "green",
  },
  {
    id: "selling",
    icon: Store,
    title: "Selling & Creators",
    desc: "Storefronts, product uploads, and creator tools.",
    color: "purple",
  },
  {
    id: "security",
    icon: Shield,
    title: "Security",
    desc: "Passwords, sessions, MFA, and account recovery.",
    color: "rose",
  },
  {
    id: "moderation",
    icon: Gavel,
    title: "Moderation & Safety",
    desc: "Reporting, rules, and the review process.",
    color: "amber",
  },
  {
    id: "technical",
    icon: Monitor,
    title: "Technical",
    desc: "Troubleshooting, browser support, API, and downloads.",
    color: "sky",
  },
]

const colorClasses: Record<string, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
  sky: "text-sky-600 dark:text-sky-400",
}

const colorBgClasses: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-900/20",
  green: "bg-green-50 dark:bg-green-900/20",
  purple: "bg-purple-50 dark:bg-purple-900/20",
  rose: "bg-rose-50 dark:bg-rose-900/20",
  amber: "bg-amber-50 dark:bg-amber-900/20",
  sky: "bg-sky-50 dark:bg-sky-900/20",
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Help Center
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Find answers about buying, selling, accounts, security, and
            technical topics. Published articles are reviewed and current.
          </p>
        </header>

        <div className="mb-8">
          <HelpSearch articles={publishedHelpArticles} />
        </div>

        <div className="space-y-10">
          {helpSectionOrder.map((sectionId) => {
            const config = helpSections.find((s) => s.id === sectionId)
            const articles = getHelpSectionArticles(sectionId)
            if (!config || articles.length === 0) return null
            return (
              <section key={sectionId}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      colorBgClasses[config.color]
                    }`}
                  >
                    <config.icon
                      className={`h-5 w-5 ${colorClasses[config.color]}`}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                      {config.title}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {config.desc}
                    </p>
                  </div>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {helpSectionLabels[sectionId]} articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {articles.map((article) => (
                        <li key={article.slug}>
                          <Link
                            href={`/help/articles/${article.slug}`}
                            className="block text-accent hover:underline py-1.5"
                          >
                            {article.title}
                          </Link>
                          <p className="text-sm text-text-secondary line-clamp-1">
                            {article.summary}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            )
          })}
        </div>

        <div className="mt-12 rounded-lg border bg-accent/30 px-6 py-5 text-center">
          <LifeBuoy className="h-6 w-6 text-primary mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-text-primary mb-1">
            Need more help?
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Our Support team can assist with account, purchase, and technical
            questions.
          </p>
          <Button asChild className="gradient-bg text-white">
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
