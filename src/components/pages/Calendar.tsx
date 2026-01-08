'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { Button, Modal, Input, Select, formatTime, formatCurrency } from '@/components/ui'
import { LessonDetail } from '@/components/lesson/LessonDetail'
import { FadeIn, SlideIn, StaggerChildren } from '@/lib/animations/gsap-hooks'
import { PoolLane, Stopwatch } from '@/components/icons/SwimmingIcons'

type ViewMode = 'agenda' | 'week'

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function Calendar() {
  const { bookings, clients, serviceTypes, instructors, participants, addBooking, tenant } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('agenda')
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    clientId: '',
    serviceTypeId: '',
    instructorId: '',
    date: '',
    startTime: '',
    notes: '',
  })

  const today = new Date()
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  // Get bookings for selected day (agenda view) or week
  const dayBookings = useMemo(() => {
    return bookings
      .filter(b => isSameDay(new Date(b.startTime), currentDate))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [bookings, currentDate])

  // Get next 7 days of bookings for agenda
  const upcomingBookings = useMemo(() => {
    const next7Days: { date: Date; bookings: typeof bookings }[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() + i)
      const dayBookings = bookings
        .filter(b => isSameDay(new Date(b.startTime), date))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      if (dayBookings.length > 0) {
        next7Days.push({ date, bookings: dayBookings })
      }
    }
    return next7Days
  }, [bookings, currentDate])

  const navigateDay = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + delta)
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  const handleCreateBooking = async () => {
    if (!newBooking.clientId || !newBooking.serviceTypeId) return

    const service = serviceTypes.find(s => s.id?.toString() === newBooking.serviceTypeId)
    const [hours, minutes] = newBooking.startTime.split(':').map(Number)

    const startTime = new Date(newBooking.date)
    startTime.setHours(hours, minutes, 0, 0)

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + (service?.durationMinutes || 45))

    const instructorId = newBooking.instructorId || instructors[0]?.id?.toString() || ''

    await addBooking({
      clientId: newBooking.clientId,
      serviceTypeId: parseInt(newBooking.serviceTypeId),
      instructorId: parseInt(instructorId),
      startTime,
      endTime,
      status: 'confirmed',
      price: service?.pricePerSession || 250,
      notes: newBooking.notes,
    })

    setShowNewBooking(false)
    setNewBooking({
      clientId: '',
      serviceTypeId: '',
      instructorId: '',
      date: '',
      startTime: '',
      notes: '',
    })
  }

  const getBookingDetails = (bookingId: number) => {
    const participant = participants.find(p => p.bookingId === bookingId)
    const client = participant ? clients.find(c => c.id === participant.clientId) : null
    const booking = bookings.find(b => b.id === bookingId)
    const service = booking ? serviceTypes.find(s => s.id === booking.serviceTypeId) : null
    return { client, service, booking }
  }

  const formatDateLabel = (date: Date) => {
    const isToday = isSameDay(date, today)
    const isTomorrow = isSameDay(date, new Date(today.getTime() + 86400000))

    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Wave animation CSS */}
      <style jsx global>{`
        @keyframes wave-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
          }
        }
        .wave-badge {
          animation: wave-pulse 2s ease-in-out infinite;
        }
        .booking-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .booking-card-hover:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">
        {/* Header with SlideIn animation */}
        <SlideIn direction="left" duration={0.6}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <PoolLane size={24} className="text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
                <p className="text-slate-500 text-sm">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewBooking(true)}
              className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </SlideIn>

        {/* Week Selector - Horizontal scroll */}
        <FadeIn delay={0.1}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => navigateDay(-7)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateDay(7)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Pills with StaggerChildren */}
            <StaggerChildren stagger={0.05} y={20} className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {weekDays.map((date, i) => {
                const isSelected = isSameDay(date, currentDate)
                const isToday = isSameDay(date, today)
                const dayBookings = bookings.filter(b => isSameDay(new Date(b.startTime), date))
                const hasBookings = dayBookings.length > 0

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentDate(date)}
                    className={`flex-shrink-0 w-14 py-2 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : isToday
                        ? 'bg-cyan-50 text-cyan-600'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <p className={`text-xs font-medium ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-bold">{date.getDate()}</p>
                    {hasBookings && !isSelected && (
                      <div className="flex justify-center gap-0.5 mt-1">
                        {dayBookings.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1 h-1 rounded-full bg-cyan-400" />
                        ))}
                      </div>
                    )}
                    {hasBookings && isSelected && (
                      <p className="text-xs text-cyan-100 mt-0.5">{dayBookings.length} lessons</p>
                    )}
                  </button>
                )
              })}
            </StaggerChildren>
          </div>
        </FadeIn>

        {/* View Toggle */}
        <FadeIn delay={0.2}>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'agenda' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Week Agenda
            </button>
          </div>
        </FadeIn>

        {/* Content */}
        {viewMode === 'agenda' ? (
          /* Day View */
          <div>
            <FadeIn delay={0.3}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {formatDateLabel(currentDate)}
              </h2>
            </FadeIn>

            {dayBookings.length === 0 ? (
              <FadeIn delay={0.4}>
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-50 rounded-2xl flex items-center justify-center">
                    <PoolLane size={32} className="text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No lessons scheduled</h3>
                  <p className="text-slate-500 text-sm mb-4">Your schedule is clear for this day</p>
                  <button
                    onClick={() => {
                      setNewBooking({
                        ...newBooking,
                        date: currentDate.toISOString().split('T')[0],
                      })
                      setShowNewBooking(true)
                    }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-medium text-sm hover:bg-cyan-700 transition-colors"
                  >
                    Schedule a Lesson
                  </button>
                </div>
              </FadeIn>
            ) : (
              <div className="space-y-3">
                {dayBookings.map((booking, index) => {
                  const { client, service } = getBookingDetails(booking.id!)
                  const startTime = new Date(booking.startTime)
                  const endTime = new Date(booking.endTime)
                  const isNow = startTime <= today && endTime > today
                  const isPast = endTime < today
                  const isCompleted = booking.status === 'completed'

                  return (
                    <FadeIn key={booking.id} delay={0.3 + index * 0.1}>
                      <button
                        onClick={() => setSelectedLessonId(booking.id!)}
                        className={`w-full bg-white rounded-xl p-4 border text-left booking-card-hover ${
                          isCompleted ? 'border-slate-200 opacity-60' :
                          isNow ? 'border-emerald-300 bg-emerald-50' :
                          'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className={`text-center min-w-[60px] ${isCompleted ? 'text-slate-400' : ''}`}>
                            <p className={`text-lg font-bold ${isNow ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {formatTime(startTime)}
                            </p>
                            <p className="text-xs text-slate-500">{service?.durationMinutes || 45} min</p>
                          </div>

                          {/* Divider */}
                          <div className={`w-1 h-12 rounded-full ${
                            isCompleted ? 'bg-slate-300' : isNow ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`} />

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold truncate ${isCompleted ? 'text-slate-400' : 'text-slate-900'}`}>
                                {client?.fullName || 'Unknown Student'}
                              </p>
                              {isNow && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full wave-badge">
                                  Now
                                </span>
                              )}
                              {isCompleted && (
                                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className={`text-sm ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                              {service?.name}
                            </p>
                          </div>

                          {/* Arrow */}
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </FadeIn>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* Week Agenda View */
          <div className="space-y-6">
            {upcomingBookings.length === 0 ? (
              <FadeIn delay={0.3}>
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-50 rounded-2xl flex items-center justify-center">
                    <PoolLane size={32} className="text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No upcoming lessons</h3>
                  <p className="text-slate-500 text-sm mb-4">Schedule your first lesson to get started</p>
                  <button
                    onClick={() => setShowNewBooking(true)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-medium text-sm hover:bg-cyan-700 transition-colors"
                  >
                    Schedule a Lesson
                  </button>
                </div>
              </FadeIn>
            ) : (
              upcomingBookings.map(({ date, bookings: dayBookings }, dayIndex) => (
                <FadeIn key={date.toISOString()} delay={0.3 + dayIndex * 0.1}>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      {formatDateLabel(date)}
                    </h3>
                    <div className="space-y-2">
                      {dayBookings.map((booking, bookingIndex) => {
                        const { client, service } = getBookingDetails(booking.id!)
                        const startTime = new Date(booking.startTime)
                        const isCompleted = booking.status === 'completed'

                        return (
                          <FadeIn key={booking.id} delay={0.4 + dayIndex * 0.1 + bookingIndex * 0.05}>
                            <button
                              onClick={() => setSelectedLessonId(booking.id!)}
                              className={`w-full bg-white rounded-xl p-3 border border-slate-200 text-left booking-card-hover flex items-center gap-3 ${
                                isCompleted ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="text-center min-w-[50px]">
                                <p className="text-sm font-bold text-slate-900">{formatTime(startTime)}</p>
                              </div>
                              <div className="w-1 h-8 rounded-full bg-cyan-500" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">{client?.fullName}</p>
                                <p className="text-xs text-slate-500">{service?.name}</p>
                              </div>
                              {isCompleted && (
                                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </FadeIn>
                        )
                      })}
                    </div>
                  </div>
                </FadeIn>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <Modal
        isOpen={showNewBooking}
        onClose={() => setShowNewBooking(false)}
        title="Schedule Lesson"
        size="md"
      >
        <div className="space-y-5">
          <Select
            label="Student"
            id="client"
            value={newBooking.clientId}
            onChange={(e) => setNewBooking({ ...newBooking, clientId: e.target.value })}
            options={[
              { value: '', label: 'Select a student...' },
              ...clients.map(c => ({ value: c.id!.toString(), label: c.fullName }))
            ]}
          />

          <Select
            label="Lesson Type"
            id="serviceType"
            value={newBooking.serviceTypeId}
            onChange={(e) => setNewBooking({ ...newBooking, serviceTypeId: e.target.value })}
            options={[
              { value: '', label: 'Select lesson type...' },
              ...serviceTypes.map(s => ({
                value: s.id!.toString(),
                label: `${s.name} (${s.durationMinutes} min)`
              }))
            ]}
          />

          {instructors.length > 1 && (
            <Select
              label="Instructor"
              id="instructor"
              value={newBooking.instructorId}
              onChange={(e) => setNewBooking({ ...newBooking, instructorId: e.target.value })}
              options={[
                { value: '', label: 'Select instructor...' },
                ...instructors.map(i => ({ value: i.id!.toString(), label: i.fullName }))
              ]}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              id="date"
              value={newBooking.date}
              onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
            />
            <Input
              type="time"
              label="Time"
              id="startTime"
              value={newBooking.startTime}
              onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowNewBooking(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              onClick={handleCreateBooking}
              disabled={!newBooking.clientId || !newBooking.serviceTypeId || !newBooking.date || !newBooking.startTime}
            >
              Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lesson Detail Modal */}
      {selectedLessonId && (
        <LessonDetail
          bookingId={selectedLessonId}
          onClose={() => setSelectedLessonId(null)}
          onComplete={() => setSelectedLessonId(null)}
        />
      )}
    </div>
  )
}
