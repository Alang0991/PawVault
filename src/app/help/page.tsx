import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <p className="text-muted-foreground mb-6">Find answers to common questions and get support.</p>

        <section className="prose max-w-none">
          <h2>Get Started</h2>
          <p>Visit our <Link href="/api-docs">API Docs</Link> or <Link href="/tutorials">Tutorials</Link> to learn more.</p>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
