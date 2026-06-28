'use client'

import Sidebar from '@/components/Sidebar'

// Données complètes des devis extraites du HTML
const devisData = [
  {
    initials: 'VD',
    client: 'Villa Dubois',
    date: 'Envoyé le 18 juin',
    relances: '📧 2×',
    montant: '34 500 €',
    statut: 'En attente',
    statutStyle: {
      bg: '#FCF3E6',
      color: '#B45309',
    },
  },
  {
    initials: 'RL',
    client: 'Restaurant Le Phare',
    date: 'Envoyé le 21 juin',
    relances: '📧 1×',
    montant: '12 800 €',
    statut: 'En attente',
    statutStyle: {
      bg: '#FCF3E6',
      color: '#B45309',
    },
  },
  {
    initials: 'SM',
    client: 'SCI Montparnasse',
    date: 'Envoyé le 23 juin',
    relances: '📧 1×',
    montant: '58 200 €',
    statut: 'En attente',
    statutStyle: {
      bg: '#FCF3E6',
      color: '#B45309',
    },
  },
  {
    initials: 'CR',
    client: 'Cabinet Rivière',
    date: 'Envoyé le 24 juin',
    relances: null,
    montant: '9 400 €',
    statut: 'En attente',
    statutStyle: {
      bg: '#FCF3E6',
      color: '#B45309',
    },
  },
  {
    initials: 'GM',
    client: 'Garage Mécano Plus',
    date: 'Envoyé le 25 juin',
    relances: null,
    montant: '21 100 €',
    statut: 'En attente',
    statutStyle: {
      bg: '#FCF3E6',
      color: '#B45309',
    },
  },
  {
    initials: 'ML',
    client: 'Maison Lefèvre',
    date: 'Envoyé le 14 juin',
    relances: null,
    montant: '28 000 €',
    statut: 'Accepté',
    statutStyle: {
      bg: '#F0FBF4',
      color: '#157347',
    },
  },
  {
    initials: 'BP',
    client: 'Boulangerie Pain Co',
    date: 'Envoyé le 12 juin',
    relances: null,
    montant: '7 600 €',
    statut: 'Accepté',
    statutStyle: {
      bg: '#F0FBF4',
      color: '#157347',
    },
  },
  {
    initials: 'HL',
    client: 'Hangar Logistique Sud',
    date: 'Envoyé le 20 juin',
    relances: null,
    montant: '64 000 €',
    statut: 'Envoyé',
    statutStyle: {
      bg: '#EEF1FB',
      color: '#4655B0',
    },
  },
  {
    initials: 'CL',
    client: 'Copropriété Les Tilleuls',
    date: 'Envoyé le 8 juin',
    relances: null,
    montant: '19 500 €',
    statut: 'Refusé',
    statutStyle: {
      bg: '#F4F4F2',
      color: '#8A867C',
    },
  },
]

export default function DevisPage() {
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
            Devis
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
            Tous vos devis en un endroit. Votre salarié <strong style={{ color: '#3F3C35' }}>📧 Relance</strong>{' '}
            s'occupe tout seul de relancer ceux qui traînent.
          </p>

          {/* Stats cards */}
          <div
            style={{
              marginTop: '26px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEBE7',
                borderRadius: '16px',
                padding: '16px 20px',
                minWidth: '150px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#B45309',
                }}
              >
                14
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                en attente
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEBE7',
                borderRadius: '16px',
                padding: '16px 20px',
                minWidth: '150px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#23211D',
                }}
              >
                182 000 €
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                de valeur en jeu
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEBE7',
                borderRadius: '16px',
                padding: '16px 20px',
                minWidth: '150px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#157347',
                }}
              >
                16
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                acceptés ce mois
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEBE7',
                borderRadius: '16px',
                padding: '16px 20px',
                minWidth: '150px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#4655B0',
                }}
              >
                11
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                relancés par l'agent
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              marginTop: '22px',
              background: '#FFFFFF',
              border: '1px solid #ECEBE7',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 110px 100px',
                gap: '14px',
                padding: '16px 22px 12px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: '#B4B0A6',
                textTransform: 'uppercase',
              }}
            >
              <span>Client</span>
              <span>Relances</span>
              <span style={{ textAlign: 'right' }}>Montant</span>
              <span style={{ textAlign: 'right' }}>Statut</span>
            </div>

            {/* Rows */}
            {devisData.map((devis, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 110px 100px',
                  gap: '14px',
                  alignItems: 'center',
                  padding: '14px 22px',
                  borderTop: '1px solid #F1F0EC',
                }}
              >
                {/* Client column */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: '#F4F4F2',
                      color: '#6F6B61',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {devis.initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {devis.client}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#9A968D',
                      }}
                    >
                      {devis.date}
                    </div>
                  </div>
                </div>

                {/* Relances column */}
                <div>
                  {devis.relances && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '9px',
                        background: '#EEF1FB',
                        color: '#4655B0',
                      }}
                    >
                      {devis.relances}
                    </span>
                  )}
                </div>

                {/* Montant column */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    textAlign: 'right',
                  }}
                >
                  {devis.montant}
                </div>

                {/* Statut column */}
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '9px',
                      background: devis.statutStyle.bg,
                      color: devis.statutStyle.color,
                    }}
                  >
                    {devis.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
