'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatTime } from '@/components/ui'
import { LessonDetail } from '@/components/lesson/LessonDetail'
import { StatCard, GlassCard, CollapsibleCard, ProgressRing, FadeIn } from '@/components/ui/AnimatedComponents'
import { SwimmerFreestyle, Trophy, Stopwatch, PoolLane, Medal } from '@/components/icons/SwimmingIcons'

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

  // Completion rate percentage
  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0
    return Math.round((stats.completed / stats.total) * 100)
  }, [stats])

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
        <FadeIn>
          <div className="mb-6">
            <p className="text-slate-500 text-sm font-medium">{greeting()}</p>
            <h1 className="text-2xl font-bold text-slate-900">Coach Sam</h1>
          </div>
        </FadeIn>

        {/* Today's Focus Card */}
        <FadeIn delay={0.1}>
          {focusLesson ? (
            <div className={`rounded-2xl p-5 mb-4 ${
              focusLesson.status === 'now'
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-teal-500 to-turquoise-500 text-white'
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
                    <Stopwatch size={16} className="opacity-70" />
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
                      className="flex-1 py-3 bg-white text-teal-600 hover:bg-teal-50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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
                <SwimmerFreestyle size={28} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Day Off</h2>
              <p className="text-slate-500 text-sm mb-4">No lessons scheduled for today</p>
              <button
                onClick={() => onNavigate('calendar')}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-turquoise-500 text-white rounded-xl font-medium text-sm hover:from-teal-600 hover:to-turquoise-600 transition-colors"
              >
                Schedule a Lesson
              </button>
            </div>
          )}
        </FadeIn>

        {/* Today's Progress Bar with ProgressRing */}
        <FadeIn delay={0.2}>
          {stats.total > 0 && (
            <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Today's Progress</span>
                    <span className="text-sm text-slate-500">{stats.completed}/{stats.total} lessons</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <ProgressRing
                    value={completionRate}
                    size={56}
                    strokeWidth={5}
                    color="#10B981"
                  />
                </div>
              </div>
            </div>
          )}
        </FadeIn>

        {/* Quick Stats - Animated StatCards */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => onNavigate('clients')}
              className="text-left hover:scale-[1.02] transition-transform"
            >
              <StatCard
                value={clients.length}
                label="Students"
                icon={<SwimmerFreestyle size={20} />}
                className="h-full"
              />
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-left hover:scale-[1.02] transition-transform"
            >
              <StatCard
                value={stats.remaining}
                label="Remaining"
                icon={<PoolLane size={20} />}
                className="h-full"
              />
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className="text-left hover:scale-[1.02] transition-transform"
            >
              <StatCard
                value={stats.completed}
                label="Done"
                icon={<Trophy size={20} />}
                className="h-full"
              />
            </button>
          </div>
        </FadeIn>

        {/* Today's Schedule - Collapsible */}
        <FadeIn delay={0.4}>
          {todaysBookings.length > 0 && (
            <CollapsibleCard
              title="Today's Schedule"
              icon={<PoolLane size={20} />}
              defaultOpen={true}
              className="mb-4"
            >
              <div className="flex items-center justify-end mb-3">
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-sm text-teal-600 font-medium hover:text-teal-700"
                >
                  Full Calendar
                </button>
              </div>
              <div className="divide-y divide-slate-100 -mx-5 px-5">
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
                      className={`w-full flex items-center gap-3 py-3 text-left hover:bg-slate-50 transition-colors ${
                        isCompleted ? 'bg-slate-50 opacity-60' : isNow ? 'bg-emerald-50 hover:bg-emerald-100 -mx-5 px-5 rounded-lg' : ''
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
                        isCompleted ? 'bg-slate-300' : isNow ? 'bg-emerald-500' : isCheckedIn ? 'bg-teal-500' : 'bg-slate-200'
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleComplete(booking.id!)
                            }}
                            disabled={checkingIn === booking.id}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Done
                          </button>
                        ) : isCheckedIn ? (
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                            Ready
                          </span>
                        ) : !isPast ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCheckIn(booking.id!)
                            }}
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
            </CollapsibleCard>
          )}
        </FadeIn>

        {/* Students Needing Attention - Collapsible */}
        <FadeIn delay={0.5}>
          {studentsNeedingAttention.length > 0 && (
            <CollapsibleCard
              title="Needs Attention"
              icon={<Medal size={20} className="text-amber-500" />}
              defaultOpen={false}
              className="mb-4 border-amber-200 bg-amber-50/50"
            >
              <div className="divide-y divide-amber-200 -mx-5 px-5">
                {studentsNeedingAttention.map(({ client, skill }) => (
                  <div key={client.id} className="flex items-center gap-3 py-3">
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
            </CollapsibleCard>
          )}
        </FadeIn>

        {/* Quick Actions FAB-style - Glass Card styling */}
        <FadeIn delay={0.6}>
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
            <GlassCard blur="md" opacity={0.9} className="p-0">
              <button
                onClick={() => onNavigate('clients')}
                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 transition-colors"
                title="Add Student"
              >
                <SwimmerFreestyle size={24} />
              </button>
            </GlassCard>
            <button
              onClick={() => onNavigate('calendar')}
              className="w-14 h-14 bg-gradient-to-r from-teal-500 to-turquoise-500 rounded-full shadow-lg flex items-center justify-center text-white hover:from-teal-600 hover:to-turquoise-600 transition-colors"
              title="New Lesson"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </FadeIn>

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
