"use client"

import { useState, useEffect } from "react"
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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isCreator, setIsCreator] = useState(false)
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

  useEffect(() => {
    async function checkCreatorStatus() {
      try {
        const res = await fetch("/api/creator/application")
        if (res.ok) {
          const data = await res.json()
          const status = data.application?.status || "NONE"
          if (status === "APPROVED") {
            setIsCreator(true)
          } else if (status === "PENDING" || status === "UNDER_REVIEW") {
            setError("Your creator application is under review. You will be notified once it's approved.")
          } else {
            setError("You need to become a creator before opening a store.")
          }
        } else {
          setError("You need to become a creator before opening a store.")
        }
      } catch {
        setError("Unable to verify creator status.")
      } finally {
        setLoading(false)
      }
    }
    checkCreatorStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const slug = formData.slug || generateSlug(formData.name)

    if (!formData.name.trim()) {
      setError("Store name is required")
      setSubmitting(false)
      return
    }
    if (!slug) {
      setError("Store slug is required")
      setSubmitting(false)
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
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Creator Account Required</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To open a PawVault store, you first need an approved creator account.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button asChild className="w-full gradient-bg text-white">
                <Link href="/become-creator">Apply to Become a Creator</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
