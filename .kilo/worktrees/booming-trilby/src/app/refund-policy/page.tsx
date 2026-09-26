import Link from "next/link"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
        <div className="prose dark:prose-invert">
          <p>Last updated: July 7, 2026</p>

          <h2>Eligibility</h2>
          <p>
            Refunds are available for digital products purchased on PawVault within 14 days of the purchase date. To qualify, the product must not have been downloaded or accessed after purchase.
          </p>

          <h2>How to Request a Refund</h2>
          <p>
            Open your order from Dashboard → Purchases, choose "Request refund", and describe the reason. The creator or an admin reviews the request.
          </p>

          <h2>Processing</h2>
          <p>
            Approved refunds are processed within 5–10 business days. The license key is revoked and download access is blocked immediately upon approval.
          </p>

          <h2>Exceptions</h2>
          <p>
            Repeated refund requests from the same account may result in account restrictions. Refunds are not guaranteed and are evaluated on a case-by-case basis.
          </p>

          <p>
            <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
