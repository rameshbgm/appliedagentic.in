'use client'
// app/(admin)/dashboard/DashboardCharts.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Props {
  recentArticles: { title: string; viewCount: number }[]
  topArticles: { title: string; viewCount: number }[]
}

const COLORS = ['#6C3DFF', '#00D4FF', '#FF6B6B', '#FFA502', '#2ED573']

export default function DashboardCharts({ recentArticles, topArticles }: Props) {
  const topData = topArticles.slice(0, 5).map((a) => ({
    name: a.title.length > 20 ? a.title.slice(0, 20) + '…' : a.title,
    views: a.viewCount,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar chart - top articles */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          Top Articles by Views
        </h2>
        {topData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topData} margin={{ left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 12 }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="views" fill="#6C3DFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            No data yet
          </div>
        )}
      </div>

      {/* Pie chart - article status */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          Content Distribution
        </h2>
        {topData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={topData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="views"
                nameKey="name"
              >
                {topData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            No data yet
          </div>
        )}
      </div>
    </div>
  )
}
