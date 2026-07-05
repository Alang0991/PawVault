"use client"

import { useState, useEffect } from "react"
import { getServerUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function PurchasesPage() {
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
        <h1 className="text-3xl font-bold mb-8">My Imports</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Imports</h1>
      {licenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No purchases yet.</p>
            <Button asChild>
              <Link href="/browse">Browse Assets</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {licenses.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                       {order.items[0]?.product.title || "License"}
                      {order.items.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
