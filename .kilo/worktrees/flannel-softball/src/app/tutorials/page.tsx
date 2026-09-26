import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Store,
  Upload,
  KeyRound,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react"

export const metadata = {
  title: "Tutorials | PawVault",
  description:
    "Step-by-step guides for setting up your store, uploading products, managing licenses, and getting paid on PawVault.",
}

const tutorials = [
  {
    icon: Store,
    title: "Set up your creator storefront",
    level: "Beginner",
    minutes: 10,
    steps: [
      "From the top-right menu open your dashboard and choose Create store.",
      "Pick a store name and a unique slug (this becomes your URL: /store/your-slug).",
      "Write a short description and upload a logo and banner from your device.",
      "Add social links so customers can find you elsewhere.",
      "Publish your store. You can refine the look anytime from Store Settings.",
    ],
  },
  {
    icon: Upload,
    title: "Upload and publish your first product",
    level: "Beginner",
    minutes: 15,
    steps: [
      "Go to Creator → Products → New Product.",
      "Fill in the title, description, category, and tags in the info step.",
      "Upload a thumbnail and gallery images via the media uploader.",
      "Add your downloadable files (ZIP, RAR, source archives, etc.).",
      "Set pricing — regular price, optional sale price, or mark it Free.",
      "Choose your license type and publish. Your product is now live and discoverable.",
    ],
  },
  {
    icon: KeyRound,
    title: "Understanding and validating licenses",
    level: "Intermediate",
    minutes: 8,
    steps: [
      "A license key is created automatically when an order completes.",
      "Buyers find their keys under Dashboard → Licenses; creators see issued licenses per product.",
      "Keys grant download, update, and support entitlements for that product.",
      "Validate a key externally via GET /api/licenses/validate?key=XXX (rate-limited).",
      "Keys are revoked on refund or chargeback, which immediately blocks downloads.",
    ],
  },
  {
    icon: CreditCard,
    title: "Configure payouts and tax",
    level: "Intermediate",
    minutes: 6,
    steps: [
      "Open Creator → Payouts to review your earnings and payout history.",
      "PawVault is the merchant of record: we collect and remit tax for you.",
      "Commissions vary by creator status; verified creators qualify for reduced rates.",
      "Payouts run on the schedule displayed in your dashboard.",
      "Track every payout and tax record from your creator analytics.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Secure your account with MFA",
    level: "Beginner",
    minutes: 4,
    steps: [
      "Open Account → MFA.",
      "Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.).",
      "Enter the 6-digit code to confirm and enable TOTP.",
      "Save your backup codes somewhere safe in case you lose your device.",
    ],
  },
]

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Tutorials</h1>
          <p className="text-muted-foreground">
            Practical, step-by-step walkthroughs to help you get the most out of PawVault.
          </p>
        </div>

        <div className="space-y-6">
          {tutorials.map((t, i) => (
            <Card key={t.title} className="overflow-hidden">
              <CardHeader className="bg-white dark:bg-gray-900 border-b">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                    <t.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{t.title}</CardTitle>
                      <Badge variant="secondary">{t.level}</Badge>
                      <Badge variant="outline">{t.minutes} min</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ol className="space-y-3">
                  {t.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <h3 className="font-semibold">Want a guided walkthrough?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team can help you set up your store and first product.
              </p>
            </div>
            <Button asChild className="gradient-bg text-white">
              <Link href="/support">Get help</Link>
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
