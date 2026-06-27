'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

interface AgentLog {
  id: number
  agent_name: string
  action: string
  status: string
  created_at: string
  details?: any
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

type TabType = 'dashboard' | 'agents' | 'analytics' | 'logs' | 'settings'

export default function Agents3DPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('agent-logs-3d')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchData() {
    try {
      const { data: logsData } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      setLogs(logsData || [])

      const agentStatuses: AgentStatus[] = AGENTS_INFO.map((info) => {
        const agentLogs = logsData?.filter((log) => log.agent_name === info.name) || []
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
      console.error('Error fetching data:', error)
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

  // Simple chart data (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate.toDateString() === date.toDateString()
    })
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      value: dayLogs.length
    }
  })
  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar GAUCHE */}
      <div className="w-64 bg-[#FAFAFA] border-r border-gray-200 flex flex-col py-8 px-6 fixed h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            <svg className={`w-5 h-5 transition-all duration-200 ${activeTab === 'dashboard' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`text-sm font-medium ${activeTab === 'dashboard' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'agents'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            <svg className={`w-5 h-5 transition-all duration-200 ${activeTab === 'agents' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`text-sm font-medium ${activeTab === 'agents' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>Agents</span>
            {activeAgents > 0 && (
              <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-md">
                <span className="text-xs font-semibold text-blue-600">{activeAgents}</span>
              </div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            <svg className={`w-5 h-5 transition-all duration-200 ${activeTab === 'analytics' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className={`text-sm font-medium ${activeTab === 'analytics' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'logs'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            <svg className={`w-5 h-5 transition-all duration-200 ${activeTab === 'logs' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`text-sm font-medium ${activeTab === 'logs' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>Logs</span>
          </button>

          <div className="my-4 h-px bg-gray-200"></div>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white hover:shadow-sm'
            }`}
          >
            <svg className={`w-5 h-5 transition-all duration-200 ${activeTab === 'settings' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'} group-hover:scale-110 group-hover:rotate-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-sm font-medium ${activeTab === 'settings' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>Settings</span>
          </button>
        </nav>
      </div>

      {/* Contenu PRINCIPAL */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-10 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h1>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative group">
                <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 group-focus-within:text-gray-600 group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-80 h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Create Button */}
              <button className="group h-11 px-6 bg-gray-900 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Create
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              {/* Settings Icon */}
              <button className="group w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-all duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-300/50 ring-2 ring-white"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-10 py-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Overview Section */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
                <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200">
                  <option>Last month</option>
                  <option>Last week</option>
                  <option>Last year</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Card Agents */}
                <div className="group bg-white rounded-2xl p-8 border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-blue-100 group-hover:scale-110">
                      <svg className="w-5 h-5 text-blue-600 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Agents actifs</span>
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <div className="text-5xl font-bold text-gray-900 tracking-tight transition-all duration-300 group-hover:scale-105">{activeAgents}</div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg mb-2 transition-all duration-300 group-hover:bg-green-100">
                      <svg className="w-3 h-3 text-green-600 transition-transform duration-300 group-hover:translate-y-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="text-xs font-semibold text-green-600">+{Math.round((activeAgents / 6) * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">vs dernier mois</p>
                </div>

                {/* Card Actions */}
                <div className="group bg-white rounded-2xl p-8 border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-1" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-purple-100 group-hover:scale-110">
                      <svg className="w-5 h-5 text-purple-600 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Actions totales</span>
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <div className="text-5xl font-bold text-gray-900 tracking-tight transition-all duration-300 group-hover:scale-105">{totalActions}</div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg mb-2 transition-all duration-300 group-hover:bg-green-100">
                      <svg className="w-3 h-3 text-green-600 transition-transform duration-300 group-hover:translate-y-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="text-xs font-semibold text-green-600">+36.8%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">vs dernier mois</p>
                </div>

                {/* Card Chart - Activity Chart */}
                <div className="group bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-green-100/50 hover:-translate-y-1" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-green-100 group-hover:scale-110">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Activité 7 jours</span>
                  </div>

                  {/* Simple SVG Chart */}
                  <div className="h-24 flex items-end gap-1">
                    {chartData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                          style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: '4px' }}
                        ></div>
                        <span className="text-[10px] text-gray-400">{data.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Agents List */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Agents actifs maintenant</h3>
                <div className="grid grid-cols-3 gap-4">
                  {agents.filter(a => a.actionsToday > 0).map((agent) => (
                    <div key={agent.name} className="group flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:shadow-md border border-gray-100">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: `${agent.color}20`,
                          boxShadow: agent.isActive ? `0 0 15px ${agent.color}30` : 'none'
                        }}
                      >
                        {agent.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{agent.displayName}</p>
                        <p className="text-xs text-gray-500">{agent.actionsToday} actions</p>
                      </div>
                      {agent.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Activité récente</h3>
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => {
                    const agent = agents.find(a => a.name === log.agent_name)
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                          style={{ background: agent ? `${agent.color}20` : '#F5F5F5' }}
                        >
                          {agent?.emoji || '📋'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{agent?.displayName || log.agent_name}</p>
                          <p className="text-xs text-gray-500">{log.action}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                            log.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {log.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'agents' && (
            <div className="grid grid-cols-2 gap-6">
              {agents.map((agent) => (
                <div key={agent.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        background: `${agent.color}20`,
                        boxShadow: agent.isActive ? `0 0 20px ${agent.color}40` : 'none'
                      }}
                    >
                      {agent.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{agent.displayName}</h3>
                        {agent.isActive && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-semibold rounded-md">Actif</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{agent.actionsToday} actions aujourd'hui</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Dernière exécution</p>
                          <p className="text-sm font-medium text-gray-900">
                            {agent.lastRun ? new Date(agent.lastRun).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Jamais'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Statut</p>
                          <p className="text-sm font-medium text-gray-900">
                            {agent.isActive ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité sur 7 jours</h3>
                <div className="h-64 flex items-end gap-4">
                  {chartData.map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-sm font-semibold text-gray-700">{data.value}</div>
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                        style={{ height: `${(data.value / maxValue) * 100}%`, minHeight: '20px' }}
                      ></div>
                      <span className="text-sm font-medium text-gray-600">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Top Agents</h4>
                  <div className="space-y-3">
                    {agents.sort((a, b) => b.actionsToday - a.actionsToday).slice(0, 5).map((agent, idx) => (
                      <div key={agent.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xl">{agent.emoji}</span>
                          <span className="text-sm font-medium text-gray-900">{agent.displayName}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{agent.actionsToday}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Statistiques</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Taux de réussite</span>
                        <span className="font-semibold text-gray-900">
                          {Math.round((logs.filter(l => l.status === 'success').length / Math.max(logs.length, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${(logs.filter(l => l.status === 'success').length / Math.max(logs.length, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Agents actifs</span>
                        <span className="font-semibold text-gray-900">{activeAgents} / {agents.length}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${(activeAgents / agents.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total actions</span>
                        <span className="font-semibold text-gray-900">{totalActions}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-gray-900">Agent</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-900">Action</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-900">Statut</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 20).map((log) => {
                      const agent = agents.find(a => a.name === log.agent_name)
                      return (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{agent?.emoji || '📋'}</span>
                              <span className="text-sm font-medium text-gray-900">{agent?.displayName || log.agent_name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{log.action}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                              log.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">
                              {new Date(log.created_at).toLocaleString('fr-FR')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres généraux</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Nom de l'organisation</label>
                    <input
                      type="text"
                      defaultValue="Mon Entreprise"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="contact@exemple.fr"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Fuseau horaire</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <option>Europe/Paris</option>
                      <option>Europe/London</option>
                      <option>America/New_York</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <button className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
