"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Shield, QrCode, Key, Copy, Eye, EyeOff } from "lucide-react"

interface MFAStatus {
  enabled: boolean
  secret?: string | null
  backupCodes?: string[] | null
  qrCode?: string | null
}

export default function MFAPage() {
  const [status, setStatus] = useState<MFAStatus>({ enabled: false })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [setupStep, setSetupStep] = useState<"idle" | "verify" | "complete">("idle")
  const [token, setToken] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/account/mfa")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        if (data.secret && !data.enabled && setupStep === "idle") {
          setSetupStep("verify")
        }
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load MFA status" })
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/account/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        setSetupStep("complete")
        setMessage({ type: "success", text: "MFA enabled successfully! Save your backup codes." })
        setToken("")
      } else {
        const err = await res.json()
        setMessage({ type: "error", text: err.error || "Invalid token" })
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/account/mfa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (res.ok) {
        setStatus({ enabled: false })
        setMessage({ type: "success", text: "MFA disabled" })
        setToken("")
      } else {
        const err = await res.json()
        setMessage({ type: "error", text: err.error || "Invalid token" })
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copySecret = async () => {
    if (status.secret) {
      await navigator.clipboard.writeText(status.secret)
      setMessage({ type: "success", text: "Secret copied to clipboard" })
    }
  }

  if (loading && !status.enabled && setupStep === "idle") {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Two-Factor Authentication</h1>
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              <span className="ml-3 text-muted-foreground">Loading...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          Two-Factor Authentication
        </h1>

        {message && (
          <div className="mb-6 p-4 rounded-lg border" style={{
            backgroundColor: message.type === "success" ? "rgb(34 197 94 / 0.1)" : "rgb(239 68 68 / 0.1)",
            borderColor: message.type === "success" ? "rgb(34 197 94 / 0.3)" : "rgb(239 68 68 / 0.3)",
            color: message.type === "success" ? "#22c55e" : "#ef4444"
          }}>
            <div className="flex items-center gap-2">
              {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {message.text}
            </div>
          </div>
        )}

        {!status.enabled && setupStep === "idle" && (
          <Card>
            <CardHeader>
              <CardTitle>Enable Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using an authenticator app like Google Authenticator, Authy, or 1Password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full gradient-bg text-white" onClick={() => setSetupStep("verify")} disabled={loading}>
                Set Up MFA
              </Button>
            </CardContent>
          </Card>
        )}

        {!status.enabled && setupStep === "verify" && status.secret && (
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Scan this QR code with your authenticator app, then enter the 6-digit code below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {status.qrCode && (
                  <img src={status.qrCode} alt="MFA QR Code" className="mx-auto h-64 w-64 rounded border" />
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Manual Entry Key</span>
                  <Button variant="ghost" size="sm" onClick={copySecret}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="font-mono text-sm break-all" style={{ fontFamily: "monospace" }}>
                  {showSecret ? status.secret : "••••••••••••••••"}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSecret(!showSecret)} className="mt-2">
                  {showSecret ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showSecret ? "Hide" : "Show"} Secret
                </Button>
              </div>

              <div className="space-y-4">
                <Label htmlFor="token">Enter 6-digit code from authenticator app</Label>
                <Input
                  id="token"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-widest"
                  disabled={loading}
                />
                <Button className="w-full gradient-bg text-white" onClick={handleSetup} disabled={loading || token.length !== 6}>
                  {loading ? "Verifying..." : "Verify & Enable MFA"}
                </Button>
              </div>

              <Button variant="ghost" onClick={() => setSetupStep("idle")} disabled={loading}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {!status.enabled && setupStep === "complete" && status.backupCodes && (
          <Card className="border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                MFA Enabled Successfully!
              </CardTitle>
              <CardDescription>
                Save these backup codes in a secure place. Each code can only be used once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {status.backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <code className="font-mono text-lg tracking-wider">{code}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyCode(code, index)}
                      disabled={copiedIndex === index}
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => loadStatus()}>
                Done
              </Button>
            </CardContent>
          </Card>
        )}

        {status.enabled && setupStep === "idle" && (
          <Card>
            <CardHeader>
              <CardTitle>MFA is Enabled</CardTitle>
              <CardDescription>
                Your account is protected with two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status.backupCodes && status.backupCodes.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Backup Codes ({status.backupCodes.length} remaining)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {status.backupCodes.slice(0, 4).map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <code className="font-mono text-lg tracking-wider">{code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyCode(code, index)}
                          disabled={copiedIndex === index}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                    {status.backupCodes.length > 4 && (
                      <div className="col-span-2 text-center text-sm text-muted-foreground">
                        +{status.backupCodes.length - 4} more codes
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  To disable MFA, enter a code from your authenticator app or use a backup code.
                </p>
                <Label htmlFor="disable-token" className="block mb-2">Enter 6-digit code</Label>
                <Input
                  id="disable-token"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-widest mb-3"
                  disabled={loading}
                />
                <Button variant="destructive" className="w-full" onClick={handleDisable} disabled={loading || token.length !== 6}>
                  {loading ? "Disabling..." : "Disable MFA"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}