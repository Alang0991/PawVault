import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 1, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At PawVault, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Personal Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may collect personally identifiable information such as your name, email address, phone number, payment information, and any other information you voluntarily provide to us when you register an account, make a purchase, or contact us.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We automatically collect certain information when you visit our site, including your IP address, browser type, operating system, pages visited, time spent on pages, and other analytics data. This helps us improve our services and user experience.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transaction Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information about your purchases, downloads, licenses, and payment history. This includes order amounts, dates, asset information, and payment status.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Process transactions and send you purchase confirmations</li>
              <li>Create and manage your account</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send you updates about your licenses, licenses, and account activity</li>
              <li>Improve our platform, assets, and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud, spam, and other malicious activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> We share data with trusted third parties (Stripe, email providers, hosting services) who assist in operating our platform</li>
              <li><strong>Creators:</strong> When you purchase a asset, the creator receives your username and purchase information to deliver the asset</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your data may be transferred</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. All payment data is processed securely through Stripe. We use encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access and review your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences. Essential cookies required for site functionality cannot be disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform integrates with third-party services including Stripe (payments), NextAuth (authentication), and email providers. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new policy on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">PawVault Support Team</p>
              <p className="text-muted-foreground">Email: privacy@PawVault.com</p>
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
