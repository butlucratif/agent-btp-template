import { SystemStatsBar } from './components/SystemStatsBar'
import { AgentGrid } from './components/AgentGrid'
import { ActivityFeed } from './components/ActivityFeed'

export const metadata = {
  title: 'Cockpit | Agent BTP Dashboard',
  description: 'Centre de contrôle en temps réel pour les agents IA',
}

export default function CockpitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f172a] to-[#1e1b4b] relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7c3aed] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#fbbf24] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto p-8 space-y-8">
        {/* Premium Hero Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent animate-shimmer">
            Wall Street Command Center
          </h1>
          <p className="text-[#a1a1aa] text-lg">Centre de contrôle premium pour vos agents IA</p>
        </div>

        {/* Premium Stats Bar */}
        <SystemStatsBar />

        {/* Main layout: Agents (60%) + Activity feed (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Agent grid (60% = 3/5) */}
          <div className="lg:col-span-3">
            <AgentGrid />
          </div>

          {/* Activity feed (40% = 2/5) */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 h-[calc(100vh-10rem)]">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
