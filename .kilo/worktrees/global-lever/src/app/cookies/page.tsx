import Link from "next/link"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 7, 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They are used to remember your preferences,
              understand how you use the site, and improve your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">PawVault uses the following categories of cookies:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Essential Cookies:</strong> Required for the site to function properly. These include session tokens, authentication
                cookies, and security features. These cannot be disabled.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings such as language, currency, and display preferences.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous
                statistical data.
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Used to deliver personalized advertisements and track campaign performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Cookie Duration</h2>
            <p className="text-muted-foreground leading-relaxed">
              Essential cookies remain active for the duration of your session or as required for functionality. Preference cookies persist
              until you change your settings. Analytics cookies are retained for up to 12 months. Marketing cookies are retained only as
              long as necessary for their purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can manage or delete cookies through your browser settings. Most browsers allow you to refuse all cookies, accept all
              cookies, or receive a notification when a cookie is being set. Please note that disabling essential cookies may impair the
              functionality of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              PawVault integrates with third-party services including Stripe (payments), NextAuth (authentication), and email providers.
              These services may set their own cookies. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.
              Continued use of our services after changes constitute acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">PawVault Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@pawvault.com</p>
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
