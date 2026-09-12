"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, Flag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type SubmitState = "idle" | "submitting" | "success" | "error"

export function ReportProductDialog({
  productId,
  productTitle,
  isAuthenticated,
}: {
  productId: string
  productTitle: string
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setReason("")
    setSubmitState("idle")
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedReason = reason.trim()
    if (trimmedReason.length < 10) return

    setSubmitState("submitting")
    setError(null)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedType: "Product",
          reportedId: productId,
          reason: trimmedReason,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401 && !isAuthenticated) {
          router.push(
            `/auth/signin?callbackUrl=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          )
          return
        }
        throw new Error(data.error || "Unable to submit report")
      }

      setSubmitState("success")
    } catch (submitError) {
      setSubmitState("error")
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit report"
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Report product"
          aria-label={`Report ${productTitle}`}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Report product</DialogTitle>
          <DialogDescription className="text-center">
            Tell the moderation team what is wrong with this product. Reports
            are reviewed privately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Reason</Label>
            <Textarea
              id="report-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={10}
              maxLength={2000}
              required
              disabled={submitState === "submitting" || submitState === "success"}
              placeholder="Describe the issue in at least 10 characters"
              aria-describedby="report-reason-help report-reason-error"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p id="report-reason-help">Minimum 10 characters</p>
              <p>{reason.trim().length}/2000</p>
            </div>
            {error && (
              <p id="report-reason-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {submitState === "success" && (
              <p className="flex items-center gap-1.5 text-sm text-green-600" role="status">
                <Check className="h-4 w-4" />
                Report submitted. Thank you for helping keep PawVault safe.
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitState === "submitting"}>
                {submitState === "success" ? "Close" : "Cancel"}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                submitState === "submitting" ||
                submitState === "success" ||
                reason.trim().length < 10
              }
            >
              {submitState === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
