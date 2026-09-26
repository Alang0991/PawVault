import Link from "next/link"

export default function CreatorAgreementPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Creator Agreement</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 7, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              By registering as a creator on PawVault, you agree to the terms of this Creator Agreement. If you do not agree with these
              terms, please do not register or use the creator features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Creator Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">As a creator on PawVault, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information about yourself and your products</li>
              <li>Ensure all products are legal and comply with applicable laws and regulations</li>
              <li>Maintain the quality and integrity of your products</li>
              <li>Respond to buyer inquiries and support requests in a timely manner</li>
              <li>Comply with all applicable tax and reporting requirements</li>
              <li>Not engage in fraudulent, misleading, or harmful activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Content Ownership and Licensing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ownership</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You retain full ownership of all content you create and upload to PawVault. By uploading content, you grant PawVault a
                  worldwide, non-exclusive, royalty-free license to use, display, and distribute your content for the purpose of operating
                  and promoting the platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Buyer Licenses</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Buyers receive a license to use your digital products according to the license terms you specify at the time of listing.
                  You are responsible for defining appropriate license terms for your products.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Payouts and Fees</h2>
            <p className="text-muted-foreground leading-relaxed">
              Payouts are processed according to the payout schedule displayed in your creator dashboard. PawVault collects payment from
              buyers and disburses your earnings after deducting platform fees and applicable taxes. You are responsible for your own tax
              obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Prohibited Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You may not upload:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Copyrighted material without permission</li>
              <li>Malicious code or harmful software</li>
              <li>Illegal or infringing content</li>
              <li>Content that violates community guidelines</li>
              <li>Content that endangers minors</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Account Suspension and Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              PawVault reserves the right to suspend or terminate creator accounts that violate this agreement, engage in fraudulent
              activity, or pose a risk to other users. In such cases, your products may be removed and payouts may be withheld pending
              resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Disputes between creators, buyers, and PawVault are handled through our moderation and support systems. PawVault's decision
              on disputes is final.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Changes to This Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Creator Agreement from time to time. Continued use of creator features after changes constitute
              acceptance of the updated agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact Information</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">PawVault Creator Support</p>
              <p className="text-muted-foreground">Email: creators@pawvault.com</p>
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
