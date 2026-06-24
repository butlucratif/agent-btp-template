'use client'

import { useState } from 'react'

interface TriggerButtonProps {
  agentName: string
  onTrigger?: () => void
}

export function TriggerButton({ agentName, onTrigger }: TriggerButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleTrigger = async () => {
    if (loading) return

    const confirmed = confirm(`Voulez-vous lancer l'agent ${agentName} manuellement ?`)
    if (!confirmed) return

    setLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/agents/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        onTrigger?.()
      } else {
        throw new Error(data.message || 'Erreur lors du déclenchement')
      }
    } catch (error) {
      console.error('Error triggering agent:', error)
      setStatus('error')
    } finally {
      setLoading(false)

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <button
      onClick={handleTrigger}
      disabled={loading}
      className={`
        w-full px-4 py-2.5 rounded-lg font-medium text-sm
        transition-all duration-200
        ${
          loading
            ? 'bg-[#18181b] text-[#52525b] cursor-wait border border-[rgba(255,255,255,0.06)]'
            : status === 'success'
              ? 'bg-[#22c55e] text-white'
              : status === 'error'
                ? 'bg-[#ef4444] text-white'
                : 'bg-transparent text-[#7c3aed] border border-[#7c3aed] hover:bg-[#7c3aed] hover:text-white'
        }
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Lancement...
        </span>
      ) : status === 'success' ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Lancé !
        </span>
      ) : status === 'error' ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Erreur
        </span>
      ) : (
        'Lancer'
      )}
    </button>
  )
}
