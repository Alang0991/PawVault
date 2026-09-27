"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  label?: string
  /** Accessible text representation of the current value */
  valueText?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, label, valueText, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const ariaValueText = valueText ?? (label ? `${label}: ${Math.round(percentage)}%` : `${Math.round(percentage)}%`)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={ariaValueText}
        aria-label={label}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
        {showLabel && label && (
          <span className="absolute -top-6 right-0 text-xs text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }