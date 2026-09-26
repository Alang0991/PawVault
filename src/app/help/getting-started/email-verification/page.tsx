export const metadata = {
  title: "Email Verification & Login Issues | Help Center",
  description: "Troubleshoot email verification and login problems on PawVault.",
}

export default function EmailVerificationArticle() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-3xl">
        <a href="/help" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Help Center
        </a>

        <article className="prose prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Email Verification & Login Issues</h1>
            <p className="text-lg text-text-secondary mb-4">Common solutions for email verification and login problems.</p>
          </header>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Email Verification</h2>
            <h3 className="font-medium text-text-secondary mb-2">I didn't receive the verification email</h3>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Check your spam, junk, and promotions folders</li>
              <li>Wait 5-10 minutes — delivery can sometimes be delayed</li>
              <li>Make sure you entered the correct email address</li>
              <li>Request a new verification email from the sign-in page</li>
              <li>If using a corporate/educational email, check with your IT department</li>
            </ul>

            <h3 className="font-medium text-text-secondary mb-2 mt-6">The verification link expired</h3>
            <p className="text-text-secondary">Verification links expire after 24 hours. Request a new one from the sign-in page.</p>

            <h3 className="font-medium text-text-secondary mb-2 mt-6">I clicked the link but still can't sign in</h3>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Make sure you're using the same browser where you clicked the link</li>
              <li>Clear your browser cache and cookies for pawvault.com</li>
              <li>Try opening the link in an incognito/private window</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Login Issues</h2>
            <h3 className="font-medium text-text-secondary mb-2">"Invalid email or password"</h3>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Double-check your email address for typos</li>
              <li>Make sure Caps Lock is off</li>
              <li>Use the "Forgot password" link to reset your password</li>
              <li>If you signed up with Google/Discord, use that same method to sign in</li>
            </ul>

            <h3 className="font-medium text-text-secondary mb-2 mt-6">Account locked or suspended</h3>
            <p className="text-text-secondary">If your account was suspended or banned, you'll see a specific message explaining why. Contact support if you believe this is an error.</p>

            <h3 className="font-medium text-text-secondary mb-2 mt-6">Two-factor authentication (MFA) issues</h3>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Make sure your device time is synchronized (automatic time zone)</li>
              <li>Use one of your backup codes if you lost access to your authenticator app</li>
              <li>If you lost both, contact support for account recovery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Still Need Help?</h2>
            <p className="text-text-secondary">If none of these solutions work, <a href="/support" className="text-accent hover:underline">contact our support team</a> with details about the issue you're experiencing.</p>
          </section>
        </article>
      </div>
    </div>
  )
}