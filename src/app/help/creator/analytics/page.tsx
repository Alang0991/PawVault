export const metadata = {
  title: "Analytics & Insights | Help Center",
  description: "Understand your store analytics.",
}

export default function Article() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Analytics & Insights</h1>
            <p className="text-lg text-text-secondary mb-4">Understand your store analytics.</p>
          </header>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Overview</h2>
            <p className="text-text-secondary">
              This article is being written. Please check back soon for detailed content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Related Articles</h2>
            <p className="text-text-secondary">
              Browse the <a href="/help" className="text-accent hover:underline">Help Center</a> for more articles on this topic.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}