import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"

export const metadata = {
  title: "Blog | PawVault",
  description:
    "Platform updates, creator tips, and news from the PawVault team.",
}

const posts = [
  {
    title: "Getting Started as a Creator on PawVault",
    category: "Creator Tips",
    date: "July 7, 2026",
    readTime: "5 min read",
    excerpt:
      "Learn how to set up your creator account, create your first storefront, and publish your first product.",
    slug: "getting-started-as-creator",
  },
  {
    title: "How to Write Product Descriptions That Convert",
    category: "Selling Tips",
    date: "July 7, 2026",
    readTime: "4 min read",
    excerpt:
      "A clear, detailed product description helps buyers understand exactly what they are getting. Here are practical tips for writing better listings.",
    slug: "product-descriptions-that-convert",
  },
  {
    title: "Understanding License Types on PawVault",
    category: "Guides",
    date: "July 7, 2026",
    readTime: "6 min read",
    excerpt:
      "Standard, Extended, and Commercial licenses each serve different use cases. Learn which one to choose for your product.",
    slug: "understanding-license-types",
  },
  {
    title: "Managing Your Payouts and Earnings",
    category: "Creator Tips",
    date: "July 7, 2026",
    readTime: "4 min read",
    excerpt:
      "Track your earnings, review payout history, and understand how platform commissions affect your revenue.",
    slug: "managing-payouts-and-earnings",
  },
  {
    title: "Using Tags and Categories to Improve Discovery",
    category: "Selling Tips",
    date: "July 7, 2026",
    readTime: "3 min read",
    excerpt:
      "Good tagging and categorization help buyers find your products. Learn how to choose tags that match real search behavior.",
    slug: "tags-and-categories-discovery",
  },
  {
    title: "PawVault Security Best Practices",
    category: "Security",
    date: "July 7, 2026",
    readTime: "4 min read",
    excerpt:
      "Protect your account with strong passwords, session management, and by reviewing your account activity regularly.",
    slug: "security-best-practices",
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
            Platform updates, creator tips, and practical guides for using PawVault.
          </p>
        </div>

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
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/blog/${post.slug}`}>
                      Read <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
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
