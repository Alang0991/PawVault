"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreatorResponseFormProps {
  reviewId: string
  productId: string
}

export function CreatorResponseForm({ reviewId, productId }: CreatorResponseFormProps) {
  const [response, setResponse] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!response.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      })
      if (res.ok) {
        setResponse("")
        window.location.reload()
      } else {
        alert("Failed to post response")
      }
    } catch {
      alert("Failed to post response")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t pt-3">
      <Label htmlFor="creator-response" className="block text-xs font-medium mb-1">
        Respond as creator
      </Label>
      <Textarea
        id="creator-response"
        rows={2}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write a response to this review..."
        className="mb-2"
      />
      <Button onClick={handleSubmit} disabled={submitting || !response.trim()}>
        {submitting ? "Posting..." : "Post Response"}
      </Button>
    </div>
  )
}