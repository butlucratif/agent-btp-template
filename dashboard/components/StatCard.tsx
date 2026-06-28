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
  delay?: number
}

export default function StatCard({
  title,
  value,
  change,
  subtitle,
  icon,
  trend = 'neutral',
  delay = 0
}: StatCardProps) {
  // Format value if it's a number
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('fr-FR')
    : value

  // Determine trend color and icon
  const isPositive = change && change.value > 0
  const isNegative = change && change.value < 0

  return (
    <div
      className="stat-card fade-in"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Header with icon */}
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <div className="icon-wrapper">
            {icon}
          </div>
        )}
      </div>

      {/* HUGE Monospace Value */}
      <div className="stat-value">
        {formattedValue}
      </div>

      {/* Change badge + Subtitle */}
      <div className="flex items-center gap-3 flex-wrap">
        {change && (
          <span className={`stat-badge ${isNegative ? 'negative' : ''}`}>
            {/* Arrow SVG */}
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              {isPositive ? (
                // Up arrow
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              ) : isNegative ? (
                // Down arrow
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              ) : null}
            </svg>
            {isPositive ? '+' : ''}{change.value.toFixed(1)}%
          </span>
        )}

        {subtitle && (
          <span className="stat-footer">{subtitle}</span>
        )}
      </div>
    </div>
  )
}
