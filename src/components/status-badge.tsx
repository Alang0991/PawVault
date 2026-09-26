import { cn } from "@/lib/utils"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Check } from "lucide-react"

export type StatusType =
  | "sale"
  | "free"
  | "owned"
  | "mature"
  | "verified"
  | "featured"
  | "draft"
  | "pending"
  | "suspended"
  | "banned"

interface StatusBadgeProps extends BadgeProps {
  type: StatusType
  label?: string
  icon?: React.ReactNode
}

const STATUS_CONFIG: Record<
  StatusType,
  {
    variant: NonNullable<BadgeProps["variant"]>
    defaultLabel: string
    icon?: React.ReactNode
  }
> = {
  sale: {
    variant: "sale",
    defaultLabel: "Sale",
  },
  free: {
    variant: "success",
    defaultLabel: "Free",
  },
  owned: {
    variant: "info",
    defaultLabel: "Owned",
    icon: <Check className="h-3 w-3" />,
  },
  mature: {
    variant: "error",
    defaultLabel: "Mature 18+",
  },
  verified: {
    variant: "secondary",
    defaultLabel: "Verified",
    icon: (
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  featured: {
    variant: "warning",
    defaultLabel: "Featured",
  },
  draft: {
    variant: "subtle",
    defaultLabel: "Draft",
  },
  pending: {
    variant: "warning",
    defaultLabel: "Pending",
  },
  suspended: {
    variant: "warning",
    defaultLabel: "Suspended",
  },
  banned: {
    variant: "error",
    defaultLabel: "Banned",
  },
}

export function StatusBadge({ type, label, className, icon, ...props }: StatusBadgeProps) {
  const config = STATUS_CONFIG[type]
  if (!config) return null

  return (
    <Badge
      variant={config.variant}
      size="sm"
      className={cn(
        "font-semibold",
        config.icon && "gap-1",
        className
      )}
      {...props}
    >
      {icon ?? config.icon}
      {label ?? config.defaultLabel}
    </Badge>
  )
}

StatusBadge.displayName = "StatusBadge"
