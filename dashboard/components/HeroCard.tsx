interface StatusPill {
  label: string
  count: number
  status: 'actif' | 'pause' | 'error'
}

interface HeroCardProps {
  amount: string
  statusPills: StatusPill[]
}

const statusThemes = {
  actif: {
    badgeBg: '#F0FBF4',
    badgeText: '#157347',
    dot: '#10B981',
  },
  pause: {
    badgeBg: '#F4F4F2',
    badgeText: '#6F6B61',
    dot: '#A8A49B',
  },
  error: {
    badgeBg: '#FEF1F1',
    badgeText: '#C2353A',
    dot: '#E5484D',
  },
}

export default function HeroCard({ amount, statusPills }: HeroCardProps) {
  return (
    <div
      className="w-full"
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECEBE7',
        borderRadius: '22px',
        padding: '34px 36px',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Left: Amount */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#6F6B61',
              letterSpacing: '0.02em',
              marginBottom: '12px',
            }}
          >
            CETTE SEMAINE
          </div>
          <div
            style={{
              fontSize: '54px',
              fontWeight: 800,
              color: '#23211D',
              letterSpacing: '-0.03em',
              lineHeight: '1.1',
              marginBottom: '8px',
            }}
          >
            {amount}
          </div>
          <div
            style={{
              fontSize: '15px',
              color: '#9A968D',
              lineHeight: '1.4',
            }}
          >
            Ils vous ont rapporté
          </div>
        </div>

        {/* Right: Status pills */}
        <div className="flex flex-wrap items-center gap-3">
          {statusPills.map((pill) => {
            const theme = statusThemes[pill.status]
            return (
              <div
                key={pill.status}
                className="inline-flex items-center gap-2.5 font-semibold"
                style={{
                  fontSize: '13px',
                  padding: '10px 16px 10px 14px',
                  borderRadius: '20px',
                  background: theme.badgeBg,
                  color: theme.badgeText,
                }}
              >
                <span className="relative inline-block w-[7px] h-[7px]">
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: theme.dot,
                      animation:
                        pill.status === 'actif'
                          ? 'pulse-dot 2s infinite'
                          : pill.status === 'error'
                            ? 'pulse-dot-red 2s infinite'
                            : 'none',
                    }}
                  />
                </span>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{pill.count}</span>
                <span>{pill.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
