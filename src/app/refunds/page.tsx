import Link from "next/link"

export default function RefundsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
        <div className="prose dark:prose-invert">
          <p>Last updated: July 1, 2026</p>
          <p>We offer a 14-day refund window for all VRChat assets. Refund requests can be submitted through your purchase history.</p>
          <p>Refunds are processed within 5-10 business days.</p>
          <p>
            <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
