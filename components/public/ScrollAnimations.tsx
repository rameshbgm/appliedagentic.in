'use client'
// components/public/ScrollAnimations.tsx
import { motion, useInView, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'

interface AnimProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

// framer-motion v12 requires a typed 4-tuple for cubic-bezier ease values
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
}

const slideLeftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
}

const slideRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  }),
}

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: EASE },
  }),
}

function AnimWrapper({
  variants,
  children,
  className,
  delay = 0,
}: AnimProps & { variants: Variants }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, className, delay }: AnimProps) {
  return <AnimWrapper variants={fadeUpVariants} className={className} delay={delay}>{children}</AnimWrapper>
}

export function SlideInLeft({ children, className, delay }: AnimProps) {
  return <AnimWrapper variants={slideLeftVariants} className={className} delay={delay}>{children}</AnimWrapper>
}

export function SlideInRight({ children, className, delay }: AnimProps) {
  return <AnimWrapper variants={slideRightVariants} className={className} delay={delay}>{children}</AnimWrapper>
}

export function ScaleIn({ children, className, delay }: AnimProps) {
  return <AnimWrapper variants={scaleVariants} className={className} delay={delay}>{children}</AnimWrapper>
}

export function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * ParallaxSection — wraps children in a div that moves at a slower rate than scroll.
 * @param speed  0 = no movement, 1 = full scroll speed. Default 0.3 = subtle depth.
 * @param offset How far (in px) the section travels over its full viewport journey.
 */
export function ParallaxSection({
  children,
  className,
  speed = 0.3,
}: {
  children: React.ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 80}px`, `-${speed * 80}px`])

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
