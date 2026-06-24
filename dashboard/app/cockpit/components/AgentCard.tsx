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
        group relative bg-[#111113] rounded-xl p-6 border transition-all duration-200
        ${isActive ? 'border-l-2 border-l-[#7c3aed] bg-[#18181b] border-[rgba(255,255,255,0.08)]' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'}
      `}
      style={{
        opacity: 0,
        animation: `fadeInUp 0.4s ease forwards ${index * 0.08}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#fafafa]">{agent.displayName}</h3>
            <p className="text-xs text-[#52525b] font-mono mt-0.5">{agent.name}</p>
          </div>
        </div>

        {/* Status indicator - pulse animation only when active */}
        <div className="relative">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive
                ? 'bg-[#22c55e]'
                : hasError
                  ? 'bg-[#ef4444]'
                  : 'bg-[#52525b]'
            }`}
            style={{
              animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#52525b]">Dernière exécution</span>
          <span className="text-xs text-[#a1a1aa] font-mono tabular-nums">{formatTimeAgo(agent.lastRun)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-[#52525b]">Prochaine exécution</span>
          <span className="text-xs text-[#a1a1aa] font-mono tabular-nums">{formatCountdown(agent.nextRun)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-[#52525b]">Actions aujourd'hui</span>
          <span className="text-sm text-[#fafafa] font-mono font-semibold tabular-nums">{agent.actionsToday}</span>
        </div>
      </div>

      {/* Trigger button - appears on hover */}
      <div
        className="transition-opacity duration-200"
        style={{
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        <TriggerButton agentName={agent.name} onTrigger={onTrigger} />
      </div>
    </div>
  )
}
