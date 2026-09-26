import Link from "next/link"

export default function MarketplaceGuidelinesPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Marketplace Guidelines</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 7, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Purpose</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Marketplace Guidelines outline the rules and expectations for all transactions, listings, and interactions on
              PawVault. All users, creators, and buyers must comply with these guidelines to maintain a safe, fair, and trustworthy
              marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Listing Standards</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">All product listings must:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Accurately represent the product being sold</li>
              <li>Include appropriate descriptions, media, and license information</li>
              <li>Comply with applicable content ratings (SFW, MATURE, NSFW)</li>
              <li>Not violate any third-party intellectual property rights</li>
              <li>Not contain harmful, malicious, or illegal content</li>
              <li>Be priced fairly and transparently</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Buyer Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Buyers agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Respect creator license terms and conditions</li>
              <li>Not reverse-engineer, redistribute, or resell purchased products unless explicitly permitted</li>
              <li>Use products in accordance with applicable laws</li>
              <li>Report issues through proper support channels</li>
              <li>Leave honest and constructive reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">The following activities are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Selling counterfeit or pirated products</li>
              <li>Fraudulent transactions or payment manipulation</li>
              <li>Harassment, threats, or abusive behavior toward any user</li>
              <li>Spamming, phishing, or deceptive marketing</li>
              <li>Exploiting vulnerabilities in the platform</li>
              <li>Selling products that violate applicable laws or regulations</li>
              <li>Manipulating reviews, ratings, or other marketplace metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Moderation and Enforcement</h2>
            <p className="text-muted-foreground leading-relaxed">
              PawVault moderators review reports and may take action including: content removal, listing suspension, account restriction,
              or account termination. All moderation decisions are made in good faith to maintain marketplace quality and safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Disputes and Appeals</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users who disagree with moderation decisions may submit an appeal through the support system. Appeals are reviewed by a
              separate team member and resolved as quickly as possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Changes to Guidelines</h2>
            <p className="text-muted-foreground leading-relaxed">
              PawVault may update these guidelines at any time. Continued use of the marketplace after changes constitute acceptance of
              the updated guidelines. Significant changes will be announced through platform notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">PawVault Trust & Safety</p>
              <p className="text-muted-foreground">Email: trust@pawvault.com</p>
              <p className="text-muted-foreground">Support: <Link href="/support" className="text-blue-600 hover:underline">Submit a ticket</Link></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to PawVault
          </Link>
        </div>
      </div>
    </div>
  )
}
