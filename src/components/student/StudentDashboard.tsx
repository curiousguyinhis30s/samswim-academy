'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatTime } from '@/components/ui'

type StudentPageType = 'dashboard' | 'schedule' | 'progress'

interface StudentDashboardProps {
  studentId: number
  onNavigate: (page: StudentPageType) => void
}

export function StudentDashboard({ studentId, onNavigate }: StudentDashboardProps) {
  const { clients, bookings, participants, serviceTypes, assessments, skills, skillCategories } = useAppStore()

  const student = clients.find(c => c.id === studentId)

  // Get student's bookings
  const studentBookings = useMemo(() => {
    const studentParticipants = participants.filter(p => p.clientId === studentId)
    const bookingIds = studentParticipants.map(p => p.bookingId)
    return bookings.filter(b => bookingIds.includes(b.id!))
  }, [studentId, participants, bookings])

  // Get upcoming lessons
  const upcomingLessons = useMemo(() => {
    const now = new Date()
    return studentBookings
      .filter(b => new Date(b.startTime) >= now && b.status === 'confirmed')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3)
  }, [studentBookings])

  const nextLesson = upcomingLessons[0]

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const studentAssessments = assessments.filter(a => a.studentId === studentId)
    const totalSkills = skills.length
    const masteredSkills = studentAssessments.filter(a => a.level >= 3).length
    const inProgressSkills = studentAssessments.filter(a => a.level > 0 && a.level < 3).length
    const percentage = totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0
    return { totalSkills, masteredSkills, inProgressSkills, percentage }
  }, [studentId, assessments, skills])

  const completedLessons = studentBookings.filter(b => b.status === 'completed').length

  // Get skills by category
  const skillsByCategory = useMemo(() => {
    const studentAssessments = assessments.filter(a => a.studentId === studentId)
    return skillCategories.map(category => {
      const categorySkills = skills.filter(s => s.categoryId === category.id)
      const mastered = categorySkills.filter(skill => {
        const assessment = studentAssessments.find(a => a.skillId === skill.id)
        return assessment && assessment.level >= 3
      }).length
      const total = categorySkills.length
      const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0
      return { ...category, mastered, total, percentage }
    })
  }, [skillCategories, skills, assessments, studentId])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">

        {/* Simple Greeting */}
        <div className="mb-6">
          <p className="text-slate-500 text-sm font-medium">{greeting()}</p>
          <h1 className="text-2xl font-bold text-slate-900">{student?.fullName.split(' ')[0]}</h1>
        </div>

        {/* Progress Ring */}
        <div className="bg-white rounded-xl p-5 mb-4 border border-slate-200">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#1E5AA8"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${progressStats.percentage * 2.14} 214`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{progressStats.percentage}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-slate-900 font-semibold">Overall Progress</p>
              <p className="text-slate-500 text-sm">{progressStats.masteredSkills} of {progressStats.totalSkills} skills</p>
              <button
                onClick={() => onNavigate('progress')}
                className="mt-2 text-sm text-ocean-500 font-medium hover:text-ocean-600"
              >
                View details →
              </button>
            </div>
          </div>
        </div>

        {/* Next Lesson */}
        {nextLesson && (
          <button
            onClick={() => onNavigate('schedule')}
            className="w-full bg-ocean-500 text-white rounded-xl p-5 mb-4 text-left hover:bg-ocean-600 transition-colors"
          >
            <p className="text-ocean-200 text-xs font-medium uppercase tracking-wide mb-1">Next Lesson</p>
            <p className="font-semibold text-lg">
              {serviceTypes.find(s => s.id === nextLesson.serviceTypeId)?.name || 'Swimming Lesson'}
            </p>
            <p className="text-ocean-200 text-sm mt-1">
              {new Date(nextLesson.startTime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })} at {formatTime(new Date(nextLesson.startTime))}
            </p>
          </button>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-2xl font-bold text-slate-900">{progressStats.masteredSkills}</p>
            <p className="text-xs text-slate-500 mt-0.5">Mastered</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-2xl font-bold text-slate-900">{completedLessons}</p>
            <p className="text-xs text-slate-500 mt-0.5">Lessons</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-2xl font-bold text-slate-900">{upcomingLessons.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Upcoming</p>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Skills</h2>
            <button
              onClick={() => onNavigate('progress')}
              className="text-sm text-ocean-500 font-medium hover:text-ocean-600"
            >
              See all
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {skillsByCategory.slice(0, 4).map((category) => (
              <div key={category.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.mastered}/{category.total}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ocean-500 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-8 text-right">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Lessons */}
        {upcomingLessons.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Upcoming</h2>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-sm text-ocean-500 font-medium hover:text-ocean-600"
              >
                Calendar
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingLessons.map((lesson) => {
                const service = serviceTypes.find(s => s.id === lesson.serviceTypeId)
                const lessonDate = new Date(lesson.startTime)
                const isToday = lessonDate.toDateString() === new Date().toDateString()

                return (
                  <div key={lesson.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs ${
                      isToday ? 'bg-ocean-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <span className="font-bold leading-none">{lessonDate.getDate()}</span>
                      <span className="uppercase text-[10px] leading-none mt-0.5">
                        {lessonDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{service?.name || 'Lesson'}</p>
                      <p className="text-xs text-slate-500">{formatTime(lessonDate)}</p>
                    </div>
                    {isToday && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-ocean-50 text-ocean-600 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
