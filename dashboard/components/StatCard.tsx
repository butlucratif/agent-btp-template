interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({
  title,
  value,
  change,
  subtitle,
  icon,
  trend = 'neutral'
}: StatCardProps) {
  // Format value if it's a number
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('fr-FR')
    : value

  // Determine trend color and icon
  const isPositive = change && change.value > 0
  const isNegative = change && change.value < 0

  return (
    <div className="stat-card fade-in">
      {/* Header */}
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <div className="icon-wrapper">
            {icon}
          </div>
        )}
      </div>

      {/* Value - HUGE */}
      <div className="stat-value">
        {formattedValue}
      </div>

      {/* Change badge + Subtitle */}
      <div className="flex items-center gap-3">
        {change && (
          <span className={`stat-badge ${isNegative ? 'negative' : ''}`}>
            {/* Arrow icon */}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              ) : isNegative ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              ) : null}
            </svg>
            {Math.abs(change.value).toFixed(1)}%
          </span>
        )}

        {subtitle && (
          <span className="stat-footer">{subtitle}</span>
        )}
      </div>
    </div>
  )
}
