'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Badge, StudentBadge, AttendanceStreak } from '@/lib/db'

interface StudentBadgesProps {
  studentId: number
}

// Mock data for demonstration
const mockBadges: Badge[] = [
  // Skill badges
  { id: 1, tenantId: 1, name: 'Water Baby', description: 'Complete all water safety skills', icon: '🏊', category: 'skill', requirement: { type: 'skill_mastered', value: 5 }, points: 100, rarity: 'common', isActive: true, createdAt: new Date() },
  { id: 2, tenantId: 1, name: 'Stroke Master', description: 'Master all basic strokes', icon: '🏅', category: 'skill', requirement: { type: 'skill_mastered', value: 10 }, points: 250, rarity: 'rare', isActive: true, createdAt: new Date() },
  { id: 3, tenantId: 1, name: 'Freestyle Champion', description: 'Master freestyle technique', icon: '🥇', category: 'skill', requirement: { type: 'skill_mastered', value: 1, skillId: 1 }, points: 150, rarity: 'rare', isActive: true, createdAt: new Date() },
  { id: 4, tenantId: 1, name: 'Butterfly Legend', description: 'Master the butterfly stroke', icon: '🦋', category: 'skill', requirement: { type: 'skill_mastered', value: 1, skillId: 11 }, points: 300, rarity: 'epic', isActive: true, createdAt: new Date() },
  { id: 5, tenantId: 1, name: 'Complete Swimmer', description: 'Master all swimming skills', icon: '👑', category: 'skill', requirement: { type: 'skill_mastered', value: 20 }, points: 500, rarity: 'legendary', isActive: true, createdAt: new Date() },

  // Attendance badges
  { id: 6, tenantId: 1, name: 'First Splash', description: 'Complete your first lesson', icon: '💦', category: 'attendance', requirement: { type: 'lessons_completed', value: 1 }, points: 25, rarity: 'common', isActive: true, createdAt: new Date() },
  { id: 7, tenantId: 1, name: 'Getting Started', description: 'Complete 5 lessons', icon: '⭐', category: 'attendance', requirement: { type: 'lessons_completed', value: 5 }, points: 50, rarity: 'common', isActive: true, createdAt: new Date() },
  { id: 8, tenantId: 1, name: 'Dedicated Swimmer', description: 'Complete 25 lessons', icon: '🌟', category: 'attendance', requirement: { type: 'lessons_completed', value: 25 }, points: 200, rarity: 'rare', isActive: true, createdAt: new Date() },
  { id: 9, tenantId: 1, name: 'Swimming Star', description: 'Complete 50 lessons', icon: '💫', category: 'attendance', requirement: { type: 'lessons_completed', value: 50 }, points: 400, rarity: 'epic', isActive: true, createdAt: new Date() },
  { id: 10, tenantId: 1, name: 'Swimming Legend', description: 'Complete 100 lessons', icon: '🏆', category: 'attendance', requirement: { type: 'lessons_completed', value: 100 }, points: 1000, rarity: 'legendary', isActive: true, createdAt: new Date() },

  // Milestone badges
  { id: 11, tenantId: 1, name: 'Week Warrior', description: 'Attend lessons for 2 weeks straight', icon: '🔥', category: 'milestone', requirement: { type: 'streak_days', value: 14 }, points: 75, rarity: 'common', isActive: true, createdAt: new Date() },
  { id: 12, tenantId: 1, name: 'Month Master', description: 'Maintain a 30-day streak', icon: '📅', category: 'milestone', requirement: { type: 'streak_days', value: 30 }, points: 200, rarity: 'rare', isActive: true, createdAt: new Date() },
  { id: 13, tenantId: 1, name: 'Consistency King', description: 'Maintain a 90-day streak', icon: '👑', category: 'milestone', requirement: { type: 'streak_days', value: 90 }, points: 500, rarity: 'epic', isActive: true, createdAt: new Date() },

  // Special badges
  { id: 14, tenantId: 1, name: 'Speed Demon', description: 'Beat your personal best', icon: '⚡', category: 'special', requirement: { type: 'personal_best', value: 1 }, points: 50, rarity: 'common', isActive: true, createdAt: new Date() },
  { id: 15, tenantId: 1, name: 'Record Breaker', description: 'Beat your PB 5 times', icon: '📈', category: 'special', requirement: { type: 'personal_best', value: 5 }, points: 150, rarity: 'rare', isActive: true, createdAt: new Date() },
  { id: 16, tenantId: 1, name: 'Elite Performer', description: 'Beat your PB 10 times', icon: '🚀', category: 'special', requirement: { type: 'personal_best', value: 10 }, points: 300, rarity: 'epic', isActive: true, createdAt: new Date() },
]

const mockEarnedBadges: StudentBadge[] = [
  { id: 1, tenantId: 1, studentId: 1, badgeId: 1, earnedAt: new Date('2024-11-15'), notified: true, createdAt: new Date() },
  { id: 2, tenantId: 1, studentId: 1, badgeId: 6, earnedAt: new Date('2024-10-01'), notified: true, createdAt: new Date() },
  { id: 3, tenantId: 1, studentId: 1, badgeId: 7, earnedAt: new Date('2024-10-20'), notified: true, createdAt: new Date() },
  { id: 4, tenantId: 1, studentId: 1, badgeId: 11, earnedAt: new Date('2024-11-10'), notified: true, createdAt: new Date() },
  { id: 5, tenantId: 1, studentId: 1, badgeId: 14, earnedAt: new Date('2024-12-01'), notified: true, createdAt: new Date() },
  { id: 6, tenantId: 1, studentId: 1, badgeId: 3, earnedAt: new Date('2024-12-20'), notified: false, createdAt: new Date() }, // New badge!
]

const mockStreak: AttendanceStreak = {
  id: 1,
  tenantId: 1,
  studentId: 1,
  currentStreak: 12,
  longestStreak: 18,
  lastAttendanceDate: new Date(),
  totalLessonsAttended: 23,
  perfectWeeks: 5,
  level: 4,
  xpPoints: 875,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
const LEVEL_NAMES = ['Rookie', 'Beginner', 'Swimmer', 'Aquanaut', 'Dolphin', 'Shark', 'Whale', 'Kraken', 'Poseidon', 'Legend', 'Mythical']

const categoryLabels: Record<string, { label: string; icon: string }> = {
  skill: { label: 'Skills', icon: '🎯' },
  attendance: { label: 'Attendance', icon: '📅' },
  milestone: { label: 'Milestones', icon: '🏁' },
  special: { label: 'Special', icon: '✨' },
}

const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', glow: '' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-600', glow: 'shadow-blue-200' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', glow: 'shadow-purple-200' },
  legendary: { bg: 'bg-gradient-to-br from-amber-50 to-yellow-100', border: 'border-amber-400', text: 'text-amber-600', glow: 'shadow-amber-300' },
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <div
      className={`absolute w-3 h-3 ${color} animate-confetti`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  )
}

// Confetti explosion component
function ConfettiExplosion({ onComplete }: { onComplete: () => void }) {
  const colors = ['bg-teal-400', 'bg-turquoise-400', 'bg-amber-400', 'bg-purple-400', 'bg-pink-400', 'bg-blue-400']

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiParticle
          key={i}
          delay={i * 30}
          color={colors[i % colors.length]}
        />
      ))}
    </div>
  )
}

// Badge card component
function BadgeCard({
  badge,
  isEarned,
  earnedAt,
  isNew,
  onClick
}: {
  badge: Badge
  isEarned: boolean
  earnedAt?: Date
  isNew?: boolean
  onClick: () => void
}) {
  const rarity = rarityColors[badge.rarity]

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full aspect-square rounded-2xl border-2 p-3
        transition-all duration-300 transform
        ${isEarned
          ? `${rarity.bg} ${rarity.border} hover:scale-105 hover:shadow-lg ${rarity.glow ? `shadow-md ${rarity.glow}` : ''}`
          : 'bg-slate-100 border-slate-200 opacity-50 grayscale'
        }
        ${isNew ? 'animate-badge-pop ring-4 ring-teal-400 ring-opacity-50' : ''}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
      `}
    >
      {/* New badge indicator */}
      {isNew && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}

      {/* Lock icon for unearned */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-200/50 rounded-2xl" />
          <svg className="w-8 h-8 text-slate-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}

      {/* Badge content */}
      <div className={`flex flex-col items-center justify-center h-full ${!isEarned ? 'opacity-30' : ''}`}>
        <span className="text-3xl mb-1">{badge.icon}</span>
        <span className={`text-xs font-semibold text-center leading-tight ${isEarned ? rarity.text : 'text-slate-500'}`}>
          {badge.name}
        </span>
      </div>

      {/* Rarity indicator */}
      {isEarned && badge.rarity !== 'common' && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <div className={`flex gap-0.5`}>
            {['rare', 'epic', 'legendary'].slice(0, ['rare', 'epic', 'legendary'].indexOf(badge.rarity) + 1).map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${
                badge.rarity === 'rare' ? 'bg-blue-400' :
                badge.rarity === 'epic' ? 'bg-purple-400' :
                'bg-amber-400'
              }`} />
            ))}
          </div>
        </div>
      )}
    </button>
  )
}

// Badge detail modal
function BadgeModal({
  badge,
  isEarned,
  earnedAt,
  progress,
  onClose
}: {
  badge: Badge | null
  isEarned: boolean
  earnedAt?: Date
  progress?: { current: number; target: number }
  onClose: () => void
}) {
  if (!badge) return null

  const rarity = rarityColors[badge.rarity]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slideUp`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Badge icon */}
        <div className={`
          w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4
          ${isEarned ? `${rarity.bg} ${rarity.border} border-2` : 'bg-slate-100 border-2 border-slate-200'}
          ${!isEarned ? 'grayscale opacity-50' : ''}
        `}>
          <span className="text-5xl">{badge.icon}</span>
        </div>

        {/* Badge info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{badge.name}</h3>
          <p className="text-sm text-slate-500 mb-3">{badge.description}</p>

          {/* Rarity badge */}
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${rarity.bg} ${rarity.text} border ${rarity.border}`}>
            {badge.rarity === 'legendary' && '✨'}
            {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
            {badge.rarity === 'legendary' && '✨'}
          </span>
        </div>

        {/* Status */}
        {isEarned ? (
          <div className="bg-teal-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-teal-700 mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Earned!</span>
            </div>
            {earnedAt && (
              <p className="text-sm text-teal-600">
                {earnedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-1 text-amber-600">
              <span className="text-lg">+{badge.points}</span>
              <span className="text-sm">XP</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{progress?.current || 0} / {progress?.target || badge.requirement.value}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-turquoise-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((progress?.current || 0) / (progress?.target || badge.requirement.value)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">
              +{badge.points} XP when earned
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function StudentBadges({ studentId }: StudentBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasSeenNewBadge, setHasSeenNewBadge] = useState(false)

  // Get earned badge IDs
  const earnedBadgeIds = useMemo(() =>
    new Set(mockEarnedBadges.map(eb => eb.badgeId)),
    []
  )

  // Get new (unnotified) badges
  const newBadgeIds = useMemo(() =>
    new Set(mockEarnedBadges.filter(eb => !eb.notified).map(eb => eb.badgeId)),
    []
  )

  // Calculate XP progress to next level
  const xpProgress = useMemo(() => {
    const currentLevel = mockStreak.level
    const currentXP = mockStreak.xpPoints
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || currentThreshold + 500
    const progress = currentXP - currentThreshold
    const needed = nextThreshold - currentThreshold
    return {
      current: progress,
      needed,
      percentage: Math.min((progress / needed) * 100, 100),
      nextLevel: currentLevel + 1,
    }
  }, [])

  // Filter badges by category
  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') return mockBadges
    return mockBadges.filter(b => b.category === selectedCategory)
  }, [selectedCategory])

  // Group badges by earned/unearned
  const { earnedBadges, unearnedBadges } = useMemo(() => {
    const earned = filteredBadges.filter(b => earnedBadgeIds.has(b.id!))
    const unearned = filteredBadges.filter(b => !earnedBadgeIds.has(b.id!))
    return { earnedBadges: earned, unearnedBadges: unearned }
  }, [filteredBadges, earnedBadgeIds])

  // Show confetti for new badges
  useEffect(() => {
    if (newBadgeIds.size > 0 && !hasSeenNewBadge) {
      setShowConfetti(true)
    }
  }, [newBadgeIds.size, hasSeenNewBadge])

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false)
    setHasSeenNewBadge(true)
  }, [])

  const getEarnedDate = (badgeId: number) => {
    const earned = mockEarnedBadges.find(eb => eb.badgeId === badgeId)
    return earned?.earnedAt
  }

  // Calculate mock progress for unearned badges
  const getBadgeProgress = (badge: Badge) => {
    switch (badge.requirement.type) {
      case 'lessons_completed':
        return { current: mockStreak.totalLessonsAttended, target: badge.requirement.value }
      case 'streak_days':
        return { current: mockStreak.currentStreak, target: badge.requirement.value }
      case 'personal_best':
        return { current: 2, target: badge.requirement.value } // Mock data
      case 'skill_mastered':
        return { current: 6, target: badge.requirement.value } // Mock data
      default:
        return { current: 0, target: badge.requirement.value }
    }
  }

  const categories = ['all', 'skill', 'attendance', 'milestone', 'special']

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/30">
      {/* Confetti animation */}
      {showConfetti && <ConfettiExplosion onComplete={handleConfettiComplete} />}

      {/* Badge detail modal */}
      <BadgeModal
        badge={selectedBadge}
        isEarned={selectedBadge ? earnedBadgeIds.has(selectedBadge.id!) : false}
        earnedAt={selectedBadge ? getEarnedDate(selectedBadge.id!) : undefined}
        progress={selectedBadge ? getBadgeProgress(selectedBadge) : undefined}
        onClose={() => setSelectedBadge(null)}
      />

      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
          <p className="text-slate-500 text-sm mt-1">
            {earnedBadgeIds.size} of {mockBadges.length} badges earned
          </p>
        </div>

        {/* XP & Level Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Level badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-turquoise-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">{mockStreak.level}</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 rounded-full">
                <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                  {LEVEL_NAMES[mockStreak.level - 1] || 'Swimmer'}
                </span>
              </div>
            </div>

            {/* XP Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">XP Progress</span>
                <span className="text-sm text-slate-500">
                  {mockStreak.xpPoints.toLocaleString()} XP
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-turquoise-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-slate-400">Level {mockStreak.level}</span>
                <span className="text-xs text-slate-500">
                  {xpProgress.current} / {xpProgress.needed} to Level {xpProgress.nextLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-bold text-teal-600">{mockStreak.currentStreak}</p>
              <p className="text-xs text-slate-500">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{mockStreak.totalLessonsAttended}</p>
              <p className="text-xs text-slate-500">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{earnedBadgeIds.size}</p>
              <p className="text-xs text-slate-500">Badges</p>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300'
              }`}
            >
              All Badges
            </button>
            {categories.slice(1).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300'
                }`}
              >
                <span>{categoryLabels[cat].icon}</span>
                <span>{categoryLabels[cat].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Earned badges section */}
        {earnedBadges.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Earned</h2>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                {earnedBadges.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {earnedBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={true}
                  earnedAt={getEarnedDate(badge.id!)}
                  isNew={newBadgeIds.has(badge.id!)}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Unearned badges section */}
        {unearnedBadges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Locked</h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                {unearnedBadges.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {unearnedBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={false}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next badge to earn */}
        {unearnedBadges.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-br from-teal-50 to-turquoise-50 rounded-2xl border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl border-2 border-teal-300 flex items-center justify-center shadow-sm">
                <span className="text-2xl">{unearnedBadges[0].icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-teal-700">Next badge</p>
                <p className="font-semibold text-teal-900">{unearnedBadges[0].name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-teal-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          (getBadgeProgress(unearnedBadges[0]).current / getBadgeProgress(unearnedBadges[0]).target) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-teal-600 font-medium">
                    {getBadgeProgress(unearnedBadges[0]).current}/{getBadgeProgress(unearnedBadges[0]).target}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 mb-3">Badge Rarity</p>
          <div className="grid grid-cols-4 gap-2">
            {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
              <div key={rarity} className="text-center">
                <div className={`
                  w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1
                  ${rarityColors[rarity].bg} border ${rarityColors[rarity].border}
                `}>
                  <span className={`text-xs ${rarityColors[rarity].text}`}>
                    {rarity === 'common' ? '●' : rarity === 'rare' ? '●●' : rarity === 'epic' ? '●●●' : '★'}
                  </span>
                </div>
                <p className={`text-[10px] font-medium ${rarityColors[rarity].text}`}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes badge-pop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-confetti {
          animation: confetti 2.5s ease-out forwards;
        }

        .animate-badge-pop {
          animation: badge-pop 0.5s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
