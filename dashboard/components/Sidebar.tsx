'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: '📊' },
  { name: 'Agents', href: '/agents', icon: '🤖' },
  { name: 'Devis', href: '/devis', icon: '📝' },
  { name: 'Chantiers', href: '/chantiers', icon: '🏗️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: '236px',
        background: '#FFFFFF',
        borderRight: '1px solid #ECEBE7',
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: '32px 24px',
          borderBottom: '1px solid #ECEBE7',
        }}
      >
        <div
          style={{
            fontSize: '19px',
            fontWeight: 800,
            color: '#23211D',
            letterSpacing: '-0.01em',
          }}
        >
          BâtiPilot
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#9A968D',
            marginTop: '4px',
          }}
        >
          Agents IA
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '24px 16px', flex: 1 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name} style={{ marginBottom: '6px' }}>
                <Link
                  href={item.href}
                  className="no-underline block transition-all duration-200"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    fontSize: '14.5px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#157347' : '#6F6B61',
                    background: isActive ? '#F0FBF4' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div
        style={{
          padding: '24px',
          borderTop: '1px solid #ECEBE7',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#F8F8F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            👨‍💼
          </div>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#23211D',
              }}
            >
              Léon
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#9A968D',
              }}
            >
              Gérant
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
