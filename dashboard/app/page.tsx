'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Devis, Chantier } from '@/lib/supabase'
import HeroCard from '@/components/HeroCard'
import AgentCard from '@/components/AgentCard'
import Sidebar from '@/components/Sidebar'

// Agent definitions from /app/agents/page.tsx
const AGENTS = [
  { name: 'relance-devis', displayName: 'Relance Devis', emoji: '📧', schedule: '20h00 quotidien' },
  { name: 'daily-briefing', displayName: 'Daily Briefing', emoji: '☀️', schedule: '7h00 quotidien' },
  { name: 'urgent-alert', displayName: 'Urgent Alert', emoji: '🚨', schedule: 'Toutes les 6h' },
  { name: 'calcul-ca', displayName: 'CA Hebdomadaire', emoji: '💰', schedule: 'Lundi 8h00' },
  { name: 'avis-google', displayName: 'Avis Google', emoji: '⭐', schedule: '9h00 quotidien' },
  { name: 'rentabilite-chantier', displayName: 'Rentabilité', emoji: '📊', schedule: '21h00 quotidien' },
]

export default function Dashboard() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [chantiers, setChantiers] = useState<Chantier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()

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

      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .order('date_envoi', { ascending: false })

      if (devisError) throw devisError

      const { data: chantiersData, error: chantiersError } = await supabase
        .from('chantiers')
        .select('*')
        .order('date_debut', { ascending: true })

      if (chantiersError) throw chantiersError

      setDevis(devisData || [])
      setChantiers(chantiersData || [])
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate weekly revenue
  const getWeekChantiers = () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    return chantiers.filter((c) => {
      const startDate = new Date(c.date_debut)
      return startDate >= weekStart && startDate <= weekEnd
    })
  }

  const weekChantiers = getWeekChantiers()
  const totalCAWeek = weekChantiers.reduce((sum, c) => sum + Number(c.montant_devis), 0)

  // Mock agent statuses (TODO: fetch from agent_logs table)
  const agentStatuses = {
    actif: 4,
    pause: 1,
    error: 1,
  }

  // Mock agent data (TODO: fetch real data from agent_logs)
  const agentCards = [
    {
      emoji: '📧',
      name: 'Relance Devis',
      role: 'Suivi commercial',
      status: 'actif' as const,
      report: 'A relancé 3 devis en attente ce soir. 1 client a répondu positivement.',
      stat1: { value: '3', label: 'Devis relancés' },
      stat2: { value: '45 000 €', label: 'Montant total', isMoney: true },
      nextAction: 'Prochaine relance prévue demain à 20h00',
    },
    {
      emoji: '☀️',
      name: 'Daily Briefing',
      role: 'Synthèse quotidienne',
      status: 'actif' as const,
      report: "Briefing matinal envoyé à 7h00. Résumé de l'activité de la veille et objectifs du jour.",
      stat1: { value: '12', label: 'Points clés' },
      stat2: { value: '100%', label: 'Taux de lecture' },
      nextAction: 'Prochain briefing demain à 7h00',
    },
    {
      emoji: '🚨',
      name: 'Urgent Alert',
      role: 'Veille urgences',
      status: 'actif' as const,
      report: 'Surveillance active. Aucune urgence détectée dans les 6 dernières heures.',
      stat1: { value: '0', label: 'Alertes' },
      stat2: { value: '24/7', label: 'Surveillance' },
      nextAction: 'Prochaine vérification dans 2h15',
    },
    {
      emoji: '💰',
      name: 'CA Hebdomadaire',
      role: 'Suivi financier',
      status: 'actif' as const,
      report: 'Calcul du CA hebdomadaire effectué ce lundi. Performance en hausse de 15%.',
      stat1: { value: '125 000 €', label: 'CA cette semaine', isMoney: true },
      stat2: { value: '+15%', label: 'vs semaine dernière' },
      nextAction: 'Prochain calcul lundi prochain à 8h00',
    },
    {
      emoji: '⭐',
      name: 'Avis Google',
      role: 'Gestion réputation',
      status: 'pause' as const,
      report: 'En pause suite au dernier avis traité. Aucun nouvel avis à traiter.',
      stat1: { value: '4.8', label: 'Note moyenne' },
      stat2: { value: '2', label: 'Nouveaux avis' },
      nextAction: 'Reprise demain à 9h00',
    },
    {
      emoji: '📊',
      name: 'Rentabilité',
      role: 'Analyse chantiers',
      status: 'error' as const,
      report: 'Erreur lors de l\'analyse du chantier #CH-2024-042. Données manquantes détectées.',
      stat1: { value: '5', label: 'Chantiers analysés' },
      stat2: { value: '1', label: 'Erreur' },
      nextAction: 'Vérification requise - données manquantes',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F8F7' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: '#9A968D' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F8F7' }}>
      <Sidebar />

      <main className="flex-1" style={{ marginLeft: '236px' }}>
        <div className="w-full" style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 40px 64px' }}>
          {/* Date */}
          <div
            style={{
              fontSize: '13px',
              color: '#9A968D',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          {/* Hero Title */}
          <h1
            style={{
              margin: '8px 0 0',
              fontSize: '30px',
              fontWeight: 700,
              color: '#23211D',
              letterSpacing: '-0.025em',
            }}
          >
            Bonjour Léon 👋
          </h1>

          {/* Subtitle */}
          <p
            style={{
              margin: '10px 0 0',
              fontSize: '17px',
              lineHeight: 1.5,
              color: '#56524A',
              maxWidth: '560px',
            }}
          >
            Vos salariés virtuels ont travaillé pour vous. Voici ce qu'ils ont fait — en clair.
          </p>

          {/* Hero Card */}
          <div style={{ marginTop: '32px', marginBottom: '42px' }}>
            <HeroCard
              amount={`${(totalCAWeek / 1000).toFixed(0)} 000 €`}
              statusPills={[
                { label: 'au travail', count: agentStatuses.actif, status: 'actif' },
                { label: 'en pause', count: agentStatuses.pause, status: 'pause' },
                { label: 'à regarder', count: agentStatuses.error, status: 'error' },
              ]}
            />
          </div>

          {/* Section Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#23211D',
                letterSpacing: '-0.015em',
              }}
            >
              Vos 6 salariés
            </h2>
            <Link
              href="/agents"
              style={{
                fontSize: '14px',
                color: '#157347',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Tout voir →
            </Link>
          </div>

          {/* Agent Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {agentCards.map((agent, index) => (
              <AgentCard key={index} {...agent} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
