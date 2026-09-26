"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react"

interface BackupRestoreButtonProps {
  backupId: string
  backupLabel: string
}

export function BackupRestoreButton({ backupId, backupLabel }: BackupRestoreButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  async function handleRestore() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/backups/${backupId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Restore failed")
        return
      }
      setOpen(false)
      setConfirmed(false)
      window.location.reload()
    } catch (e: any) {
      setError(e.message || "Restore failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) { setConfirmed(false); setError(null) }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <RotateCcw className="h-3 w-3 mr-1" /> Restore
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle>Restore backup?</DialogTitle>
              <DialogDescription>
                This will restore from &ldquo;{backupLabel}&rdquo;. A pre-restore safety backup is always created first.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Restore is destructive. Confirm you want to proceed.
            </AlertDescription>
          </Alert>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded"
            />
            I understand this is a destructive action and want to proceed.
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRestore} disabled={!confirmed || loading}>
            {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RotateCcw className="h-3 w-3 mr-1" />}
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}