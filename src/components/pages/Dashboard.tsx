'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatTime } from '@/components/ui'
import { LessonDetail } from '@/components/lesson/LessonDetail'

type PageType = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'settings'

interface DashboardProps {
  onNavigate: (page: PageType) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { clients, bookings, participants, serviceTypes, updateBooking, updateAttendance, assessments, skills } = useAppStore()
  const [checkingIn, setCheckingIn] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  // Get today's date boundaries
  const { today, tomorrow, now } = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { today, tomorrow, now }
  }, [])

  // Today's bookings sorted by time
  const todaysBookings = useMemo(() => {
    return bookings
      .filter((b) => new Date(b.startTime) >= today && new Date(b.startTime) < tomorrow)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [bookings, today, tomorrow])

  // Find the next/current lesson (the focus)
  const focusLesson = useMemo(() => {
    // First priority: currently happening
    const current = todaysBookings.find(b => {
      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      return start <= now && end > now && b.status !== 'completed'
    })
    if (current) return { booking: current, status: 'now' as const }

    // Second priority: next upcoming
    const upcoming = todaysBookings.find(b => {
      const start = new Date(b.startTime)
      return start > now && b.status === 'confirmed'
    })
    if (upcoming) return { booking: upcoming, status: 'upcoming' as const }

    // Third priority: first uncompleted of the day
    const uncompleted = todaysBookings.find(b => b.status !== 'completed')
    if (uncompleted) return { booking: uncompleted, status: 'pending' as const }

    return null
  }, [todaysBookings, now])

  // Get client details for a booking
  const getBookingDetails = (bookingId?: number) => {
    if (!bookingId) return { client: null, service: null }
    const participant = participants.find((p) => p.bookingId === bookingId)
    const client = participant ? clients.find((c) => c.id === participant.clientId) : null
    const booking = bookings.find(b => b.id === bookingId)
    const service = booking ? serviceTypes.find((s) => s.id === booking.serviceTypeId) : null
    return { client, service, participant }
  }

  // Quick check-in handler
  const handleCheckIn = async (bookingId: number) => {
    setCheckingIn(bookingId)
    const participant = participants.find(p => p.bookingId === bookingId)

    // Mark as present (checked in)
    if (participant) {
      await updateAttendance(participant.id!, 'present')
    }

    setTimeout(() => setCheckingIn(null), 500)
  }

  // Complete lesson handler
  const handleComplete = async (bookingId: number) => {
    setCheckingIn(bookingId)
    await updateBooking(bookingId, { status: 'completed' })

    // Mark all participants as completed
    const bookingParticipants = participants.filter(p => p.bookingId === bookingId)
    for (const p of bookingParticipants) {
      await updateAttendance(p.id!, 'present')
    }

    setTimeout(() => setCheckingIn(null), 500)
  }

  // Stats
  const stats = useMemo(() => {
    const completed = todaysBookings.filter(b => b.status === 'completed').length
    const remaining = todaysBookings.filter(b => b.status !== 'completed').length
    const checkedIn = todaysBookings.filter(b => {
      const bookingParticipants = participants.filter(p => p.bookingId === b.id)
      return bookingParticipants.some(p => p.attendanceStatus === 'present')
    }).length

    return { completed, remaining, checkedIn, total: todaysBookings.length }
  }, [todaysBookings, participants])

  // Time until next lesson
  const timeUntilNext = useMemo(() => {
    if (!focusLesson || focusLesson.status === 'now') return null
    const start = new Date(focusLesson.booking.startTime)
    const diff = start.getTime() - now.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return `${hours}h ${remainingMins}m`
  }, [focusLesson, now])

  // Greeting based on time
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Students needing attention (recent assessments showing struggle)
  const studentsNeedingAttention = useMemo(() => {
    const strugglingStudents: { client: typeof clients[0], skill: string, level: number }[] = []

    clients.forEach(client => {
      const clientAssessments = assessments.filter(a => a.studentId === client.id)
      const struggling = clientAssessments.find(a => a.level === 1) // Level 1 = struggling
      if (struggling) {
        const skill = skills.find(s => s.id === struggling.skillId)
        if (skill) {
          strugglingStudents.push({ client, skill: skill.name, level: struggling.level })
        }
      }
    })

    return strugglingStudents.slice(0, 3)
  }, [clients, assessments, skills])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-slate-500 text-sm font-medium">{greeting()}</p>
          <h1 className="text-2xl font-bold text-slate-900">Coach Sam</h1>
        </div>

        {/* Today's Focus Card */}
        {focusLesson ? (
          <div className={`rounded-2xl p-5 mb-4 ${
            focusLesson.status === 'now'
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-3">
              {focusLesson.status === 'now' ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span className="text-sm font-medium opacity-90">In Session</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium opacity-90">
                    {timeUntilNext ? `Starts in ${timeUntilNext}` : 'Up Next'}
                  </span>
                </>
              )}
            </div>

            {/* Lesson details */}
            {(() => {
              const { client, service } = getBookingDetails(focusLesson.booking.id)
              return (
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-1">{client?.fullName || 'Student'}</h2>
                  <p className="opacity-80 text-sm">
                    {service?.name || 'Swimming Lesson'} • {formatTime(new Date(focusLesson.booking.startTime))}
                  </p>
                </div>
              )
            })()}

            {/* Quick actions */}
            <div className="flex gap-2">
              {focusLesson.status === 'now' ? (
                <button
                  onClick={() => handleComplete(focusLesson.booking.id!)}
                  disabled={checkingIn === focusLesson.booking.id}
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {checkingIn === focusLesson.booking.id ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Complete Lesson
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleCheckIn(focusLesson.booking.id!)}
                    disabled={checkingIn === focusLesson.booking.id}
                    className="flex-1 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {checkingIn === focusLesson.booking.id ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Check In
                  </button>
                  <button
                    onClick={() => onNavigate('progress')}
                    className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* No lessons state */
          <div className="bg-white rounded-2xl p-6 mb-4 border border-slate-200 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Day Off</h2>
            <p className="text-slate-500 text-sm mb-4">No lessons scheduled for today</p>
            <button
              onClick={() => onNavigate('calendar')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Schedule a Lesson
            </button>
          </div>
        )}

        {/* Today's Progress Bar */}
        {stats.total > 0 && (
          <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Today's Progress</span>
              <span className="text-sm text-slate-500">{stats.completed}/{stats.total} lessons</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => onNavigate('clients')}
            className="bg-white rounded-xl p-4 border border-slate-200 text-center hover:border-slate-300 transition-colors"
          >
            <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Students</p>
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="bg-white rounded-xl p-4 border border-slate-200 text-center hover:border-slate-300 transition-colors"
          >
            <p className="text-2xl font-bold text-slate-900">{stats.remaining}</p>
            <p className="text-xs text-slate-500 mt-0.5">Remaining</p>
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className="bg-white rounded-xl p-4 border border-slate-200 text-center hover:border-slate-300 transition-colors"
          >
            <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
            <p className="text-xs text-slate-500 mt-0.5">Done</p>
          </button>
        </div>

        {/* Today's Schedule */}
        {todaysBookings.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Today's Schedule</h2>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                Full Calendar
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {todaysBookings.map((booking) => {
                const { client, service, participant } = getBookingDetails(booking.id)
                const isPast = new Date(booking.endTime) < now
                const isNow = new Date(booking.startTime) <= now && new Date(booking.endTime) > now
                const isCompleted = booking.status === 'completed'
                const isCheckedIn = participant?.attendanceStatus === 'present'

                return (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedLessonId(booking.id!)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      isCompleted ? 'bg-slate-50 opacity-60' : isNow ? 'bg-emerald-50 hover:bg-emerald-100' : ''
                    }`}
                  >
                    {/* Time */}
                    <div className="text-center min-w-[48px]">
                      <p className={`text-sm font-semibold ${
                        isNow ? 'text-emerald-600' : isCompleted ? 'text-slate-400' : 'text-slate-900'
                      }`}>
                        {formatTime(new Date(booking.startTime))}
                      </p>
                    </div>

                    {/* Status indicator line */}
                    <div className={`w-1 h-10 rounded-full ${
                      isCompleted ? 'bg-slate-300' : isNow ? 'bg-emerald-500' : isCheckedIn ? 'bg-blue-500' : 'bg-slate-200'
                    }`} />

                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isCompleted ? 'text-slate-400' : 'text-slate-900'}`}>
                        {client?.fullName || 'Unknown'}
                      </p>
                      <p className={`text-sm truncate ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                        {service?.name}
                      </p>
                    </div>

                    {/* Status/Action */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <span className="text-slate-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : isNow ? (
                        <button
                          onClick={() => handleComplete(booking.id!)}
                          disabled={checkingIn === booking.id}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Done
                        </button>
                      ) : isCheckedIn ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Ready
                        </span>
                      ) : !isPast ? (
                        <button
                          onClick={() => handleCheckIn(booking.id!)}
                          disabled={checkingIn === booking.id}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Missed</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Students Needing Attention */}
        {studentsNeedingAttention.length > 0 && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="font-semibold text-amber-900">Needs Attention</h2>
            </div>
            <div className="divide-y divide-amber-200">
              {studentsNeedingAttention.map(({ client, skill }) => (
                <div key={client.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-amber-800">{client.fullName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900 truncate">{client.fullName}</p>
                    <p className="text-sm text-amber-700 truncate">Struggling with: {skill}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('progress')}
                    className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions FAB-style at bottom */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => onNavigate('clients')}
            className="w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            title="Add Student"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            title="New Lesson"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Lesson Detail Modal */}
        {selectedLessonId && (
          <LessonDetail
            bookingId={selectedLessonId}
            onClose={() => setSelectedLessonId(null)}
            onComplete={() => setSelectedLessonId(null)}
          />
        )}
      </div>
    </div>
  )
}
