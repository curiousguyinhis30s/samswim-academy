'use client'

import { useMemo, useState, useEffect } from 'react'
import { AttendanceStreak } from '@/lib/db'
import { useAppStore } from '@/lib/store/app'

interface StudentStreaksProps {
  studentId: number
}

// Level tier configuration
const LEVEL_TIERS = [
  { minLevel: 1, maxLevel: 5, name: 'Tadpole', icon: '🐸', color: 'from-lime-400 to-green-500' },
  { minLevel: 6, maxLevel: 10, name: 'Guppy', icon: '🐠', color: 'from-cyan-400 to-teal-500' },
  { minLevel: 11, maxLevel: 20, name: 'Dolphin', icon: '🐬', color: 'from-blue-400 to-indigo-500' },
  { minLevel: 21, maxLevel: 35, name: 'Shark', icon: '🦈', color: 'from-purple-400 to-violet-500' },
  { minLevel: 36, maxLevel: 999, name: 'Aquaman', icon: '🔱', color: 'from-amber-400 to-orange-500' },
]

// Streak milestones
const STREAK_MILESTONES = [
  { days: 7, label: '1 Week', icon: '🔥', reward: 50 },
  { days: 14, label: '2 Weeks', icon: '⚡', reward: 100 },
  { days: 30, label: '1 Month', icon: '🌟', reward: 250 },
  { days: 60, label: '2 Months', icon: '💫', reward: 500 },
  { days: 90, label: '3 Months', icon: '👑', reward: 1000 },
  { days: 180, label: '6 Months', icon: '🏆', reward: 2500 },
  { days: 365, label: '1 Year', icon: '🎖️', reward: 5000 },
]

// XP required per level (increases progressively)
function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Get motivational message based on streak
function getMotivationalMessage(streak: number): { message: string; emoji: string } {
  if (streak === 0) return { message: 'Start your streak today!', emoji: '🚀' }
  if (streak < 3) return { message: 'Great start! Keep it up!', emoji: '💪' }
  if (streak < 7) return { message: 'You\'re on fire!', emoji: '🔥' }
  if (streak < 14) return { message: 'Incredible dedication!', emoji: '⭐' }
  if (streak < 30) return { message: 'You\'re unstoppable!', emoji: '🌊' }
  if (streak < 60) return { message: 'Swimming legend in the making!', emoji: '🏊' }
  if (streak < 90) return { message: 'Elite swimmer status!', emoji: '🥇' }
  return { message: 'You\'re absolutely legendary!', emoji: '👑' }
}

// Get tier info for level
function getTierForLevel(level: number) {
  return LEVEL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || LEVEL_TIERS[0]
}

export function StudentStreaks({ studentId }: StudentStreaksProps) {
  const { bookings, participants } = useAppStore()
  const [animateStreak, setAnimateStreak] = useState(false)
  const [animateXp, setAnimateXp] = useState(false)

  // Calculate streak data from bookings
  const streakData = useMemo((): AttendanceStreak => {
    const studentParticipants = participants.filter(p => p.clientId === studentId)
    const studentBookingIds = studentParticipants.map(p => p.bookingId)
    const completedBookings = bookings
      .filter(b => studentBookingIds.includes(b.id!) && b.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    const totalLessonsAttended = completedBookings.length
    const xpPoints = totalLessonsAttended * 25 // 25 XP per lesson base

    // Calculate current streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let perfectWeeks = 0

    // Sort by date ascending for streak calculation
    const sortedBookings = [...completedBookings].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    const attendedDates = new Set<string>()
    sortedBookings.forEach(booking => {
      const dateStr = new Date(booking.startTime).toISOString().split('T')[0]
      attendedDates.add(dateStr)
    })

    // Calculate streaks from dates
    const sortedDates = Array.from(attendedDates).sort()
    let lastDateValue: Date | null = null

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr)
      if (lastDateValue) {
        const dayDiff = Math.floor((currentDate.getTime() - lastDateValue.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff <= 7) { // Consider lessons within a week as maintaining streak
          tempStreak++
        } else {
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak
      lastDateValue = currentDate
    }

    // Check if streak is current (last lesson within 7 days)
    if (lastDateValue) {
      const daysSinceLastLesson = Math.floor((Date.now() - lastDateValue.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastLesson <= 7) {
        currentStreak = tempStreak
      }
    }

    // Calculate perfect weeks (simplified)
    perfectWeeks = Math.floor(totalLessonsAttended / 4)

    // Calculate level from XP
    let level = 1
    let remainingXp = xpPoints
    while (remainingXp >= getXpForLevel(level)) {
      remainingXp -= getXpForLevel(level)
      level++
    }

    return {
      tenantId: 1,
      studentId,
      currentStreak,
      longestStreak,
      lastAttendanceDate: lastDateValue || undefined,
      totalLessonsAttended,
      perfectWeeks,
      level,
      xpPoints,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }, [studentId, bookings, participants])

  // Generate weekly calendar data (last 12 weeks)
  const weeklyCalendar = useMemo(() => {
    const studentParticipants = participants.filter(p => p.clientId === studentId)
    const studentBookingIds = studentParticipants.map(p => p.bookingId)
    const completedBookings = bookings.filter(
      b => studentBookingIds.includes(b.id!) && b.status === 'completed'
    )

    const attendedDates = new Set(
      completedBookings.map(b => new Date(b.startTime).toISOString().split('T')[0])
    )

    const weeks: { date: Date; attended: boolean; isToday: boolean; isFuture: boolean }[][] = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 84) // 12 weeks ago
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of that week

    for (let week = 0; week < 12; week++) {
      const weekDays: { date: Date; attended: boolean; isToday: boolean; isFuture: boolean }[] = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + week * 7 + day)
        const dateStr = date.toISOString().split('T')[0]
        weekDays.push({
          date,
          attended: attendedDates.has(dateStr),
          isToday: dateStr === today.toISOString().split('T')[0],
          isFuture: date > today,
        })
      }
      weeks.push(weekDays)
    }
    return weeks
  }, [studentId, bookings, participants])

  // Check if streak is about to break
  const streakWarning = useMemo(() => {
    if (!streakData.lastAttendanceDate || streakData.currentStreak === 0) return null
    const daysSinceLastLesson = Math.floor(
      (Date.now() - new Date(streakData.lastAttendanceDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLastLesson >= 5 && daysSinceLastLesson < 7) {
      return { daysLeft: 7 - daysSinceLastLesson, urgent: true }
    }
    if (daysSinceLastLesson >= 4) {
      return { daysLeft: 7 - daysSinceLastLesson, urgent: false }
    }
    return null
  }, [streakData.lastAttendanceDate, streakData.currentStreak])

  // Trigger animations on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateStreak(true), 300)
    const timer2 = setTimeout(() => setAnimateXp(true), 600)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const tier = getTierForLevel(streakData.level)
  const motivation = getMotivationalMessage(streakData.currentStreak)

  // XP progress to next level
  const currentLevelXp = getXpForLevel(streakData.level)
  let xpInCurrentLevel = streakData.xpPoints
  for (let i = 1; i < streakData.level; i++) {
    xpInCurrentLevel -= getXpForLevel(i)
  }
  const xpProgress = Math.min((xpInCurrentLevel / currentLevelXp) * 100, 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">

        {/* Streak Warning Banner */}
        {streakWarning && (
          <div className={`mb-4 p-4 rounded-xl border-2 ${
            streakWarning.urgent
              ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 animate-pulse'
              : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{streakWarning.urgent ? '🚨' : '⏰'}</span>
              <div>
                <p className={`font-bold ${streakWarning.urgent ? 'text-red-700' : 'text-amber-700'}`}>
                  Streak at risk!
                </p>
                <p className={`text-sm ${streakWarning.urgent ? 'text-red-600' : 'text-amber-600'}`}>
                  {streakWarning.daysLeft} day{streakWarning.daysLeft > 1 ? 's' : ''} left to keep your {streakData.currentStreak}-day streak alive!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Streak Display */}
        <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-turquoise-500 rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden">
          {/* Animated background bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-float-slow" />
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-white/10 rounded-full animate-float-medium" />
            <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-white/10 rounded-full animate-float-fast" />
          </div>

          <div className="relative z-10">
            {/* Current Streak */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`text-6xl sm:text-8xl font-black text-white drop-shadow-lg ${
                  animateStreak ? 'animate-bounce-in' : 'opacity-0'
                }`}>
                  {streakData.currentStreak}
                </span>
                <span className={`text-5xl sm:text-7xl ${animateStreak ? 'animate-wiggle' : 'opacity-0'}`}>
                  🔥
                </span>
              </div>
              <p className="text-white/90 text-lg font-semibold">Day Streak</p>
              <p className="text-white/70 text-sm mt-1">
                {motivation.emoji} {motivation.message}
              </p>
            </div>

            {/* Longest Streak */}
            <div className="flex justify-center gap-6 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-white">{streakData.longestStreak}</p>
                <p className="text-white/70 text-xs">Best Streak</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-white">{streakData.totalLessonsAttended}</p>
                <p className="text-white/70 text-xs">Total Lessons</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-2xl font-bold text-white">{streakData.perfectWeeks}</p>
                <p className="text-white/70 text-xs">Perfect Weeks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level & XP Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            {/* Level Badge */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg ${
              animateXp ? 'animate-pop-in' : 'opacity-0'
            }`}>
              <span className="text-3xl">{tier.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r ${tier.color} text-white`}>
                  LEVEL {streakData.level}
                </span>
                <span className="text-lg font-bold text-slate-900">{tier.name}</span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {streakData.xpPoints.toLocaleString()} XP Total
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress to Level {streakData.level + 1}</span>
              <span>{Math.round(xpInCurrentLevel)} / {currentLevelXp} XP</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tier.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: animateXp ? `${xpProgress}%` : '0%' }}
              />
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700 mb-2">How XP is earned:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                <span>+25 XP per lesson</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                <span>+50 XP streak bonus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span>+100 XP milestone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <span>+250 XP badge earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Calendar (GitHub style) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Attendance History</h3>
            <span className="text-xs text-slate-500">Last 12 weeks</span>
          </div>

          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-4" />
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="w-5 text-center text-[10px] text-slate-400 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex flex-col gap-1">
            {weeklyCalendar.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-1 items-center">
                <div className="w-4 text-[9px] text-slate-400">
                  {weekIndex % 4 === 0 && new Date(week[0].date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-5 h-5 rounded-sm transition-all hover:scale-125 cursor-default ${
                      day.isFuture
                        ? 'bg-slate-50'
                        : day.isToday
                        ? day.attended
                          ? 'bg-teal-500 ring-2 ring-teal-300 ring-offset-1'
                          : 'bg-slate-200 ring-2 ring-slate-300 ring-offset-1'
                        : day.attended
                        ? 'bg-teal-500 hover:bg-teal-600'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                    title={`${day.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}${day.attended ? ' - Attended' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-100" />
              <span>No lesson</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-teal-500" />
              <span>Attended</span>
            </div>
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Streak Milestones</h3>

          <div className="space-y-3">
            {STREAK_MILESTONES.map((milestone) => {
              const isAchieved = streakData.longestStreak >= milestone.days
              const isNext = !isAchieved && streakData.currentStreak < milestone.days &&
                STREAK_MILESTONES.filter(m => m.days < milestone.days).every(m => streakData.longestStreak >= m.days)
              const progress = isAchieved ? 100 : (streakData.currentStreak / milestone.days) * 100

              return (
                <div
                  key={milestone.days}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isAchieved
                      ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200'
                      : isNext
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 animate-pulse-subtle'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isAchieved
                        ? 'bg-gradient-to-br from-teal-400 to-cyan-500'
                        : isNext
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                        : 'bg-slate-200'
                    }`}>
                      <span className={`text-xl ${isAchieved || isNext ? '' : 'grayscale opacity-50'}`}>
                        {milestone.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-sm ${isAchieved ? 'text-teal-700' : 'text-slate-700'}`}>
                          {milestone.label}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isAchieved
                            ? 'bg-teal-100 text-teal-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          +{milestone.reward} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isAchieved
                                ? 'bg-gradient-to-r from-teal-400 to-cyan-500'
                                : isNext
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-12 text-right">
                          {isAchieved ? '✓' : `${milestone.days} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Level Tiers Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Swimmer Ranks</h3>

          <div className="grid grid-cols-5 gap-2">
            {LEVEL_TIERS.map((t) => {
              const isCurrentTier = t.name === tier.name
              const isUnlocked = streakData.level >= t.minLevel

              return (
                <div
                  key={t.name}
                  className={`text-center p-3 rounded-xl transition-all ${
                    isCurrentTier
                      ? 'bg-gradient-to-br ' + t.color + ' shadow-lg scale-105 ring-2 ring-white'
                      : isUnlocked
                      ? 'bg-slate-100'
                      : 'bg-slate-50 opacity-50'
                  }`}
                >
                  <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{t.icon}</span>
                  <p className={`text-[10px] font-bold mt-1 ${
                    isCurrentTier ? 'text-white' : 'text-slate-600'
                  }`}>
                    {t.name}
                  </p>
                  <p className={`text-[9px] ${
                    isCurrentTier ? 'text-white/70' : 'text-slate-400'
                  }`}>
                    Lv {t.minLevel}{t.maxLevel < 999 ? `-${t.maxLevel}` : '+'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes pop-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-wiggle {
          animation: wiggle 0.6s ease-in-out 0.3s;
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
