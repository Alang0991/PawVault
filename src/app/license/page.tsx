import Link from "next/link"

export default function LicensePage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">License Agreement</h1>
        <p className="text-muted-foreground mb-6">License terms for purchased digital products. Full agreement coming soon.</p>

        <section className="prose max-w-none">
          <p>This page is a placeholder for the full license agreement.</p>
        </section>

        <div className="mt-8">
          <Link href="/terms" className="text-blue-600 hover:underline">View Terms</Link>
        </div>
      </div>
    </div>
  )
}
