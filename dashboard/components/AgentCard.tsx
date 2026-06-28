interface AgentCardProps {
  emoji: string
  name: string
  role: string
  status: 'actif' | 'pause' | 'error'
  report: string
  stat1: {
    value: string
    label: string
    isMoney?: boolean
  }
  stat2: {
    value: string
    label: string
    isMoney?: boolean
  }
  nextAction: string
  onClick?: () => void
}

const statusThemes = {
  actif: {
    label: 'Au travail',
    badgeBg: '#F0FBF4',
    badgeText: '#157347',
    dot: '#10B981',
    border: '#ECEBE7',
    pulse: true,
  },
  pause: {
    label: 'En pause',
    badgeBg: '#F4F4F2',
    badgeText: '#6F6B61',
    dot: '#A8A49B',
    border: '#ECEBE7',
    pulse: false,
  },
  error: {
    label: 'À regarder',
    badgeBg: '#FEF1F1',
    badgeText: '#C2353A',
    dot: '#E5484D',
    border: '#F2D6D6',
    pulse: true,
  },
}

export default function AgentCard({
  emoji,
  name,
  role,
  status,
  report,
  stat1,
  stat2,
  nextAction,
  onClick,
}: AgentCardProps) {
  const theme = statusThemes[status]

  return (
    <a
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      className="block min-w-0 no-underline cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(31,41,55,0.18)]"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        padding: '22px 24px',
        color: 'inherit',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div
          className="flex-shrink-0 flex items-center justify-center text-2xl"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: '#F8F8F7',
            border: '1px solid #ECEBE7',
          }}
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="font-bold"
            style={{
              fontSize: '15.5px',
              letterSpacing: '-0.01em',
            }}
          >
            {name}
          </div>
          <div
            className="mt-0.5"
            style={{
              fontSize: '12.5px',
              color: '#9A968D',
            }}
          >
            {role}
          </div>
        </div>
        <span
          className="flex-shrink-0 inline-flex items-center gap-1.5 font-semibold"
          style={{
            fontSize: '12px',
            padding: '5px 11px 5px 9px',
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
                animation: theme.pulse
                  ? status === 'error'
                    ? 'pulse-dot-red 2s infinite'
                    : 'pulse-dot 2s infinite'
                  : 'none',
              }}
            />
          </span>
          {theme.label}
        </span>
      </div>

      {/* Report */}
      <p
        className="m-0 mt-4"
        style={{
          fontSize: '15px',
          lineHeight: '1.55',
          color: '#3F3C35',
        }}
      >
        {report}
      </p>

      {/* Stats */}
      <div
        className="mt-[18px] pt-4 grid grid-cols-2 gap-3.5"
        style={{
          borderTop: '1px solid #F1F0EC',
        }}
      >
        <div>
          <div
            className="font-extrabold"
            style={{
              fontSize: '23px',
              letterSpacing: '-0.02em',
              color: stat1.isMoney ? '#157347' : '#23211D',
            }}
          >
            {stat1.value}
          </div>
          <div
            className="mt-0.5"
            style={{
              fontSize: '12px',
              color: '#9A968D',
              lineHeight: '1.3',
            }}
          >
            {stat1.label}
          </div>
        </div>
        <div>
          <div
            className="font-extrabold"
            style={{
              fontSize: '23px',
              letterSpacing: '-0.02em',
              color: stat2.isMoney ? '#157347' : '#23211D',
            }}
          >
            {stat2.value}
          </div>
          <div
            className="mt-0.5"
            style={{
              fontSize: '12px',
              color: '#9A968D',
              lineHeight: '1.3',
            }}
          >
            {stat2.label}
          </div>
        </div>
      </div>

      {/* Next action */}
      <div className="mt-[15px] flex items-center gap-2">
        <span
          className="flex-shrink-0 rounded-full"
          style={{
            width: '6px',
            height: '6px',
            background: theme.dot,
          }}
        />
        <span
          style={{
            fontSize: '13px',
            color: '#9A968D',
          }}
        >
          {nextAction}
        </span>
      </div>
    </a>
  )
}
