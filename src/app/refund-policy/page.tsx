import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Refund Policy | PawVault",
  description:
    "When a digital product on PawVault can be refunded, how to request one, and how long it takes.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      document={{
        title: "Refund policy",
        lastUpdated: "Last updated: July 7, 2026",
        backLabel: "Back to home",
        sections: [
          {
            heading: "Eligibility",
            paragraphs: [
              "Refunds are available for digital products purchased on PawVault within 14 days of the purchase date. To qualify, the product must not have been downloaded or accessed after purchase.",
            ],
          },
          {
            heading: "How to request a refund",
            paragraphs: [
              "Open the order from your Orders page, choose “Request refund”, and describe the reason. The creator or an admin reviews the request.",
            ],
          },
          {
            heading: "Processing",
            paragraphs: [
              "Approved refunds are processed within 5–10 business days. The license key is revoked and download access is blocked immediately upon approval.",
            ],
          },
          {
            heading: "Exceptions",
            paragraphs: [
              "Repeated refund requests from the same account may result in account restrictions. Refunds are not guaranteed and are evaluated on a case-by-case basis.",
            ],
          },
        ],
      }}
    />
  )
}
