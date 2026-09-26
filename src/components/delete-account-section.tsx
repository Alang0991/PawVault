"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"

export function DeleteAccountSection() {
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type 'DELETE MY ACCOUNT' to confirm")
      return
    }
    if (!password) {
      setError("Please enter your password")
      return
    }

    setDeleting(true)
    setError(null)
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm: confirmText }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = "/auth/signout"
        }, 3000)
      } else {
        setError(data.error || "Failed to delete account")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trash2 className="h-6 w-6 text-destructive" />
        <div>
          <h2 className="text-2xl font-bold">Delete Account</h2>
          <p className="text-sm text-text-secondary mt-1">
            Permanently delete your account and all associated data
          </p>
        </div>
      </div>

      <Alert variant="destructive" className="border-destructive/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>This action is irreversible</AlertTitle>
        <AlertDescription>
          Deleting your account will permanently remove:
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Your profile, username, and display name</li>
            <li>All purchased products and licenses</li>
            <li>Order history and payment records</li>
            <li>Reviews, wishlist, and recently viewed items</li>
            <li>All notifications and preferences</li>
            <li>Creator application and products (if applicable)</li>
          </ul>
          This cannot be undone.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50">
          <AlertTitle className="text-green-600">Account Deleted</AlertTitle>
          <AlertDescription>Your account has been permanently deleted. Redirecting to sign out...</AlertDescription>
        </Alert>
      )}

      {!success && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Confirm Deletion</CardTitle>
            <CardDescription>
              Enter your password and type "DELETE MY ACCOUNT" to confirm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Password</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={deleting || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type "DELETE MY ACCOUNT"</Label>
              <Input
                id="delete-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                disabled={deleting || success}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={deleting || success}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete My Account Permanently"
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}