'use client'
// components/shared/LazyImage.tsx
// Renders an image that loads lazily in the background.
// While the image is pending, an animated SVG shimmer placeholder is shown so
// the surrounding text content remains immediately readable.

import { useState, useCallback } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  /** Aspect-ratio wrapper class, e.g. "aspect-video" or "aspect-square" */
  aspectClass?: string
  /** Width/height passed to the underlying <img> for intrinsic sizing hints */
  width?: number
  height?: number
}

function ShimmerPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="50%"  stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-100 0;100 0;-100 0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </linearGradient>
        {/* Unique id per instance to avoid cross-component id collisions */}
        <linearGradient id="shimmer-grad-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-100 0;100 0;-100 0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      {/* Base fill */}
      <rect width="100%" height="100%" fill="url(#shimmer-grad)" rx="4" />

      {/* Simple image icon in the centre */}
      <g opacity="0.25" transform="translate(50%,50%) translate(-24,-20)">
        <rect x="0" y="4" width="48" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="14" cy="16" r="4" fill="currentColor" />
        <polyline points="0,32 16,18 28,26 36,20 48,32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

export default function LazyImage({ src, alt, className = '', aspectClass = '', width, height }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const handleLoad = useCallback(() => setLoaded(true), [])
  const handleError = useCallback(() => setErrored(true), [])

  const wrapperClass = aspectClass
    ? `${aspectClass} relative overflow-hidden w-full`
    : 'relative overflow-hidden w-full'

  return (
    <div className={wrapperClass}>
      {/* Shimmer shown while image is loading, hidden once loaded or errored */}
      {!loaded && !errored && (
        <ShimmerPlaceholder className="absolute inset-0 w-full h-full" />
      )}

      {/* Error fallback */}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <circle cx="8" cy="10" r="2" />
            <polyline points="2,18 8,12 13,15 17,11 22,15" />
            <line x1="2" y1="2" x2="22" y2="22" strokeWidth="1.5" />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      )}

      {/* Actual image — loads in the background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={[
          className,
          'absolute inset-0 w-full h-full transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        ].filter(Boolean).join(' ')}
      />
    </div>
  )
}
