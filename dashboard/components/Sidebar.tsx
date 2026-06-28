'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// SVG Icons
const icons = {
  accueil: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/>',
  salaries: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M9 2h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
  devis: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 13h6M9 17h4"/>',
  chantiers: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>',
  bureau: '<path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  import: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
}

const navigation = [
  { section: 'Pilotage', items: [
    { name: 'Accueil', href: '/', icon: icons.accueil },
    { name: 'Mes salariés', href: '/agents', icon: icons.salaries, hasAlert: true },
  ]},
  { section: 'Mon entreprise', items: [
    { name: 'Devis', href: '/devis', icon: icons.devis },
    { name: 'Chantiers', href: '/chantiers', icon: icons.chantiers },
  ]},
  { section: 'En plus', items: [
    { name: 'Le bureau des agents', href: '/bureau', icon: icons.bureau },
    { name: 'Import de données', href: '/import', icon: icons.import },
  ]},
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
          padding: '24px 22px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: '#23211D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '15px',
          }}
        >
          B
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '14.5px',
              letterSpacing: '-0.01em',
            }}
          >
            BâtiPilot
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#9A968D',
              fontWeight: 500,
            }}
          >
            Vos salariés virtuels
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          padding: '6px 12px',
          flex: 1,
        }}
      >
        {navigation.map((section) => (
          <div key={section.section}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                letterSpacing: '0.07em',
                color: '#B4B0A6',
                textTransform: 'uppercase',
                padding: '14px 12px 5px',
              }}
            >
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="no-underline block transition-all duration-200"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '10px 12px',
                    borderRadius: '11px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#23211D' : '#6F6B61',
                    background: isActive ? '#F4F4F2' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      display: 'inline-flex',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>`,
                    }}
                  />
                  <span>{item.name}</span>
                  {item.hasAlert && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#E5484D',
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
