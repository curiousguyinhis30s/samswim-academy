'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store/app'
import {
  SwimmerFreestyle,
  PoolLane,
  Goggles,
  Trophy,
  WaterDrop,
  Stopwatch,
  SwimCap,
  WaterWaves,
} from '@/components/icons/SwimmingIcons'

type PageType = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'payments' | 'analytics' | 'settings'

interface SidebarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  onLogout?: () => void
}

const navItems = [
  {
    id: 'dashboard' as PageType,
    label: 'Dashboard',
    Icon: SwimmerFreestyle,
  },
  {
    id: 'calendar' as PageType,
    label: 'Schedule',
    Icon: PoolLane,
  },
  {
    id: 'clients' as PageType,
    label: 'Students',
    Icon: Goggles,
  },
  {
    id: 'progress' as PageType,
    label: 'Progress',
    Icon: Trophy,
  },
  {
    id: 'payments' as PageType,
    label: 'Payments',
    Icon: WaterDrop,
  },
  {
    id: 'analytics' as PageType,
    label: 'Analytics',
    Icon: Stopwatch,
  },
  {
    id: 'settings' as PageType,
    label: 'Settings',
    Icon: SwimCap,
  },
]

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { currentUser } = useAppStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [rippleKey, setRippleKey] = useState<string | null>(null)

  const handleNavigate = useCallback((page: PageType) => {
    // Trigger ripple effect
    setRippleKey(page)
    setTimeout(() => setRippleKey(null), 600)

    onNavigate(page)
    setIsMobileOpen(false)
  }, [onNavigate])

  return (
    <>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes wave-flow {
          0% { transform: translateX(-5px); opacity: 0.3; }
          50% { transform: translateX(0); opacity: 0.6; }
          100% { transform: translateX(5px); opacity: 0.3; }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes icon-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .nav-item-hover:hover .nav-icon {
          transform: scale(1.1);
          transition: transform 0.2s ease-out;
        }

        .nav-item-hover:active .nav-icon {
          animation: icon-bounce 0.3s ease-out;
        }

        .logo-float {
          animation: float 3s ease-in-out infinite;
        }

        .wave-decoration {
          animation: wave-flow 2s ease-in-out infinite;
        }

        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(20, 184, 166, 0.3);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }

        .nav-icon {
          transition: transform 0.2s ease-out, color 0.2s ease-out;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-3 ml-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-md logo-float">
            <SwimmerFreestyle size={18} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">Sam's Swim Academy</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-50
        transform transition-transform duration-200 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 relative overflow-hidden">
          {/* Decorative waves */}
          <div className="absolute -bottom-2 left-0 right-0 opacity-20 wave-decoration">
            <WaterWaves size={200} className="text-teal-500" />
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/30 logo-float">
              <SwimmerFreestyle size={22} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight">Sam's Swim Academy</h1>
              <p className="text-xs text-teal-600 font-medium">Coach Portal</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            const IconComponent = item.Icon
            const showRipple = rippleKey === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`
                  nav-item-hover relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 overflow-hidden
                  ${isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:shadow-sm'
                  }
                `}
              >
                {/* Ripple effect */}
                {showRipple && (
                  <span className="ripple-effect absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2" />
                )}

                <span className={`nav-icon relative z-10 ${isActive ? 'text-white' : 'text-teal-500 group-hover:text-teal-600'}`}>
                  <IconComponent size={20} className={isActive ? 'text-white drop-shadow-sm' : ''} />
                </span>
                <span className="relative z-10">{item.label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100 bg-gradient-to-t from-slate-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {currentUser?.fullName?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {currentUser?.fullName || 'Coach Sam'}
              </p>
              <p className="text-xs text-teal-600 font-medium">Coach</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
