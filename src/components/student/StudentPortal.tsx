'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/app'
import { StudentDashboard } from './StudentDashboard'
import { StudentSchedule } from './StudentSchedule'
import { StudentProgress } from './StudentProgress'
import { StudentDrills } from './StudentDrills'

type StudentPageType = 'dashboard' | 'schedule' | 'drills' | 'progress'

interface StudentPortalProps {
  studentId: number
  onExit: () => void
}

export function StudentPortal({ studentId, onExit }: StudentPortalProps) {
  const { clients, tenant } = useAppStore()
  const [currentPage, setCurrentPage] = useState<StudentPageType>('dashboard')

  const student = clients.find(c => c.id === studentId)

  if (!student) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600">Student not found</p>
          <button onClick={onExit} className="mt-4 text-ocean-500 hover:text-ocean-600 text-sm font-medium">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'dashboard' as StudentPageType, label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'schedule' as StudentPageType, label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'drills' as StudentPageType, label: 'Drills', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'progress' as StudentPageType, label: 'Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <StudentDashboard studentId={studentId} onNavigate={setCurrentPage} />
      case 'schedule':
        return <StudentSchedule studentId={studentId} />
      case 'drills':
        return <StudentDrills studentId={studentId} />
      case 'progress':
        return <StudentProgress studentId={studentId} />
      default:
        return <StudentDashboard studentId={studentId} onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-xs text-slate-500 font-medium">Student Portal</p>
            <p className="font-semibold text-slate-900">{student.fullName}</p>
          </div>
          <button
            onClick={onExit}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Exit student portal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Page Content */}
      <main>
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center py-3 px-4 min-w-[70px] transition-colors ${
                  isActive ? 'text-teal-500' : 'text-slate-400'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
