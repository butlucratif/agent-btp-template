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

  // Agent data from HTML design
  const agentCards = [
    {
      emoji: '📧',
      name: 'Relance Devis',
      role: 'Relance les clients',
      status: 'actif' as const,
      report: "J'ai relancé 8 clients qui n'avaient pas répondu à leur devis. 2 m'ont déjà rappelé.",
      stat1: { value: '34', label: 'devis relancés ce mois' },
      stat2: { value: '+3 850 €', label: 'récupérés', isMoney: true },
      nextAction: 'Prochaine relance ce soir à 20h',
    },
    {
      emoji: '☀️',
      name: 'Briefing du matin',
      role: 'Prépare votre journée',
      status: 'actif' as const,
      report: "Ce matin je vous ai préparé le résumé de la journée : 5 chantiers à suivre, rien d'urgent.",
      stat1: { value: '127', label: 'résumés livrés' },
      stat2: { value: '100 %', label: 'jours couverts' },
      nextAction: 'Prochain résumé demain à 7h',
    },
    {
      emoji: '🚨',
      name: 'Alertes',
      role: 'Surveille les devis',
      status: 'actif' as const,
      report: "J'ai repéré 2 devis qui traînaient depuis trop longtemps et je vous les ai signalés avant qu'ils ne soient perdus.",
      stat1: { value: '17', label: 'devis sauvés à temps' },
      stat2: { value: '+2 650 €', label: 'évités de perdre', isMoney: true },
      nextAction: 'Je surveille en continu',
    },
    {
      emoji: '⭐',
      name: 'Avis Google',
      role: 'Récolte les avis',
      status: 'actif' as const,
      report: "J'ai demandé un avis à 3 clients satisfaits. 1 vous a déjà mis 5 étoiles sur Google.",
      stat1: { value: '43', label: 'avis Google récoltés' },
      stat2: { value: '4,7 ★', label: 'note moyenne' },
      nextAction: 'Prochaines demandes demain à 9h',
    },
    {
      emoji: '💰',
      name: "Chiffre d'affaires",
      role: 'Calcule vos revenus',
      status: 'pause' as const,
      report: "Je me repose. Chaque lundi matin, je calcule combien vous allez gagner dans la semaine.",
      stat1: { value: '18 200 €', label: 'prévus ce mois', isMoney: true },
      stat2: { value: '8', label: 'rapports envoyés' },
      nextAction: 'Je reprends lundi à 8h',
    },
    {
      emoji: '📊',
      name: 'Rentabilité',
      role: 'Analyse vos marges',
      status: 'error' as const,
      report: "Je n'ai pas réussi à me connecter pour analyser vos marges cette nuit. J'ai besoin que vous me relanciez.",
      stat1: { value: '+24 %', label: 'marge moyenne' },
      stat2: { value: '31', label: 'chantiers analysés' },
      nextAction: 'Un clic et je repars',
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
