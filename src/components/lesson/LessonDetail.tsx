'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatTime } from '@/components/ui'
import type { LessonNote } from '@/lib/db'

interface LessonDetailProps {
  bookingId: number
  onClose: () => void
  onComplete?: () => void
}

const MOOD_OPTIONS: { value: LessonNote['mood']; emoji: string; label: string }[] = [
  { value: 'excellent', emoji: '🌟', label: 'Excellent' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'struggling', emoji: '😓', label: 'Struggling' },
  { value: 'absent', emoji: '🚫', label: 'Absent' },
]

const QUICK_HIGHLIGHTS = [
  'Great technique',
  'Confident',
  'Improved',
  'Focused',
  'Brave',
  'Strong kicks',
  'Good breathing',
  'Fast learner',
]

const QUICK_IMPROVEMENTS = [
  'Work on breathing',
  'Build confidence',
  'Kick technique',
  'Arm movement',
  'Body position',
  'Practice needed',
  'Stamina',
  'Focus',
]

export function LessonDetail({ bookingId, onClose, onComplete }: LessonDetailProps) {
  const {
    bookings,
    clients,
    participants,
    serviceTypes,
    lessonNotes,
    addLessonNote,
    updateBooking,
    updateAttendance
  } = useAppStore()

  const booking = bookings.find(b => b.id === bookingId)
  const participant = participants.find(p => p.bookingId === bookingId)
  const client = participant ? clients.find(c => c.id === participant.clientId) : null
  const service = booking ? serviceTypes.find(s => s.id === booking.serviceTypeId) : null
  const existingNote = lessonNotes.find(n => n.bookingId === bookingId && n.studentId === client?.id)

  const [mood, setMood] = useState<LessonNote['mood']>(existingNote?.mood || undefined)
  const [highlights, setHighlights] = useState<string[]>(existingNote?.highlights || [])
  const [improvements, setImprovements] = useState<string[]>(existingNote?.areasToImprove || [])
  const [note, setNote] = useState(existingNote?.content || '')
  const [privateNote, setPrivateNote] = useState(existingNote?.privateNote || '')
  const [saving, setSaving] = useState(false)
  const [showPrivateNote, setShowPrivateNote] = useState(false)

  if (!booking || !client) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
        <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 text-center">
          <p className="text-slate-500">Lesson not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg">Close</button>
        </div>
      </div>
    )
  }

  const toggleHighlight = (item: string) => {
    setHighlights(prev =>
      prev.includes(item) ? prev.filter(h => h !== item) : [...prev, item]
    )
  }

  const toggleImprovement = (item: string) => {
    setImprovements(prev =>
      prev.includes(item) ? prev.filter(h => h !== item) : [...prev, item]
    )
  }

  const handleSave = async () => {
    if (!client?.id) return
    setSaving(true)

    try {
      await addLessonNote({
        bookingId,
        studentId: client.id,
        content: note,
        mood,
        highlights,
        areasToImprove: improvements,
        privateNote: privateNote || undefined,
      })

      onClose()
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      // Save the note first
      if (mood || highlights.length > 0 || improvements.length > 0 || note) {
        await addLessonNote({
          bookingId,
          studentId: client.id!,
          content: note,
          mood,
          highlights,
          areasToImprove: improvements,
          privateNote: privateNote || undefined,
        })
      }

      // Mark booking as completed
      await updateBooking(bookingId, { status: 'completed' })

      // Mark participant as present
      if (participant?.id && mood !== 'absent') {
        await updateAttendance(participant.id, 'present')
      } else if (participant?.id && mood === 'absent') {
        await updateAttendance(participant.id, 'absent')
      }

      onComplete?.()
      onClose()
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    } finally {
      setSaving(false)
    }
  }

  const lessonDate = new Date(booking.startTime)
  const isToday = lessonDate.toDateString() === new Date().toDateString()
  const isPast = new Date(booking.endTime) < new Date()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="font-semibold text-slate-900">Lesson Notes</h2>
          <div className="w-10" />
        </div>

        <div className="p-4 space-y-6">
          {/* Lesson Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-700">{client.fullName.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{client.fullName}</p>
              <p className="text-sm text-slate-500">
                {service?.name} • {formatTime(lessonDate)}
                {isToday && <span className="ml-2 text-blue-600 font-medium">Today</span>}
              </p>
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">How did the lesson go?</label>
            <div className="flex gap-2 justify-between">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    mood === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-xs font-medium ${mood === option.value ? 'text-blue-700' : 'text-slate-500'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Highlights */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Highlights</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_HIGHLIGHTS.map(item => (
                <button
                  key={item}
                  onClick={() => toggleHighlight(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    highlights.includes(item)
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {highlights.includes(item) && '✓ '}{item}
                </button>
              ))}
            </div>
          </div>

          {/* Areas to Improve */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Areas to Work On</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_IMPROVEMENTS.map(item => (
                <button
                  key={item}
                  onClick={() => toggleImprovement(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    improvements.includes(item)
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {improvements.includes(item) && '✓ '}{item}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about today's lesson..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Private Note Toggle */}
          <div>
            <button
              onClick={() => setShowPrivateNote(!showPrivateNote)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <svg className={`w-4 h-4 transition-transform ${showPrivateNote ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">Private note (coach only)</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
            {showPrivateNote && (
              <textarea
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                placeholder="Private notes not shared with parents..."
                className="w-full mt-2 p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none bg-slate-50"
                rows={2}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Save Notes
          </button>
          {(isToday || isPast) && booking.status !== 'completed' && (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
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
          )}
        </div>
      </div>
    </div>
  )
}
