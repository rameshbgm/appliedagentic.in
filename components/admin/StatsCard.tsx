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

  return (
    <div
      className="card p-5 flex items-start justify-between gap-4"
      style={{ borderRadius: 18 }}
    >
      <div>
        <p className="f-kicker mb-1">
          {label}
        </p>
        <p className="f-display" style={{ fontSize: '2.4rem', fontVariantNumeric: 'tabular-nums' }}>
          {count.toLocaleString()}{suffix}
        </p>
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}% vs last month
          </p>
        )}
      </div>
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  )
}
