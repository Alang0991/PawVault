import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Store,
  KeyRound,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
  User,
  Search,
} from "lucide-react"

export const metadata = {
  title: "Help Center | PawVault",
  description:
    "Answers to common questions about buying, selling, licenses, payments, and your PawVault account.",
}

const categories = [
  {
    icon: User,
    title: "Getting Started",
    href: "#getting-started",
    desc: "Accounts, verification, and navigating the marketplace.",
  },
  {
    icon: ShoppingCart,
    title: "Buying & Downloads",
    href: "#buying",
    desc: "Purchasing, accessing files, and managing orders.",
  },
  {
    icon: Store,
    title: "Selling & Creators",
    href: "#selling",
    desc: "Storefronts, product uploads, and payouts.",
  },
  {
    icon: KeyRound,
    title: "Licenses",
    href: "#licenses",
    desc: "What a license key is and how it works.",
  },
  {
    icon: CreditCard,
    title: "Payments & Payouts",
    href: "#payments",
    desc: "Pricing, commissions, taxes, and creator earnings.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Account",
    href: "#security",
    desc: "Passwords, sessions, and keeping your account safe.",
  },
]

const faqs = [
  {
    group: "getting-started",
    heading: "Getting Started",
    items: [
      {
        q: "How do I create a PawVault account?",
        a: "Click Sign In in the top navigation and choose Create account, or use Google or Discord to register in one click. You will need to verify your email address before you can make purchases or publish products.",
      },
      {
        q: "Do I need to be a creator to browse and buy?",
        a: "No. Anyone can browse, search, wishlist, and purchase products as a customer. You only need a creator storefront if you want to sell your own assets.",
      },
      {
        q: "How do I become a verified creator?",
        a: "Verified status is granted after our team reviews your identity and portfolio. Verified creators benefit from a lower platform commission. Reach out via Support to start the review.",
      },
    ],
  },
  {
    group: "buying",
    heading: "Buying & Downloads",
    items: [
      {
        q: "Where do I find my purchased files?",
        a: "After checkout, go to Dashboard → Downloads. Every product you have bought appears there with its current version and a secure download link.",
      },
      {
        q: "Do I get future updates for free?",
        a: "Yes. Purchased products include update access for the life of the listing. When a creator publishes a new version you will see it on your Downloads page and receive a product-update notification.",
      },
      {
        q: "Can I request a refund?",
        a: "Refunds are handled per our Refund Policy. Open the order from Dashboard → Purchases, choose Request refund, and describe the reason. The creator or an admin reviews the request; approved refunds revoke the license and process the refund.",
      },
    ],
  },
  {
    group: "selling",
    heading: "Selling & Creators",
    items: [
      {
        q: "How do I open a creator storefront?",
        a: "From your dashboard choose Create store, set a name, slug, description, and upload a logo and banner. Once published, your store gets a public URL at /store/your-slug.",
      },
      {
        q: "What file types can I sell?",
        a: "We support images (PNG, JPG, WEBP, GIF, AVIF), videos (MP4, MOV, WEBM), and archives (ZIP, RAR, 7Z, PDF, source-code archives). Individual files can be up to 10 GB.",
      },
      {
        q: "How do I organize my products?",
        a: "Use categories, tags, and collections. Pin featured products to your storefront, and group related items into collections that shoppers can follow and share.",
      },
    ],
  },
  {
    group: "licenses",
    heading: "Licenses",
    items: [
      {
        q: "What is a license key?",
        a: "A license key is generated automatically when your order completes. It proves ownership, unlocks downloads and updates, and can be validated through our license API for integrations.",
      },
      {
        q: "When is a license revoked?",
        a: "Licenses are revoked automatically on refund or chargeback. Once revoked, new downloads are blocked immediately, though already-downloaded files remain on the buyer's machine.",
      },
      {
        q: "Can I transfer a license to someone else?",
        a: "Licenses are tied to the purchasing account and are not transferable. Each buyer receives their own key.",
      },
    ],
  },
  {
    group: "payments",
    heading: "Payments & Payouts",
    items: [
      {
        q: "What are the platform fees?",
        a: "PawVault is the merchant of record. We take a platform commission on all sales. Verified creators benefit from a lower commission rate. Reach out via Support for current rates.",
      },
      {
        q: "When and how do creators get paid?",
        a: "Payouts are processed according to the schedule displayed in your creator dashboard. PawVault handles tax collection and remittance on your behalf.",
      },
      {
        q: "Are taxes included in the price?",
        a: "Taxes are calculated at checkout based on the buyer's location and remitted by PawVault. Creators do not need to manage tax compliance for marketplace sales.",
      },
    ],
  },
  {
    group: "security",
    heading: "Security & Account",
    items: [
      {
        q: "How is my password stored?",
        a: "Passwords are hashed with bcrypt and never stored in plain text. Sessions use httpOnly cookies and all sensitive actions are recorded in an audit log.",
      },
      {
        q: "Should I enable multi-factor authentication?",
        a: "Yes. Enable TOTP authenticator MFA from Account → MFA to protect your account with a time-based code, plus recovery backup codes for trusted devices.",
      },
      {
        q: "I think my account was compromised — what now?",
        a: "Reset your password immediately, enable MFA, and contact Support. We can lock the account and review recent activity through our audit logs.",
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Help Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, learn how the marketplace works, and
            get support when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {categories.map((c) => (
            <Link key={c.title} href={c.href}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <c.icon className="h-6 w-6 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-1">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.group} id={section.group}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <Card key={item.q}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.q}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground pt-0">
                      {item.a}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Card className="mt-12 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Still need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Our support team is happy to assist with anything not covered here.
                </p>
              </div>
            </div>
            <Button asChild className="gradient-bg text-white">
              <Link href="/support">
                <Search className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
