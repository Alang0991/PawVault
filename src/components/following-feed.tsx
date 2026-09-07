"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { ProductGridSkeleton } from "@/components/product-grid-skeleton"
import { EmptyState } from "@/components/empty-state"
import { Users } from "lucide-react"

interface FollowingFeedProps {
  userId: string
}

export function FollowingFeed({ userId }: FollowingFeedProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed/following?limit=8")
        if (res.ok) {
          const data = await res.json()
          setItems(data.items || [])
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [userId])

  if (loading) {
    return (
      <section>
        <SectionHeader title="From Creators You Follow" />
        <ProductGridSkeleton count={4} />
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section>
      <SectionHeader
        title="From Creators You Follow"
        subtitle="Latest drops from creators you follow"
      />
      <ProductGrid products={items} />
    </section>
  )
}

FollowingFeed.displayName = "FollowingFeed"