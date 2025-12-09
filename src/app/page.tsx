'use client'

import { useEffect, useState, useRef } from 'react'
import { seedDemoData } from '@/lib/db/seed'
import { useAppStore } from '@/lib/store/app'

// Pages
import { Landing } from '@/components/pages/Landing'
import { Login } from '@/components/pages/Login'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/pages/Dashboard'
import { Calendar } from '@/components/pages/Calendar'
import { Clients } from '@/components/pages/Clients'
import { Progress } from '@/components/pages/Progress'
import { Settings } from '@/components/pages/Settings'
import { StudentPortal } from '@/components/student/StudentPortal'

type AppView = 'landing' | 'login' | 'admin' | 'student'
type AdminPage = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'settings'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<AppView>('landing')
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard')
  const [studentId, setStudentId] = useState<number | null>(null)
  const initRef = useRef(false)

  const { initialize, clients } = useAppStore()

  // Initialize app data - only once
  useEffect(() => {
    // Guard: Prevent double initialization
    if (initRef.current) return
    initRef.current = true

    async function init() {
      // Guard: Only run on client
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      // Set a timeout to ensure we don't get stuck forever
      const timeout = setTimeout(() => {
        console.warn('Initialization timeout - proceeding without data')
        setIsLoading(false)
      }, 5000)

      try {
        console.log('Starting initialization...')
        await seedDemoData()
        console.log('Demo data seeded')
        await initialize()
        console.log('Store initialized')
      } catch (error) {
        console.error('Failed to initialize:', error)
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }
    init()
  }, []) // Empty dependency - run only once on mount

  // Handle login
  const handleLogin = (type: 'admin' | 'student', userId?: number) => {
    if (type === 'admin') {
      setView('admin')
    } else if (type === 'student' && userId) {
      setStudentId(userId)
      setView('student')
    }
  }

  // Handle logout
  const handleLogout = () => {
    setView('landing')
    setStudentId(null)
    setAdminPage('dashboard')
  }

  // Loading state - only wait for local loading, not isInitialized
  // This allows showing landing page even without tenant data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-ocean-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Landing page
  if (view === 'landing') {
    return <Landing onEnterPortal={() => setView('login')} />
  }

  // Login page
  if (view === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onBack={() => setView('landing')}
        clients={clients}
      />
    )
  }

  // Student portal
  if (view === 'student' && studentId) {
    return (
      <StudentPortal
        studentId={studentId}
        onExit={handleLogout}
      />
    )
  }

  // Admin dashboard
  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setAdminPage} />
      case 'calendar':
        return <Calendar />
      case 'clients':
        return (
          <Clients
            onViewAsStudent={(id) => {
              setStudentId(id)
              setView('student')
            }}
          />
        )
      case 'progress':
        return <Progress />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={setAdminPage} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={adminPage}
        onNavigate={setAdminPage}
        onLogout={handleLogout}
      />
      <main className="min-h-screen lg:ml-64 pt-16 lg:pt-0">
        {renderAdminPage()}
      </main>
    </div>
  )
}
