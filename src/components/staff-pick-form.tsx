"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Product {
  id: string
  title: string
  slug: string
}

export function StaffPickForm({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) {
      alert("Please select a product")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/staff-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, note: note || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to create staff pick")
        return
      }
      alert("Staff pick created")
      setProductId("")
      setNote("")
    } catch {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="product">Product</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a product..." />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why this product is a staff pick..."
          maxLength={500}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={loading} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        {loading ? "Adding..." : "Add Staff Pick"}
      </Button>
    </form>
  )
}