import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string }

interface Post {
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  body: Block[]
}

const posts: Record<string, Post> = {
  "pawvault-2-browse": {
    title: "Introducing PawVault 2.0: Faster Browsing and Smarter Search",
    category: "Product News",
    date: "June 24, 2026",
    readTime: "4 min read",
    excerpt:
      "We rebuilt the browse experience with a filter sidebar, instant search autocomplete, and pagination so you can find the perfect asset in seconds. Here’s what changed and why.",
    body: [
      {
        type: "p",
        text: "Finding the right asset used to mean scrolling through endless pages. With PawVault 2.0, the browse page is built around how creators and buyers actually search.",
      },
      { type: "h2", text: "A filter sidebar that does the work" },
      {
        type: "p",
        text: "The new sidebar lets you narrow results by category, price range, minimum rating, tags, and quick toggles for free and on-sale items. Filters combine, so “free avatar, 4+ stars” is one click away.",
      },
      { type: "h2", text: "Instant search autocomplete" },
      {
        type: "p",
        text: "Start typing in the search bar and PawVault suggests matching products and creators before you finish. Keyboard navigation (arrow keys + Enter) makes it fast for power users.",
      },
      {
        type: "ul",
        items: [
          "Debounced requests so we don’t hammer the server on every keystroke.",
          "Separate results for products and creators with thumbnails.",
          "A “see all results” shortcut that drops you into the full search page.",
        ],
      },
      { type: "h2", text: "Sorting and pagination" },
      {
        type: "p",
        text: "Sort by newest, price (low/high), popularity, best-selling, or highest rated, and page through large catalogs without reloading. URLs stay shareable, so you can bookmark a filtered view.",
      },
      {
        type: "quote",
        text: "“I found three assets for my world in under a minute. The old way took me ten.” — beta tester",
      },
      {
        type: "p",
        text: "Try it now from the Browse link in the navigation, and let us know what filters you’d like next.",
      },
    ],
  },
  "creator-spotlight-novaforge": {
    title: "Creator Spotlight: How NovaForge Built a Six-Figure Avatar Business",
    category: "Creator Spotlight",
    date: "June 12, 2026",
    readTime: "7 min read",
    excerpt:
      "From a single free VRChat emote to a thriving storefront, NovaForge shares the workflow, pricing strategy, and community tactics that grew their catalog to 200+ products.",
    body: [
      {
        type: "p",
        text: "NovaForge started where many creators do: a free emote posted to a community Discord. Two years later, their PawVault storefront spans 200+ products and a loyal repeat-buyer base.",
      },
      { type: "h2", text: "A repeatable production workflow" },
      {
        type: "ul",
        items: [
          "Block out assets in batches so uploads and thumbnails happen in bulk.",
          "Standardize a thumbnail template for instant brand recognition.",
          "Keep a changelog per product so update emails write themselves.",
        ],
      },
      { type: "h2", text: "Pricing that rewards commitment" },
      {
        type: "p",
        text: "NovaForge uses a mix of free intro assets, mid-tier paid items, and occasional bundles. Free products act as a funnel: most paying customers started with a free download.",
      },
      { type: "h2", text: "Community as distribution" },
      {
        type: "p",
        text: "Instead of paid ads, NovaForge leans on Discord showcases, creator collabs, and featuring buyers’ worlds. That earned reach compounds far better than sporadic promotion.",
      },
      {
        type: "quote",
        text: "“The platform handling tax and payouts let me focus on making things, not paperwork.” — NovaForge",
      },
    ],
  },
  "understanding-licenses": {
    title: "Understanding Licenses: What Buyers and Creators Should Know",
    category: "Guides",
    date: "May 30, 2026",
    readTime: "6 min read",
    excerpt:
      "Every purchase generates a license key that unlocks downloads and updates. We break down entitlements, revocation, and how to validate keys via the license API.",
    body: [
      {
        type: "p",
        text: "A license is the proof of ownership that ties a buyer to a product. PawVault generates one automatically the moment an order completes.",
      },
      { type: "h2", text: "What a license unlocks" },
      {
        type: "ul",
        items: [
          "Download access to the current and future versions of the product.",
          "Update access whenever the creator publishes a new version.",
          "Support access as defined by the creator.",
        ],
      },
      { type: "h2", text: "When licenses are revoked" },
      {
        type: "p",
        text: "A license is revoked on refund or chargeback. Once revoked, new downloads are blocked immediately, though already-downloaded files remain on the buyer’s machine.",
      },
      { type: "h2", text: "Validating keys programmatically" },
      {
        type: "p",
        text: "Creators and partners can validate ownership with GET /api/licenses/validate?key=XXX. The endpoint checks existence, revocation, and expiry, and is rate-limited to 100 requests per minute.",
      },
    ],
  },
  "optimizing-listings": {
    title: "Optimizing Your Product Listings for Discovery",
    category: "Selling Tips",
    date: "May 18, 2026",
    readTime: "5 min read",
    excerpt:
      "Tags, thumbnails, and pricing tiers matter. Learn the listing habits that consistently rank higher in search and convert more visitors into buyers.",
    body: [
      {
        type: "p",
        text: "Discovery starts with the listing itself. Small, consistent habits separate products that sell from products that sit.",
      },
      { type: "h2", text: "Naming and compatibility" },
      {
        type: "p",
        text: "Include the asset type and compatibility in the title — for example “PC + Quest VRChat Avatar”. Shoppers filter by platform, so explicit naming pays off.",
      },
      { type: "h2", text: "Tags that match intent" },
      {
        type: "ul",
        items: [
          "Use 5–10 specific tags: style, engine, platform, and theme.",
          "Mirror the words buyers actually type in search.",
          "Avoid duplicate or spammy tags — they hurt ranking.",
        ],
      },
      { type: "h2", text: "Thumbnails and previews" },
      {
        type: "p",
        text: "A crisp thumbnail and a short preview video are the strongest drivers of click-through. Treat the gallery like a store window.",
      },
    ],
  },
  "how-payouts-work": {
    title: "How Payouts Work: Commissions, Taxes, and the Monthly Cycle",
    category: "Selling Tips",
    date: "May 2, 2026",
    readTime: "5 min read",
    excerpt:
      "PawVault is the merchant of record, which means we handle tax and take a 15% commission (less for verified creators). Here’s exactly when and how you get paid.",
    body: [
      {
        type: "p",
        text: "When you sell on PawVault, you’re not running a storefront business alone — we act as the merchant of record.",
      },
      { type: "h2", text: "Commissions" },
      {
        type: "ul",
        items: [
          "Standard: 15% platform commission.",
          "Verified creators: 12%.",
          "Premium partners: 10%.",
        ],
      },
      { type: "h2", text: "Tax, handled for you" },
      {
        type: "p",
        text: "We calculate, collect, and remit VAT/sales tax at checkout based on the buyer’s location. You don’t register for tax in every region to sell globally.",
      },
      { type: "h2", text: "The payout cycle" },
      {
        type: "p",
        text: "Earnings accumulate and are paid monthly on the 15th, with a $50 minimum threshold. You can review every payout and the underlying tax records from your creator analytics dashboard.",
      },
    ],
  },
  "enable-mfa": {
    title: "Security Update: Enable MFA to Protect Your Account",
    category: "Security",
    date: "April 21, 2026",
    readTime: "3 min read",
    excerpt:
      "We added TOTP authenticator support and backup codes. Turning on MFA takes two minutes and dramatically reduces the risk of unauthorized access.",
    body: [
      {
        type: "p",
        text: "Account takeovers are one of the most common ways creators lose access to their storefront and earnings. Multi-factor authentication (MFA) is the single best defense.",
      },
      { type: "h2", text: "What we added" },
      {
        type: "ul",
        items: [
          "TOTP authenticator support (Google Authenticator, Authy, etc.).",
          "One-tap backup codes for when you lose your device.",
          "Trusted-device marking to reduce prompts on hardware you use often.",
        ],
      },
      { type: "h2", text: "Turn it on in two minutes" },
      {
        type: "p",
        text: "Open Account → MFA, scan the QR code, confirm the 6-digit code, and save your backup codes somewhere safe. That’s it — your account is now protected.",
      },
      {
        type: "quote",
        text: "Passwords get leaked. A time-based code means a leaked password alone can’t get in.",
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = posts[params.slug]
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        <Badge variant="secondary" className="mb-3">
          {post.category}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span>{post.date}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {post.readTime}
          </span>
        </div>

        <article className="space-y-4">
          {post.body.map((block, i) => {
            if (block.type === "h2")
              return (
                <h2 key={i} className="text-2xl font-bold mt-8 mb-2">
                  {block.text}
                </h2>
              )
            if (block.type === "p")
              return (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {block.text}
                </p>
              )
            if (block.type === "ul")
              return (
                <ul key={i} className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {block.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              )
            return (
              <blockquote
                key={i}
                className="border-l-4 border-purple-400 pl-4 italic text-muted-foreground"
              >
                {block.text}
              </blockquote>
            )
          })}
        </article>

        <div className="mt-12 text-center">
          <Link href="/blog" className="text-sm text-purple-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
