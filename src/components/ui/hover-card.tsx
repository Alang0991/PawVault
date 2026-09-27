"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverCardProps {
  children: React.ReactNode
  openDelay?: number
  closeDelay?: number
  /** Enable click/touch to toggle on mobile */
  clickToOpen?: boolean
}

export interface HoverCardTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Click to toggle on mobile (default: true) */
  clickToOpen?: boolean
}

export interface HoverCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const HoverCardContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.MutableRefObject<HTMLDivElement | null>
  openHoverCard: () => void
  closeHoverCard: () => void
  toggleHoverCard: () => void
} | null>(null)

function useHoverCardContext() {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error("HoverCard components must be used within HoverCard")
  }
  return context
}

export const HoverCard = ({ children, openDelay = 200, closeDelay = 100, clickToOpen = true }: HoverCardProps) => {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const openHoverCard = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(true), openDelay)
  }, [openDelay])

  const closeHoverCard = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), closeDelay)
  }, [closeDelay])

  const toggleHoverCard = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (open) {
      timeoutRef.current = setTimeout(() => setOpen(false), closeDelay)
    } else {
      timeoutRef.current = setTimeout(() => setOpen(true), openDelay)
    }
  }, [open, openDelay, closeDelay])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ open, setOpen, triggerRef, openHoverCard, closeHoverCard, toggleHoverCard }}>
      <div className="relative inline-block">{children}</div>
    </HoverCardContext.Provider>
  )
}

export const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>(
  ({ className, children, clickToOpen = true, ...props }, ref) => {
    const context = useHoverCardContext()

    return (
      <div
        ref={(node) => {
          context.triggerRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn("inline-block", className)}
        onMouseEnter={context.openHoverCard}
        onMouseLeave={context.closeHoverCard}
        onFocus={context.openHoverCard}
        onBlur={context.closeHoverCard}
        onClick={clickToOpen ? context.toggleHoverCard : undefined}
        onTouchStart={clickToOpen ? context.toggleHoverCard : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)
HoverCardTrigger.displayName = "HoverCardTrigger"

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, side = "bottom", align = "center", sideOffset = 4, children, ...props }, ref) => {
    const context = useHoverCardContext()

    if (!context.open) return null

    const sideClasses = {
      top: "bottom-full mb-1",
      right: "left-full ml-1",
      bottom: "top-full mt-1",
      left: "right-full mr-1",
    }

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    }

return (
        <div
          ref={ref}
          className={cn(
            "fixed z-50 max-w-xs rounded-md border border-border bg-popover p-3 shadow-lg",
            "animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in",
            sideClasses[side],
            alignClasses[align],
            className
          )}
          style={{
            ...props.style,
            ["--side-offset" as any]: `${sideOffset}px`,
          } as React.CSSProperties}
          {...props}
        >
          {children}
        </div>
      )
  }
)
HoverCardContent.displayName = "HoverCardContent"