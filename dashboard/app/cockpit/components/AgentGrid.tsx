'use client'

import { useAgentStatus } from '../hooks/useAgentStatus'
import { AgentCard } from './AgentCard'

export function AgentGrid() {
  const { agents, loading, refetch } = useAgentStatus()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[240px] rounded-xl bg-[#18181b] border border-[rgba(255,255,255,0.06)] animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {agents.map((agent, index) => (
        <AgentCard key={agent.name} agent={agent} index={index} onTrigger={refetch} />
      ))}
    </div>
  )
}
