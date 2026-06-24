'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const OfficeGame = dynamic(() => import('./components/OfficeGame').then(mod => ({ default: mod.OfficeGame })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#a1a1aa] text-sm">Chargement du jeu pixel art...</p>
      </div>
    </div>
  ),
})

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
          <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#a1a1aa] text-sm">Chargement du bureau pixel art...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden">
      {/* HUD Top Bar - Compact */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#0a0118]/95 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">💼</span>
              <span className="bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
                Bureau des Agents
              </span>
            </h1>
            <div className="flex items-center gap-4 ml-6">
              <div className="bg-[#111113]/60 backdrop-blur-md rounded-lg px-4 py-2 border border-[#fbbf24]/20">
                <span className="text-xs text-[#fbbf24] font-semibold">{agents.filter((a) => a.isActive).length} Actifs</span>
              </div>
              <div className="bg-[#111113]/60 backdrop-blur-md rounded-lg px-4 py-2 border border-[#3b82f6]/20">
                <span className="text-xs text-[#60a5fa]">{agents.reduce((sum, a) => sum + a.actionsToday, 0)} Actions</span>
              </div>
            </div>
          </div>

          <Link
            href="/cockpit"
            className="px-5 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-[#3b82f6]/30 hover:shadow-[#3b82f6]/50 text-sm"
          >
            ← Cockpit
          </Link>
        </div>
      </div>

      {/* Scène Pixel Art - Full Screen */}
      <div className="absolute inset-0">
        <OfficeGame agents={agents} />
      </div>

      {/* HUD Bottom - Instructions */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-[#111113]/90 backdrop-blur-md rounded-xl px-8 py-3 border border-[#fbbf24]/30 shadow-2xl shadow-[#fbbf24]/10">
          <p className="text-[#fbbf24] text-sm text-center font-medium flex items-center gap-6">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#1e293b] rounded text-xs border border-[#334155]">WASD</kbd>
              <span className="text-[#a1a1aa]">Déplacer</span>
            </span>
            <span className="w-px h-4 bg-[#334155]"></span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#1e293b] rounded text-xs border border-[#334155]">E</kbd>
              <span className="text-[#a1a1aa]">Interagir avec agent</span>
            </span>
          </p>
        </div>
      </div>

    </div>
  )
}
