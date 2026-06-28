'use client'

import Sidebar from '@/components/Sidebar'

// Structure complète des agents avec toutes leurs données extraites du HTML
const agentsDetail = [
  {
    emoji: '📧',
    name: 'Relance Devis',
    role: 'Relance les clients',
    schedule: 'tous les jours 20h',
    status: 'actif' as const,
    statusLabel: 'Au travail',
    report: "J'ai relancé 8 clients qui n'avaient pas répondu à leur devis. 2 m'ont déjà rappelé.",
    stat1: { value: '34', label: 'devis relancés ce mois', color: '#23211D' },
    stat2: { value: '+42 300 €', label: 'récupérés', color: '#157347' },
    activity: [
      { time: 'Auj. 14:02', text: 'Relance envoyée à M. Leclerc' },
      { time: 'Auj. 09:15', text: '3 relances groupées' },
      { time: 'Hier 20:00', text: '5 devis relancés' },
    ],
    buttonText: 'Mettre en pause',
    buttonStyle: 'default' as const,
  },
  {
    emoji: '☀️',
    name: 'Briefing du matin',
    role: 'Prépare votre journée',
    schedule: 'tous les jours 7h',
    status: 'actif' as const,
    statusLabel: 'Au travail',
    report: "Ce matin je vous ai préparé le résumé de la journée : 5 chantiers à suivre, rien d'urgent.",
    stat1: { value: '127', label: 'résumés livrés', color: '#23211D' },
    stat2: { value: '100 %', label: 'jours couverts', color: '#23211D' },
    activity: [
      { time: 'Auj. 07:00', text: 'Résumé du jour envoyé' },
      { time: 'Hier 07:00', text: 'Résumé du jour envoyé' },
      { time: 'Avant-hier', text: 'Résumé du jour envoyé' },
    ],
    buttonText: 'Mettre en pause',
    buttonStyle: 'default' as const,
  },
  {
    emoji: '🚨',
    name: 'Alertes',
    role: 'Surveille les devis',
    schedule: 'toutes les 6h',
    status: 'actif' as const,
    statusLabel: 'Au travail',
    report: "J'ai repéré 2 devis qui traînaient depuis trop longtemps et je vous les ai signalés avant qu'ils ne soient perdus.",
    stat1: { value: '17', label: 'devis sauvés à temps', color: '#23211D' },
    stat2: { value: '+28 900 €', label: 'évités de perdre', color: '#157347' },
    activity: [
      { time: 'Auj. 13:40', text: 'Alerte : devis SCI La Fontaine (J+6)' },
      { time: 'Auj. 07:40', text: 'Aucun devis critique' },
      { time: 'Hier 19:40', text: 'Alerte : devis M. Leclerc (J+7)' },
    ],
    buttonText: 'Mettre en pause',
    buttonStyle: 'default' as const,
  },
  {
    emoji: '⭐',
    name: 'Avis Google',
    role: 'Récolte les avis',
    schedule: 'tous les jours 9h',
    status: 'actif' as const,
    statusLabel: 'Au travail',
    report: "J'ai demandé un avis à 3 clients satisfaits. 1 vous a déjà mis 5 étoiles sur Google.",
    stat1: { value: '43', label: 'avis Google récoltés', color: '#23211D' },
    stat2: { value: '4,7 ★', label: 'note moyenne', color: '#23211D' },
    activity: [
      { time: 'Auj. 09:00', text: "3 demandes d'avis envoyées" },
      { time: 'Hier', text: '1 nouvel avis 5★ reçu' },
      { time: 'Avant-hier', text: '4 demandes envoyées' },
    ],
    buttonText: 'Mettre en pause',
    buttonStyle: 'default' as const,
  },
  {
    emoji: '💰',
    name: "Chiffre d'affaires",
    role: 'Calcule vos revenus',
    schedule: 'lundi 8h',
    status: 'pause' as const,
    statusLabel: 'En pause',
    report: "Je me repose. Chaque lundi matin, je calcule combien vous allez gagner dans la semaine.",
    stat1: { value: '167 400 €', label: 'prévus ce mois', color: '#157347' },
    stat2: { value: '8', label: 'rapports envoyés', color: '#23211D' },
    activity: [
      { time: 'Lundi 08:00', text: 'CA hebdo calculé : 33 500 €' },
      { time: 'Lun. préc.', text: 'CA hebdo : 31 200 €' },
      { time: 'En pause', text: 'Reprise lundi' },
    ],
    buttonText: 'Réactiver le salarié',
    buttonStyle: 'primary' as const,
  },
  {
    emoji: '📊',
    name: 'Rentabilité',
    role: 'Analyse vos marges',
    schedule: 'tous les jours 21h',
    status: 'error' as const,
    statusLabel: 'À regarder',
    report: "Je n'ai pas réussi à me connecter pour analyser vos marges cette nuit. J'ai besoin que vous me relanciez.",
    stat1: { value: '+24 %', label: 'marge moyenne', color: '#157347' },
    stat2: { value: '31', label: 'chantiers analysés', color: '#23211D' },
    activity: [
      { time: 'Auj. 21:00', text: '❌ Échec connexion API' },
      { time: 'Hier 21:00', text: 'Marges calculées : +24%' },
      { time: 'Avant-hier', text: 'Marges calculées : +23%' },
    ],
    buttonText: 'Relancer le salarié',
    buttonStyle: 'error' as const,
  },
]

const statusThemes = {
  actif: {
    bg: '#F0FBF4',
    color: '#157347',
    dotBg: '#10B981',
    animation: 'pulse-dot',
  },
  pause: {
    bg: '#F4F4F2',
    color: '#6F6B61',
    dotBg: '#A8A49B',
    animation: 'none',
  },
  error: {
    bg: '#FEF1F1',
    color: '#C2353A',
    dotBg: '#E5484D',
    animation: 'pulse-dot-red',
  },
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#F8F8F7' }}>
      <Sidebar />

      <main className="flex-1" style={{ marginLeft: '236px' }}>
        <div className="w-full" style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 40px 64px' }}>
          {/* Titre */}
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
            }}
          >
            Mes salariés
          </h1>

          {/* Sous-titre */}
          <p
            style={{
              margin: '10px 0 0',
              fontSize: '16px',
              lineHeight: 1.5,
              color: '#56524A',
              maxWidth: '600px',
            }}
          >
            Le détail de chacun de vos salariés virtuels : ce qu'il a fait, ce qu'il vous a rapporté, et comment le
            piloter.
          </p>

          {/* Grille d'agents */}
          <div
            style={{
              marginTop: '30px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {agentsDetail.map((agent, index) => {
              const theme = statusThemes[agent.status]
              const cardBorder = agent.status === 'error' ? '#F2D6D6' : '#ECEBE7'

              return (
                <div
                  key={index}
                  style={{
                    display: 'block',
                    minWidth: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    background: '#FFFFFF',
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '20px',
                    padding: '22px 24px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  {/* En-tête */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '14px',
                        background: '#F8F8F7',
                        border: '1px solid #ECEBE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                      }}
                    >
                      {agent.emoji}
                    </div>
                    <div style={{ minWidth: 0, flex: '1 1 0%' }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#9A968D', marginTop: '1px' }}>
                        {agent.role} · {agent.schedule}
                      </div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '5px 11px 5px 9px',
                        borderRadius: '20px',
                        background: theme.bg,
                        color: theme.color,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ position: 'relative', width: '7px', height: '7px', display: 'inline-block' }}>
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: theme.dotBg,
                            animation: theme.animation !== 'none' ? `${theme.animation} 2s ease 0s infinite` : 'none',
                          }}
                        />
                      </span>
                      {agent.statusLabel}
                    </span>
                  </div>

                  {/* Rapport */}
                  <p style={{ margin: '16px 0 0', fontSize: '15px', lineHeight: 1.55, color: '#3F3C35' }}>
                    {agent.report}
                  </p>

                  {/* Stats */}
                  <div
                    style={{
                      marginTop: '18px',
                      paddingTop: '16px',
                      borderTop: '1px solid #F1F0EC',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '23px',
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                          color: agent.stat1.color,
                        }}
                      >
                        {agent.stat1.value}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#9A968D',
                          marginTop: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {agent.stat1.label}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '23px',
                          fontWeight: 800,
                          letterSpacing: '-0.02em',
                          color: agent.stat2.color,
                        }}
                      >
                        {agent.stat2.value}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#9A968D',
                          marginTop: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {agent.stat2.label}
                      </div>
                    </div>
                  </div>

                  {/* Activité récente */}
                  <div style={{ marginTop: '18px' }}>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: '#B4B0A6',
                        textTransform: 'uppercase',
                      }}
                    >
                      Activité récente
                    </div>
                    <div style={{ marginTop: '9px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {agent.activity.map((act, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            gap: '9px',
                            alignItems: 'baseline',
                            fontSize: '13px',
                            color: '#56524A',
                            lineHeight: 1.4,
                          }}
                        >
                          <span
                            style={{
                              color: '#B4B0A6',
                              flexShrink: 0,
                              fontVariantNumeric: 'tabular-nums',
                              minWidth: '84px',
                            }}
                          >
                            {act.time}
                          </span>
                          <span>{act.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton d'action */}
                  <button
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      marginTop: '18px',
                      padding: '11px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        agent.buttonStyle === 'default'
                          ? '1px solid #E7E6E1'
                          : agent.buttonStyle === 'primary'
                            ? '1px solid transparent'
                            : '1px solid transparent',
                      background:
                        agent.buttonStyle === 'default'
                          ? '#F4F4F2'
                          : agent.buttonStyle === 'primary'
                            ? '#23211D'
                            : '#E5484D',
                      color: agent.buttonStyle === 'default' ? '#56524A' : '#FFFFFF',
                    }}
                  >
                    {agent.buttonText}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
