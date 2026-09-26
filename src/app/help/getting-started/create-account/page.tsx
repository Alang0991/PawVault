export const metadata = {
  title: "How to Create a PawVault Account | Help Center",
  description: "Learn how to create a PawVault account using email or social login options.",
}

export default function CreateAccountArticle() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">How to Create a PawVault Account</h1>
            <p className="text-lg text-text-secondary mb-4">Step-by-step guide to setting up your PawVault account.</p>
          </header>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Option 1: Email & Password</h2>
            <ol className="space-y-4 text-text-secondary">
              <li>Click <strong>Sign In</strong> in the top navigation bar</li>
              <li>Click <strong>Create account</strong> below the login form</li>
              <li>Enter your email address and choose a strong password</li>
              <li>Check your email for a verification link</li>
              <li>Click the link to verify your email address</li>
              <li>You're now ready to browse and purchase!</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Option 2: Social Login (Google / Discord)</h2>
            <ol className="space-y-4 text-text-secondary">
              <li>Click <strong>Sign In</strong> in the top navigation bar</li>
              <li>Click <strong>Continue with Google</strong> or <strong>Continue with Discord</strong></li>
              <li>Authorize PawVault to access your basic profile info</li>
              <li>Your account is created instantly — no email verification needed!</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">After Creating Your Account</h2>
            <ul className="space-y-2 text-text-secondary list-disc list-inside">
              <li>Complete your profile with a display name, avatar, and bio</li>
              <li>Enable two-factor authentication (MFA) for extra security</li>
              <li>Set your preferred language and currency</li>
              <li>If you want to sell, apply for a creator storefront from your Dashboard</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Common Issues</h2>
            <div className="space-y-4 text-text-secondary">
              <div>
                <h3 className="font-medium mb-2">Didn't receive the verification email?</h3>
                <p>Check your spam/junk folder. You can also request a new verification email from the sign-in page.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Email already in use?</h3>
                <p>You may already have an account. Try signing in instead, or use the password reset option.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Social login not working?</h3>
                <p>Make sure pop-ups are allowed for PawVault. Try a different browser or use email/password instead.</p>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}