'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { Button, Modal, Input, Select, formatTime, formatCurrency } from '@/components/ui'

type ViewMode = 'week' | 'day'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6) // 6 AM to 8 PM

// Sample photos for clients
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
]

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

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatDayHeader(date: Date): { day: string; num: string } {
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    num: date.getDate().toString(),
  }
}

export function Calendar() {
  const { bookings, clients, serviceTypes, instructors, participants, addBooking, tenant } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null)

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    clientId: '',
    serviceTypeId: '',
    instructorId: '',
    date: '',
    startTime: '',
    notes: '',
  })

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const today = new Date()

  const navigateWeek = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (delta * 7))
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  const getBookingsForSlot = (date: Date, hour: number) => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.startTime)
      return isSameDay(bookingDate, date) && bookingDate.getHours() === hour
    })
  }

  const handleSlotClick = (date: Date, hour: number) => {
    const slotDate = new Date(date)
    slotDate.setHours(hour, 0, 0, 0)
    setSelectedSlot({ date: slotDate, hour })
    setNewBooking({
      ...newBooking,
      date: slotDate.toISOString().split('T')[0],
      startTime: `${hour.toString().padStart(2, '0')}:00`,
    })
    setShowNewBooking(true)
  }

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
    setSelectedSlot(null)
    setNewBooking({
      clientId: '',
      serviceTypeId: '',
      instructorId: '',
      date: '',
      startTime: '',
      notes: '',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-sea-100 border-sea-200 text-sea-800'
      case 'cancelled': return 'bg-ocean-100 border-ocean-200 text-ocean-500'
      case 'no_show': return 'bg-red-100 border-red-200 text-red-800'
      default: return 'bg-gradient-to-r from-ocean-50 to-sea-50 border-ocean-200 text-ocean-800'
    }
  }

  const getClientPhoto = (clientId: number) => {
    const index = clients.findIndex(c => c.id === clientId)
    return SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length]
  }

  return (
    <div className="h-screen flex flex-col ocean-bg">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-8 py-6 border-b border-ocean-100 bg-white/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ocean-900">Calendar</h1>
            <p className="text-ocean-600 mt-1">Manage lessons and schedules</p>
          </div>
          <Button onClick={() => setShowNewBooking(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Lesson
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-ocean-100 p-1.5 rounded-xl">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-ocean-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-white rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-ocean-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <h2 className="text-lg font-bold text-ocean-900">
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-ocean-100 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-white text-ocean-700 shadow-sm' : 'text-ocean-600 hover:text-ocean-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-white text-ocean-700 shadow-sm' : 'text-ocean-600 hover:text-ocean-800'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-ocean-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <div className="w-20" /> {/* Time column spacer */}
            {weekDays.map((date, i) => {
              const { day, num } = formatDayHeader(date)
              const isToday = isSameDay(date, today)
              return (
                <div
                  key={i}
                  className={`py-4 text-center border-l border-ocean-50 ${
                    isToday ? 'bg-gradient-to-b from-ocean-50 to-transparent' : ''
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-ocean-600' : 'text-ocean-400'}`}>
                    {day}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isToday ? 'text-ocean-600' : 'text-ocean-900'
                  }`}>
                    {num}
                  </p>
                  {isToday && (
                    <div className="w-2 h-2 rounded-full bg-tennis-500 mx-auto mt-2" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Time Slots */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-ocean-50 hover:bg-ocean-50/30 transition-colors">
              <div className="w-20 py-4 pr-3 text-right">
                <span className="text-xs font-semibold text-ocean-400">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              </div>
              {weekDays.map((date, i) => {
                const slotBookings = getBookingsForSlot(date, hour)
                const isToday = isSameDay(date, today)
                return (
                  <div
                    key={i}
                    onClick={() => handleSlotClick(date, hour)}
                    className={`min-h-[70px] border-l border-ocean-50 p-1.5 cursor-pointer group transition-colors ${
                      isToday ? 'bg-ocean-50/20' : 'hover:bg-ocean-50/50'
                    }`}
                  >
                    {slotBookings.length === 0 && (
                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-ocean-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                    {slotBookings.map(booking => {
                      const participant = participants.find(p => p.bookingId === booking.id)
                      const client = participant ? clients.find(c => c.id === participant.clientId) : null
                      const service = serviceTypes.find(s => s.id === booking.serviceTypeId)
                      const photoUrl = client ? getClientPhoto(client.id!) : SAMPLE_PHOTOS[0]
                      return (
                        <div
                          key={booking.id}
                          className={`rounded-xl p-2.5 text-xs mb-1 border shadow-sm hover:shadow-md transition-shadow ${getStatusColor(booking.status)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={photoUrl}
                              alt={client?.fullName || 'Client'}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate text-ocean-900">{client?.fullName}</div>
                              <div className="text-ocean-500 flex items-center gap-1.5 mt-0.5">
                                <span>{service?.name}</span>
                                <span className="opacity-50">·</span>
                                <span>{formatTime(new Date(booking.startTime))}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* New Booking Modal */}
      <Modal
        isOpen={showNewBooking}
        onClose={() => {
          setShowNewBooking(false)
          setSelectedSlot(null)
        }}
        title="Schedule New Lesson"
        size="md"
      >
        <div className="space-y-5">
          <Select
            label="Client"
            id="client"
            value={newBooking.clientId}
            onChange={(e) => setNewBooking({ ...newBooking, clientId: e.target.value })}
            options={[
              { value: '', label: 'Select a client...' },
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
                label: `${s.name} - ${formatCurrency(s.pricePerSession, tenant?.currency || 'AED')}`
              }))
            ]}
          />

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
              label="Start Time"
              id="startTime"
              value={newBooking.startTime}
              onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
            />
          </div>

          <Input
            label="Notes (optional)"
            id="notes"
            value={newBooking.notes}
            onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
            placeholder="Any special instructions..."
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowNewBooking(false)
                setSelectedSlot(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateBooking}
              disabled={!newBooking.clientId || !newBooking.serviceTypeId}
            >
              Schedule Lesson
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
