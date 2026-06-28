'use client'

import { useEffect, useState } from 'react'
import { supabase, Devis, Chantier } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DevisTable from '@/components/DevisTable'
import ChantiersTable from '@/components/ChantiersTable'
import ChartsSection from '@/components/ChartsSection'
import Sidebar from '@/components/Sidebar'
import companyConfig from '@/config/company'

export default function Dashboard() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [chantiers, setChantiers] = useState<Chantier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()

    // Subscribe to real-time changes
    const devisChannel = supabase
      .channel('devis-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devis' }, () => {
        fetchData()
      })
      .subscribe()

    const chantiersChannel = supabase
      .channel('chantiers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chantiers' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(devisChannel)
      supabase.removeChannel(chantiersChannel)
    }
  }, [])

  async function fetchData() {
    try {
      setLoading(true)

      // Fetch devis
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .order('date_envoi', { ascending: false })

      if (devisError) throw devisError

      // Fetch chantiers
      const { data: chantiersData, error: chantiersError } = await supabase
        .from('chantiers')
        .select('*')
        .order('date_debut', { ascending: true })

      if (chantiersError) throw chantiersError

      setDevis(devisData || [])
      setChantiers(chantiersData || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary stats
  const devisEnAttente = devis.filter((d) => d.statut === 'en_attente')
  const totalPipeline = devis.reduce((sum, d) => sum + Number(d.montant), 0)
  const totalDevisEnAttente = devisEnAttente.reduce((sum, d) => sum + Number(d.montant), 0)

  // Get chantiers for this week
  const getWeekChantiers = () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Sunday

    return chantiers.filter((c) => {
      const startDate = new Date(c.date_debut)
      return startDate >= weekStart && startDate <= weekEnd
    })
  }

  const weekChantiers = getWeekChantiers()
  const totalCAWeek = weekChantiers.reduce((sum, c) => sum + Number(c.montant_devis), 0)
  const chantiersEnCours = chantiers.filter((c) => c.statut === 'en_cours').length

  // Calculate changes (mock data - you can replace with real comparison)
  const calculateChange = (current: number, comparison: number) => {
    if (comparison === 0) return 0
    return ((current - comparison) / comparison) * 100
  }

  // Mock previous period data for demo
  const previousTotalPipeline = totalPipeline * 0.75
  const previousDevisEnAttente = devisEnAttente.length * 0.85
  const previousChantiersEnCours = chantiersEnCours * 0.95

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card p-8 max-w-md fade-in">
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            Erreur de connexion
          </h3>
          <p className="text-sm mb-6 text-gray-600">
            {error}
          </p>
          <button onClick={fetchData} className="btn-primary w-full">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 ml-[240px]">
        {/* Header */}
        <div className="border-b border-border px-8 py-6 bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                {companyConfig.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period selector */}
              <select className="input" style={{ width: 'auto', paddingRight: '2.5rem' }}>
                <option>Last month</option>
                <option>This month</option>
                <option>This year</option>
              </select>

              <button onClick={fetchData} className="btn-secondary">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Overview Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Overview</h2>
            </div>

            {/* Stats Grid - 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Stat 1: Total Clients */}
              <StatCard
                title="Customers"
                value={devis.length}
                change={{
                  value: calculateChange(devis.length, previousTotalPipeline / 50000),
                  period: 'vs last month'
                }}
                subtitle="vs last month"
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />

              {/* Stat 2: Balance (Pipeline) */}
              <StatCard
                title="Balance"
                value={`${(totalPipeline / 1000).toFixed(0)}k`}
                change={{
                  value: calculateChange(totalPipeline, previousTotalPipeline),
                  period: 'vs last month'
                }}
                subtitle="vs last month"
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* Stat 3: Pending Quotes */}
              <StatCard
                title="Pending"
                value={devisEnAttente.length}
                change={{
                  value: calculateChange(devisEnAttente.length, previousDevisEnAttente),
                  period: 'vs last month'
                }}
                subtitle={`${(totalDevisEnAttente / 1000).toFixed(0)}k€ value`}
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* Stat 4: Active Sites */}
              <StatCard
                title="Active"
                value={chantiersEnCours}
                change={{
                  value: calculateChange(chantiersEnCours, previousChantiersEnCours),
                  period: 'vs last month'
                }}
                subtitle="construction sites"
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <ChartsSection devis={devis} chantiers={chantiers} />
          </div>

          {/* Tables Section */}
          <div className="space-y-8">
            <DevisTable devis={devisEnAttente} />
            <ChantiersTable chantiers={chantiers.filter((c) => c.statut !== 'termine')} />
          </div>
        </div>
      </main>
    </div>
  )
}
