'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/app'

type PageType = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'settings'

interface SidebarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  onLogout?: () => void
}

const navItems = [
  {
    id: 'dashboard' as PageType,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'calendar' as PageType,
    label: 'Calendar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: 'clients' as PageType,
    label: 'Clients',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 'progress' as PageType,
    label: 'Progress',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: 'settings' as PageType,
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { tenant, currentUser } = useAppStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleNavigate = (page: PageType) => {
    onNavigate(page)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button - HAMBURGER ON LEFT */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5 ml-3">
          <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.5c-2.5 0-4.5-.5-6-1.5s-2.5-2.5-2.5-4.5c0-1.5.5-3 1.5-4s2.5-2 4.5-2c1.5 0 3 .5 4 1.5s1.5 2 1.5 3c0 .5-.5 1-1.5 1h-4c-.5 0-1-.5-1-1s.5-1 1-1h2.5c0-.5-.5-1-1.5-1s-2 .5-2.5 1.5-1 2-1 3c0 1.5.5 2.5 1.5 3s2.5 1 4.5 1 4-.5 5-1.5 1.5-2.5 1.5-4c0-2.5-1-4.5-3-6s-4.5-2.5-7.5-2.5c-1.5 0-3 .5-4 1s-2 1-2.5 1.5c-.5-.5-1-1-1-1.5s0-1 .5-1.5 1-1 2-1.5 2.5-1 4.5-1c3.5 0 6.5 1 8.5 3s3 4.5 3 7.5c0 2.5-1 4.5-3 6s-4.5 2.5-7.5 2.5z"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-900">{tenant?.name || "Sam's Swim Academy"}</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 z-40"
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
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.5c-2.5 0-4.5-.5-6-1.5s-2.5-2.5-2.5-4.5c0-1.5.5-3 1.5-4s2.5-2 4.5-2c1.5 0 3 .5 4 1.5s1.5 2 1.5 3c0 .5-.5 1-1.5 1h-4c-.5 0-1-.5-1-1s.5-1 1-1h2.5c0-.5-.5-1-1.5-1s-2 .5-2.5 1.5-1 2-1 3c0 1.5.5 2.5 1.5 3s2.5 1 4.5 1 4-.5 5-1.5 1.5-2.5 1.5-4c0-2.5-1-4.5-3-6s-4.5-2.5-7.5-2.5c-1.5 0-3 .5-4 1s-2 1-2.5 1.5c-.5-.5-1-1-1-1.5s0-1 .5-1.5 1-1 2-1.5 2.5-1 4.5-1c3.5 0 6.5 1 8.5 3s3 4.5 3 7.5c0 2.5-1 4.5-3 6s-4.5 2.5-7.5 2.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 text-sm">{tenant?.name || "Sam's Swim Academy"}</h1>
              <p className="text-xs text-slate-500">Dubai, UAE</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ocean-500 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Today Stats */}
        <div className="px-3 pb-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Today</p>
            <div className="flex items-center justify-between text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">5</p>
                <p className="text-xs text-slate-500">Lessons</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-lg font-bold text-algae-500">3</p>
                <p className="text-xs text-slate-500">Clients</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-lg font-bold text-coral-500">2</p>
                <p className="text-xs text-slate-500">New</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-ocean-700">
                {currentUser?.fullName?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-coral-500 hover:bg-coral-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
