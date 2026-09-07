"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminActionButton } from "@/components/admin-action-button"
import { Package, User, History } from "lucide-react"
import { CheckCircle, Edit2, XCircle, Shield, Archive, RotateCcw } from "lucide-react"
import Image from "next/image"

interface ProductModerationEntry {
  id: string
  action: string
  reason: string | null
  notes: string | null
  createdAt: string
  actor: {
    username: string
    displayName: string | null
  }
}

interface Product {
  id: string
  title: string
  slug: string
  price: number
  isFree: boolean
  isPublished: boolean
  status: string
  creator: {
    id: string
    username: string
    displayName: string | null
    email: string
  }
  category: { name: string } | null
  media: { id: string; url: string }[]
  _count: { reviews: number; favorites: number }
  productModeration: ProductModerationEntry[]
}

export function ModerationProductRow({ product }: { product: Product }) {
  const statusColors: Record<string, string> = {
    PENDING_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    CHANGES_REQUESTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    SUSPENDED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  }

  const statusLabel: Record<string, string> = {
    PENDING_REVIEW: "Pending Review",
    CHANGES_REQUESTED: "Changes Requested",
    APPROVED: "Approved",
    SUSPENDED: "Suspended",
    REJECTED: "Rejected",
  }

  const canApprove = product.status === "PENDING_REVIEW" || product.status === "CHANGES_REQUESTED" || product.status === "REJECTED"
  const canReject = product.status === "PENDING_REVIEW" || product.status === "CHANGES_REQUESTED"
  const canRequestChanges = product.status === "PENDING_REVIEW" || product.status === "APPROVED"
  const canSuspend = product.status === "PUBLISHED" || product.status === "APPROVED" || product.status === "PENDING_REVIEW"
  const canRemove = product.status !== "REMOVED"
  const canRestore = product.status === "SUSPENDED" || product.status === "REJECTED"

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
            {product.media[0] ? (
              <Image src={product.media[0].url} alt="" width={48} height={48} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-6 w-6 m-3 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{product.title}</p>
            <p className="text-xs text-muted-foreground">
              by {product.creator.displayName || product.creator.username}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className={statusColors[product.status] || ""}>
                {statusLabel[product.status] || product.status}
              </Badge>
              {product.isPublished && <Badge variant="default">Published</Badge>}
              {product.isFree ? (
                <Badge variant="outline">Free</Badge>
              ) : (
                <Badge variant="outline">£{product.price.toFixed(2)}</Badge>
              )}
              {product.category && <span className="text-xs text-muted-foreground">{product.category.name}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-1 flex-wrap justify-end">
            {canApprove && (
              <AdminActionButton
                url={`/api/moderation/products/${product.id}`}
                method="POST"
                body={{ action: "approve" }}
                size="sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Approve
              </AdminActionButton>
            )}
            {canRequestChanges && (
              <AdminActionButton
                url={`/api/moderation/products/${product.id}`}
                method="POST"
                body={{ action: "request_changes" }}
                size="sm"
                variant="outline"
              >
                <Edit2 className="h-3 w-3 mr-1" /> Changes
              </AdminActionButton>
            )}
            {canReject && (
              <AdminActionButton
                url={`/api/moderation/products/${product.id}`}
                method="POST"
                body={{ action: "reject" }}
                size="sm"
                variant="destructive"
              >
                <XCircle className="h-3 w-3 mr-1" /> Reject
              </AdminActionButton>
            )}
            {canSuspend && (
              <AdminActionButton
                url={`/api/moderation/products/${product.id}`}
                method="POST"
                body={{ action: "suspend" }}
                size="sm"
                variant="secondary"
              >
                <Shield className="h-3 w-3 mr-1" /> Suspend
              </AdminActionButton>
            )}
            {canRemove && (
              <AdminActionButton
                url={`/api/moderation/products/${product.id}`}
                method="POST"
                body={{ action: "remove" }}
                size="sm"
                variant="destructive"
                confirm="Remove this product from the marketplace?"
              >
                <Archive className="h-3 w-3 mr-1" /> Remove
              </AdminActionButton>
            )}
            {canRestore && (
              <AdminActionButton
                url={`/api/moderation/products/${product.id}`}
                method="POST"
                body={{ action: "restore" }}
                size="sm"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Restore
              </AdminActionButton>
            )}
          </div>
          <Link href={`/product/${product.slug}`} target="_blank" className="text-xs text-muted-foreground hover:underline">
            View product →
          </Link>
        </div>
      </div>

      {/* Moderation history */}
      {product.productModeration.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-1 mb-1">
            <History className="h-3 w-3" /> Recent activity
          </div>
          {product.productModeration.slice(0, 3).map((entry) => (
            <div key={entry.id} className="ml-4">
              {entry.actor.displayName || entry.actor.username} · {entry.action.toLowerCase()} ·{" "}
              {new Date(entry.createdAt).toLocaleDateString()}
              {entry.reason && ` · "${entry.reason}"`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}