"use client"

import { motion, type MotionProps, type HTMLMotionProps } from "framer-motion"
import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes } from "react"
import {
  fadeIn,
  slideUp,
  slideDown,
  scaleIn,
  staggerContainer,
  staggerItem,
  modalVariants,
  drawerVariants,
  dropdownVariants,
  tooltipVariants,
  pageVariants,
  listVariants,
  listItemVariants,
  cardHover,
  buttonTap,
  buttonHover,
  iconHover,
  iconTap,
  wishPop,
  shimmer,
  pulse,
} from "@/lib/animations"
import { type Variants } from "framer-motion"
import React from "react"

export interface FadeInProps extends Omit<MotionProps, "variants" | "initial" | "animate"> {
  delay?: number
  variant?: "fadeIn" | "slideUp" | "slideDown" | "scaleIn"
  className?: string
}

export function FadeIn({ children, delay = 0, variant = "fadeIn", className, ...props }: FadeInProps) {
  const variantsMap = { fadeIn, slideUp, slideDown, scaleIn }
  return (
    <motion.div
      variants={variantsMap[variant]}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface StaggerProps {
  children: React.ReactElement | React.ReactElement[]
  stagger?: number
  variant?: "slideUp" | "fadeIn"
  className?: string
}

export function Stagger({ children, stagger = 0.06, variant = "slideUp", className, ...props }: StaggerProps) {
  const childArray = React.Children.toArray(children)
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: stagger }}
      className={className}
      {...props}
    >
      {childArray.map((child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              key: child.key ?? index,
              variants: { slideUp, fadeIn }[variant],
            })
          : child
      )}
    </motion.div>
  )
}

export interface ModalProps extends Omit<MotionProps, "variants" | "initial" | "animate" | "exit"> {
  open: boolean
  onClose: () => void
  className?: string
}

export function Modal({ open, onClose, children, className, ...props }: ModalProps) {
  if (!open) return null

  return (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className || ""}`}
      {...props}
      onClick={onClose}
    >
      <motion.div
        className="bg-surface text-surface-foreground rounded-2xl shadow-card-elevated w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export interface DrawerProps extends Omit<MotionProps, "variants" | "initial" | "animate" | "exit"> {
  open: boolean
  onClose: () => void
  side?: "left" | "right"
  className?: string
}

export function Drawer({ open, onClose, side = "right", children, className, ...props }: DrawerProps) {
  if (!open) return null

  const variants = {
    hidden: { x: side === "left" ? "-100%" : "100%" },
    visible: { x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 40 } },
    exit: { x: side === "left" ? "-100%" : "100%", transition: { type: "spring" as const, stiffness: 400, damping: 40 } },
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`fixed inset-0 z-50 flex ${side === "left" ? "items-start justify-start" : "items-start justify-end"} ${className || ""}`}
      {...props}
      onClick={onClose}
    >
      <motion.div
        className="bg-surface text-surface-foreground h-full w-full max-w-sm md:max-w-md lg:max-w-lg shadow-card-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export interface DropdownProps extends Omit<MotionProps, "variants" | "initial" | "animate" | "exit"> {
  open: boolean
  children: React.ReactNode
  align?: "left" | "right"
  className?: string
}

export function Dropdown({ open, children, align = "left", className, ...props }: DropdownProps) {
  if (!open) return null

  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`absolute z-50 mt-1 min-w-[16rem] rounded-xl border border-border bg-popover p-1 shadow-card-elevated ${
        align === "right" ? "right-0" : "left-0"
      } ${className || ""}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface TooltipProps extends Omit<MotionProps, "variants" | "initial" | "animate" | "exit"> {
  open: boolean
  children: React.ReactNode
  className?: string
}

export function Tooltip({ open, children, className, ...props }: TooltipProps) {
  if (!open) return null

  return (
    <motion.div
      variants={tooltipVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`absolute z-50 px-2 py-1 text-xs text-popover-foreground bg-popover rounded shadow-card ${className || ""}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface PageTransitionProps extends Omit<MotionProps, "variants" | "initial" | "animate" | "exit"> {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface ListProps {
  children: React.ReactElement | React.ReactElement[]
  stagger?: number
  className?: string
}

export function AnimatedList({ children, stagger = 0.05, className, ...props }: ListProps) {
  const childArray = React.Children.toArray(children)
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: stagger }}
      className={className}
      {...props}
    >
      {childArray.map((child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              key: child.key ?? index,
              variants: listItemVariants,
            })
          : child
      )}
    </motion.ul>
  )
}

export interface CardHoverProps extends Omit<MotionProps, "variants" | "whileHover"> {
  children: React.ReactNode
  elevated?: boolean
  className?: string
}

export function CardHover({ children, elevated = false, className, ...props }: CardHoverProps) {
  return (
    <motion.div
      whileHover={elevated ? { ...cardHover, scale: 1.03, y: -8 } : cardHover}
      className={`group relative transition-shadow duration-200 ${className || ""}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface IconButtonProps extends Omit<MotionProps, "whileHover" | "whileTap"> {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <motion.button
      whileHover={iconHover}
      whileTap={iconTap}
      className={`inline-flex items-center justify-center rounded-xl p-2 transition-colors ${className || ""}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export interface WishButtonProps extends Omit<MotionProps, "whileTap"> {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function WishButton({ active, onClick, children, className, ...props }: WishButtonProps) {
  return (
    <motion.button
      whileTap={{ ...wishPop, ...iconTap }}
      className={`inline-flex items-center justify-center rounded-xl p-2 transition-colors ${className || ""}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export interface SkeletonProps extends Omit<MotionProps, "variants" | "animate"> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ variant = "text", width = "100%", height, className, ...props }: SkeletonProps) {
  const baseStyle: React.CSSProperties = { width, height }
  const variants = {
    text: { borderRadius: "0.375rem" },
    circular: { borderRadius: "9999px" },
    rectangular: { borderRadius: "0.5rem" },
  }

  return (
    <motion.div
      animate={shimmer}
      style={{ ...baseStyle, ...variants[variant] }}
      className={`bg-muted relative overflow-hidden ${className || ""}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={shimmer}
      />
    </motion.div>
  )
}

export function Pulse({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div animate={pulse} className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function MotionDiv(props: HTMLMotionProps<"div">) {
  return <motion.div {...props} />
}

export function MotionSpan(props: HTMLMotionProps<"span">) {
  return <motion.span {...props} />
}

export function MotionButton(props: HTMLMotionProps<"button">) {
  return <motion.button {...props} />
}

export function MotionLi(props: HTMLMotionProps<"li">) {
  return <motion.li {...props} />
}

export function MotionUl(props: HTMLMotionProps<"ul">) {
  return <motion.ul {...props} />
}

export function MotionSection(props: HTMLMotionProps<"section">) {
  return <motion.section {...props} />
}

export function MotionArticle(props: HTMLMotionProps<"article">) {
  return <motion.article {...props} />
}

export function MotionHeader(props: HTMLMotionProps<"header">) {
  return <motion.header {...props} />
}

export function MotionFooter(props: HTMLMotionProps<"footer">) {
  return <motion.footer {...props} />
}

export function MotionNav(props: HTMLMotionProps<"nav">) {
  return <motion.nav {...props} />
}

export function MotionMain(props: HTMLMotionProps<"main">) {
  return <motion.main {...props} />
}

export function MotionAside(props: HTMLMotionProps<"aside">) {
  return <motion.aside {...props} />
}