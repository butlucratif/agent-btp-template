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
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar GAUCHE avec texte - Exactement comme la référence */}
      <div className="w-64 bg-[#FAFAFA] border-r border-gray-200 flex flex-col py-8 px-6 fixed h-screen">
        {/* Logo circulaire */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Navigation avec icônes + texte */}
        <nav className="flex-1 space-y-2">
          {/* Dashboard - Actif */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl cursor-pointer shadow-sm">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Dashboard</span>
          </div>

          {/* Products */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Products</span>
          </div>

          {/* Agents (équivalent Customers) */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Agents</span>
            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Stats</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Actions</span>
            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Promote */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Promote</span>
          </div>
        </nav>
      </div>

      {/* Contenu PRINCIPAL */}
      <div className="flex-1 ml-64 mr-80">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-10 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-80 h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Create Button - NOIR comme référence */}
              <button className="h-11 px-6 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                Create
              </button>

              {/* Icons */}
              <button className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <button className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-10 py-8">
          {/* Overview Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option>Last month</option>
              <option>Last week</option>
              <option>Last year</option>
            </select>
          </div>

          {/* Stats Cards - Exactement comme référence */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Card Agents */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Agents</span>
              </div>

              <div className="flex items-end gap-3 mb-3">
                <div className="text-5xl font-bold text-gray-900 tracking-tight">{activeAgents}</div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg mb-2">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs font-semibold text-green-600">+{Math.round((activeAgents / 6) * 100)}%</span>
                </div>
              </div>

              <p className="text-sm text-gray-500">vs last month</p>
            </div>

            {/* Card Actions (Balance) */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Actions</span>
              </div>

              <div className="flex items-end gap-3 mb-3">
                <div className="text-5xl font-bold text-gray-900 tracking-tight">{totalActions}</div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg mb-2">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs font-semibold text-green-600">+36.8%</span>
                </div>
              </div>

              <p className="text-sm text-gray-500">vs last month</p>
            </div>
          </div>

          {/* New Agents Today */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="mb-4">
              <p className="text-base font-semibold text-gray-900">{agents.filter(a => a.actionsToday > 0).length} agents actifs aujourd'hui!</p>
              <p className="text-sm text-gray-500">Suivi en temps réel de tous vos agents.</p>
            </div>

            {/* Avatars Row - Exactement comme référence */}
            <div className="flex items-center gap-4">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.name} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl ring-2 ring-white"
                    style={{ background: `${agent.color}30` }}
                  >
                    {agent.emoji}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{agent.displayName.split(' ')[0]}</span>
                </div>
              ))}

              <div className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600">View all</span>
              </div>
            </div>
          </div>

          {/* Game Section (Product view équivalent) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Agent Activity</h3>
              <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer focus:outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>

            <div className="h-96 overflow-hidden rounded-xl">
              <OfficeGame agents={agents} />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar DROITE - Popular products équivalent */}
      <div className="w-80 bg-white border-l border-gray-200 fixed right-0 h-screen overflow-y-auto p-6">
        {/* Popular Agents */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Agents actifs</h3>

          <div className="space-y-4">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${agent.color}20` }}
                >
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{agent.displayName}</p>
                  <p className="text-xs text-gray-500">{agent.actionsToday} actions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{agent.actionsToday}</p>
                  <p className="text-xs text-green-600">+{Math.floor(Math.random() * 20)}%</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            All agents
          </button>
        </div>

        {/* Comments section */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-6">Recent Activity</h3>

          <div className="space-y-4">
            {agents.slice(0, 2).map((agent, idx) => (
              <div key={idx} className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${agent.color}20` }}
                >
                  {agent.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <span className="font-semibold">{agent.displayName}</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {agent.lastRun ? new Date(agent.lastRun).toLocaleString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Jamais'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Action effectuée avec succès
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
