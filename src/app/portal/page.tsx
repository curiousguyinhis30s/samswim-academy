'use client'

import { useEffect, useState, useRef } from 'react'
import { seedDemoData } from '@/lib/db/seed'
import { useAppStore } from '@/lib/store/app'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Pages
import { Login } from '@/components/pages/Login'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/pages/Dashboard'
import { Calendar } from '@/components/pages/Calendar'
import { Clients } from '@/components/pages/Clients'
import { Progress } from '@/components/pages/Progress'
import { Payments } from '@/components/pages/Payments'
import { Settings } from '@/components/pages/Settings'
import { StudentPortal } from '@/components/student/StudentPortal'
import { Analytics } from '@/components/admin/Analytics'

type AppView = 'login' | 'admin' | 'student'
type AdminPage = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'payments' | 'analytics' | 'settings'

function PortalContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<AppView>('login')
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard')
  const [studentId, setStudentId] = useState<number | null>(null)
  const initRef = useRef(false)

  const { initialize, clients } = useAppStore()

  // Initialize app data - only once
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      // Check for reset flag in URL
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('reset') === 'true') {
        console.log('Resetting database...')
        const Dexie = (await import('dexie')).default
        await Dexie.delete('samswim-academy')
        // Remove reset param and reload
        window.location.href = window.location.pathname
        return
      }

      // Check if we've had a recent crash and force reset
      const lastCrash = localStorage.getItem('samswim-db-crash')
      if (lastCrash) {
        const crashTime = parseInt(lastCrash, 10)
        const now = Date.now()
        // If crashed in last 30 seconds, force reset
        if (now - crashTime < 30000) {
          console.log('Recent crash detected, forcing database reset...')
          localStorage.removeItem('samswim-db-crash')
          const Dexie = (await import('dexie')).default
          await Dexie.delete('samswim-academy')
          // Clear IndexedDB directly as fallback
          if (indexedDB.databases) {
            const dbs = await indexedDB.databases()
            for (const db of dbs) {
              if (db.name?.includes('samswim')) {
                indexedDB.deleteDatabase(db.name)
              }
            }
          }
          window.location.reload()
          return
        }
        localStorage.removeItem('samswim-db-crash')
      }

      const timeout = setTimeout(() => {
        console.warn('Initialization timeout - proceeding without data')
        setIsLoading(false)
      }, 5000)

      try {
        await seedDemoData()
        await initialize()
      } catch (error) {
        console.error('Failed to initialize:', error)
        // Mark crash time for next reload
        localStorage.setItem('samswim-db-crash', Date.now().toString())
        // If initialization fails, try clearing and reloading
        try {
          const Dexie = (await import('dexie')).default
          await Dexie.delete('samswim-academy')
          // Also try direct IndexedDB delete
          indexedDB.deleteDatabase('samswim-academy')
          console.log('Cleared corrupted database, reloading...')
          window.location.reload()
          return
        } catch (clearError) {
          console.error('Failed to clear database:', clearError)
        }
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Handle login
  const handleLogin = (type: 'admin' | 'student', userId?: number) => {
    if (type === 'admin') {
      setView('admin')
    } else if (type === 'student' && userId) {
      setStudentId(userId)
      setView('student')
    }
  }

  // Handle logout - go back to landing on port 3050
  const handleLogout = () => {
    window.location.href = 'http://localhost:3050'
  }

  // Handle back to landing
  const handleBack = () => {
    window.location.href = 'http://localhost:3050'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading Portal...</p>
        </div>
      </div>
    )
  }

  // Login page
  if (view === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onBack={handleBack}
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
      case 'payments':
        return <Payments />
      case 'analytics':
        return <Analytics />
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

// Wrap with ErrorBoundary for graceful database error handling
export default function PortalPage() {
  return (
    <ErrorBoundary>
      <PortalContent />
    </ErrorBoundary>
  )
}
