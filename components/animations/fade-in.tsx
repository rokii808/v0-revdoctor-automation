"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.5, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({
  children,
  delay = 0,
  direction = "left",
  className
}: FadeInProps & { direction?: "left" | "right" }) {
  const x = direction === "left" ? -30 : 30

  return (
    <motion.div
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
