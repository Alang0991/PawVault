import Link from "next/link"

export default function TutorialsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Tutorials</h1>
        <p className="text-muted-foreground mb-6">Step-by-step guides and walkthroughs for creators and buyers.</p>

        <section className="prose max-w-none">
          <ul>
            <li>No tutorials yet — this page is a placeholder.</li>
          </ul>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
