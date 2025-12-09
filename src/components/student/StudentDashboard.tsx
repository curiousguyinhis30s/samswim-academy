'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatTime } from '@/components/ui'

type StudentPageType = 'dashboard' | 'schedule' | 'progress'

interface StudentDashboardProps {
  studentId: number
  onNavigate: (page: StudentPageType) => void
}

// Success stories from other students
const successStories = [
  {
    name: 'Ahmed K.',
    age: '8 years old',
    text: 'I was scared of water but now I can swim 25 meters!',
    achievement: 'Freestyle Champion',
  },
  {
    name: 'Sara M.',
    age: '6 years old',
    text: 'Coach Sam makes swimming so fun. I love my lessons!',
    achievement: 'Water Safety',
  },
  {
    name: 'Omar A.',
    age: '10 years old',
    text: 'I learned butterfly stroke in just 3 months.',
    achievement: 'All Strokes Mastered',
  },
]

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
                  stroke="#2563EB"
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
                className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-700"
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
            className="w-full bg-blue-600 text-white rounded-xl p-5 mb-4 text-left hover:bg-blue-700 transition-colors"
          >
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Next Lesson</p>
            <p className="font-semibold text-lg">
              {serviceTypes.find(s => s.id === nextLesson.serviceTypeId)?.name || 'Swimming Lesson'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
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
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
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
                      className="h-full bg-blue-600 rounded-full"
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Upcoming</h2>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
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
                      isToday ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
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
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Success Stories */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Success Stories</h2>
            <p className="text-xs text-slate-500 mt-0.5">See what other swimmers achieved</p>
          </div>
          <div className="divide-y divide-slate-100">
            {successStories.map((story, index) => (
              <div key={index} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">{story.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 text-sm">{story.name}</p>
                      <span className="text-xs text-slate-400">{story.age}</span>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{story.text}"</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-emerald-700">{story.achievement}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
