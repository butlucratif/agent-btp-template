'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentsScene } from './components/AgentsScene'
import Link from 'next/link'

interface AgentStatus {
  name: string
  displayName: string
  emoji: string
  color: string
  isActive: boolean
  lastRun: Date | null
  nextRun: Date | null
  actionsToday: number
}

// Couleurs cartoon vibrantes pour chaque agent
const AGENT_COLORS: Record<string, string> = {
  'relance-devis': '#f97316', // Orange vif
  'daily-briefing': '#fbbf24', // Jaune doré
  'urgent-alert': '#ef4444', // Rouge vif
  'calcul-ca': '#10b981', // Vert émeraude
  'avis-google': '#3b82f6', // Bleu vif
  'rentabilite-chantier': '#8b5cf6', // Violet
}

const AGENTS_INFO = [
  {
    name: 'relance-devis',
    displayName: 'Relance Devis',
    emoji: '📧',
  },
  {
    name: 'daily-briefing',
    displayName: 'Daily Briefing',
    emoji: '☀️',
  },
  {
    name: 'urgent-alert',
    displayName: 'Urgent Alert',
    emoji: '🚨',
  },
  {
    name: 'calcul-ca',
    displayName: 'CA Hebdo',
    emoji: '💰',
  },
  {
    name: 'avis-google',
    displayName: 'Avis Google',
    emoji: '⭐',
  },
  {
    name: 'rentabilite-chantier',
    displayName: 'Rentabilité',
    emoji: '📊',
  },
]

export default function Agents3DPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentStatuses()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('agent-logs-3d')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_logs' },
        () => {
          fetchAgentStatuses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAgentStatuses() {
    try {
      const { data: logs } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      const agentStatuses: AgentStatus[] = AGENTS_INFO.map((info) => {
        const agentLogs = logs?.filter((log) => log.agent_name === info.name) || []
        const lastLog = agentLogs[0]
        const isActive = lastLog
          ? new Date().getTime() - new Date(lastLog.created_at).getTime() < 5 * 60 * 1000 // Actif si dernière action < 5 min
          : false

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const actionsToday = agentLogs.filter(
          (log) => new Date(log.created_at) >= todayStart
        ).length

        return {
          ...info,
          color: AGENT_COLORS[info.name] || '#6b7280',
          isActive,
          lastRun: lastLog ? new Date(lastLog.created_at) : null,
          nextRun: null, // À calculer selon le schedule si nécessaire
          actionsToday,
        }
      })

      setAgents(agentStatuses)
    } catch (error) {
      console.error('Error fetching agent statuses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#a1a1aa] text-sm">Chargement de l'espace 3D...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08080a] via-[#0d0d11] to-[#08080a]">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🤖 Espace Agents 3D
              </h1>
              <p className="text-[#a1a1aa] text-lg">
                Visualisation en temps réel de vos agents IA
              </p>
            </div>
            <Link
              href="/cockpit"
              className="px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-[#f97316]/20 hover:shadow-[#f97316]/40"
            >
              ← Retour au Cockpit
            </Link>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#111113] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
              <div className="text-2xl font-bold text-white">
                {agents.length}
              </div>
              <div className="text-sm text-[#52525b]">Agents actifs</div>
            </div>
            <div className="bg-[#111113] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
              <div className="text-2xl font-bold text-[#22c55e]">
                {agents.filter((a) => a.isActive).length}
              </div>
              <div className="text-sm text-[#52525b]">En cours</div>
            </div>
            <div className="bg-[#111113] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
              <div className="text-2xl font-bold text-[#f97316]">
                {agents.reduce((sum, a) => sum + a.actionsToday, 0)}
              </div>
              <div className="text-sm text-[#52525b]">Actions aujourd'hui</div>
            </div>
            <div className="bg-[#111113] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
              <div className="text-2xl font-bold text-[#3b82f6]">
                {agents.filter((a) => a.lastRun).length}/{agents.length}
              </div>
              <div className="text-sm text-[#52525b]">Agents opérationnels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scène 3D */}
      <div className="relative" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)] mx-6">
          <AgentsScene agents={agents} />
        </div>

        {/* Instructions overlay */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#111113]/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-[rgba(255,255,255,0.06)]">
          <p className="text-[#a1a1aa] text-sm text-center">
            🖱️ Cliquez et faites glisser pour pivoter • 🔍 Molette pour zoomer • ✨ Survolez un agent pour l'agrandir
          </p>
        </div>
      </div>

      {/* Légende des couleurs */}
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-[#111113] rounded-xl p-6 border border-[rgba(255,255,255,0.06)]">
            <h3 className="text-white font-semibold mb-4 text-lg">
              🎨 Légende des agents
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 bg-[#18181b] rounded-lg p-3 border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{agent.emoji}</span>
                      <span className="text-white text-xs font-medium truncate">
                        {agent.displayName}
                      </span>
                    </div>
                    <div className="text-[#52525b] text-xs">
                      {agent.actionsToday} actions
                    </div>
                  </div>
                  {agent.isActive && (
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
