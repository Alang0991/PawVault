import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"

export const metadata = {
  title: "Blog | PawVault",
  description:
    "Product news, creator spotlights, marketplace updates, and tips for buying and selling digital assets on PawVault.",
}

const posts = [
  {
    title: "Introducing PawVault 2.0: Faster Browsing and Smarter Search",
    category: "Product News",
    date: "June 24, 2026",
    readTime: "4 min read",
    excerpt:
      "We rebuilt the browse experience with a filter sidebar, instant search autocomplete, and pagination so you can find the perfect asset in seconds. Here’s what changed and why.",
    slug: "pawvault-2-browse",
  },
  {
    title: "Creator Spotlight: How NovaForge Built a Six-Figure Avatar Business",
    category: "Creator Spotlight",
    date: "June 12, 2026",
    readTime: "7 min read",
    excerpt:
      "From a single free VRChat emote to a thriving storefront, NovaForge shares the workflow, pricing strategy, and community tactics that grew their catalog to 200+ products.",
    slug: "creator-spotlight-novaforge",
  },
  {
    title: "Understanding Licenses: What Buyers and Creators Should Know",
    category: "Guides",
    date: "May 30, 2026",
    readTime: "6 min read",
    excerpt:
      "Every purchase generates a license key that unlocks downloads and updates. We break down entitlements, revocation, and how to validate keys via the license API.",
    slug: "understanding-licenses",
  },
  {
    title: "Optimizing Your Product Listings for Discovery",
    category: "Selling Tips",
    date: "May 18, 2026",
    readTime: "5 min read",
    excerpt:
      "Tags, thumbnails, and pricing tiers matter. Learn the listing habits that consistently rank higher in search and convert more visitors into buyers.",
    slug: "optimizing-listings",
  },
  {
    title: "How Payouts Work: Commissions, Taxes, and the Monthly Cycle",
    category: "Selling Tips",
    date: "May 2, 2026",
    readTime: "5 min read",
    excerpt:
      "PawVault is the merchant of record, which means we handle tax and take a 15% commission (less for verified creators). Here’s exactly when and how you get paid.",
    slug: "how-payouts-work",
  },
  {
    title: "Security Update: Enable MFA to Protect Your Account",
    category: "Security",
    date: "April 21, 2026",
    readTime: "3 min read",
    excerpt:
      "We added TOTP authenticator support and backup codes. Turning on MFA takes two minutes and dramatically reduces the risk of unauthorized access.",
    slug: "enable-mfa",
  },
]

export default function BlogPage() {
  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Blog</h1>
          <p className="text-muted-foreground">
            News, creator stories, and practical tips for getting more out of PawVault.
          </p>
        </div>

        {/* Featured post */}
        <Card className="mb-10 overflow-hidden border-0 shadow-md">
          <div className="aspect-[21/9] bg-gradient-to-br from-purple-500 to-rose-500 flex items-end p-6">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-2">{featured.category}</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">{featured.title}</h2>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-3">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{featured.date}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {featured.readTime}
              </span>
            </div>
            <Button asChild variant="outline">
              <Link href={`/blog/${featured.slug}`}>
                Read article <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rest.map((post) => (
            <Card key={post.slug} className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-purple-600 hover:underline flex items-center"
                  >
                    Read <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
