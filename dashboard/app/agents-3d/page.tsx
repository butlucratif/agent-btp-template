'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

interface Devis {
  id: number
  client_nom: string
  montant: number
  statut: string
  date_envoi: string
}

interface Chantier {
  id: number
  nom: string
  montant_devis: number
  cout_reel?: number
  statut: string
  date_debut: string
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

type TabType = 'dashboard' | 'devis' | 'chantiers' | 'agents'

export default function Agents3DPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [devis, setDevis] = useState<Devis[]>([])
  const [chantiers, setChantiers] = useState<Chantier[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  useEffect(() => {
    fetchAgentStatuses()
    fetchDevis()
    fetchChantiers()

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

    const devisChannel = supabase
      .channel('devis-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devis' }, () => {
        fetchDevis()
      })
      .subscribe()

    const chantiersChannel = supabase
      .channel('chantiers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chantiers' }, () => {
        fetchChantiers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(devisChannel)
      supabase.removeChannel(chantiersChannel)
    }
  }, [])

  async function fetchAgentStatuses() {
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
        const actionsToday = agentLogs.filter(
          (log) => new Date(log.created_at) >= todayStart
        ).length

        return {
          ...info,
          color: AGENT_COLORS[info.name] || '#6b7280',
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

  async function fetchDevis() {
    try {
      const { data } = await supabase
        .from('devis')
        .select('*')
        .order('date_envoi', { ascending: false })
      setDevis(data || [])
    } catch (error) {
      console.error('Error fetching devis:', error)
    }
  }

  async function fetchChantiers() {
    try {
      const { data } = await supabase
        .from('chantiers')
        .select('*')
        .order('date_debut', { ascending: false })
      setChantiers(data || [])
    } catch (error) {
      console.error('Error fetching chantiers:', error)
    }
  }

  // Calculate stats
  const totalCA = chantiers.reduce((sum, c) => sum + Number(c.montant_devis || 0), 0)
  const totalCouts = chantiers.reduce((sum, c) => sum + Number(c.cout_reel || 0), 0)
  const roi = totalCA > 0 ? ((totalCA - totalCouts) / totalCA) * 100 : 0
  const activeAgentsCount = agents.filter((a) => a.isActive).length
  const totalActions = agents.reduce((sum, a) => sum + a.actionsToday, 0)
  const devisEnAttente = devis.filter((d) => d.statut === 'en_attente')
  const chantiersEnCours = chantiers.filter((c) => c.statut === 'en_cours')

  // Prepare chart data - Évolution des devis (30 derniers jours)
  const getDevisEvolutionData = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const days: { date: string; count: number }[] = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(thirtyDaysAgo.getDate() + i)
      days.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        count: 0,
      })
    }

    devis.forEach((d) => {
      const devisDate = new Date(d.date_envoi)
      if (devisDate >= thirtyDaysAgo && devisDate <= today) {
        const dayIndex = Math.floor((devisDate.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
        if (dayIndex >= 0 && dayIndex < 30) {
          days[dayIndex].count++
        }
      }
    })

    return days
  }

  // CA prévisionnel par semaine (4 prochaines semaines)
  const getCAPrevisionnel = () => {
    const today = new Date()
    const weeks: { week: string; ca: number }[] = []

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() + i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      let weekCA = 0
      chantiers.forEach((c) => {
        const startDate = new Date(c.date_debut)
        if (startDate >= weekStart && startDate <= weekEnd) {
          weekCA += Number(c.montant_devis)
        }
      })

      weeks.push({
        week: `Sem ${i + 1}`,
        ca: Math.round(weekCA),
      })
    }

    return weeks
  }

  // Activité des agents (7 derniers jours)
  const getAgentActivityData = () => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const days: { date: string; actions: number }[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(sevenDaysAgo.getDate() + i)
      days.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        actions: 0,
      })
    }

    logs.forEach((log) => {
      const logDate = new Date(log.created_at)
      if (logDate >= sevenDaysAgo && logDate <= today) {
        const dayIndex = Math.floor((logDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
        if (dayIndex >= 0 && dayIndex < 7) {
          days[dayIndex].actions++
        }
      }
    })

    return days
  }

  // Taux de conversion devis (par mois)
  const getTauxConversionData = () => {
    const months: { mois: string; envoyes: number; acceptes: number; taux: number }[] = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)

      const devisMois = devis.filter((d) => {
        const devisDate = new Date(d.date_envoi)
        return devisDate >= monthDate && devisDate <= monthEnd
      })

      const envoyes = devisMois.length
      const acceptes = devisMois.filter((d) => d.statut === 'accepte').length
      const taux = envoyes > 0 ? Math.round((acceptes / envoyes) * 100) : 0

      months.push({
        mois: monthDate.toLocaleDateString('fr-FR', { month: 'short' }),
        envoyes,
        acceptes,
        taux,
      })
    }

    return months
  }

  const devisEvolutionData = getDevisEvolutionData()
  const caPrevisionnel = getCAPrevisionnel()
  const agentActivityData = getAgentActivityData()
  const tauxConversionData = getTauxConversionData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">PM</span>
            </div>
            <span className="font-semibold text-base text-gray-900">Patrick Maçonnerie</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Tableau de bord
            </button>

            <button
              onClick={() => setActiveTab('devis')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'devis'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Devis
            </button>

            <button
              onClick={() => setActiveTab('chantiers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'chantiers'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Chantiers
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'agents'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Agents
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="h-20 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'dashboard' && 'Tableau de bord'}
            {activeTab === 'devis' && 'Devis'}
            {activeTab === 'chantiers' && 'Chantiers'}
            {activeTab === 'agents' && 'Agents'}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* CA Total */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">CA Total</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {totalCA.toLocaleString('fr-FR')}€
                  </div>
                  <div className="text-sm text-gray-500">{chantiers.length} chantiers</div>
                </div>

                {/* ROI */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">ROI</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {(totalCA - totalCouts).toLocaleString('fr-FR')}€ de marge
                  </div>
                </div>

                {/* Agents Actifs */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Agents Actifs</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {activeAgentsCount}/{agents.length}
                  </div>
                  <div className="text-sm text-gray-500">En temps réel</div>
                </div>

                {/* Actions Aujourd'hui */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Actions</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {totalActions}
                  </div>
                  <div className="text-sm text-gray-500">Aujourd'hui</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Évolution des Devis */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Évolution des Devis</h3>
                  <p className="text-sm text-gray-500 mb-6">Nombre de devis envoyés par jour (30 derniers jours)</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={devisEvolutionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        dot={{ fill: '#3B82F6', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* CA Prévisionnel */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">CA Prévisionnel</h3>
                  <p className="text-sm text-gray-500 mb-6">Revenus prévus par semaine (4 prochaines semaines)</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={caPrevisionnel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value) => `${Number(value).toLocaleString('fr-FR')}€`}
                      />
                      <Bar dataKey="ca" fill="#22C55E" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Activité des Agents */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Activité des Agents</h3>
                  <p className="text-sm text-gray-500 mb-6">Actions effectuées par jour (7 derniers jours)</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={agentActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actions"
                        stroke="#8B5CF6"
                        strokeWidth={2.5}
                        dot={{ fill: '#8B5CF6', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Taux de Conversion */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Taux de Conversion</h3>
                  <p className="text-sm text-gray-500 mb-6">Devis envoyés vs acceptés (6 derniers mois)</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={tauxConversionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="envoyes" fill="#94A3B8" name="Envoyés" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="acceptes" fill="#3B82F6" name="Acceptés" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Overview Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Devis En Attente */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Devis En Attente</h3>
                  <div className="space-y-3">
                    {devisEnAttente.slice(0, 5).map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium text-gray-900">{d.client_nom}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(d.date_envoi).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {Number(d.montant).toLocaleString('fr-FR')}€
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chantiers En Cours */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chantiers En Cours</h3>
                  <div className="space-y-3">
                    {chantiersEnCours.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium text-gray-900">{c.nom}</div>
                          <div className="text-sm text-gray-500">
                            Début: {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {Number(c.montant_devis).toLocaleString('fr-FR')}€
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activité Récente */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente des Agents</h3>
                <div className="space-y-2">
                  {logs.slice(0, 10).map((log) => {
                    const agent = AGENTS_INFO.find((a) => a.name === log.agent_name)
                    return (
                      <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                        <div className="text-2xl">{agent?.emoji || '🤖'}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{agent?.displayName || log.agent_name}</div>
                          <div className="text-sm text-gray-600">{log.action}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'devis' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Liste des Devis</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devis.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.client_nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(d.montant).toLocaleString('fr-FR')}€</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            d.statut === 'accepte' ? 'bg-green-100 text-green-700' :
                            d.statut === 'refuse' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(d.date_envoi).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chantiers' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Liste des Chantiers</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Devis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût Réel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chantiers.map((c) => {
                      const marge = Number(c.montant_devis || 0) - Number(c.cout_reel || 0)
                      return (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.nom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(c.montant_devis).toLocaleString('fr-FR')}€</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(c.cout_reel || 0).toLocaleString('fr-FR')}€</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: marge >= 0 ? '#22C55E' : '#EF4444' }}>
                            {marge.toLocaleString('fr-FR')}€
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              c.statut === 'termine' ? 'bg-green-100 text-green-700' :
                              c.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {c.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <>
              {/* Stats des Agents */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Agents Actifs</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{activeAgentsCount}/{agents.length}</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Actions Aujourd'hui</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{totalActions}</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Taux de Succès</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {logs.length > 0 ? Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100) : 100}%
                  </div>
                </div>
              </div>

              {/* Grid des Agents */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {agents.map((agent) => (
                  <div key={agent.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{agent.emoji}</div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          agent.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {agent.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.displayName}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Actions aujourd'hui</span>
                        <span className="font-semibold text-gray-900">{agent.actionsToday}</span>
                      </div>
                      {agent.lastRun && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dernière exécution</span>
                          <span className="text-gray-900">
                            {agent.lastRun.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Logs des Agents */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique Complet</h3>
                <div className="space-y-2">
                  {logs.slice(0, 20).map((log) => {
                    const agent = AGENTS_INFO.find((a) => a.name === log.agent_name)
                    return (
                      <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                        <div className="text-2xl">{agent?.emoji || '🤖'}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{agent?.displayName || log.agent_name}</div>
                          <div className="text-sm text-gray-600">{log.action}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
