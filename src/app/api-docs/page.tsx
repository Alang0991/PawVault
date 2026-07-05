import Link from "next/link"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
        <p className="text-muted-foreground mb-6">Technical docs for integrators and partners.</p>

        <section className="prose max-w-none">
          <p>API docs will be added here. For now, check the <Link href="/help">Help Center</Link>.</p>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
