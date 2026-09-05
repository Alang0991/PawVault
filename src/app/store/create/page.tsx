"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Store } from "lucide-react"

export default function CreateShopPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  })

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const slug = formData.slug || generateSlug(formData.name)

    if (!formData.name.trim()) {
      setError("Store name is required")
      setLoading(false)
      return
    }
    if (!slug) {
      setError("Store slug is required")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/creator/store/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: slug,
          description: formData.description,
          socialLinks: {},
        }),
      })

      if (res.ok) {
        router.push("/creator/store/settings")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to create store")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Open Your Store</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Set up your creator storefront</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Store"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: formData.slug || generateSlug(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Store Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^\w-]/g, "-") })}
                  placeholder="my-awesome-store"
                />
                <p className="text-xs text-muted-foreground">Your store will be at /store/{formData.slug || "your-slug"}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your store..."
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
