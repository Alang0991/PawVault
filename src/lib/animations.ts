"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import type { ForwardRefExoticComponent, RefAttributes } from "react"
import { useState, useEffect } from "react"

const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const defaultTransition = { duration: 0.18, ease: "easeOut" as const }
const defaultHoverTransition = { duration: 0.12, ease: "easeOut" as const }
const springTransition = { type: "spring" as const, stiffness: 400, damping: 40 }

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
}

export const slideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
}

export const slideDown = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { ...defaultTransition, duration: 0.15 } },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
}

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" as const } },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.12, ease: "easeIn" as const } },
}

export const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: springTransition },
  exit: { x: "100%", transition: springTransition },
}

export const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.12, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.08, ease: "easeIn" as const } },
}

export const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.1, ease: "easeOut" as const } },
}

export const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" as const } },
}

export const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export const listItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
}

export const cardHover = {
  scale: 1.02,
  y: -4,
  boxShadow: "0 12px 28px hsl(var(--pv-text-primary) / 0.1)",
  transition: defaultHoverTransition,
}

export const buttonTap = { scale: 0.98 }
export const buttonHover = { scale: 1.02, transition: defaultHoverTransition }

export const iconHover = { scale: 1.1, rotate: 3, transition: defaultHoverTransition }
export const iconTap = { scale: 0.9 }

export const wishPop = {
  scale: [1, 1.3, 1],
  transition: { duration: 0.35, ease: "easeOut" as const },
}

export const shimmer = {
  hidden: { x: "-100%" },
  visible: { x: "100%", transition: { duration: 1.5, ease: "linear" as const, repeat: Infinity } },
}

export const pulse = {
  scale: [1, 1.02, 1],
  transition: { duration: 2, ease: "easeInOut" as const, repeat: Infinity },
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])
  return reduced
}

// Simple motion component exports
export const MotionDiv = motion.div
export const MotionSpan = motion.span
export const MotionButton = motion.button
export const MotionLi = motion.li
export const MotionUl = motion.ul
export const MotionSection = motion.section
export const MotionArticle = motion.article
export const MotionHeader = motion.header
export const MotionFooter = motion.footer
export const MotionNav = motion.nav
export const MotionMain = motion.main
export const MotionAside = motion.aside