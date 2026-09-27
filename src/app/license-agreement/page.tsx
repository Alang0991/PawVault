import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "License Agreement | PawVault",
  description:
    "Standard, extended and commercial license terms for digital products bought on PawVault.",
}

export default function LicenseAgreementPage() {
  return (
    <LegalPage
      document={{
        title: "License agreement",
        lastUpdated: "Last updated: July 7, 2026",
        backLabel: "Back to home",
        sections: [
          {
            heading: "Standard license",
            paragraphs: [
              "A standard license grants the purchaser the right to use the digital product for personal or commercial projects. The product may not be resold, redistributed, or shared with others.",
            ],
          },
          {
            heading: "Extended license",
            paragraphs: [
              "An extended license allows the purchaser to use the product in commercial end products that are sold to end users. The product itself may not be sold as a standalone asset.",
            ],
          },
          {
            heading: "Commercial license",
            paragraphs: [
              "A commercial license permits use in commercial products, including SaaS and physical goods, subject to the specific terms defined by the creator at the time of purchase.",
            ],
          },
          {
            heading: "License keys",
            paragraphs: [
              "Each purchase generates a unique license key. This key proves ownership, unlocks downloads and updates, and can be validated through our license API. Keys are revoked on refund or chargeback.",
            ],
          },
          {
            heading: "Creator license terms",
            paragraphs: [
              "Creators define the specific license terms for their products at the time of listing. Buyers should review the license type and any additional terms before purchasing. PawVault is not responsible for enforcing creator-specific license terms beyond the standard platform protections.",
            ],
          },
        ],
      }}
    />
  )
}
