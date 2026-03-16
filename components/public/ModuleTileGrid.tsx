'use client'
// components/public/ModuleTileGrid.tsx
import { useState, useEffect } from 'react'
import NavLink from '@/components/shared/NavLink'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { StaggerContainer } from '@/components/public/ScrollAnimations'

interface SubMenu { id: number; title: string; slug: string }
interface NavMenu {
  id: number
  title: string
  slug: string
  description?: string | null
  subMenus: SubMenu[]
}

// Border gradient color pairs — used for the spinning ring
const BORDER_GRADIENTS: [string, string][] = [
  ['#3b82f6', '#06b6d4'],   // blue → cyan
  ['#8b5cf6', '#ec4899'],   // violet → pink
  ['#f59e0b', '#ef4444'],   // amber → red
  ['#10b981', '#3b82f6'],   // emerald → blue
  ['#f472b6', '#a78bfa'],   // pink → purple
  ['#06b6d4', '#10b981'],   // cyan → emerald
  ['#a855f7', '#f59e0b'],   // purple → amber
  ['#ef4444', '#f97316'],   // red → orange
]

// Rich dark title colors — randomised per session on the client
const TITLE_COLORS = [
  '#1d4ed8', '#7c3aed', '#be185d', '#b45309',
  '#047857', '#0e7490', '#c2410c', '#9333ea',
  '#0369a1', '#15803d', '#9f1239', '#1e40af',
]

// Fixed tag-chip palette — cycles by sub-menu slot index, independent of tile color
const TAG_PALETTE = [
  { bg: 'rgba(37,99,235,0.07)',   text: '#2563eb', border: 'rgba(37,99,235,0.20)'   },  // blue
  { bg: 'rgba(124,58,237,0.07)',  text: '#7c3aed', border: 'rgba(124,58,237,0.20)'  },  // violet
  { bg: 'rgba(190,24,93,0.07)',   text: '#be185d', border: 'rgba(190,24,93,0.20)'   },  // pink
  { bg: 'rgba(21,128,61,0.07)',   text: '#166534', border: 'rgba(21,128,61,0.20)'   },  // green
  { bg: 'rgba(161,98,7,0.07)',    text: '#92400e', border: 'rgba(161,98,7,0.20)'    },  // amber
  { bg: 'rgba(14,116,144,0.07)',  text: '#0e7490', border: 'rgba(14,116,144,0.20)'  },  // cyan
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface TileColors { colorA: string; colorB: string; titleColor: string }

export default function ModuleTileGrid({ menus }: { menus: NavMenu[] }) {
  // Start with deterministic (SSR-safe) values; randomise on the client after hydration
  const [colorMap, setColorMap] = useState<Record<number, TileColors>>({})

  useEffect(() => {
    const borders = shuffleArray(BORDER_GRADIENTS)
    const titles  = shuffleArray(TITLE_COLORS)
    const map: Record<number, TileColors> = {}
    menus.forEach((menu, i) => {
      map[menu.id] = {
        colorA:     borders[i % borders.length][0],
        colorB:     borders[i % borders.length][1],
        titleColor: titles[i % titles.length],
      }
    })
    setColorMap(map)
  }, [menus])

  return (
    <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-w-lg mx-auto lg:max-w-none">
      {menus.map((menu, i) => {
        // SSR / pre-hydration fallback (deterministic — avoids mismatch)
        const fallback: TileColors = {
          colorA:     BORDER_GRADIENTS[i % BORDER_GRADIENTS.length][0],
          colorB:     BORDER_GRADIENTS[i % BORDER_GRADIENTS.length][1],
          titleColor: TITLE_COLORS[i % TITLE_COLORS.length],
        }
        const { colorA, colorB, titleColor } = colorMap[menu.id] ?? fallback

        return (
          <NavLink key={menu.id} href={`/${menu.slug}`} className="block group">
            {/* Thin rotating-gradient border wrapper */}
            <div className="module-tile-wrapper relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
              {/* Spinning conic-gradient ring — clipped to 1 px by overflow-hidden + margin */}
              <div
                className="module-tile-ring"
                style={{ background: `conic-gradient(from 0deg, ${colorA} 0%, ${colorB} 50%, ${colorA} 100%)` }}
              />

              {/* Inner card surface */}
              <div className="module-tile-inner flex flex-col gap-3" style={{ background: 'var(--bg-surface)' }}>

                {/* Top row: accent dash + arrow button */}
                <div className="flex items-center justify-between">
                  <div
                    className="h-0.5 w-8 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${colorA}, ${colorB})` }}
                  />
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-[-8deg]"
                    style={{
                      background: `linear-gradient(135deg, ${colorA}18, ${colorB}18)`,
                      border: `1px solid ${colorA}35`,
                      color: colorA,
                    }}
                  >
                    <ArrowUpRight size={13} />
                  </div>
                </div>

                {/* Title — bold, random dark color */}
                <h3
                  className="w-full text-[17px] sm:text-[18px] font-bold leading-snug tracking-tight text-balance transition-opacity duration-200 group-hover:opacity-75"
                  style={{ color: titleColor, fontFamily: "'Inter', 'DM Sans', sans-serif" }}
                >
                  {menu.title}
                </h3>

                {/* Description — Lora italic, same format as article card summary */}
                {menu.description && (
                  <p className="card-summary text-[12.5px] flex-1">
                    {menu.description}
                  </p>
                )}

                {/* Sub-menu chips — fixed palette, not tied to tile color */}
                {menu.subMenus.length > 0 && (
                  <div
                    className="flex flex-wrap gap-1.5 pt-2.5"
                    style={{ borderTop: `1px solid ${colorA}18` }}
                  >
                    {menu.subMenus.map((sub, si) => {
                      const tag = TAG_PALETTE[si % TAG_PALETTE.length]
                      return (
                        <span
                          key={sub.id}
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-semibold"
                          style={{ background: tag.bg, color: tag.text, border: `1px solid ${tag.border}` }}
                        >
                          <ChevronRight size={8} />
                          {sub.title}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </NavLink>
        )
      })}
    </StaggerContainer>
  )
}
