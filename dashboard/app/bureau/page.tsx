'use client'

import Sidebar from '@/components/Sidebar'

// Données des 6 agents extraites du HTML
const bureauAgents = [
  {
    emoji: '📧',
    name: 'Relance Devis',
    activity: 'Rédige une relance…',
    status: 'actif' as const,
  },
  {
    emoji: '☀️',
    name: 'Briefing du matin',
    activity: 'Compile le résumé…',
    status: 'actif' as const,
  },
  {
    emoji: '🚨',
    name: 'Alertes',
    activity: 'Scanne les devis…',
    status: 'actif' as const,
  },
  {
    emoji: '⭐',
    name: 'Avis Google',
    activity: 'Contacte un client…',
    status: 'actif' as const,
  },
  {
    emoji: '💰',
    name: "Chiffre d'affaires",
    activity: 'En veille 💤',
    status: 'pause' as const,
  },
  {
    emoji: '📊',
    name: 'Rentabilité',
    activity: 'Hors ligne ⚠',
    status: 'error' as const,
  },
]

const statusConfig = {
  actif: {
    label: 'Au travail',
    bg: '#F0FBF4',
    color: '#157347',
    dotBg: '#10B981',
    animation: 'pulse-dot',
  },
  pause: {
    label: 'En pause',
    bg: '#F4F4F2',
    color: '#6F6B61',
    dotBg: '#A8A49B',
    animation: 'none',
  },
  error: {
    label: 'À regarder',
    bg: '#FEF1F1',
    color: '#C2353A',
    dotBg: '#E5484D',
    animation: 'pulse-dot-red',
  },
}

export default function BureauPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#F8F8F7' }}>
      <Sidebar />

      <main className="flex-1" style={{ marginLeft: '236px' }}>
        <div
          className="w-full"
          style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 40px 64px' }}
        >
          {/* Titre */}
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.025em',
            }}
          >
            Le bureau des agents
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
            Votre équipe au travail, en ce moment même. Chaque poste est occupé par un de vos salariés virtuels.
          </p>

          {/* Container avec gradient */}
          <div
            style={{
              marginTop: '30px',
              background: 'linear-gradient(rgb(244, 242, 238) 0%, rgb(236, 233, 227) 100%)',
              border: '1px solid #E6E2DA',
              borderRadius: '24px',
              padding: '34px',
            }}
          >
            {/* Grille d'agents */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '22px',
              }}
            >
              {bureauAgents.map((agent, index) => {
                const config = statusConfig[agent.status]
                const isBlinking = agent.status === 'actif' || agent.status === 'error'

                return (
                  <div
                    key={index}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #ECEBE7',
                      borderRadius: '20px',
                      padding: '22px 20px 20px',
                      textAlign: 'center',
                      boxShadow: 'rgba(35, 33, 29, 0.25) 0px 6px 18px -12px',
                    }}
                  >
                    {/* Desktop avec emoji */}
                    <div
                      style={{
                        position: 'relative',
                        height: '92px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Emoji badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          zIndex: 2,
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          background: '#F8F8F7',
                          border: '1px solid #ECEBE7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '27px',
                        }}
                      >
                        {agent.emoji}
                      </div>

                      {/* Desktop screen */}
                      <div
                        style={{
                          width: '104px',
                          height: '62px',
                          borderRadius: '11px',
                          background: '#2A2723',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          gap: '5px',
                          padding: '10px 12px',
                        }}
                      >
                        {/* Progress bars on screen */}
                        <div
                          style={{
                            height: '5px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.18)',
                            width: '80%',
                          }}
                        ></div>
                        <div
                          style={{
                            height: '5px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            width: '55%',
                          }}
                        ></div>

                        {/* Status dot */}
                        <div style={{ position: 'absolute', top: '36px', right: '34px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: config.dotBg,
                              animation: isBlinking ? '1.4s ease 0s infinite normal none running blink' : 'none',
                            }}
                          ></span>
                        </div>
                      </div>
                    </div>

                    {/* Barre de séparation */}
                    <div
                      style={{
                        height: '9px',
                        borderRadius: '6px',
                        background: '#E2DDD3',
                        margin: '6px 0 14px',
                      }}
                    ></div>

                    {/* Nom de l'agent */}
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {agent.name}
                    </div>

                    {/* Activité en cours */}
                    <div
                      style={{
                        marginTop: '9px',
                        fontSize: '12.5px',
                        color: '#56524A',
                        minHeight: '18px',
                      }}
                    >
                      {agent.activity}
                    </div>

                    {/* Badge de statut */}
                    <div
                      style={{
                        marginTop: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '5px 11px 5px 9px',
                          borderRadius: '20px',
                          background: config.bg,
                          color: config.color,
                          flexShrink: 0,
                        }}
                      >
                        {/* Dot with animation */}
                        <span
                          style={{
                            position: 'relative',
                            width: '7px',
                            height: '7px',
                            display: 'inline-block',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '50%',
                              background: config.dotBg,
                              animation:
                                config.animation !== 'none'
                                  ? `2s ease 0s infinite normal none running ${config.animation}`
                                  : 'none',
                            }}
                          ></span>
                        </span>
                        <span>{config.label}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
