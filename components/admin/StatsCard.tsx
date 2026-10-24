'use client'
// components/admin/StatsCard.tsx
import { useEffect, useState } from 'react'
import { FileText, Layers, BookOpen, Eye, TrendingUp, Users, Cpu, Image, Menu, ListTree, LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Layers,
  BookOpen,
  Eye,
  TrendingUp,
  Users,
  Cpu,
  Image,
  Menu,
  ListTree,
}

interface StatsCardProps {
  label: string
  value: number
  iconName: string
  color: string
  suffix?: string
  change?: number
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function StatsCard({ label, value, iconName, color, suffix = '', change }: StatsCardProps) {
  const count = useCountUp(value)
  const Icon = ICON_MAP[iconName] ?? FileText
  // Light swatches (sun, mint, pink) need dark icons to stay readable
  const onLight = /--(l3|l4|l6|l7|sun|mint|pink)\b/.test(color)

  return (
    <div
      className="card p-5 flex items-start justify-between gap-4"
      style={{ borderTop: `6px solid ${color}`, borderRadius: 24 }}
    >
      <div>
        <p className="p-label mb-1" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
        <p className="p-display" style={{ fontSize: '2.6rem', fontVariationSettings: '"wdth" 90', fontVariantNumeric: 'tabular-nums' }}>
          {count.toLocaleString()}{suffix}
        </p>
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}% vs last month
          </p>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: color, transform: 'rotate(-6deg)' }}
      >
        <Icon size={22} style={{ color: onLight ? 'var(--on-light)' : '#fff' }} />
      </div>
    </div>
  )
}
