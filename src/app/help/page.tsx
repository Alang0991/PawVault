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
  BookOpen,
  FileText,
  RotateCcw,
  AlertTriangle,
  Gavel,
  Copyright,
  Shield,
  DollarSign,
  Lock,
  Download,
  Box,
  Wrench,
  Monitor,
  MessageSquare,
  Flag,
  HelpCircle,
  ExternalLink,
  Code,
  Server,
  BarChart2,
} from "lucide-react"

export const metadata = {
  title: "Help Center | PawVault",
  description:
    "Answers to common questions about buying, selling, licenses, payments, and your PawVault account.",
}

const helpSections = [
  {
    id: "getting-started",
    icon: User,
    title: "Getting Started",
    desc: "Accounts, verification, and navigating the marketplace.",
    color: "blue",
    articles: [
      { title: "How to create a PawVault account", href: "/help/getting-started/create-account" },
      { title: "Email verification & login issues", href: "/help/getting-started/email-verification" },
      { title: "Navigating the marketplace", href: "/help/getting-started/navigation" },
      { title: "Setting up your profile", href: "/help/getting-started/profile-setup" },
      { title: "Understanding user roles", href: "/help/getting-started/user-roles" },
    ],
  },
  {
    id: "buying",
    icon: ShoppingCart,
    title: "Buying & Downloads",
    desc: "Purchasing, accessing files, and managing orders.",
    color: "green",
    articles: [
      { title: "How to purchase products", href: "/help/buying/purchase-products" },
      { title: "Accessing your downloads", href: "/help/buying/access-downloads" },
      { title: "Product updates & version history", href: "/help/buying/updates" },
      { title: "Managing your orders", href: "/help/buying/manage-orders" },
      { title: "Purchase history & receipts", href: "/help/buying/history-receipts" },
      { title: "Download troubleshooting", href: "/help/buying/download-issues" },
    ],
  },
  {
    id: "selling",
    icon: Store,
    title: "Selling on PawVault",
    desc: "Storefronts, product uploads, and creator tools.",
    color: "purple",
    articles: [
      { title: "Creating your creator storefront", href: "/help/selling/create-storefront" },
      { title: "Becoming a verified creator", href: "/help/selling/verified-creator" },
      { title: "Uploading & managing products", href: "/help/selling/upload-products" },
      { title: "Product categories & tags", href: "/help/selling/categories-tags" },
      { title: "Pricing & sales management", href: "/help/selling/pricing-sales" },
      { title: "Bundles & collections", href: "/help/selling/bundles-collections" },
      { title: "Creator dashboard overview", href: "/help/selling/dashboard" },
      { title: "Payouts & earnings", href: "/help/selling/payouts" },
    ],
  },
  {
    id: "commissions",
    icon: MessageSquare,
    title: "Commission Guidelines",
    desc: "Rules for avatar & art commission services.",
    color: "pink",
    articles: [
      { title: "Avatar commission guidelines", href: "/help/commissions/avatar-guidelines" },
      { title: "Art commission guidelines", href: "/help/commissions/art-guidelines" },
      { title: "Service listing requirements", href: "/help/commissions/listing-requirements" },
      { title: "Pricing & turnaround standards", href: "/help/commissions/pricing-turnaround" },
      { title: "Communication & delivery", href: "/help/commissions/communication-delivery" },
      { title: "Dispute resolution", href: "/help/commissions/disputes" },
    ],
  },
  {
    id: "refunds",
    icon: RotateCcw,
    title: "Returns & Refunds",
    desc: "Refund policy, process, and eligibility.",
    color: "orange",
    articles: [
      { title: "Refund policy overview", href: "/help/refunds/policy" },
      { title: "How to request a refund", href: "/help/refunds/request-refund" },
      { title: "Refund eligibility criteria", href: "/help/refunds/eligibility" },
      { title: "Refund process timeline", href: "/help/refunds/timeline" },
      { title: "Partial vs full refunds", href: "/help/refunds/partial-full" },
      { title: "Refund disputes", href: "/help/refunds/disputes" },
    ],
  },
  {
    id: "legal",
    icon: Gavel,
    title: "Legal & Policies",
    desc: "Terms of Service, Privacy, DMCA, and guidelines.",
    color: "red",
    articles: [
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Cookie Policy", href: "/help/legal/cookie-policy" },
      { title: "Community Guidelines", href: "/help/legal/community-guidelines" },
      { title: "Creator Guidelines", href: "/help/legal/creator-guidelines" },
      { title: "Marketplace Guidelines", href: "/help/legal/marketplace-guidelines" },
      { title: "Commission Guidelines", href: "/help/legal/commission-guidelines" },
      { title: "Copyright & DMCA", href: "/copyright" },
      { title: "Licensing Information", href: "/help/legal/licensing" },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments & Security",
    desc: "Payment methods, security, and account safety.",
    color: "amber",
    articles: [
      { title: "Accepted payment methods", href: "/help/payments/methods" },
      { title: "Platform fees & commissions", href: "/help/payments/fees" },
      { title: "Tax information", href: "/help/payments/tax" },
      { title: "Account security & MFA", href: "/help/payments/account-security" },
      { title: "Payment information help", href: "/help/payments/payment-info" },
      { title: "Fraud prevention", href: "/help/payments/fraud-prevention" },
    ],
  },
  {
    id: "creator-help",
    icon: Wrench,
    title: "Creator Help",
    desc: "Selling, store management, and creator tools.",
    color: "indigo",
    articles: [
      { title: "Selling on PawVault guide", href: "/help/creator/selling-guide" },
      { title: "Store customization", href: "/help/creator/store-customization" },
      { title: "Product file management", href: "/help/creator/file-management" },
      { title: "Analytics & insights", href: "/help/creator/analytics" },
      { title: "Promoting your products", href: "/help/creator/promotion" },
      { title: "Coupon & discount codes", href: "/help/creator/coupons" },
      { title: "Staff picks & featuring", href: "/help/creator/staff-picks" },
    ],
  },
  {
    id: "technical",
    icon: Monitor,
    title: "Technical Help",
    desc: "Download help, API docs, and troubleshooting.",
    color: "cyan",
    articles: [
      { title: "Download help & troubleshooting", href: "/help/technical/download-help" },
      { title: "API documentation", href: "/api-docs" },
      { title: "Website status", href: "/help/technical/status" },
      { title: "Browser compatibility", href: "/help/technical/browser-support" },
      { title: "Mobile app guide", href: "/help/technical/mobile" },
      { title: "Webhook integration", href: "/help/technical/webhooks" },
    ],
  },
  {
    id: "reporting",
    icon: Flag,
    title: "Reporting & Safety",
    desc: "Report issues, products, creators, and copyright.",
    color: "rose",
    articles: [
      { title: "Report an issue", href: "/help/reporting/report-issue" },
      { title: "Report a product", href: "/help/reporting/report-product" },
      { title: "Report a creator", href: "/help/reporting/report-creator" },
      { title: "Report copyright infringement", href: "/help/reporting/copyright" },
      { title: "Safety & moderation", href: "/help/reporting/safety" },
    ],
  },
  {
    id: "tutorials",
    icon: BookOpen,
    title: "Tutorials & Guides",
    desc: "Step-by-step tutorials for common tasks.",
    color: "violet",
    articles: [
      { title: "Getting started tutorial", href: "/tutorials/getting-started" },
      { title: "Creating your first product", href: "/tutorials/create-product" },
      { title: "Setting up commissions", href: "/tutorials/setup-commissions" },
      { title: "Using the API", href: "/tutorials/api-guide" },
      { title: "Advanced store features", href: "/tutorials/advanced-store" },
    ],
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

function SectionCard({ section }: { section: typeof helpSections[0] }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400",
    pink: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900 text-pink-600 dark:text-pink-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400",
    indigo: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400",
    cyan: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400",
    rose: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400",
    violet: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900 text-violet-600 dark:text-violet-400",
  }

  const ColorIcon = section.icon
  const classes = colorClasses[section.color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <Link href={`#${section.id}`} className="group">
      <Card className={`h-full hover:shadow-md transition-shadow border ${classes}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${classes.replace("border-", "bg-").replace("text-", "bg-opacity-10")} shrink-0`}>
              <ColorIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1 group-hover:underline">{section.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2">{section.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {section.articles.slice(0, 3).map((article) => (
                  <Link
                    key={article.title}
                    href={article.href}
                    className="text-xs px-2 py-1 rounded bg-background/50 hover:bg-accent/10 transition-colors text-text-secondary hover:text-text-primary"
                  >
                    {article.title}
                  </Link>
                ))}
                {section.articles.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded bg-background/50 text-text-muted">
                    +{section.articles.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Help Center</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Find answers to common questions, learn how the marketplace works, and get support when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {helpSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        <div className="space-y-12">
          {helpSections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses].replace("border-", "bg-").replace("text-", "bg-opacity-10")}`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.articles.map((article) => (
                  <Link
                    key={article.title}
                    href={article.href}
                    className="p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors group"
                  >
                    <h3 className="font-medium text-text-primary group-hover:text-accent-foreground mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-text-muted">
                      View article →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-10 mt-16 border-t pt-12">
          {faqs.map((section) => (
            <section key={section.group}>
              <h2 className="text-2xl font-bold text-text-primary mb-6">{section.heading}</h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <Card key={item.q} className="border-border hover:border-accent/50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium text-text-primary">{item.q}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-text-secondary pt-0">
                      {item.a}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Card className="mt-12 bg-accent/10 border-accent/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-accent-foreground" />
              <div>
                <h3 className="font-semibold text-text-primary">Still need help?</h3>
                <p className="text-sm text-text-secondary">
                  Our support team is happy to assist with anything not covered here.
                </p>
              </div>
            </div>
            <Button asChild className="bg-accent-foreground text-accent">
              <Link href="/support">
                <Search className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

const colorClasses = {
  blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400",
  green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400",
  purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400",
  pink: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900 text-pink-600 dark:text-pink-400",
  orange: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400",
  red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400",
  amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400",
  indigo: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400",
  cyan: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400",
  rose: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900 text-violet-600 dark:text-violet-400",
}