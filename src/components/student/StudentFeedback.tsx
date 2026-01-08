'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import type { LessonFeedback } from '@/lib/db'

interface StudentFeedbackProps {
  studentId: number
  bookingId?: number
}

type EnjoymentLevel = 'loved_it' | 'liked_it' | 'okay' | 'not_great'
type DifficultyLevel = 'too_easy' | 'just_right' | 'challenging' | 'too_hard'

const ENJOYMENT_OPTIONS: { value: EnjoymentLevel; emoji: string; label: string; color: string }[] = [
  { value: 'loved_it', emoji: '🤩', label: 'Loved it!', color: 'from-emerald-400 to-emerald-500' },
  { value: 'liked_it', emoji: '😊', label: 'Liked it', color: 'from-teal-400 to-teal-500' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-amber-400 to-amber-500' },
  { value: 'not_great', emoji: '😕', label: 'Not great', color: 'from-slate-400 to-slate-500' },
]

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; emoji: string; label: string }[] = [
  { value: 'too_easy', emoji: '😴', label: 'Too Easy' },
  { value: 'just_right', emoji: '👌', label: 'Just Right' },
  { value: 'challenging', emoji: '💪', label: 'Challenging' },
  { value: 'too_hard', emoji: '😰', label: 'Too Hard' },
]

// Animated Star component
function AnimatedStar({
  filled,
  onClick,
  index,
  hoveredRating
}: {
  filled: boolean
  onClick: () => void
  index: number
  hoveredRating: number
}) {
  const isHovered = hoveredRating >= index + 1
  const shouldAnimate = filled || isHovered

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ease-out
        ${shouldAnimate ? 'scale-110' : 'scale-100'}
        active:scale-95
      `}
      aria-label={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
    >
      {/* Background glow effect */}
      <div
        className={`
          absolute inset-0 rounded-full blur-lg transition-opacity duration-300
          ${shouldAnimate ? 'opacity-40 bg-amber-400' : 'opacity-0'}
        `}
      />

      {/* Star SVG */}
      <svg
        viewBox="0 0 24 24"
        className={`
          relative w-full h-full transition-all duration-300
          ${shouldAnimate ? 'text-amber-400 drop-shadow-lg' : 'text-slate-300'}
        `}
        style={{
          filter: shouldAnimate ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.5))' : 'none',
          transform: shouldAnimate ? `rotate(${(index % 2 === 0 ? -5 : 5)}deg)` : 'rotate(0deg)',
        }}
      >
        <path
          fill="currentColor"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          className={`
            transition-all duration-300
            ${shouldAnimate ? 'stroke-amber-500' : 'stroke-slate-400'}
          `}
          strokeWidth="0.5"
        />
      </svg>

      {/* Sparkle effect on hover/fill */}
      {shouldAnimate && (
        <>
          <span className="absolute -top-1 -right-1 text-xs animate-bounce">✨</span>
          {index === 4 && filled && (
            <span className="absolute -bottom-1 -left-1 text-xs animate-ping">🌟</span>
          )}
        </>
      )}
    </button>
  )
}

// Star Rating Component
function StarRating({
  rating,
  onRatingChange
}: {
  rating: number
  onRatingChange: (rating: number) => void
}) {
  const [hoveredRating, setHoveredRating] = useState(0)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex gap-1 sm:gap-2"
        onMouseLeave={() => setHoveredRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            onMouseEnter={() => setHoveredRating(star)}
          >
            <AnimatedStar
              filled={rating >= star}
              onClick={() => onRatingChange(star)}
              index={star - 1}
              hoveredRating={hoveredRating}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500 font-medium">
        {rating === 0 && 'Tap the stars to rate'}
        {rating === 1 && 'Could be better 😕'}
        {rating === 2 && 'It was okay 🤔'}
        {rating === 3 && 'Pretty good! 👍'}
        {rating === 4 && 'Really great! 😊'}
        {rating === 5 && 'Amazing! Perfect! 🌟'}
      </p>
    </div>
  )
}

// Feedback Form Component
function FeedbackForm({
  studentId,
  bookingId,
  onSubmit
}: {
  studentId: number
  bookingId: number
  onSubmit: () => void
}) {
  const [rating, setRating] = useState(0)
  const [enjoyment, setEnjoyment] = useState<EnjoymentLevel | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null)
  const [favoriteActivity, setFavoriteActivity] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const { bookings, serviceTypes } = useAppStore()
  const booking = bookings.find(b => b.id === bookingId)
  const serviceType = booking ? serviceTypes.find(s => s.id === booking.serviceTypeId) : null

  const handleSubmit = async () => {
    if (rating === 0 || !enjoyment || !difficulty) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real app, you would save this to the database
    const feedback: Omit<LessonFeedback, 'id' | 'createdAt'> = {
      tenantId: 1,
      bookingId,
      studentId,
      rating,
      enjoymentLevel: enjoyment,
      difficultyLevel: difficulty,
      favoriteActivity: favoriteActivity || undefined,
      suggestions: suggestions || undefined,
      wouldRecommend: wouldRecommend ?? true,
      submittedAt: new Date(),
    }

    console.log('Submitting feedback:', feedback)

    setIsSubmitting(false)
    onSubmit()
  }

  const canProceed = step === 1
    ? rating > 0
    : step === 2
    ? enjoyment !== null
    : step === 3
    ? difficulty !== null
    : true

  return (
    <div className="bg-gradient-to-br from-teal-50 via-white to-turquoise-50 min-h-screen">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-turquoise-500 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🏊</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">How was your lesson?</h1>
          {serviceType && (
            <p className="text-slate-500 text-sm mt-1">{serviceType.name}</p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`
                h-2 rounded-full transition-all duration-300
                ${s <= step ? 'bg-gradient-to-r from-teal-400 to-turquoise-500 w-8' : 'bg-slate-200 w-4'}
              `}
            />
          ))}
        </div>

        {/* Step 1: Star Rating */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 text-center mb-6">
              Rate your lesson
            </h2>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
        )}

        {/* Step 2: Enjoyment Level */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 text-center mb-2">
              How much did you enjoy it?
            </h2>
            <p className="text-slate-500 text-sm text-center mb-6">Pick the emoji that matches!</p>

            <div className="grid grid-cols-2 gap-3">
              {ENJOYMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEnjoyment(option.value)}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all duration-300
                    ${enjoyment === option.value
                      ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-lg scale-105`
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md'
                    }
                  `}
                >
                  <span className="text-4xl block mb-2">{option.emoji}</span>
                  <span className={`text-sm font-medium ${enjoyment === option.value ? 'text-white' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                  {enjoyment === option.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Difficulty Level */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 text-center mb-2">
              How was the difficulty?
            </h2>
            <p className="text-slate-500 text-sm text-center mb-6">Was it right for you?</p>

            <div className="grid grid-cols-2 gap-3">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDifficulty(option.value)}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all duration-300
                    ${difficulty === option.value
                      ? 'border-teal-500 bg-teal-50 shadow-lg scale-105'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md'
                    }
                  `}
                >
                  <span className="text-3xl block mb-2">{option.emoji}</span>
                  <span className={`text-sm font-medium ${difficulty === option.value ? 'text-teal-700' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                  {difficulty === option.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Optional Details */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Favorite Activity */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                <span className="mr-2">⭐</span>
                What was your favorite activity?
              </label>
              <input
                type="text"
                value={favoriteActivity}
                onChange={(e) => setFavoriteActivity(e.target.value)}
                placeholder="e.g., Diving, racing, learning backstroke..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                <span className="mr-2">💬</span>
                Any suggestions or comments?
              </label>
              <textarea
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Tell us what you think..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
              />
            </div>

            {/* Would Recommend */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <p className="text-sm font-semibold text-slate-900 mb-4">
                <span className="mr-2">🎯</span>
                Would you recommend our lessons to friends?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`
                    flex-1 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-2
                    ${wouldRecommend === true
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                    }
                  `}
                >
                  <span className="text-2xl">👍</span>
                  <span className="font-semibold">Yes!</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`
                    flex-1 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-2
                    ${wouldRecommend === false
                      ? 'border-slate-500 bg-slate-50 text-slate-700 shadow-lg'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }
                  `}
                >
                  <span className="text-2xl">🤔</span>
                  <span className="font-semibold">Not sure</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 px-6 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className={`
                flex-1 py-4 px-6 font-semibold rounded-2xl transition-all
                ${canProceed
                  ? 'bg-gradient-to-r from-teal-500 to-turquoise-500 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-teal-500 to-turquoise-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Feedback 🎉'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Thank You Component
function ThankYouMessage() {
  return (
    <div className="bg-gradient-to-br from-teal-50 via-white to-turquoise-50 min-h-screen flex items-center justify-center">
      <div className="px-4 py-8 max-w-sm mx-auto text-center animate-fadeIn">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-turquoise-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
            <span className="text-5xl">🎉</span>
          </div>
          <span className="absolute -top-2 -left-2 text-2xl animate-spin-slow">⭐</span>
          <span className="absolute -top-4 -right-4 text-3xl animate-pulse">✨</span>
          <span className="absolute -bottom-2 -right-2 text-2xl animate-spin-slow">🌟</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">Thank You!</h1>
        <p className="text-slate-600 mb-6">
          Your feedback helps us make swimming lessons even more awesome! 🏊‍♂️
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <p className="text-sm text-slate-500 mb-2">You earned</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🏅</span>
            <span className="text-2xl font-bold text-teal-600">+10 XP</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">for sharing your thoughts!</p>
        </div>

        <div className="flex justify-center gap-3">
          <span className="text-4xl animate-wave">👋</span>
          <span className="text-4xl animate-wave" style={{ animationDelay: '0.1s' }}>🐬</span>
          <span className="text-4xl animate-wave" style={{ animationDelay: '0.2s' }}>🌊</span>
        </div>
      </div>
    </div>
  )
}

// Feedback Card for history
function FeedbackCard({ feedback }: { feedback: LessonFeedback & { lessonName?: string; lessonDate?: Date } }) {
  const enjoymentEmoji = ENJOYMENT_OPTIONS.find(e => e.value === feedback.enjoymentLevel)?.emoji || '😊'
  const difficultyEmoji = DIFFICULTY_OPTIONS.find(d => d.value === feedback.difficultyLevel)?.emoji || '👌'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-900">{feedback.lessonName || 'Swimming Lesson'}</p>
          {feedback.lessonDate && (
            <p className="text-xs text-slate-500">
              {new Date(feedback.lessonDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              viewBox="0 0 24 24"
              className={`w-5 h-5 ${feedback.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
            >
              <path
                fill="currentColor"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
          <span className="text-lg">{enjoymentEmoji}</span>
          <span className="text-xs text-slate-600 capitalize">
            {feedback.enjoymentLevel.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
          <span className="text-lg">{difficultyEmoji}</span>
          <span className="text-xs text-slate-600 capitalize">
            {feedback.difficultyLevel.replace('_', ' ')}
          </span>
        </div>
      </div>

      {feedback.favoriteActivity && (
        <div className="mb-2">
          <p className="text-xs text-slate-500 mb-1">Favorite Activity</p>
          <p className="text-sm text-slate-700">{feedback.favoriteActivity}</p>
        </div>
      )}

      {feedback.suggestions && (
        <div className="mb-2">
          <p className="text-xs text-slate-500 mb-1">Comments</p>
          <p className="text-sm text-slate-700 italic">"{feedback.suggestions}"</p>
        </div>
      )}

      {feedback.wouldRecommend && (
        <div className="flex items-center gap-1.5 text-emerald-600 mt-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">Would recommend</span>
        </div>
      )}
    </div>
  )
}

// Feedback History Component
function FeedbackHistory({ studentId }: { studentId: number }) {
  const { bookings, serviceTypes } = useAppStore()

  // Mock feedback data - in a real app, this would come from the database
  const feedbackHistory: (LessonFeedback & { lessonName?: string; lessonDate?: Date })[] = useMemo(() => {
    // This is mock data for demonstration
    // In production, you would fetch from lessonFeedback table
    const completedBookings = bookings.filter(b => b.status === 'completed').slice(0, 5)

    return completedBookings.map((booking, index) => ({
      id: index + 1,
      tenantId: 1,
      bookingId: booking.id!,
      studentId,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      enjoymentLevel: ['loved_it', 'liked_it', 'okay'][Math.floor(Math.random() * 3)] as EnjoymentLevel,
      difficultyLevel: ['just_right', 'challenging', 'too_easy'][Math.floor(Math.random() * 3)] as DifficultyLevel,
      favoriteActivity: ['Racing', 'Diving practice', 'Freestyle drills', 'Backstroke', 'Fun games'][Math.floor(Math.random() * 5)],
      suggestions: index === 0 ? 'More time for free swimming would be great!' : undefined,
      wouldRecommend: Math.random() > 0.2,
      submittedAt: new Date(booking.startTime),
      createdAt: new Date(booking.startTime),
      lessonName: serviceTypes.find(s => s.id === booking.serviceTypeId)?.name,
      lessonDate: new Date(booking.startTime),
    }))
  }, [studentId, bookings, serviceTypes])

  if (feedbackHistory.length === 0) {
    return (
      <div className="bg-gradient-to-br from-teal-50 via-white to-turquoise-50 min-h-screen">
        <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Feedback</h1>
          <p className="text-slate-500 text-sm mb-8">Your lesson reviews</p>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No feedback yet</h3>
            <p className="text-slate-500 text-sm">
              After your lessons, you can share how they went!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate stats
  const avgRating = feedbackHistory.reduce((acc, f) => acc + f.rating, 0) / feedbackHistory.length
  const totalFeedback = feedbackHistory.length

  return (
    <div className="bg-gradient-to-br from-teal-50 via-white to-turquoise-50 min-h-screen">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Feedback</h1>
        <p className="text-slate-500 text-sm mb-6">Your lesson reviews</p>

        {/* Stats Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl font-bold text-slate-900">{avgRating.toFixed(1)}</span>
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-400">
                  <path
                    fill="currentColor"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <p className="text-xs text-slate-500">Avg Rating</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{totalFeedback}</p>
              <p className="text-xs text-slate-500">Reviews</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">
                {Math.round((feedbackHistory.filter(f => f.wouldRecommend).length / totalFeedback) * 100)}%
              </p>
              <p className="text-xs text-slate-500">Recommend</p>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbackHistory.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Component
export function StudentFeedback({ studentId, bookingId }: StudentFeedbackProps) {
  const [submitted, setSubmitted] = useState(false)

  // If bookingId is provided, show the feedback form
  if (bookingId) {
    if (submitted) {
      return <ThankYouMessage />
    }
    return (
      <FeedbackForm
        studentId={studentId}
        bookingId={bookingId}
        onSubmit={() => setSubmitted(true)}
      />
    )
  }

  // Otherwise, show the feedback history
  return <FeedbackHistory studentId={studentId} />
}
