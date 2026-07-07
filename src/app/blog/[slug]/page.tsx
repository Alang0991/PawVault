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
  "getting-started-as-creator": {
    title: "Getting Started as a Creator on PawVault",
    category: "Creator Tips",
    date: "July 7, 2026",
    readTime: "5 min read",
    excerpt:
      "Learn how to set up your creator account, create your first storefront, and publish your first product.",
    body: [
      {
        type: "p",
        text: "Becoming a creator on PawVault is straightforward. You need an account, a storefront, and at least one product to start selling.",
      },
      { type: "h2", text: "Create your account" },
      {
        type: "p",
        text: "Sign up with your email or use Google or Discord for one-click registration. Verify your email to unlock creator features.",
      },
      { type: "h2", text: "Set up your storefront" },
      {
        type: "p",
        text: "From your dashboard, select Create store. Choose a name and slug, write a short description, and upload a logo and banner. Your store URL will be /store/your-slug.",
      },
      { type: "h2", text: "Upload your first product" },
      {
        type: "p",
        text: "Go to Creator → Products → New Product. Fill in the title, description, category, and tags. Upload a thumbnail and gallery images, add your downloadable files, set a price, and choose publish or draft.",
      },
      { type: "h2", text: "What happens next" },
      {
        type: "ul",
        items: [
          "Your product becomes visible in the marketplace once published.",
          "Buyers can purchase it and receive a license key automatically.",
          "You can track sales and earnings from your creator dashboard.",
        ],
      },
    ],
  },
  "product-descriptions-that-convert": {
    title: "How to Write Product Descriptions That Convert",
    category: "Selling Tips",
    date: "July 7, 2026",
    readTime: "4 min read",
    excerpt:
      "A clear, detailed product description helps buyers understand exactly what they are getting. Here are practical tips for writing better listings.",
    body: [
      {
        type: "p",
        text: "Buyers decide quickly. A good product description answers the most important questions before the buyer has to ask.",
      },
      { type: "h2", text: "Start with the essentials" },
      {
        type: "ul",
        items: [
          "What the product is and what it does.",
          "Who it is for and what problem it solves.",
          "Key features, formats, and compatibility details.",
        ],
      },
      { type: "h2", text: "Be specific" },
      {
        type: "p",
        text: "Avoid vague language. Instead of high-quality assets, say high-poly 3D model with 4K textures, rigged for VRChat. Specific details build trust and reduce refund requests.",
      },
      { type: "h2", text: "Use formatting" },
      {
        type: "p",
        text: "Break long text into short paragraphs. Use bullet points for features. Keep the most important information near the top.",
      },
    ],
  },
  "understanding-license-types": {
    title: "Understanding License Types on PawVault",
    category: "Guides",
    date: "July 7, 2026",
    readTime: "6 min read",
    excerpt:
      "Standard, Extended, and Commercial licenses each serve different use cases. Learn which one to choose for your product.",
    body: [
      {
        type: "p",
        text: "Every product on PawVault is sold with a license that defines how the buyer can use it. Choosing the right license protects both you and your customers.",
      },
      { type: "h2", text: "Standard License" },
      {
        type: "p",
        text: "Best for personal use, internal projects, or non-commercial work. The buyer may not resell or redistribute the asset.",
      },
      { type: "h2", text: "Extended License" },
      {
        type: "p",
        text: "Allows use in commercial end products sold to end users. The asset itself may not be sold as a standalone product.",
      },
      { type: "h2", text: "Commercial License" },
      {
        type: "p",
        text: "Permits use in commercial products, including SaaS or physical goods, subject to the specific terms defined by the creator at the time of purchase.",
      },
      { type: "h2", text: "How to choose" },
      {
        type: "p",
        text: "Consider how your customers will use the product. If you are unsure, start with Standard and offer Extended or Commercial as an upgrade option.",
      },
    ],
  },
  "managing-payouts-and-earnings": {
    title: "Managing Your Payouts and Earnings",
    category: "Creator Tips",
    date: "July 7, 2026",
    readTime: "4 min read",
    excerpt:
      "Track your earnings, review payout history, and understand how platform commissions affect your revenue.",
    body: [
      {
        type: "p",
        text: "Your creator dashboard shows real-time earnings, payout history, and platform commissions. Understanding these numbers helps you plan your store and pricing strategy.",
      },
      { type: "h2", text: "Where to find earnings data" },
      {
        type: "p",
        text: "Open Creator → Payouts to see your total earnings, pending payouts, and payment history. You can also view order-level details from Creator → Orders.",
      },
      { type: "h2", text: "Platform commissions" },
      {
        type: "p",
        text: "PawVault deducts a platform commission on each sale. Verified creators qualify for a reduced commission rate. The exact rate is shown in your payout summary.",
      },
      { type: "h2", text: "Taxes" },
      {
        type: "p",
        text: "PawVault handles tax collection and remittance at checkout. You are responsible for reporting your earnings according to your local tax regulations.",
      },
    ],
  },
  "tags-and-categories-discovery": {
    title: "Using Tags and Categories to Improve Discovery",
    category: "Selling Tips",
    date: "July 7, 2026",
    readTime: "3 min read",
    excerpt:
      "Good tagging and categorization help buyers find your products. Learn how to choose tags that match real search behavior.",
    body: [
      {
        type: "p",
        text: "Discovery on PawVault relies on categories, tags, and search. Using them well is one of the easiest ways to get more eyes on your products.",
      },
      { type: "h2", text: "Categories" },
      {
        type: "p",
        text: "Choose the most specific category that fits your product. Broad categories compete with thousands of other listings. Narrow categories attract buyers who are already looking for exactly what you sell.",
      },
      { type: "h2", text: "Tags" },
      {
        type: "ul",
        items: [
          "Use 5 to 10 specific tags per product.",
          "Include style, engine, platform, and theme keywords.",
          "Avoid duplicate or overly generic tags.",
          "Think about the words buyers actually type into search.",
        ],
      },
      { type: "h2", text: "Titles and subtitles" },
      {
        type: "p",
        text: "Put the most important keywords first. A title like PC Quest VRChat Avatar with animations is more searchable than My Awesome Avatar.",
      },
    ],
  },
  "security-best-practices": {
    title: "PawVault Security Best Practices",
    category: "Security",
    date: "July 7, 2026",
    readTime: "4 min read",
    excerpt:
      "Protect your account with strong passwords, session management, and by reviewing your account activity regularly.",
    body: [
      {
        type: "p",
        text: "Your PawVault account controls access to your storefront, earnings, and customer data. Follow these practices to keep it secure.",
      },
      { type: "h2", text: "Use a strong password" },
      {
        type: "p",
        text: "Choose a password that is at least 12 characters long and includes a mix of letters, numbers, and symbols. Avoid reusing passwords from other sites.",
      },
      { type: "h2", text: "Enable multi-factor authentication" },
      {
        type: "p",
        text: "Enable TOTP authenticator MFA from Account → MFA. This adds a second layer of protection beyond your password. Save your backup codes in a secure location.",
      },
      { type: "h2", text: "Review account activity" },
      {
        type: "p",
        text: "Periodically check your login history and active sessions from Account Settings. If you see unfamiliar activity, reset your password and contact Support immediately.",
      },
      { type: "h2", text: "Beware of phishing" },
      {
        type: "p",
        text: "PawVault will never ask for your password or MFA code by email. Always verify the sender before clicking links or downloading attachments.",
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
