"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"
import { Download } from "lucide-react"
import { redirect } from "next/navigation"

export default function DownloadsPage() {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLicenses() {
      try {
        const res = await fetch("/api/licenses")
        const data = await res.json()
        if (res.ok) {
          setLicenses(data.licenses)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchLicenses()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Licenses & Downloads</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Licenses & Downloads</h1>
      {licenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No licenses yet.</p>
            <Button asChild>
              <Link href="/browse">Browse Assets</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {licenses.map((license: any) => (
            <Card key={license.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium">{license.product.title}</p>
                  <p className="text-sm text-muted-foreground">Key: {license.licenseKey}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={license.status === "ACTIVE" ? "default" : "destructive"}>
                    {license.status}
                  </Badge>
                  {license.status === "ACTIVE" && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
