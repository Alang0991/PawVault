import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 1, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using PawVault, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              PawVault is a VRChat-focused digital marketplace that enables creators to sell VRChat assets directly to customers. We provide platform infrastructure, payment processing, download delivery, and customer support tools. Creators retain full ownership of their content and are independent contractors, not employees of PawVault.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain uploads, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be at least 13 years old (or 18 in jurisdictions requiring adulthood)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Creator Terms</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Commission Structure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  PawVault charges a platform commission on all sales:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Standard creators: 15% commission</li>
                  <li>Verified creators: 12% commission</li>
                  <li>Premium creators: 10% commission</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Content Ownership</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Creators retain full ownership of their content. By uploading content, you grant PawVault a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content exclusively for the purpose of operating and promoting the platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Payouts</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Payouts are processed monthly on the 15th with a $50 minimum threshold. Payment methods include PayPal, direct deposit, and other available options. Creators are responsible for their own tax obligations.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Customer Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Customers receive a license to use purchased VRChat assets according to the license terms specified by the creator. Most licenses are for personal/commercial use. Resale or redistribution of purchased files is prohibited unless explicitly permitted by the creator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Upload copyrighted material without permission</li>
              <li>Post malicious, harmful, or illegal content</li>
              <li>Engage in fraud, scam, or deceptive practices</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Attempt to bypass payment or licensing systems</li>
              <li>Use automated systems to access the platform without permission</li>
              <li>Reverse engineer or copy our platform software</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer a 14-day refund window for all VRChat assets. Refund requests can be submitted through your purchase history. Refunds are processed within 5-10 business days. Repeated refund requests may result in account restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The PawVault platform, including its design, code, and branding, is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              PawVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid by you in the past six months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to other users. Creators who violate content policies may have their assets removed and payouts withheld.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the jurisdiction in which PawVault operates. Any disputes shall be resolved through arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">PawVault Legal Team</p>
              <p className="text-muted-foreground">Email: legal@pawvault.com</p>
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
