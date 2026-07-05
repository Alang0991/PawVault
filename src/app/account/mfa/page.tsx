"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function MFAPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/account/mfa", {
        method: checked ? "POST" : "DELETE",
      })

      if (res.ok) {
        setMfaEnabled(checked)
        setMessage(checked ? "MFA enabled" : "MFA disabled")
      } else {
        setMessage("Something went wrong")
      }
    } catch (error) {
      setMessage("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Two-Factor Authentication</h1>
        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable MFA</p>
                <p className="text-sm text-muted-foreground">
                  Protect your account with an extra layer of security
                </p>
              </div>
              <Switch
                checked={mfaEnabled}
                onCheckedChange={handleToggle}
                disabled={loading}
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes("wrong") ? "text-red-500" : "text-green-600"}`}>
                {message}
              </p>
            )}
            {mfaEnabled && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">MFA is enabled. Keep your backup codes safe.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
