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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden flex items-center justify-center">
        {/* Background glow effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3b82f6] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fbbf24] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center">
          {/* Premium loading spinner */}
          <div className="relative mx-auto mb-8">
            {/* Outer ring */}
            <div className="w-24 h-24 border-4 border-[#1e293b]/30 rounded-full absolute inset-0"></div>
            {/* Spinning gradient ring */}
            <div className="w-24 h-24 border-4 border-transparent border-t-[#3b82f6] border-r-[#fbbf24] rounded-full animate-spin"></div>
            {/* Inner pulsing dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-[#3b82f6] to-[#fbbf24] rounded-full animate-pulse shadow-lg shadow-[#3b82f6]/50"></div>
            </div>
          </div>

          {/* Loading text */}
          <div className="space-y-3">
            <p className="text-xl font-bold bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent animate-shimmer">
              Chargement du bureau...
            </p>
            <p className="text-sm text-[#a1a1aa]/70 font-medium tracking-wide">
              Préparation de l'environnement pixel art premium
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden">
      {/* HUD Top Bar - Premium Glassmorphism */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#0a0118]/90 via-[#0a0118]/70 to-transparent backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 relative">
              <span className="text-4xl drop-shadow-lg">💼</span>
              <span className="bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent drop-shadow-2xl animate-shimmer">
                Bureau des Agents
              </span>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24]/20 via-[#f59e0b]/20 to-[#fbbf24]/20 blur-xl -z-10"></div>
            </h1>
            <div className="flex items-center gap-3 ml-4">
              {/* Active agents badge */}
              <div className="group relative bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-lg rounded-xl px-5 py-2.5 border border-[#fbbf24]/30 shadow-lg shadow-[#fbbf24]/10 hover:shadow-[#fbbf24]/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/0 to-[#fbbf24]/0 group-hover:from-[#fbbf24]/5 group-hover:to-[#fbbf24]/10 rounded-xl transition-all duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse shadow-lg shadow-[#fbbf24]/50"></div>
                  <span className="text-sm text-[#fbbf24] font-bold tracking-wide">{agents.filter((a) => a.isActive).length}</span>
                  <span className="text-xs text-[#fbbf24]/70 uppercase font-semibold tracking-wider">Actifs</span>
                </div>
              </div>

              {/* Actions badge */}
              <div className="group relative bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-lg rounded-xl px-5 py-2.5 border border-[#3b82f6]/30 shadow-lg shadow-[#3b82f6]/10 hover:shadow-[#3b82f6]/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/0 to-[#3b82f6]/0 group-hover:from-[#3b82f6]/5 group-hover:to-[#3b82f6]/10 rounded-xl transition-all duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <span className="text-sm text-[#60a5fa] font-bold tracking-wide">{agents.reduce((sum, a) => sum + a.actionsToday, 0)}</span>
                  <span className="text-xs text-[#60a5fa]/70 uppercase font-semibold tracking-wider">Actions</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/cockpit"
            className="group relative px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white rounded-xl font-bold transition-all duration-300 shadow-xl shadow-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/60 text-sm overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative flex items-center gap-2">
              <span>←</span>
              <span className="tracking-wide">Cockpit</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Scène Pixel Art - Full Screen */}
      <div className="absolute inset-0">
        <OfficeGame agents={agents} />
      </div>

      {/* HUD Bottom - Premium Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="group relative bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 backdrop-blur-xl rounded-2xl px-10 py-4 border border-[#fbbf24]/40 shadow-2xl shadow-[#fbbf24]/20 hover:shadow-[#fbbf24]/30 transition-all duration-300">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24]/0 via-[#fbbf24]/5 to-[#fbbf24]/0 rounded-2xl"></div>

          <p className="relative text-sm text-center font-semibold flex items-center gap-8">
            <span className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg text-xs font-bold border border-[#fbbf24]/30 shadow-lg text-[#fbbf24] tracking-wider min-w-[3rem] text-center">
                WASD
              </kbd>
              <span className="text-[#e5e7eb]/90 font-medium tracking-wide">Déplacer</span>
            </span>

            <span className="w-px h-6 bg-gradient-to-b from-transparent via-[#fbbf24]/30 to-transparent"></span>

            <span className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg text-xs font-bold border border-[#3b82f6]/30 shadow-lg text-[#60a5fa] tracking-wider min-w-[3rem] text-center">
                E
              </kbd>
              <span className="text-[#e5e7eb]/90 font-medium tracking-wide">Interagir avec agent</span>
            </span>

            <span className="w-px h-6 bg-gradient-to-b from-transparent via-[#fbbf24]/30 to-transparent"></span>

            <span className="flex items-center gap-3">
              <div className="px-3 py-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-lg text-xs font-bold border border-[#10b981]/30 shadow-lg text-[#10b981] tracking-wider">
                CLICK
              </div>
              <span className="text-[#e5e7eb]/90 font-medium tracking-wide">Objets interactifs</span>
            </span>
          </p>
        </div>
      </div>

    </div>
  )
}
