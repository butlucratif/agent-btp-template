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
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-medium">Chargement du jeu pixel art...</p>
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

const AGENT_COLORS: Record<string, string> = {
  'relance-devis': '#3B82F6',
  'daily-briefing': '#22C55E',
  'urgent-alert': '#EF4444',
  'calcul-ca': '#8B5CF6',
  'avis-google': '#F59E0B',
  'rentabilite-chantier': '#06B6D4',
}

const AGENTS_INFO = [
  { name: 'relance-devis', displayName: 'Relance Devis', emoji: '📧' },
  { name: 'daily-briefing', displayName: 'Daily Briefing', emoji: '☀️' },
  { name: 'urgent-alert', displayName: 'Urgent Alert', emoji: '🚨' },
  { name: 'calcul-ca', displayName: 'CA Hebdo', emoji: '💰' },
  { name: 'avis-google', displayName: 'Avis Google', emoji: '⭐' },
  { name: 'rentabilite-chantier', displayName: 'Rentabilité', emoji: '📊' },
]

export default function Agents3DPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentStatuses()
    const channel = supabase
      .channel('agent-logs-3d')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, () => {
        fetchAgentStatuses()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
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
          ? new Date().getTime() - new Date(lastLog.created_at).getTime() < 5 * 60 * 1000
          : false
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const actionsToday = agentLogs.filter((log) => new Date(log.created_at) >= todayStart).length

        return {
          ...info,
          color: AGENT_COLORS[info.name] || '#737373',
          isActive,
          lastRun: lastLog ? new Date(lastLog.created_at) : null,
          nextRun: null,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement du bureau</h3>
          <p className="text-sm text-gray-500">Préparation de l'environnement</p>
        </div>
      </div>
    )
  }

  const activeAgents = agents.filter((a) => a.isActive).length
  const totalActions = agents.reduce((sum, a) => sum + a.actionsToday, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Style référence */}
      <div className="sidebar p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <span className="font-bold text-gray-900">Agents BTP</span>
          </div>

          <nav className="space-y-1">
            <div className="sidebar-item active">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </div>

            <div className="sidebar-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Agents</span>
            </div>

            <Link href="/cockpit" className="sidebar-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Cockpit</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content - Style référence */}
      <div className="ml-60 p-8">
        {/* Header - Style référence */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bureau des Agents</h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything..."
                className="input w-80 pl-10"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button className="btn btn-primary">
              Create
            </button>

            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Agents Actifs Card - Style référence */}
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">Agents</span>
              </div>

              <div className="stat-number">{activeAgents}</div>

              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-success">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +{Math.round((activeAgents / 6) * 100)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>

              <p className="text-sm text-gray-500 mt-4">{activeAgents} actifs aujourd'hui</p>
            </div>

            {/* Actions Card - Style référence */}
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">Actions</span>
              </div>

              <div className="stat-number">{totalActions}</div>

              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-success">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +36.5%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>

              <p className="text-sm text-gray-500 mt-4">Toutes actions confondues</p>
            </div>
          </div>

          {/* Agents List Card */}
          <div className="card">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{agents.length} agents aujourd'hui</p>
              <p className="text-xs text-gray-500">Cliquez sur un agent pour interagir</p>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {agents.map((agent) => (
                <div key={agent.name} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div
                    className="avatar w-12 h-12 text-2xl flex items-center justify-center"
                    style={{ background: `${agent.color}15` }}
                  >
                    {agent.emoji}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {agent.displayName.split(' ')[0]}
                  </span>
                  {agent.isActive && (
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pixel Art Game Section */}
        <div className="card p-0 overflow-hidden" style={{ height: '500px' }}>
          <OfficeGame agents={agents} />
        </div>

        {/* Instructions */}
        <div className="card mt-6">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700">
                WASD
              </kbd>
              <span className="text-gray-600">Déplacer</span>
            </div>

            <div className="w-px h-4 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700">
                E
              </kbd>
              <span className="text-gray-600">Interagir</span>
            </div>

            <div className="w-px h-4 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700">
                CLICK
              </kbd>
              <span className="text-gray-600">Objets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
