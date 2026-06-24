'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import companyConfig from '@/config/company'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path
  }

  const getLinkClasses = (path: string) => {
    return `nav-item ${isActive(path) ? 'active' : ''}`
  }

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col bg-secondary-900 slide-in-left">
      {/* Logo / Header */}
      <div className="h-20 flex items-center px-6 border-b border-secondary-800">
        <div className="flex items-center gap-3">
          {/* Premium violet square logo with BTP text */}
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.3)'
            }}
          >
            <span className="text-white font-bold text-lg tracking-tight">
              {companyConfig.avatar}
            </span>
          </div>
          {/* Company name in white */}
          <span className="font-semibold text-base text-white font-primary">
            {companyConfig.name}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-8">
        <div className="space-y-1">
          <Link href="/" className={getLinkClasses('/')}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Tableau de bord
          </Link>

          <Link href="/devis" className={getLinkClasses('/devis')}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Devis
          </Link>

          <Link href="/chantiers" className={getLinkClasses('/chantiers')}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Chantiers
          </Link>

          <Link href="/agents" className={getLinkClasses('/agents')}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Agents
          </Link>

          <Link href="/agents-3d" className={getLinkClasses('/agents-3d')}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Bureau des Agents
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="px-4 py-5 border-t border-secondary-800 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-secondary-800 cursor-pointer">
          {/* User avatar with dark background instead of gradient */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary-700 shadow-sm"
          >
            <span className="text-white font-semibold text-sm">
              {companyConfig.avatar}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate text-white font-primary">
              {companyConfig.owner}
            </div>
            <div className="text-xs truncate text-gray-400">
              Administrateur
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-red-500/10 text-gray-300 hover:text-red-400 group"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-sm font-medium">Se déconnecter</span>
        </button>
      </div>
    </aside>
  )
}
