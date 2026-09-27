import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpSearch } from "@/components/help-center-search"
import {
  publishedHelpArticles,
  helpSectionOrder,
  getHelpSectionArticles,
} from "@/lib/help-center-content"
import type { HelpSection } from "@/lib/help-center-content"

export const metadata = {
  title: "Help Center | PawVault",
  description:
    "Answers to common questions about buying, selling, licenses, payments, and your PawVault account.",
}

interface HelpSectionConfig {
  id: HelpSection
  title: string
  desc: string
}

const helpSections: HelpSectionConfig[] = [
  {
    id: "getting-started",
    title: "Getting started",
    desc: "Accounts, verification, profiles, and understanding roles.",
  },
  {
    id: "buying",
    title: "Buying and downloads",
    desc: "Purchasing, accessing files, and managing orders.",
  },
  {
    id: "selling",
    title: "Selling and creators",
    desc: "Storefronts, product uploads, and creator tools.",
  },
  {
    id: "security",
    title: "Security",
    desc: "Passwords, sessions, MFA, and account recovery.",
  },
  {
    id: "moderation",
    title: "Moderation and safety",
    desc: "Reporting, rules, and the review process.",
  },
  {
    id: "technical",
    title: "Technical",
    desc: "Troubleshooting, browser support, API, and downloads.",
  },
]

export default function HelpCenterPage() {
  const totalArticles = publishedHelpArticles.length

  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-10">
        <div className="max-w-5xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Help Center
            </h1>
            <p className="mt-2 max-w-2xl text-lg leading-relaxed text-text-secondary">
              {totalArticles} articles on buying, selling, accounts, security and
              technical topics.
            </p>
          </header>

          <div className="mb-10">
            <HelpSearch articles={publishedHelpArticles} />
          </div>

          <div className="space-y-10">
            {helpSectionOrder.map((sectionId) => {
              const config = helpSections.find((s) => s.id === sectionId)
              const articles = getHelpSectionArticles(sectionId)
              if (!config || articles.length === 0) return null

              return (
                <section key={sectionId}>
                  <div className="mb-4 border-b border-border pb-2">
                    <h2 className="text-xl font-bold tracking-tight text-text-primary">
                      {config.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-text-muted">{config.desc}</p>
                  </div>

                  <ul className="grid gap-x-8 gap-y-1 md:grid-cols-2">
                    {articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/help/articles/${article.slug}`}
                          className="block rounded-lg px-2 py-2 transition-colors hover:bg-muted focus-ring"
                        >
                          <span className="text-sm font-medium text-text-primary">
                            {article.title}
                          </span>
                          <span className="mt-0.5 block text-sm text-text-muted line-clamp-1">
                            {article.summary}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>

          <div className="mt-14 rounded-xl border border-border bg-surface px-6 py-8 text-center">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Need more help?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
              Our support team can help with account, purchase and technical
              questions.
            </p>
            <Button asChild className="mt-5">
              <Link href="/support">Contact support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
