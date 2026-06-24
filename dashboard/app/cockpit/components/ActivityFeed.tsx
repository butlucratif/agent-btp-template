'use client'

import { useAgentLogs } from '../hooks/useAgentLogs'

const AGENT_DOT_COLORS: Record<string, string> = {
  'relance-devis': '#3b82f6', // blue
  'daily-briefing': '#a855f7', // purple
  'avis-client': '#eab308', // yellow
  'suivi-chantier': '#22c55e', // green
  prospection: '#ec4899', // pink
  reporting: '#06b6d4', // cyan
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `${minutes}min`
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

export function ActivityFeed() {
  const { logs, loading, connected } = useAgentLogs(20)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-[#fafafa]">Activité en temps réel</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}
            style={{
              animation: connected ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          />
          <span className="text-xs text-[#52525b] font-mono uppercase tracking-wider">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-[#18181b] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#52525b]">
            <div className="text-3xl mb-2 opacity-50">📡</div>
            <p className="text-xs font-mono uppercase tracking-wider">Aucune activité récente</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0"
              style={{
                opacity: 0,
                animation: `slideIn 0.3s ease forwards ${index * 0.03}s`,
              }}
            >
              {/* Colored dot per agent */}
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{
                  backgroundColor: AGENT_DOT_COLORS[log.agent_name] || '#52525b',
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Agent name badge */}
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1.5"
                  style={{
                    backgroundColor: `${AGENT_DOT_COLORS[log.agent_name] || '#52525b'}20`,
                    color: AGENT_DOT_COLORS[log.agent_name] || '#a1a1aa',
                  }}
                >
                  {log.agent_name}
                </span>

                {/* Action text */}
                <p className="text-sm text-[#a1a1aa] leading-snug">{log.action}</p>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-[#52525b] font-mono tabular-nums whitespace-nowrap flex-shrink-0">
                {formatTimeAgo(log.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
