'use client'

import Sidebar from '@/components/Sidebar'
import { useState } from 'react'

type ImportStatus = 'idle' | 'uploading' | 'success' | 'error'

interface ImportSection {
  title: string
  description: string
  icon: string
  endpoint: string
  exampleColumns: string[]
}

const importSections: ImportSection[] = [
  {
    title: 'Devis',
    description: 'Importez vos devis depuis votre ERP',
    icon: '📄',
    endpoint: '/api/import/devis',
    exampleColumns: ['client', 'montant', 'date_envoi', 'statut', 'relances'],
  },
  {
    title: 'Chantiers',
    description: 'Importez vos chantiers en cours',
    icon: '🏗️',
    endpoint: '/api/import/chantiers',
    exampleColumns: ['nom', 'montant', 'heures_pointees', 'avancement', 'rentabilite'],
  },
  {
    title: 'Logs Agents',
    description: 'Importez l\'historique d\'activité des agents',
    icon: '📊',
    endpoint: '/api/import/logs',
    exampleColumns: ['agent', 'action', 'timestamp', 'details'],
  },
]

export default function ImportPage() {
  const [status, setStatus] = useState<Record<string, ImportStatus>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})

  const handleFileUpload = async (section: ImportSection, file: File) => {
    const sectionKey = section.title
    setStatus(prev => ({ ...prev, [sectionKey]: 'uploading' }))
    setMessages(prev => ({ ...prev, [sectionKey]: '' }))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(section.endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'import')
      }

      setStatus(prev => ({ ...prev, [sectionKey]: 'success' }))
      setMessages(prev => ({
        ...prev,
        [sectionKey]: `✅ ${data.count} lignes importées avec succès`,
      }))
    } catch (error) {
      setStatus(prev => ({ ...prev, [sectionKey]: 'error' }))
      setMessages(prev => ({
        ...prev,
        [sectionKey]: `❌ ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      }))
    }
  }

  const getStatusColor = (sectionStatus: ImportStatus) => {
    switch (sectionStatus) {
      case 'uploading':
        return '#4655B0'
      case 'success':
        return '#157347'
      case 'error':
        return '#C2353A'
      default:
        return '#6F6B61'
    }
  }

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
            Import de données
          </h1>

          {/* Sous-titre */}
          <p
            style={{
              margin: '10px 0 0',
              fontSize: '16px',
              lineHeight: 1.5,
              color: '#56524A',
              maxWidth: '700px',
            }}
          >
            Importez vos données depuis votre ERP existant en quelques clics. Exportez vos données en CSV/Excel
            depuis votre ERP, puis uploadez-les ici. Les données seront synchronisées automatiquement.
          </p>

          {/* Instructions */}
          <div
            style={{
              marginTop: '26px',
              background: '#EEF1FB',
              border: '1px solid #D1D9F0',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#4655B0', marginBottom: '8px' }}>
              📋 Instructions
            </div>
            <ol
              style={{
                fontSize: '13.5px',
                color: '#3F3C35',
                lineHeight: 1.6,
                margin: 0,
                paddingLeft: '20px',
              }}
            >
              <li>Exportez vos données depuis votre ERP en format CSV ou Excel</li>
              <li>Vérifiez que les colonnes correspondent aux exemples ci-dessous</li>
              <li>Uploadez le fichier dans la section correspondante</li>
              <li>Les données seront automatiquement importées dans votre dashboard</li>
            </ol>
          </div>

          {/* Import sections */}
          <div
            style={{
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {importSections.map((section) => {
              const sectionStatus = status[section.title] || 'idle'
              const message = messages[section.title] || ''

              return (
                <div
                  key={section.title}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #ECEBE7',
                    borderRadius: '20px',
                    padding: '28px 32px',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#F4F4F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {section.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {section.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#9A968D', marginTop: '2px' }}>
                        {section.description}
                      </div>
                    </div>
                  </div>

                  {/* Example columns */}
                  <div
                    style={{
                      marginBottom: '18px',
                      padding: '12px 16px',
                      background: '#F9F9F8',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9A968D', marginBottom: '6px' }}>
                      COLONNES ATTENDUES
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {section.exampleColumns.map((col) => (
                        <span
                          key={col}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #E6E2DA',
                            color: '#6F6B61',
                          }}
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Upload button */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(section, file)
                        }
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                      }}
                      disabled={sectionStatus === 'uploading'}
                    />
                    <button
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: `2px dashed ${getStatusColor(sectionStatus)}`,
                        background: sectionStatus === 'uploading' ? '#F4F4F2' : '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: getStatusColor(sectionStatus),
                        cursor: sectionStatus === 'uploading' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                      disabled={sectionStatus === 'uploading'}
                    >
                      {sectionStatus === 'uploading'
                        ? '⏳ Import en cours...'
                        : '📁 Choisir un fichier CSV ou Excel'}
                    </button>
                  </div>

                  {/* Status message */}
                  {message && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: sectionStatus === 'success' ? '#F0FBF4' : '#FEF1F1',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: sectionStatus === 'success' ? '#157347' : '#C2353A',
                      }}
                    >
                      {message}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Help section */}
          <div
            style={{
              marginTop: '32px',
              padding: '20px 24px',
              background: '#FFFFFF',
              border: '1px solid #ECEBE7',
              borderRadius: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              💡 Besoin d'aide ?
            </div>
            <div style={{ fontSize: '13px', color: '#6F6B61', lineHeight: 1.6 }}>
              Si vos colonnes ne correspondent pas exactement aux exemples ci-dessus, pas de panique ! Le
              système essaiera de les mapper automatiquement. Pour une synchronisation optimale, nous
              recommandons un import hebdomadaire de vos données.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
