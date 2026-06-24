import { SystemStatsBar } from './components/SystemStatsBar'
import { AgentGrid } from './components/AgentGrid'
import { ActivityFeed } from './components/ActivityFeed'

export const metadata = {
  title: 'Cockpit | Agent BTP Dashboard',
  description: 'Centre de contrôle en temps réel pour les agents IA',
}

export default function CockpitPage() {
  return (
    <div className="min-h-screen bg-[#08080a] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Stats bar */}
        <SystemStatsBar />

        {/* Main layout: Agents (60%) + Activity feed (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Agent grid (60% = 3/5) */}
          <div className="lg:col-span-3">
            <AgentGrid />
          </div>

          {/* Activity feed (40% = 2/5) */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 h-[calc(100vh-8rem)] bg-[#111113] rounded-xl p-6 border border-[rgba(255,255,255,0.06)]">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
