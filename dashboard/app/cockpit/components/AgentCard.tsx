'use client'

import { useState } from 'react'
import { AgentStatus } from '../hooks/useAgentStatus'
import { TriggerButton } from './TriggerButton'

interface AgentCardProps {
  agent: AgentStatus
  index: number
  onTrigger: () => void
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Jamais exécuté'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `il y a ${minutes}min`
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${days}j`
}

function formatCountdown(date: Date | null): string {
  if (!date) return 'Non programmé'

  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (diff < 0) return 'En retard'
  if (hours < 1) return `dans ${minutes}min`
  return `dans ${hours}h ${minutes}min`
}

export function AgentCard({ agent, index, onTrigger }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isActive = agent.isActive
  const hasError = agent.status === 'error'

  return (
    <div
      className={`
        group relative bg-gradient-to-br from-[#1e293b]/40 to-[#0f172a]/40 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300
        ${isActive ? 'border-[#22c55e]/40 shadow-lg shadow-[#22c55e]/20' : 'border-[#fbbf24]/20 hover:border-[#fbbf24]/40 hover:shadow-lg hover:shadow-[#fbbf24]/10'}
        hover:scale-[1.02]
      `}
      style={{
        opacity: 0,
        animation: `fadeInUp 0.5s ease forwards ${index * 0.1}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/0 to-[#7c3aed]/0 group-hover:from-[#fbbf24]/5 group-hover:to-[#7c3aed]/5 transition-all duration-300 rounded-2xl" />

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-30" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-3xl bg-gradient-to-br from-[#fbbf24]/20 to-[#7c3aed]/20 p-3 rounded-xl">
            {agent.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{agent.displayName}</h3>
            <p className="text-xs text-[#fbbf24]/70 font-mono mt-1">{agent.name}</p>
          </div>
        </div>

        {/* Premium status indicator */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#22c55e]/20 to-[#10b981]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <div
            className={`relative w-3 h-3 rounded-full ${
              isActive
                ? 'bg-[#22c55e] shadow-lg shadow-[#22c55e]/50'
                : hasError
                  ? 'bg-[#ef4444] shadow-lg shadow-[#ef4444]/50'
                  : 'bg-[#52525b]'
            }`}
            style={{
              animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          />
        </div>
      </div>

      {/* Metrics with premium styling */}
      <div className="relative z-10 space-y-4 mb-6">
        <div className="flex justify-between items-center p-3 rounded-lg bg-[#0f172a]/30 border border-[#fbbf24]/10">
          <span className="text-xs text-[#fbbf24]/80 uppercase tracking-wide font-semibold">Dernière exécution</span>
          <span className="text-sm text-white font-mono tabular-nums">{formatTimeAgo(agent.lastRun)}</span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-[#0f172a]/30 border border-[#7c3aed]/10">
          <span className="text-xs text-[#a78bfa]/80 uppercase tracking-wide font-semibold">Prochaine exécution</span>
          <span className="text-sm text-white font-mono tabular-nums">{formatCountdown(agent.nextRun)}</span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-[#fbbf24]/10 to-[#f59e0b]/10 border border-[#fbbf24]/20">
          <span className="text-xs text-[#fbbf24] uppercase tracking-wide font-bold">Actions aujourd'hui</span>
          <span className="text-2xl text-white font-bold tabular-nums">{agent.actionsToday}</span>
        </div>
      </div>

      {/* Trigger button - smooth fade in */}
      <div
        className="relative z-10 transition-all duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <TriggerButton agentName={agent.name} onTrigger={onTrigger} />
      </div>
    </div>
  )
}
