'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { db, User } from '@/lib/db'
import { Avatar, formatCurrency } from '@/components/ui'

interface DashboardStats {
  totalClients: number
  todayLessons: number
  weeklyRevenue: number
  upcomingLessons: number
}

export default function DashboardPage() {
  const { user, tenant } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    todayLessons: 0,
    weeklyRevenue: 0,
    upcomingLessons: 0,
  })
  const [recentClients, setRecentClients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      if (!tenant?.id) return

      try {
        const clients = await db.users
          .where('tenantId')
          .equals(tenant.id)
          .and(u => u.role === 'client')
          .toArray()

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayBookings = await db.bookings
          .where('tenantId')
          .equals(tenant.id)
          .and(b => b.startTime >= today && b.startTime < tomorrow)
          .toArray()

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekBookings = await db.bookings
          .where('tenantId')
          .equals(tenant.id)
          .and(b => b.startTime >= weekAgo && b.paymentStatus === 'paid')
          .toArray()

        const weeklyRevenue = weekBookings.reduce((sum, b) => sum + (b.price || 0), 0)

        const upcomingBookings = await db.bookings
          .where('tenantId')
          .equals(tenant.id)
          .and(b => b.startTime >= new Date() && b.status === 'confirmed')
          .toArray()

        setStats({
          totalClients: clients.length,
          todayLessons: todayBookings.length,
          weeklyRevenue,
          upcomingLessons: upcomingBookings.length,
        })

        const recent = clients.slice(-5).reverse()
        setRecentClients(recent)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [tenant?.id])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ocean-900">
              {greeting()}, {user?.fullName.split(' ')[0]}
            </h1>
            <p className="text-ocean-600 mt-1">Here&apos;s what&apos;s happening with your swim school today.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-tennis-100 text-tennis-700 rounded-full text-sm font-semibold">
              Pro Plan
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="ocean"
          trend="+12%"
        />
        <StatCard
          title="Today's Lessons"
          value={stats.todayLessons}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="sea"
        />
        <StatCard
          title="Weekly Revenue"
          value={formatCurrency(stats.weeklyRevenue)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="tennis"
          trend="+8%"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingLessons}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="wave"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ocean-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ocean-100">
            <h2 className="text-lg font-bold text-ocean-900">Recent Clients</h2>
            <button className="text-sm text-ocean-600 hover:text-ocean-700 font-semibold">
              View all
            </button>
          </div>
          {recentClients.length > 0 ? (
            <div className="divide-y divide-ocean-50">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center gap-4 px-6 py-4 hover:bg-ocean-50/50 transition-colors">
                  <Avatar name={client.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ocean-900 truncate">{client.fullName}</p>
                    <p className="text-xs text-ocean-500 truncate">{client.email}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sea-100 text-sea-700">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-ocean-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-ocean-600 font-medium mb-2">No clients yet</p>
              <p className="text-ocean-400 text-sm mb-4">Add your first client to get started</p>
              <button className="px-4 py-2 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-xl font-semibold text-sm shadow-ocean hover:from-ocean-600 hover:to-ocean-700 transition-all">
                Add Client
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-ocean-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              label="Book New Lesson"
              description="Schedule a swimming session"
              color="ocean"
            />
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              label="Add New Client"
              description="Register a new swimmer"
              color="sea"
            />
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              label="View Progress"
              description="Track skill assessments"
              color="tennis"
            />
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="View Calendar"
              description="See your schedule"
              color="wave"
            />
          </div>
        </div>
      </div>

      {/* Upcoming Lessons Preview */}
      <div className="mt-6 bg-gradient-to-br from-ocean-500 via-ocean-600 to-sea-600 rounded-2xl p-6 text-white shadow-ocean">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Ready for today&apos;s lessons?</h3>
            <p className="text-ocean-100">You have {stats.todayLessons} lessons scheduled for today</p>
          </div>
          <button className="px-5 py-2.5 bg-white text-ocean-700 rounded-xl font-semibold text-sm hover:bg-ocean-50 transition-colors shadow-md">
            View Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'ocean' | 'sea' | 'tennis' | 'wave'
  trend?: string
}) {
  const colors = {
    ocean: {
      bg: 'bg-ocean-50',
      icon: 'text-ocean-600',
      border: 'border-ocean-100',
    },
    sea: {
      bg: 'bg-sea-50',
      icon: 'text-sea-600',
      border: 'border-sea-100',
    },
    tennis: {
      bg: 'bg-tennis-50',
      icon: 'text-tennis-600',
      border: 'border-tennis-100',
    },
    wave: {
      bg: 'bg-wave-50',
      icon: 'text-wave-600',
      border: 'border-wave-100',
    },
  }

  return (
    <div className={`bg-white rounded-2xl border ${colors[color].border} p-4 sm:p-6 stat-card`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 sm:p-3 rounded-xl ${colors[color].bg}`}>
          <span className={colors[color].icon}>{icon}</span>
        </div>
        {trend && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-tennis-100 text-tennis-700">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs sm:text-sm text-ocean-500 font-medium">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-ocean-900 mt-1">{value}</p>
    </div>
  )
}

function QuickActionButton({
  icon,
  label,
  description,
  color,
}: {
  icon: React.ReactNode
  label: string
  description: string
  color: 'ocean' | 'sea' | 'tennis' | 'wave'
}) {
  const colors = {
    ocean: 'bg-ocean-50 text-ocean-600 group-hover:bg-ocean-100',
    sea: 'bg-sea-50 text-sea-600 group-hover:bg-sea-100',
    tennis: 'bg-tennis-50 text-tennis-600 group-hover:bg-tennis-100',
    wave: 'bg-wave-50 text-wave-600 group-hover:bg-wave-100',
  }

  return (
    <button className="w-full group flex items-center gap-4 p-4 bg-ocean-50/50 hover:bg-ocean-50 rounded-xl transition-all text-left">
      <div className={`p-2.5 rounded-xl transition-colors ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ocean-900">{label}</p>
        <p className="text-xs text-ocean-500">{description}</p>
      </div>
      <svg className="w-5 h-5 text-ocean-300 group-hover:text-ocean-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
