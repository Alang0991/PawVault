"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react"

interface ReportReviewButtonProps {
  reviewId: string
}

export function ReportReviewButton({ reviewId }: ReportReviewButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")

  const reasons = [
    { value: "spam", label: "Spam" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "fake", label: "Fake review" },
    { value: "off-topic", label: "Off-topic" },
    { value: "harassment", label: "Harassment" },
    { value: "other", label: "Other" },
  ]

  const handleReport = async () => {
    if (!selectedReason) return
    setReporting(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: selectedReason, details }),
      })
      if (res.ok) {
        setShowMenu(false)
        setSelectedReason("")
        setDetails("")
        alert("Review reported successfully")
      } else {
        alert("Failed to report review")
      }
    } catch {
      alert("Failed to report review")
    } finally {
      setReporting(false)
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} aria-label="Report review">
        <Flag className="h-4 w-4" />
      </Button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-10 w-72 bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm mb-2">Report this review</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reasons.map((r) => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={selectedReason === r.value}
                  onChange={() => setSelectedReason(r.value)}
                  className="text-primary"
                />
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-2">
            <Label htmlFor="report-details" className="block text-xs text-text-muted mb-1">
              Additional details (optional)
            </Label>
            <Textarea
              id="report-details"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Details..."
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowMenu(false)}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1" onClick={handleReport} disabled={reporting || !selectedReason}>
              {reporting ? "Reporting..." : "Report"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}