import Link from "next/link"

export default function BlogPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Blog</h1>
        <p className="text-muted-foreground mb-6">Latest news, updates, and creator spotlights.</p>

        <section className="prose max-w-none">
          <p>No posts yet — this page is a placeholder.</p>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
