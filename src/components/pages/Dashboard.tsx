'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { Button, Badge, formatTime } from '@/components/ui'

type PageType = 'dashboard' | 'calendar' | 'clients' | 'progress' | 'settings'

interface DashboardProps {
  onNavigate: (page: PageType) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { tenant, currentUser, clients, bookings, participants, serviceTypes } = useAppStore()

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const todayBookings = bookings.filter(
      (b) => new Date(b.startTime) >= today && new Date(b.startTime) < tomorrow
    )

    const upcomingBookings = bookings.filter(
      (b) => new Date(b.startTime) >= now && b.status === 'confirmed'
    )

    const completedThisWeek = bookings.filter(
      (b) => new Date(b.startTime) >= weekAgo && b.status === 'completed'
    )

    return {
      totalClients: clients.length,
      todayLessons: todayBookings.length,
      upcomingLessons: upcomingBookings.length,
      completedLessons: completedThisWeek.length,
    }
  }, [clients, bookings])

  const todaysSchedule = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return bookings
      .filter((b) => new Date(b.startTime) >= today && new Date(b.startTime) < tomorrow)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5)
  }, [bookings])

  const getClientForBooking = (bookingId?: number) => {
    if (!bookingId) return null
    const participant = participants.find((p) => p.bookingId === bookingId)
    if (!participant) return null
    return clients.find((c) => c.id === participant.clientId)
  }

  const getServiceType = (serviceTypeId?: number) => {
    if (!serviceTypeId) return null
    return serviceTypes.find((s) => s.id === serviceTypeId)
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-slate-500 text-sm font-medium">{greeting()}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentUser?.fullName?.split(' ')[0]}
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Total Clients"
            value={stats.totalClients}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
            color="ocean"
          />
          <StatCard
            label="Today's Lessons"
            value={stats.todayLessons}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            color="algae"
          />
          <StatCard
            label="Completed"
            value={stats.completedLessons}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="coral"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcomingLessons}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="slate"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Today's Schedule - NO PRICE SHOWN */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Today's Schedule</h2>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-sm text-ocean-500 font-medium hover:text-ocean-600"
                >
                  View All
                </button>
              </div>

              {todaysSchedule.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {todaysSchedule.map((booking) => {
                    const client = getClientForBooking(booking.id!)
                    const service = getServiceType(booking.serviceTypeId)
                    const isPast = new Date(booking.endTime) < new Date()
                    const isNow = new Date(booking.startTime) <= new Date() && new Date(booking.endTime) > new Date()

                    return (
                      <div
                        key={booking.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          isNow ? 'bg-algae-50' : isPast ? 'opacity-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Time */}
                        <div className="text-center min-w-[52px]">
                          <p className={`text-sm font-semibold ${isNow ? 'text-algae-600' : 'text-slate-900'}`}>
                            {formatTime(new Date(booking.startTime))}
                          </p>
                          <p className="text-xs text-slate-500">
                            {service?.durationMinutes ?? 45}m
                          </p>
                        </div>

                        <div className="w-px h-8 bg-slate-200" />

                        {/* Client Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isNow ? 'bg-algae-100' : 'bg-ocean-100'
                        }`}>
                          <span className={`text-sm font-semibold ${isNow ? 'text-algae-700' : 'text-ocean-700'}`}>
                            {client?.fullName?.charAt(0) || '?'}
                          </span>
                        </div>

                        {/* Client & Service Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{client?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-slate-500 truncate">{service?.name}</p>
                        </div>

                        {/* Status Badge - NO PRICE */}
                        <div className="flex-shrink-0">
                          {isNow && (
                            <span className="px-2 py-1 text-xs font-medium bg-algae-500 text-white rounded-full">
                              Now
                            </span>
                          )}
                          {isPast && booking.status === 'completed' && (
                            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                              Done
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900">No lessons today</p>
                  <p className="text-sm text-slate-500 mt-1">Your schedule is clear</p>
                  <button
                    onClick={() => onNavigate('calendar')}
                    className="mt-4 px-4 py-2 bg-ocean-500 text-white text-sm font-medium rounded-lg hover:bg-ocean-600 transition-colors"
                  >
                    Schedule a Lesson
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold text-slate-900 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <QuickAction
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  }
                  label="Book Lesson"
                  onClick={() => onNavigate('calendar')}
                />
                <QuickAction
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  }
                  label="Add Client"
                  onClick={() => onNavigate('clients')}
                />
                <QuickAction
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  }
                  label="Track Progress"
                  onClick={() => onNavigate('progress')}
                />
              </div>
            </div>

            {/* Recent Students */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Recent Students</h2>
                <button
                  onClick={() => onNavigate('clients')}
                  className="text-sm text-ocean-500 font-medium hover:text-ocean-600"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {clients.slice(0, 4).map((client) => (
                  <div key={client.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-ocean-700">
                        {client.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{client.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-algae-50 text-algae-600 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-6 bg-ocean-500 rounded-xl p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg">Ready for today?</h3>
              <p className="text-ocean-100 text-sm">You have {stats.todayLessons} lessons scheduled</p>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="px-4 py-2 bg-white text-ocean-600 rounded-lg font-medium text-sm hover:bg-ocean-50 transition-colors"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: 'ocean' | 'algae' | 'coral' | 'slate'
}) {
  const colors = {
    ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-500', border: 'border-ocean-100' },
    algae: { bg: 'bg-algae-50', icon: 'text-algae-500', border: 'border-algae-100' },
    coral: { bg: 'bg-coral-50', icon: 'text-coral-500', border: 'border-coral-100' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-500', border: 'border-slate-200' },
  }

  return (
    <div className={`bg-white rounded-xl border ${colors[color].border} p-4`}>
      <div className={`w-9 h-9 rounded-lg ${colors[color].bg} flex items-center justify-center mb-3`}>
        <span className={colors[color].icon}>{icon}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  )
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
    >
      <div className="p-2 bg-white rounded-lg border border-slate-200">
        <span className="text-slate-600">{icon}</span>
      </div>
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <svg className="w-4 h-4 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
