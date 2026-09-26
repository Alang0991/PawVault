import Link from "next/link"

export default function LicenseAgreementPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">License Agreement</h1>
        <div className="prose dark:prose-invert">
          <p>Last updated: July 7, 2026</p>

          <h2>Standard License</h2>
          <p>
            A standard license grants the purchaser the right to use the digital product for personal or commercial projects. The product may not be resold, redistributed, or shared with others.
          </p>

          <h2>Extended License</h2>
          <p>
            An extended license allows the purchaser to use the product in commercial end products that are sold to end users. The product itself may not be sold as a standalone asset.
          </p>

          <h2>Commercial License</h2>
          <p>
            A commercial license permits use in commercial products, including SaaS and physical goods, subject to the specific terms defined by the creator at the time of purchase.
          </p>

          <h2>License Keys</h2>
          <p>
            Each purchase generates a unique license key. This key proves ownership, unlocks downloads and updates, and can be validated through our license API. Keys are revoked on refund or chargeback.
          </p>

          <h2>Creator License Terms</h2>
          <p>
            Creators define the specific license terms for their products at the time of listing. Buyers should review the license type and any additional terms before purchasing. PawVault is not responsible for enforcing creator-specific license terms beyond the standard platform protections.
          </p>

          <p>
            <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
