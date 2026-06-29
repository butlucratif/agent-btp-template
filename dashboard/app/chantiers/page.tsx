'use client'

import Sidebar from '@/components/Sidebar'

// Données complètes des chantiers extraites du HTML
const chantiersData = [
  {
    nom: 'Extension Pavillon Particulier',
    montant: '2 450 €',
    heures: '24 h pointées',
    avancement: 65,
    rentabilite: '+26 %',
    barColor: '#10B981', // green
  },
  {
    nom: 'Rénovation Cuisine Restaurant',
    montant: '1 850 €',
    heures: '22 h pointées',
    avancement: 48,
    rentabilite: '+23 %',
    barColor: '#E0A93B', // orange
  },
  {
    nom: 'Toiture Maison Individuelle',
    montant: '1 650 €',
    heures: '20 h pointées',
    avancement: 35,
    rentabilite: '+21 %',
    barColor: '#E0A93B', // orange
  },
  {
    nom: 'Terrasse Jardin Particulier',
    montant: '1 200 €',
    heures: '18 h pointées',
    avancement: 28,
    rentabilite: '+24 %',
    barColor: '#E0A93B', // orange
  },
  {
    nom: 'Reprise Façade Boutique',
    montant: '1 950 €',
    heures: '21 h pointées',
    avancement: 15,
    rentabilite: '+26 %',
    barColor: '#7C86D6', // blue
  },
]

export default function ChantiersPage() {
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
            Chantiers
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
            Vos chantiers en cours et leur avancement. Votre salarié{' '}
            <strong style={{ color: '#3F3C35' }}>📊 Rentabilité</strong> calcule la marge de chacun.
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
                minWidth: '160px',
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
                5
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                chantiers actifs
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEBE7',
                borderRadius: '16px',
                padding: '16px 20px',
                minWidth: '160px',
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
                24 %
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                rentabilité moyenne
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEBE7',
                borderRadius: '16px',
                padding: '16px 20px',
                minWidth: '160px',
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
                9 100 €
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#9A968D',
                  marginTop: '3px',
                }}
              >
                de travaux en cours
              </div>
            </div>
          </div>

          {/* Chantiers cards */}
          <div
            style={{
              marginTop: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {chantiersData.map((chantier, index) => (
              <div
                key={index}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #ECEBE7',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                {/* Nom et montant */}
                <div style={{ flex: '1 1 0%', minWidth: '220px' }}>
                  <div
                    style={{
                      fontSize: '15.5px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {chantier.nom}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#9A968D',
                      marginTop: '2px',
                    }}
                  >
                    {chantier.montant} · {chantier.heures}
                  </div>
                </div>

                {/* Avancement */}
                <div style={{ flex: '1 1 0%', minWidth: '200px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '7px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#9A968D' }}>
                      Avancement
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      {chantier.avancement}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '8px',
                      background: '#F1F0EC',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '8px',
                        background: chantier.barColor,
                        width: `${chantier.avancement}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Rentabilité */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ fontSize: '11px', color: '#9A968D' }}>
                    Rentabilité
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      color: '#157347',
                      marginTop: '2px',
                    }}
                  >
                    {chantier.rentabilite}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
