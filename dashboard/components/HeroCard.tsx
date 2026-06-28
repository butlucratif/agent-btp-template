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
    badgeBorder: '#D5F0DF',
    badgeText: '#157347',
    dot: '#10B981',
  },
  pause: {
    badgeBg: '#F4F4F2',
    badgeBorder: '#E4E3E0',
    badgeText: '#6F6B61',
    dot: '#A8A49B',
  },
  error: {
    badgeBg: '#FEF1F1',
    badgeBorder: '#F2D6D6',
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
              color: '#9A968D',
              fontWeight: 500,
            }}
          >
            Cette semaine, ils vous ont rapporté
          </div>
          <div
            style={{
              fontSize: '54px',
              fontWeight: 800,
              color: '#23211D',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '6px',
            }}
          >
            {amount}
          </div>
          <div
            style={{
              fontSize: '14.5px',
              color: '#56524A',
              marginTop: '8px',
              lineHeight: 1.5,
            }}
          >
            de devis relancés et de chantiers signés — pendant que vous étiez sur le terrain.
          </div>
        </div>

        {/* Right: Status pills */}
        <div className="flex flex-wrap items-center gap-3">
          {statusPills.map((pill) => {
            const theme = statusThemes[pill.status]
            return (
              <div
                key={pill.status}
                className="inline-flex items-center gap-2.5"
                style={{
                  fontSize: '13px',
                  padding: '13px 16px',
                  borderRadius: '14px',
                  background: theme.badgeBg,
                  border: `1px solid ${theme.badgeBorder}`,
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
                <span style={{ fontWeight: 500 }}>{pill.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
