'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const OfficeGame = dynamic(() => import('./components/OfficeGame').then(mod => ({ default: mod.OfficeGame })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-medium">Chargement...</p>
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chargement</h3>
          <p className="text-sm text-gray-500">Préparation...</p>
        </div>
      </div>
    )
  }

  const activeAgents = agents.filter((a) => a.isActive).length
  const totalActions = agents.reduce((sum, a) => sum + a.actionsToday, 0)

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar ultra-minimale - Juste des icônes */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-8 fixed h-screen">
        {/* Logo */}
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-sm font-bold mb-12">
          AI
        </div>

        {/* Navigation - Juste des icônes */}
        <div className="flex flex-col gap-6">
          {/* Dashboard - Active */}
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          {/* Agents */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          {/* Stats */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20">
        {/* Header moderne */}
        <div className="bg-white border-b border-gray-200 px-12 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-80 h-11 pl-11 pr-4 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Create Button */}
              <button className="h-11 px-6 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors">
                Create
              </button>

              {/* Avatar */}
              <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - BEAUCOUP d'espace */}
        <div className="px-12 py-12">
          {/* Stats Cards - EXACTEMENT comme la référence */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            {/* Card Agents */}
            <div className="bg-white rounded-2xl p-12 border border-gray-100" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
              {/* Icône en haut */}
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              {/* Très grand nombre */}
              <div className="text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {activeAgents}
              </div>

              {/* Badge vert */}
              <div className="flex items-center gap-2 mb-8">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-sm font-semibold text-green-600">+{Math.round((activeAgents / 6) * 100)}%</span>
                </div>
                <span className="text-sm text-gray-400">vs last month</span>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm font-medium">Agents actifs aujourd'hui</p>
            </div>

            {/* Card Actions */}
            <div className="bg-white rounded-2xl p-12 border border-gray-100" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
              {/* Icône en haut */}
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-8">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>

              {/* Très grand nombre */}
              <div className="text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
                {totalActions}
              </div>

              {/* Badge vert */}
              <div className="flex items-center gap-2 mb-8">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-sm font-semibold text-green-600">+36.5%</span>
                </div>
                <span className="text-sm text-gray-400">vs last month</span>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm font-medium">Total actions effectuées</p>
            </div>
          </div>

          {/* Section Agents - Style "Users" de la référence */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-8" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-6">Agents</h3>

            <div className="flex items-center gap-6">
              {agents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-3 group cursor-pointer">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                    style={{ background: `${agent.color}20` }}
                  >
                    {agent.emoji}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{agent.displayName}</span>
                    <span className="text-xs text-gray-400">{agent.actionsToday} actions</span>
                  </div>
                  {agent.isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Section */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" style={{ height: '500px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
            <OfficeGame agents={agents} />
          </div>
        </div>
      </div>
    </div>
  )
}
