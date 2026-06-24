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
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1e293b]/40 to-[#0f172a]/40 backdrop-blur-xl rounded-2xl p-6 border border-[#fbbf24]/20">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Activité en temps réel</h2>
          <p className="text-xs text-[#fbbf24]/70">Flux des dernières actions</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0f172a]/50 border border-[#22c55e]/20">
          <div
            className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-[#22c55e] shadow-lg shadow-[#22c55e]/50' : 'bg-[#ef4444] shadow-lg shadow-[#ef4444]/50'}`}
            style={{
              animation: connected ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          />
          <span className="text-xs text-white font-bold uppercase tracking-wider">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Feed with custom scrollbar */}
      <div className="flex-1 overflow-y-auto space-y-0 pr-2" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#fbbf24 transparent',
      }}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gradient-to-r from-[#1e293b]/30 to-[#0f172a]/30 rounded-xl animate-pulse border border-[#fbbf24]/10"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-5xl mb-4 opacity-30">📡</div>
            <p className="text-sm text-[#fbbf24]/50 font-semibold uppercase tracking-wider">Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className="group p-4 rounded-xl bg-[#0f172a]/30 border border-[rgba(255,255,255,0.05)] hover:border-[#fbbf24]/30 hover:bg-[#0f172a]/50 transition-all duration-200"
                style={{
                  opacity: 0,
                  animation: `slideIn 0.4s ease forwards ${index * 0.05}s`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Premium status indicator */}
                  <div className="relative mt-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-lg"
                      style={{
                        backgroundColor: AGENT_DOT_COLORS[log.agent_name] || '#52525b',
                        boxShadow: `0 0 8px ${AGENT_DOT_COLORS[log.agent_name] || '#52525b'}`,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Agent name badge with premium styling */}
                    <span
                      className="inline-block px-3 py-1 rounded-lg text-xs font-bold mb-2 border"
                      style={{
                        backgroundColor: `${AGENT_DOT_COLORS[log.agent_name] || '#52525b'}15`,
                        color: AGENT_DOT_COLORS[log.agent_name] || '#a1a1aa',
                        borderColor: `${AGENT_DOT_COLORS[log.agent_name] || '#52525b'}30`,
                      }}
                    >
                      {log.agent_name}
                    </span>

                    {/* Action text with better typography */}
                    <p className="text-sm text-white leading-relaxed font-medium">{log.action}</p>
                  </div>

                  {/* Timestamp with premium styling */}
                  <span className="text-xs text-[#fbbf24]/70 font-mono tabular-nums whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-lg bg-[#fbbf24]/10">
                    {formatTimeAgo(log.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
