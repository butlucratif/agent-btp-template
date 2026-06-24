'use client'

import { useAgentStatus } from '../hooks/useAgentStatus'
import { useAgentLogs } from '../hooks/useAgentLogs'
import { useEffect, useState } from 'react'

export function SystemStatsBar() {
  const { agents } = useAgentStatus()
  const { logs } = useAgentLogs(100)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeAgents = agents.filter((a) => a.isActive).length
  const totalActionsToday = agents.reduce((sum, a) => sum + a.actionsToday, 0)
  const successRate =
    logs.length > 0
      ? Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100)
      : 100

  const lastActivity =
    logs.length > 0
      ? (() => {
          const now = new Date()
          const lastLog = new Date(logs[0].created_at)
          const diff = now.getTime() - lastLog.getTime()
          const minutes = Math.floor(diff / (1000 * 60))
          if (minutes < 1) return "À l'instant"
          if (minutes < 60) return `il y a ${minutes}min`
          return `il y a ${Math.floor(minutes / 60)}h`
        })()
      : 'Aucune activité'

  const stats = [
    {
      label: "Actions aujourd'hui",
      value: totalActionsToday,
      type: 'number' as const,
    },
    {
      label: 'Agents actifs',
      value: `${activeAgents}/6`,
      type: 'text' as const,
    },
    {
      label: 'Taux de succès',
      value: `${successRate}%`,
      type: 'text' as const,
    },
    {
      label: 'Dernière activité',
      value: lastActivity,
      type: 'time' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="group bg-gradient-to-br from-[#1e293b]/40 to-[#0f172a]/40 backdrop-blur-xl rounded-2xl p-8 border border-[#fbbf24]/20 relative overflow-hidden hover:border-[#fbbf24]/40 transition-all duration-300 hover:scale-105"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 0.4s ease ${index * 0.08}s, transform 0.4s ease ${index * 0.08}s`,
          }}
        >
          {/* Premium glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/0 to-[#3b82f6]/0 group-hover:from-[#fbbf24]/10 group-hover:to-[#3b82f6]/10 transition-all duration-300 rounded-2xl" />

          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50" />

          <div className="relative z-10">
            <p className="text-xs text-[#fbbf24] uppercase tracking-wider mb-3 font-semibold">{stat.label}</p>
            <p
              className={`font-bold tabular-nums ${
                stat.type === 'number'
                  ? 'text-4xl text-white'
                  : stat.type === 'time'
                    ? 'text-xl text-[#e5e7eb] font-mono'
                    : 'text-3xl text-white'
              }`}
            >
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
