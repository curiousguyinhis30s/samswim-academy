'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatTime } from '@/components/ui'

interface StudentScheduleProps {
  studentId: number
}

export function StudentSchedule({ studentId }: StudentScheduleProps) {
  const { bookings, participants, serviceTypes, instructors } = useAppStore()
  const [showPast, setShowPast] = useState(false)

  // Get student's bookings
  const studentBookings = useMemo(() => {
    const studentParticipants = participants.filter(p => p.clientId === studentId)
    const bookingIds = studentParticipants.map(p => p.bookingId)
    return bookings.filter(b => bookingIds.includes(b.id!))
  }, [studentId, participants, bookings])

  // Separate upcoming and past lessons
  const { upcomingLessons, pastLessons } = useMemo(() => {
    const now = new Date()
    const sorted = [...studentBookings].sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    return {
      upcomingLessons: sorted.filter(b => new Date(b.startTime) >= now),
      pastLessons: sorted.filter(b => new Date(b.startTime) < now).reverse()
    }
  }, [studentBookings])

  const lessons = showPast ? pastLessons : upcomingLessons

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">
            {upcomingLessons.length} upcoming · {pastLessons.filter(l => l.status === 'completed').length} completed
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowPast(false)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !showPast
                ? 'bg-ocean-500 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              showPast
                ? 'bg-ocean-500 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Past
          </button>
        </div>

        {/* Lessons List */}
        {lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const service = serviceTypes.find(s => s.id === lesson.serviceTypeId)
              const instructor = instructors.find(u => u.id === lesson.instructorId)
              const lessonDate = new Date(lesson.startTime)
              const isToday = lessonDate.toDateString() === new Date().toDateString()
              const isTomorrow = lessonDate.toDateString() === new Date(Date.now() + 86400000).toDateString()

              return (
                <div key={lesson.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                      isToday ? 'bg-ocean-500 text-white' :
                      isTomorrow ? 'bg-ocean-100 text-ocean-700' :
                      lesson.status === 'completed' ? 'bg-algae-50 text-algae-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      <span className="text-lg font-bold leading-none">{lessonDate.getDate()}</span>
                      <span className="text-[10px] uppercase leading-none mt-0.5">
                        {lessonDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 truncate">{service?.name || 'Lesson'}</p>
                        {isToday && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-ocean-50 text-ocean-600 rounded-full">
                            Today
                          </span>
                        )}
                        {isTomorrow && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                            Tomorrow
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatTime(lessonDate)} · {service?.durationMinutes || 45} min
                      </p>
                      {instructor && (
                        <p className="text-xs text-slate-400 mt-1">Coach {instructor.fullName}</p>
                      )}
                    </div>

                    {showPast && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        lesson.status === 'completed'
                          ? 'bg-algae-50 text-algae-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {lesson.status}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-900 font-medium">No {showPast ? 'past' : 'upcoming'} lessons</p>
            <p className="text-slate-500 text-sm mt-1">
              {showPast ? 'Your lesson history will appear here' : 'Contact your coach to book'}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            Need to reschedule? Contact your coach at least 24 hours in advance.
          </p>
        </div>
      </div>
    </div>
  )
}
