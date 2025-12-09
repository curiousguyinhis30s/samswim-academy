'use client'

import { useEffect, useState } from 'react'
import { seedDemoData } from '@/lib/db/seed'
import { useAppStore } from '@/lib/store/app'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/pages/Dashboard'
import { Calendar } from '@/components/pages/Calendar'
import { Clients } from '@/components/pages/Clients'
import { Progress } from '@/components/pages/Progress'
import { Settings } from '@/components/pages/Settings'
import { StudentPortal } from '@/components/student/StudentPortal'

type PageType = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'settings'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [studentPortalId, setStudentPortalId] = useState<number | null>(null)
  const { initialize, isInitialized, tenant } = useAppStore()

  useEffect(() => {
    async function init() {
      try {
        await seedDemoData()
        await initialize()
      } catch (error) {
        console.error('Failed to initialize:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [initialize])

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-bg">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-ocean-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-ocean-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-ocean-400 to-sea-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.5c-2.5 0-4.5-.5-6-1.5s-2.5-2.5-2.5-4.5c0-1.5.5-3 1.5-4s2.5-2 4.5-2c1.5 0 3 .5 4 1.5s1.5 2 1.5 3c0 .5-.5 1-1.5 1h-4c-.5 0-1-.5-1-1s.5-1 1-1h2.5c0-.5-.5-1-1.5-1s-2 .5-2.5 1.5-1 2-1 3c0 1.5.5 2.5 1.5 3s2.5 1 4.5 1 4-.5 5-1.5 1.5-2.5 1.5-4c0-2.5-1-4.5-3-6s-4.5-2.5-7.5-2.5c-1.5 0-3 .5-4 1s-2 1-2.5 1.5c-.5-.5-1-1-1-1.5s0-1 .5-1.5 1-1 2-1.5 2.5-1 4.5-1c3.5 0 6.5 1 8.5 3s3 4.5 3 7.5c0 2.5-1 4.5-3 6s-4.5 2.5-7.5 2.5z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ocean-900 mb-2">Sam&apos;s Swim Academy</h2>
          <p className="text-ocean-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show Student Portal if a student is selected
  if (studentPortalId !== null) {
    return (
      <StudentPortal
        studentId={studentPortalId}
        onExit={() => setStudentPortalId(null)}
      />
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'calendar':
        return <Calendar />
      case 'clients':
        return <Clients onViewAsStudent={setStudentPortalId} />
      case 'progress':
        return <Progress />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen ocean-bg">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {/* Main content - no margin on mobile, ml-64 on lg screens where sidebar is always visible */}
      <main className="min-h-screen lg:ml-64 pt-16 lg:pt-0">
        {renderPage()}
      </main>
    </div>
  )
}
