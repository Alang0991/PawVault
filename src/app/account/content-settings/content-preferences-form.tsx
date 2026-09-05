"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Check, Loader2, ShieldAlert } from "lucide-react"

interface Initial {
  showAdultContent: boolean
  blurNsfwPreviews: boolean
  adultConfirmedAt: string | null
}

export function ContentPreferencesForm({ initial }: { initial: Initial }) {
  const [showAdult, setShowAdult] = useState(initial.showAdultContent)
  const [blurNsfw, setBlurNsfw] = useState(initial.blurNsfwPreviews)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function save(patch: { showAdultContent?: boolean; blurNsfwPreviews?: boolean; confirm?: boolean }) {
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const r = await fetch("/api/account/preferences/update", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j.error || "We couldn't save your preferences.")
        return
      }
      const data = await r.json()
      setShowAdult(data.preferences.showAdultContent)
      setBlurNsfw(data.preferences.blurNsfwPreviews)
      setSaved(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700 text-sm flex items-center gap-2">
          <Check className="h-4 w-4" /> Preferences saved.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Show adult content</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When enabled, NSFW product previews, storefronts and search results will be shown without a blur. NSFW products remain visible either way.
          </p>
        </div>
        <Switch
          checked={showAdult}
          disabled={busy}
          onCheckedChange={(c) => {
            if (c) {
              setConfirming(true)
            } else {
              save({ showAdultContent: false })
            }
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Blur NSFW previews</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When adult content is enabled, you can still keep NSFW previews blurred until you click <em>Show preview</em>. Disable to show them unblurred by default.
          </p>
        </div>
        <Switch
          checked={blurNsfw}
          disabled={busy || !showAdult}
          onCheckedChange={(c) => {
            setBlurNsfw(c)
            save({ blurNsfwPreviews: c })
          }}
        />
      </div>

      {confirming && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold">
            <ShieldAlert className="h-4 w-4" /> Confirm you are 18 or older
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Adult content is intended for people aged 18 and over. By enabling this, you confirm you are at least 18.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => save({ showAdultContent: true, confirm: true })} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              I am 18 or older — enable
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {initial.adultConfirmedAt && (
        <p className="text-xs text-muted-foreground">
          Adult content enabled on {new Date(initial.adultConfirmedAt).toLocaleDateString()}.
        </p>
      )}
    </div>
  )
}
