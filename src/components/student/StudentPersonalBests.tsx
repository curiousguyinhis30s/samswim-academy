'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { getDb, PersonalBest } from '@/lib/db'
import { useAppStore } from '@/lib/store/app'

interface StudentPersonalBestsProps {
  studentId: number
}

// Event type definitions
const EVENT_TYPES = {
  freestyle_25m: { name: 'Freestyle 25m', category: 'Freestyle', distance: 25 },
  freestyle_50m: { name: 'Freestyle 50m', category: 'Freestyle', distance: 50 },
  freestyle_100m: { name: 'Freestyle 100m', category: 'Freestyle', distance: 100 },
  backstroke_25m: { name: 'Backstroke 25m', category: 'Backstroke', distance: 25 },
  backstroke_50m: { name: 'Backstroke 50m', category: 'Backstroke', distance: 50 },
  breaststroke_25m: { name: 'Breaststroke 25m', category: 'Breaststroke', distance: 25 },
  breaststroke_50m: { name: 'Breaststroke 50m', category: 'Breaststroke', distance: 50 },
  butterfly_25m: { name: 'Butterfly 25m', category: 'Butterfly', distance: 25 },
  butterfly_50m: { name: 'Butterfly 50m', category: 'Butterfly', distance: 50 },
  medley_100m: { name: 'Individual Medley 100m', category: 'Medley', distance: 100 },
  custom: { name: 'Custom Event', category: 'Custom', distance: 0 },
} as const

type EventType = keyof typeof EVENT_TYPES

// Format time from seconds to mm:ss.ms
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const wholeSecs = Math.floor(secs)
  const ms = Math.round((secs - wholeSecs) * 100)

  if (mins > 0) {
    return `${mins}:${wholeSecs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }
  return `${wholeSecs}.${ms.toString().padStart(2, '0')}`
}

// Parse time input (mm:ss.ms or ss.ms) to seconds
function parseTimeInput(input: string): number | null {
  const trimmed = input.trim()

  // Try mm:ss.ms format
  const minSecMatch = trimmed.match(/^(\d+):(\d{1,2})\.(\d{1,2})$/)
  if (minSecMatch) {
    const mins = parseInt(minSecMatch[1])
    const secs = parseInt(minSecMatch[2])
    const ms = parseInt(minSecMatch[3].padEnd(2, '0'))
    return mins * 60 + secs + ms / 100
  }

  // Try ss.ms format
  const secMatch = trimmed.match(/^(\d+)\.(\d{1,2})$/)
  if (secMatch) {
    const secs = parseInt(secMatch[1])
    const ms = parseInt(secMatch[2].padEnd(2, '0'))
    return secs + ms / 100
  }

  // Try just seconds
  const justSecs = parseFloat(trimmed)
  if (!isNaN(justSecs) && justSecs > 0) {
    return justSecs
  }

  return null
}

// Format improvement delta
function formatDelta(seconds: number): string {
  const sign = seconds >= 0 ? '-' : '+'
  const absSeconds = Math.abs(seconds)
  return `${sign}${formatTime(absSeconds)}`
}

// Simple SVG line chart component
function TimeChart({ times, color = '#14B8A6' }: { times: { date: Date; seconds: number }[]; color?: string }) {
  if (times.length < 2) return null

  const sortedTimes = [...times].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const maxTime = Math.max(...sortedTimes.map(t => t.seconds))
  const minTime = Math.min(...sortedTimes.map(t => t.seconds))
  const range = maxTime - minTime || 1

  const width = 280
  const height = 80
  const padding = { top: 10, right: 10, bottom: 20, left: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points = sortedTimes.map((t, i) => {
    const x = padding.left + (i / (sortedTimes.length - 1)) * chartWidth
    const y = padding.top + (1 - (t.seconds - minTime) / range) * chartHeight
    return { x, y, time: t }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#E2E8F0" strokeWidth="1" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#E2E8F0" strokeWidth="1" />

      {/* Line path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
      ))}

      {/* Time labels */}
      <text x={padding.left} y={padding.top - 2} fontSize="10" fill="#64748B" textAnchor="start">
        {formatTime(maxTime)}
      </text>
      <text x={padding.left} y={height - padding.bottom + 12} fontSize="10" fill="#64748B" textAnchor="start">
        {formatTime(minTime)}
      </text>
    </svg>
  )
}

// Celebration animation component
function CelebrationOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Confetti particles */}
        <div className="absolute inset-0 animate-bounce">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#14B8A6', '#22D3EE', '#F97316', '#10B981', '#3B82F6'][i % 5],
                left: `${50 + Math.cos((i / 12) * 2 * Math.PI) * 60}%`,
                top: `${50 + Math.sin((i / 12) * 2 * Math.PI) * 60}%`,
                animation: `confetti-${i % 3} 1s ease-out forwards`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Main celebration message */}
        <div className="bg-gradient-to-r from-teal-500 to-turquoise-500 text-white px-8 py-6 rounded-2xl shadow-glow-teal animate-pulse">
          <div className="text-center">
            <div className="text-4xl mb-2">NEW PB!</div>
            <div className="text-lg opacity-90">Personal Best Achieved!</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-0 {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(-100px); opacity: 0; }
        }
        @keyframes confetti-1 {
          0% { transform: scale(0) translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) translateY(-80px) rotate(180deg); opacity: 0; }
        }
        @keyframes confetti-2 {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(-120px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// Add Time Modal
function AddTimeModal({
  isOpen,
  onClose,
  onSubmit,
  initialEventType,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { eventType: EventType; customEventName?: string; timeSeconds: number; notes?: string }) => void
  initialEventType?: EventType
}) {
  const [eventType, setEventType] = useState<EventType>(initialEventType || 'freestyle_25m')
  const [customEventName, setCustomEventName] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const parsedTime = parseTimeInput(timeInput)
    if (!parsedTime) {
      setError('Invalid time format. Use ss.ms or mm:ss.ms')
      return
    }

    if (eventType === 'custom' && !customEventName.trim()) {
      setError('Please enter a custom event name')
      return
    }

    onSubmit({
      eventType,
      customEventName: eventType === 'custom' ? customEventName.trim() : undefined,
      timeSeconds: parsedTime,
      notes: notes.trim() || undefined,
    })

    // Reset form
    setTimeInput('')
    setNotes('')
    setCustomEventName('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-strong w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-teal px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Record New Time</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Event</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {Object.entries(EVENT_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Event Name */}
          {eventType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom Event Name</label>
              <input
                type="text"
                value={customEventName}
                onChange={(e) => setCustomEventName(e.target.value)}
                placeholder="e.g., Freestyle 200m"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="ss.ms or mm:ss.ms (e.g., 32.45 or 1:15.30)"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-lg"
            />
            <p className="text-xs text-slate-500 mt-1">Format: seconds.milliseconds or minutes:seconds.milliseconds</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Competition, practice session, etc."
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-coral-500 bg-coral-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-white bg-gradient-teal hover:opacity-90 rounded-xl font-medium transition-opacity"
            >
              Record Time
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main component
export function StudentPersonalBests({ studentId }: StudentPersonalBestsProps) {
  const { tenant } = useAppStore()
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState<EventType | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalEventType, setAddModalEventType] = useState<EventType | undefined>()
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedEventHistory, setSelectedEventHistory] = useState<EventType | null>(null)

  // Load personal bests
  const loadPersonalBests = useCallback(async () => {
    if (!tenant?.id) return

    try {
      const db = await getDb()
      const records = await db.personalBests
        .where('tenantId').equals(tenant.id)
        .and(r => r.studentId === studentId)
        .toArray()

      setPersonalBests(records.sort((a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      ))
    } catch (error) {
      console.error('Error loading personal bests:', error)
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, studentId])

  useEffect(() => {
    loadPersonalBests()
  }, [loadPersonalBests])

  // Get best time for each event
  const bestTimes = useMemo(() => {
    const bests: Record<string, PersonalBest> = {}

    personalBests.forEach(pb => {
      const key = pb.eventType === 'custom' ? `custom_${pb.customEventName}` : pb.eventType
      if (!bests[key] || pb.timeSeconds < bests[key].timeSeconds) {
        bests[key] = pb
      }
    })

    return bests
  }, [personalBests])

  // Get history for an event
  const getEventHistory = useCallback((eventType: EventType, customName?: string) => {
    return personalBests
      .filter(pb => {
        if (eventType === 'custom') {
          return pb.eventType === 'custom' && pb.customEventName === customName
        }
        return pb.eventType === eventType
      })
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
  }, [personalBests])

  // Filtered events for display
  const filteredEvents = useMemo(() => {
    const uniqueEvents = new Set<string>()
    personalBests.forEach(pb => {
      const key = pb.eventType === 'custom' ? `custom_${pb.customEventName}` : pb.eventType
      uniqueEvents.add(key)
    })

    let events = Array.from(uniqueEvents)

    if (filterEvent !== 'all') {
      events = events.filter(e => {
        if (filterEvent === 'custom') return e.startsWith('custom_')
        return e === filterEvent
      })
    }

    return events
  }, [personalBests, filterEvent])

  // Add new time
  const handleAddTime = async (data: { eventType: EventType; customEventName?: string; timeSeconds: number; notes?: string }) => {
    if (!tenant?.id) return

    try {
      const db = await getDb()

      // Find current best for this event
      const key = data.eventType === 'custom' ? `custom_${data.customEventName}` : data.eventType
      const currentBest = bestTimes[key]

      const improvement = currentBest ? currentBest.timeSeconds - data.timeSeconds : undefined
      const isPB = !currentBest || data.timeSeconds < currentBest.timeSeconds

      await db.personalBests.add({
        tenantId: tenant.id,
        studentId,
        eventType: data.eventType,
        customEventName: data.customEventName,
        timeSeconds: data.timeSeconds,
        previousBest: currentBest?.timeSeconds,
        improvement: improvement && improvement > 0 ? improvement : undefined,
        recordedAt: new Date(),
        notes: data.notes,
        createdAt: new Date(),
      })

      await loadPersonalBests()

      // Show celebration if PB
      if (isPB && currentBest) {
        setShowCelebration(true)
      }
    } catch (error) {
      console.error('Error adding time:', error)
    }
  }

  // Open add modal for specific event
  const openAddModalForEvent = (eventType: EventType) => {
    setAddModalEventType(eventType)
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Personal Bests</h1>
            <p className="text-slate-500 text-sm mt-1">
              {Object.keys(bestTimes).length} events tracked
            </p>
          </div>
          <button
            onClick={() => {
              setAddModalEventType(undefined)
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-teal text-white rounded-xl font-medium shadow-soft hover:shadow-medium transition-shadow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Time</span>
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setFilterEvent('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterEvent === 'all'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Events
            </button>
            {['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley', 'custom'].map((category) => {
              const hasEvents = personalBests.some(pb => {
                if (category === 'custom') return pb.eventType === 'custom'
                return pb.eventType.startsWith(category)
              })
              if (!hasEvents) return null

              return (
                <button
                  key={category}
                  onClick={() => setFilterEvent(category === 'custom' ? 'custom' : `${category}_25m` as EventType)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterEvent.startsWith(category) || (category === 'custom' && filterEvent === 'custom')
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        {/* No records state */}
        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Times Recorded</h3>
            <p className="text-slate-500 text-sm mb-4">Start tracking your swim times to see your progress</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-teal text-white rounded-xl font-medium"
            >
              Record Your First Time
            </button>
          </div>
        )}

        {/* Event Cards */}
        <div className="space-y-4">
          {filteredEvents.map((eventKey) => {
            const best = bestTimes[eventKey]
            if (!best) return null

            const eventInfo = best.eventType === 'custom'
              ? { name: best.customEventName || 'Custom Event', category: 'Custom', distance: 0 }
              : EVENT_TYPES[best.eventType as keyof typeof EVENT_TYPES]

            const history = getEventHistory(best.eventType, best.customEventName)
            const isExpanded = selectedEventHistory === eventKey

            return (
              <div key={eventKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Event Header */}
                <button
                  onClick={() => setSelectedEventHistory(isExpanded ? null : eventKey as EventType)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full font-medium">
                        {eventInfo.category}
                      </span>
                      {history.length > 1 && (
                        <span className="text-xs text-slate-400">{history.length} times</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mt-1">{eventInfo.name}</h3>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-2xl font-bold text-teal-600 font-mono">{formatTime(best.timeSeconds)}</p>
                      {best.improvement && best.improvement > 0 && (
                        <p className="text-sm text-emerald-500 font-medium">
                          {formatDelta(best.improvement)}
                        </p>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded History */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-4">
                    {/* Chart */}
                    {history.length >= 2 && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-medium text-slate-500 mb-2">Progress Over Time</p>
                        <TimeChart
                          times={history.map(h => ({ date: new Date(h.recordedAt), seconds: h.timeSeconds }))}
                        />
                      </div>
                    )}

                    {/* History List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500">History</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openAddModalForEvent(best.eventType)
                          }}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          + Add Time
                        </button>
                      </div>

                      {history.slice().reverse().slice(0, 5).map((record, idx) => (
                        <div key={record.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                            {idx === 0 && (
                              <div className="w-6 h-6 bg-gradient-teal rounded-full flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}
                            {idx !== 0 && <div className="w-6" />}
                            <div>
                              <p className="text-sm text-slate-900 font-mono">{formatTime(record.timeSeconds)}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(record.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {record.improvement && record.improvement > 0 && (
                              <span className="text-xs text-emerald-500 font-medium">
                                {formatDelta(record.improvement)}
                              </span>
                            )}
                            {record.notes && (
                              <p className="text-xs text-slate-400 mt-0.5 max-w-[120px] truncate">{record.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {history.length > 5 && (
                        <p className="text-xs text-slate-400 text-center pt-2">
                          +{history.length - 5} more entries
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Add Events (if no times for an event) */}
        {personalBests.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500 mb-3">Quick Add New Event</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EVENT_TYPES) as EventType[])
                .filter(key => key !== 'custom' && !bestTimes[key])
                .slice(0, 4)
                .map((eventType) => (
                  <button
                    key={eventType}
                    onClick={() => openAddModalForEvent(eventType)}
                    className="px-3 py-1.5 bg-white border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    + {EVENT_TYPES[eventType].name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Time Modal */}
      <AddTimeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTime}
        initialEventType={addModalEventType}
      />

      {/* Celebration Overlay */}
      {showCelebration && (
        <CelebrationOverlay onComplete={() => setShowCelebration(false)} />
      )}
    </div>
  )
}
