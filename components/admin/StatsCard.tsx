'use client'
// components/admin/StatsCard.tsx
import { useEffect, useState } from 'react'
import { FileText, Layers, BookOpen, Eye, TrendingUp, Users, Cpu, Image, LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Layers,
  BookOpen,
  Eye,
  TrendingUp,
  Users,
  Cpu,
  Image,
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
      className="card p-5 flex items-start justify-between gap-4 group hover:scale-105 transition-transform duration-200"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
          {count.toLocaleString()}{suffix}
        </p>
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}% vs last month
          </p>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
        style={{ background: `${color}20` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  )
}
