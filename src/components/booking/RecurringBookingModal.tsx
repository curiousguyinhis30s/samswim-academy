'use client'

import { useState, useMemo, useEffect } from 'react'
import { RecurringPattern } from '@/lib/db'
import { Button, Input, Select, Modal, formatDateFull } from '@/components/ui'
import { useAppStore } from '@/lib/store/app'

interface RecurringBookingModalProps {
  isOpen: boolean
  onClose: () => void
  studentId?: number
  editPattern?: RecurringPattern | null
}

type Frequency = 'weekly' | 'biweekly' | 'monthly'

interface FormState {
  studentId: string
  serviceTypeId: string
  instructorId: string
  dayOfWeek: number
  startTime: string
  frequency: Frequency
  startDate: string
  endDate: string
}

interface UpcomingLesson {
  date: Date
  hasConflict: boolean
  conflictReason?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
]

const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
]

export function RecurringBookingModal({
  isOpen,
  onClose,
  studentId,
  editPattern,
}: RecurringBookingModalProps) {
  const { clients, serviceTypes, instructors, bookings } = useAppStore()

  const [formState, setFormState] = useState<FormState>({
    studentId: studentId?.toString() || '',
    serviceTypeId: '',
    instructorId: instructors[0]?.id?.toString() || '',
    dayOfWeek: 1, // Monday default
    startTime: '09:00',
    frequency: 'weekly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editPattern) {
      setFormState({
        studentId: editPattern.studentId.toString(),
        serviceTypeId: editPattern.serviceTypeId.toString(),
        instructorId: editPattern.instructorId.toString(),
        dayOfWeek: editPattern.dayOfWeek,
        startTime: editPattern.startTime,
        frequency: editPattern.frequency,
        startDate: new Date(editPattern.startDate).toISOString().split('T')[0],
        endDate: editPattern.endDate
          ? new Date(editPattern.endDate).toISOString().split('T')[0]
          : '',
      })
    }
  }, [editPattern])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowPreview(false)
      setShowCancelConfirm(false)
      if (!editPattern) {
        setFormState({
          studentId: studentId?.toString() || '',
          serviceTypeId: '',
          instructorId: instructors[0]?.id?.toString() || '',
          dayOfWeek: 1,
          startTime: '09:00',
          frequency: 'weekly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
        })
      }
    }
  }, [isOpen, studentId, instructors, editPattern])

  // Generate upcoming lessons preview (max 12 lessons or 3 months)
  const upcomingLessons = useMemo((): UpcomingLesson[] => {
    if (!formState.startDate || !formState.dayOfWeek === undefined) return []

    const lessons: UpcomingLesson[] = []
    const startDate = new Date(formState.startDate)
    const endDate = formState.endDate
      ? new Date(formState.endDate)
      : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 3 months default

    // Find first occurrence of selected day of week
    let currentDate = new Date(startDate)
    while (currentDate.getDay() !== formState.dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const intervalDays = formState.frequency === 'weekly' ? 7 : formState.frequency === 'biweekly' ? 14 : 28

    while (currentDate <= endDate && lessons.length < 12) {
      // Mock conflict detection
      const hasConflict = mockCheckConflict(currentDate, formState.startTime)
      lessons.push({
        date: new Date(currentDate),
        hasConflict,
        conflictReason: hasConflict ? 'Time slot already booked' : undefined,
      })
      currentDate.setDate(currentDate.getDate() + intervalDays)
    }

    return lessons
  }, [formState.startDate, formState.endDate, formState.dayOfWeek, formState.frequency, formState.startTime])

  // Mock conflict detection (in real app, check against actual bookings)
  function mockCheckConflict(date: Date, time: string): boolean {
    // Simulate 10% conflict rate for demo
    const hash = date.getTime() + time.length
    return hash % 10 === 0
  }

  const selectedStudent = clients.find((c) => c.id?.toString() === formState.studentId)
  const selectedService = serviceTypes.find((s) => s.id?.toString() === formState.serviceTypeId)

  const isFormValid =
    formState.studentId &&
    formState.serviceTypeId &&
    formState.instructorId &&
    formState.startTime &&
    formState.startDate

  const conflictCount = upcomingLessons.filter((l) => l.hasConflict).length

  const handleSave = async () => {
    if (!isFormValid) return

    setIsSaving(true)
    try {
      // In real implementation, save to database
      // const db = await getDb()
      // await db.recurringPatterns.add({ ... })
      // Then generate individual bookings

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('Saving recurring pattern:', formState)
      console.log('Generated lessons:', upcomingLessons.filter((l) => !l.hasConflict))

      onClose()
    } catch (error) {
      console.error('Error saving recurring pattern:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelPattern = async () => {
    if (!editPattern) return

    setIsSaving(true)
    try {
      // In real implementation, mark pattern as inactive
      // await db.recurringPatterns.update(editPattern.id, { isActive: false })

      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('Cancelled recurring pattern:', editPattern.id)
      onClose()
    } catch (error) {
      console.error('Error cancelling pattern:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatLessonDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-turquoise-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editPattern ? 'Edit Recurring Lesson' : 'Schedule Recurring Lessons'}
            </h2>
            <p className="text-sm text-teal-600 mt-0.5">
              Set up a repeating schedule for regular lessons
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Student Selector */}
              {!studentId && (
                <Select
                  label="Student"
                  id="student"
                  value={formState.studentId}
                  onChange={(e) =>
                    setFormState({ ...formState, studentId: e.target.value })
                  }
                  options={[
                    { value: '', label: 'Select a student...' },
                    ...clients.map((c) => ({
                      value: c.id!.toString(),
                      label: c.fullName,
                    })),
                  ]}
                />
              )}

              {studentId && selectedStudent && (
                <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-turquoise-500 flex items-center justify-center text-white font-bold text-sm">
                    {selectedStudent.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedStudent.fullName}</p>
                    <p className="text-sm text-teal-600">Scheduling recurring lessons</p>
                  </div>
                </div>
              )}

              {/* Service Type */}
              <Select
                label="Lesson Type"
                id="serviceType"
                value={formState.serviceTypeId}
                onChange={(e) =>
                  setFormState({ ...formState, serviceTypeId: e.target.value })
                }
                options={[
                  { value: '', label: 'Select lesson type...' },
                  ...serviceTypes.map((s) => ({
                    value: s.id!.toString(),
                    label: `${s.name} (${s.durationMinutes} min)`,
                  })),
                ]}
              />

              {/* Day of Week Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Day of Week
                </label>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setFormState({ ...formState, dayOfWeek: day.value })}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                        formState.dayOfWeek === day.value
                          ? 'bg-gradient-to-r from-teal-500 to-turquoise-500 text-white shadow-lg shadow-teal-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Picker */}
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={formState.startTime}
                  onChange={(e) =>
                    setFormState({ ...formState, startTime: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-300 transition-all"
                />
              </div>

              {/* Frequency Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormState({ ...formState, frequency: option.value })}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        formState.frequency === option.value
                          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                          : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <p
                        className={`font-semibold ${
                          formState.frequency === option.value
                            ? 'text-teal-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          formState.frequency === option.value
                            ? 'text-teal-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-semibold text-slate-800 mb-2"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formState.startDate}
                    onChange={(e) =>
                      setFormState({ ...formState, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-300 transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-semibold text-slate-800 mb-2"
                  >
                    End Date{' '}
                    <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formState.endDate}
                    min={formState.startDate}
                    onChange={(e) =>
                      setFormState({ ...formState, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-300 transition-all"
                  />
                </div>
              </div>

              {/* Instructor (if multiple) */}
              {instructors.length > 1 && (
                <Select
                  label="Instructor"
                  id="instructor"
                  value={formState.instructorId}
                  onChange={(e) =>
                    setFormState({ ...formState, instructorId: e.target.value })
                  }
                  options={instructors.map((i) => ({
                    value: i.id!.toString(),
                    label: i.fullName,
                  }))}
                />
              )}
            </div>
          ) : (
            /* Preview Section */
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-turquoise-50 rounded-2xl border border-teal-100">
                <h3 className="font-semibold text-slate-900 mb-3">Schedule Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Student</p>
                    <p className="font-medium text-slate-900">
                      {selectedStudent?.fullName || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Lesson Type</p>
                    <p className="font-medium text-slate-900">
                      {selectedService?.name || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Day & Time</p>
                    <p className="font-medium text-slate-900">
                      {DAYS_OF_WEEK.find((d) => d.value === formState.dayOfWeek)?.fullLabel} at{' '}
                      {formatTimeDisplay(formState.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Frequency</p>
                    <p className="font-medium text-slate-900">
                      {FREQUENCY_OPTIONS.find((f) => f.value === formState.frequency)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conflict Warning */}
              {conflictCount > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <svg
                    className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-800">
                      {conflictCount} scheduling conflict{conflictCount > 1 ? 's' : ''} detected
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      These lessons will be skipped or require manual adjustment
                    </p>
                  </div>
                </div>
              )}

              {/* Upcoming Lessons List */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Upcoming Lessons ({upcomingLessons.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {upcomingLessons.map((lesson, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        lesson.hasConflict
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            lesson.hasConflict
                              ? 'bg-red-100 text-red-600'
                              : 'bg-teal-100 text-teal-600'
                          }`}
                        >
                          {lesson.date.getDate()}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              lesson.hasConflict ? 'text-red-700' : 'text-slate-900'
                            }`}
                          >
                            {formatLessonDate(lesson.date)}
                          </p>
                          <p
                            className={`text-sm ${
                              lesson.hasConflict ? 'text-red-500' : 'text-slate-500'
                            }`}
                          >
                            {formatTimeDisplay(formState.startTime)}
                          </p>
                        </div>
                      </div>
                      {lesson.hasConflict ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Conflict
                        </span>
                      ) : (
                        <svg
                          className="w-5 h-5 text-teal-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          {/* Cancel Confirmation */}
          {showCancelConfirm && editPattern && (
            <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="font-semibold text-red-800 mb-2">Cancel this recurring pattern?</p>
              <p className="text-sm text-red-600 mb-3">
                Future lessons will be cancelled. Past lessons will remain in the schedule.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Pattern
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancelPattern}
                  loading={isSaving}
                >
                  Yes, Cancel Pattern
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Left side - Cancel pattern (edit mode only) */}
            <div>
              {editPattern && !showCancelConfirm && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel Pattern
                </button>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex gap-3">
              {showPreview ? (
                <>
                  <Button variant="secondary" onClick={() => setShowPreview(false)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={!isFormValid}
                    className="bg-gradient-to-r from-teal-500 to-turquoise-500 hover:from-teal-600 hover:to-turquoise-600"
                  >
                    <svg
                      className="w-5 h-5 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {editPattern ? 'Update Pattern' : 'Create Schedule'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowPreview(true)}
                    disabled={!isFormValid}
                    className="bg-gradient-to-r from-teal-500 to-turquoise-500 hover:from-teal-600 hover:to-turquoise-600"
                  >
                    Preview Lessons
                    <svg
                      className="w-5 h-5 ml-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
