import { cn } from "@/lib/utils"
import { Package, Heart, ShoppingBag, UserPlus, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="mx-auto h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
        {icon || <Package className="h-6 w-6 text-text-muted" />}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button asChild={!!action.href} variant="outline" size="sm">
          {action.href ? (
            <Link href={action.href}>{action.label}</Link>
          ) : (
            <button onClick={action.onClick}>{action.label}</button>
          )}
        </Button>
      )}
    </div>
  )
}

export function EmptyBrowseState({
  hasFilters,
  query,
}: {
  hasFilters: boolean
  query?: string
}) {
  if (query) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="No products found"
        description={`No results for "${query}". Try adjusting your search or filters.`}
        action={{ label: "Clear search", href: "/browse" }}
      />
    )
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="No products match your filters"
        description="Try adjusting or clearing your filters."
        action={{ label: "Clear filters", href: "/browse" }}
      />
    )
  }

  return (
    <EmptyState
      icon={<Package className="h-6 w-6" />}
      title="No products yet"
      description="More drops are on the way. Check back soon."
      action={{ label: "Start selling", href: "/creator/dashboard" }}
    />
  )
}

export function EmptyWishlistState() {
  return (
    <EmptyState
      icon={<Heart className="h-6 w-6" />}
      title="Your wishlist is empty"
      description="Save products you love for later."
      action={{ label: "Browse Marketplace", href: "/browse" }}
    />
  )
}

export function EmptyOrdersState() {
  return (
    <EmptyState
      icon={<ShoppingBag className="h-6 w-6" />}
      title="No orders yet"
      description="Your purchase history will appear here."
      action={{ label: "Browse Marketplace", href: "/browse" }}
    />
  )
}

export function EmptyCreatorsState() {
  return (
    <EmptyState
      icon={<UserPlus className="h-6 w-6" />}
      title="No creators yet"
      description="Be the first to join PawVault as a creator."
      action={{ label: "Start Selling", href: "/become-creator" }}
    />
  )
}

export function EmptyReviewsState() {
  return (
    <EmptyState
      icon={<Star className="h-6 w-6" />}
      title="No reviews yet"
      description="Be the first to review this product."
    />
  )
}