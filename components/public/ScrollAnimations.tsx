// components/public/ScrollAnimations.tsx
import React from 'react'

interface AnimProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className }: AnimProps) {
  return <div className={className}>{children}</div>
}

export function SlideInLeft({ children, className }: AnimProps) {
  return <div className={className}>{children}</div>
}

export function SlideInRight({ children, className }: AnimProps) {
  return <div className={className}>{children}</div>
}

export function ScaleIn({ children, className }: AnimProps) {
  return <div className={className}>{children}</div>
}

export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function ParallaxSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
  speed?: number
}) {
  return <div className={className}>{children}</div>
}
