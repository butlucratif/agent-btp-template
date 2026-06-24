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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-[#111113] rounded-xl p-6 border border-[rgba(255,255,255,0.06)] relative overflow-hidden"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`,
          }}
        >
          {/* Subtle separator line on right (except last) */}
          {index < stats.length - 1 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-[rgba(255,255,255,0.04)] hidden lg:block" />
          )}

          <p className="text-xs text-[#52525b] uppercase tracking-wide mb-2 font-medium">{stat.label}</p>
          <p
            className={`font-semibold tabular-nums ${
              stat.type === 'number'
                ? 'text-3xl text-[#fafafa]'
                : stat.type === 'time'
                  ? 'text-lg text-[#a1a1aa] font-mono'
                  : 'text-2xl text-[#fafafa]'
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
