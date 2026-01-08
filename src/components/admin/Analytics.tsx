'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store/app'
import { formatCurrency } from '@/components/ui'

type DateRange = '7d' | '30d' | '90d' | 'all'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: 'teal' | 'emerald' | 'amber' | 'red' | 'blue'
}

function StatCard({ title, value, subtitle, change, changeLabel, icon, color = 'teal' }: StatCardProps) {
  const colorStyles = {
    teal: 'from-teal-500 to-teal-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorStyles[color]} text-white`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      {changeLabel && <p className="text-xs text-slate-400 mt-0.5">{changeLabel}</p>}
    </div>
  )
}

// Simple Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  maxValue?: number
  height?: number
  showLabels?: boolean
}

function BarChart({ data, maxValue, height = 120, showLabels = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden" style={{ height: height - 24 }}>
            <div
              className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${item.color || 'bg-gradient-to-t from-teal-500 to-teal-400'}`}
              style={{ height: `${(item.value / max) * 100}%` }}
            />
          </div>
          {showLabels && (
            <span className="text-xs text-slate-500 font-medium truncate w-full text-center">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// Simple Line Chart Component using SVG
interface LineChartProps {
  data: number[]
  labels?: string[]
  height?: number
  color?: string
}

function LineChart({ data, labels, height = 100, color = '#14b8a6' }: LineChartProps) {
  if (data.length === 0) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const width = 100
  const padding = 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Gradient fill */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#lineGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {data.map((value, index) => {
          const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2)
          const y = height - padding - ((value - min) / range) * (height - padding * 2)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
            />
          )
        })}
      </svg>
      {labels && (
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <span key={i} className="text-xs text-slate-400">{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// Progress Ring Component
interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

function ProgressRing({ progress, size = 80, strokeWidth = 8, color = '#14b8a6', label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{Math.round(progress)}%</span>
        </div>
      </div>
      {label && <span className="text-sm text-slate-600 font-medium">{label}</span>}
    </div>
  )
}

export function Analytics() {
  const { clients, bookings, participants, serviceTypes, assessments, skills, lessonNotes } = useAppStore()
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  // Date range calculations
  const dateRangeBounds = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let startDate: Date

    switch (dateRange) {
      case '7d':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 90)
        break
      case 'all':
      default:
        startDate = new Date(0)
    }

    return { startDate, endDate: now, today }
  }, [dateRange])

  // Previous period for comparison
  const previousPeriodBounds = useMemo(() => {
    const { startDate, endDate } = dateRangeBounds
    const duration = endDate.getTime() - startDate.getTime()
    return {
      startDate: new Date(startDate.getTime() - duration),
      endDate: new Date(startDate.getTime()),
    }
  }, [dateRangeBounds])

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.startTime)
      return bookingDate >= dateRangeBounds.startDate && bookingDate <= dateRangeBounds.endDate
    })
  }, [bookings, dateRangeBounds])

  const previousPeriodBookings = useMemo(() => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.startTime)
      return bookingDate >= previousPeriodBounds.startDate && bookingDate <= previousPeriodBounds.endDate
    })
  }, [bookings, previousPeriodBounds])

  // Revenue calculations
  const revenueMetrics = useMemo(() => {
    const currentRevenue = filteredBookings
      .filter(b => b.status === 'completed' || b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.price, 0)

    const previousRevenue = previousPeriodBookings
      .filter(b => b.status === 'completed' || b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.price, 0)

    const change = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0

    // Monthly breakdown for chart
    const monthlyRevenue: Record<string, number> = {}
    filteredBookings.forEach(b => {
      if (b.status === 'completed' || b.paymentStatus === 'paid') {
        const date = new Date(b.startTime)
        const monthKey = `${date.getMonth() + 1}/${date.getDate()}`
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + b.price
      }
    })

    return { currentRevenue, previousRevenue, change, monthlyRevenue }
  }, [filteredBookings, previousPeriodBookings])

  // Student metrics
  const studentMetrics = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const activeClients = new Set(
      filteredBookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .flatMap(b => participants.filter(p => p.bookingId === b.id).map(p => p.clientId))
    )

    const newThisMonth = clients.filter(c => new Date(c.createdAt) >= thisMonth).length
    const newLastMonth = clients.filter(c => {
      const created = new Date(c.createdAt)
      return created >= lastMonth && created < thisMonth
    }).length

    return {
      total: clients.length,
      active: activeClients.size,
      inactive: clients.length - activeClients.size,
      newThisMonth,
      newLastMonthChange: newLastMonth > 0
        ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
        : newThisMonth > 0 ? 100 : 0,
    }
  }, [clients, filteredBookings, participants])

  // Lesson stats
  const lessonStats = useMemo(() => {
    const completed = filteredBookings.filter(b => b.status === 'completed').length
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length
    const noShows = filteredBookings.filter(b => b.status === 'no_show').length
    const total = filteredBookings.length

    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0
    const noShowRate = total > 0 ? Math.round((noShows / total) * 100) : 0

    // Weekly average
    const days = Math.max(1, Math.ceil((dateRangeBounds.endDate.getTime() - dateRangeBounds.startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const weeks = Math.max(1, days / 7)
    const avgPerWeek = Math.round(completed / weeks * 10) / 10

    // Previous period comparison
    const prevCompleted = previousPeriodBookings.filter(b => b.status === 'completed').length
    const completedChange = prevCompleted > 0
      ? Math.round(((completed - prevCompleted) / prevCompleted) * 100)
      : completed > 0 ? 100 : 0

    return { completed, cancelled, noShows, total, cancellationRate, noShowRate, avgPerWeek, completedChange }
  }, [filteredBookings, previousPeriodBookings, dateRangeBounds])

  // Skill progress metrics
  const skillMetrics = useMemo(() => {
    if (skills.length === 0) return { masteryRate: 0, avgLevel: 0, totalAssessments: 0 }

    const masteredCount = assessments.filter(a => a.level >= 4).length
    const totalAssessments = assessments.length
    const masteryRate = totalAssessments > 0 ? Math.round((masteredCount / totalAssessments) * 100) : 0

    const avgLevel = totalAssessments > 0
      ? Math.round((assessments.reduce((sum, a) => sum + a.level, 0) / totalAssessments) * 10) / 10
      : 0

    return { masteryRate, avgLevel, totalAssessments }
  }, [assessments, skills])

  // Top performers
  const topPerformers = useMemo(() => {
    const studentProgress: Record<number, { name: string; progress: number; lessonsCompleted: number }> = {}

    // Count completed lessons per student
    filteredBookings
      .filter(b => b.status === 'completed')
      .forEach(b => {
        const bookingParticipants = participants.filter(p => p.bookingId === b.id)
        bookingParticipants.forEach(p => {
          const client = clients.find(c => c.id === p.clientId)
          if (client) {
            if (!studentProgress[p.clientId]) {
              studentProgress[p.clientId] = { name: client.fullName, progress: 0, lessonsCompleted: 0 }
            }
            studentProgress[p.clientId].lessonsCompleted++
          }
        })
      })

    // Add skill progress
    assessments.forEach(a => {
      const client = clients.find(c => c.id === a.studentId)
      if (client && studentProgress[a.studentId]) {
        studentProgress[a.studentId].progress += a.level
      }
    })

    return Object.entries(studentProgress)
      .map(([id, data]) => ({ id: Number(id), ...data }))
      .sort((a, b) => (b.lessonsCompleted * 10 + b.progress) - (a.lessonsCompleted * 10 + a.progress))
      .slice(0, 5)
  }, [filteredBookings, participants, clients, assessments])

  // At-risk students (retention)
  const atRiskStudents = useMemo(() => {
    const now = new Date()
    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const recentlyActive = new Set(
      bookings
        .filter(b => new Date(b.startTime) >= twoWeeksAgo && (b.status === 'completed' || b.status === 'confirmed'))
        .flatMap(b => participants.filter(p => p.bookingId === b.id).map(p => p.clientId))
    )

    const upcomingBookings = new Set(
      bookings
        .filter(b => new Date(b.startTime) > now && b.status !== 'cancelled')
        .flatMap(b => participants.filter(p => p.bookingId === b.id).map(p => p.clientId))
    )

    const atRisk = clients.filter(c => {
      const hasRecentActivity = recentlyActive.has(c.id!)
      const hasUpcoming = upcomingBookings.has(c.id!)
      return !hasRecentActivity && !hasUpcoming && c.status === 'active'
    })

    return atRisk.slice(0, 5).map(c => {
      const lastBooking = bookings
        .filter(b => participants.some(p => p.bookingId === b.id && p.clientId === c.id))
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]

      const daysSinceLastLesson = lastBooking
        ? Math.floor((now.getTime() - new Date(lastBooking.startTime).getTime()) / (1000 * 60 * 60 * 24))
        : null

      return { client: c, daysSinceLastLesson }
    })
  }, [clients, bookings, participants])

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 30
    const data: number[] = []
    const labels: string[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayRevenue = bookings
        .filter(b => {
          const bookingDate = new Date(b.startTime)
          return bookingDate >= dayStart && bookingDate < dayEnd && (b.status === 'completed' || b.paymentStatus === 'paid')
        })
        .reduce((sum, b) => sum + b.price, 0)

      data.push(dayRevenue)

      if (days <= 7 || i % Math.ceil(days / 7) === 0) {
        labels.push(dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }
    }

    return { data, labels }
  }, [bookings, dateRange])

  // Lessons by service type
  const lessonsByService = useMemo(() => {
    const counts: Record<number, number> = {}
    filteredBookings.forEach(b => {
      counts[b.serviceTypeId] = (counts[b.serviceTypeId] || 0) + 1
    })

    return serviceTypes
      .map(s => ({
        label: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
        value: counts[s.id!] || 0,
        color: s.color ? `bg-[${s.color}]` : 'bg-gradient-to-t from-teal-500 to-teal-400',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [filteredBookings, serviceTypes])

  // Export data handler (mock)
  const handleExport = () => {
    const data = {
      dateRange,
      revenue: revenueMetrics,
      students: studentMetrics,
      lessons: lessonStats,
      skills: skillMetrics,
      topPerformers,
      atRiskStudents: atRiskStudents.map(s => ({ name: s.client.fullName, daysSinceLastLesson: s.daysSinceLastLesson })),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `samswim-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Track your academy's performance and growth</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              {(['7d', '30d', '90d', 'all'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    dateRange === range
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(revenueMetrics.currentRevenue)}
            change={revenueMetrics.change}
            changeLabel="vs previous period"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="teal"
          />
          <StatCard
            title="Active Students"
            value={studentMetrics.active}
            subtitle={`${studentMetrics.total} total`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Lessons Completed"
            value={lessonStats.completed}
            change={lessonStats.completedChange}
            changeLabel="vs previous period"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            title="Avg Lessons/Week"
            value={lessonStats.avgPerWeek}
            subtitle={`${lessonStats.cancellationRate}% cancellation rate`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="amber"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Revenue Trend</h3>
              <span className="text-sm text-slate-500">Last {dateRange === 'all' ? '30' : dateRange.replace('d', '')} days</span>
            </div>
            <LineChart
              data={revenueChartData.data}
              labels={revenueChartData.labels.length > 0 ? [revenueChartData.labels[0], revenueChartData.labels[revenueChartData.labels.length - 1]] : []}
              height={140}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Period Total</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(revenueMetrics.currentRevenue)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Previous Period</p>
                <p className="text-lg font-bold text-slate-400">{formatCurrency(revenueMetrics.previousRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Lessons by Service Type */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Lessons by Service</h3>
              <span className="text-sm text-slate-500">{lessonStats.total} total</span>
            </div>
            {lessonsByService.length > 0 ? (
              <BarChart data={lessonsByService} height={140} />
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400">
                No lesson data available
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
              {lessonsByService.slice(0, 3).map((service, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-400" />
                  <span className="text-xs text-slate-600">{service.label}: {service.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student & Skill Metrics */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Student Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Student Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Enrolled</span>
                <span className="font-semibold text-slate-900">{studentMetrics.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Active (with bookings)</span>
                <span className="font-semibold text-emerald-600">{studentMetrics.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Inactive</span>
                <span className="font-semibold text-amber-600">{studentMetrics.inactive}</span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">New This Month</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{studentMetrics.newThisMonth}</span>
                    {studentMetrics.newLastMonthChange !== 0 && (
                      <span className={`text-xs font-medium ${studentMetrics.newLastMonthChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {studentMetrics.newLastMonthChange > 0 ? '+' : ''}{studentMetrics.newLastMonthChange}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Skill Progress</h3>
            <div className="flex items-center justify-center py-4">
              <ProgressRing
                progress={skillMetrics.masteryRate}
                label="Mastery Rate"
                size={100}
                color="#14b8a6"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{skillMetrics.avgLevel}</p>
                <p className="text-xs text-slate-500">Avg Skill Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{skillMetrics.totalAssessments}</p>
                <p className="text-xs text-slate-500">Assessments</p>
              </div>
            </div>
          </div>

          {/* Lesson Health */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Lesson Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Completion Rate</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {lessonStats.total > 0 ? Math.round((lessonStats.completed / lessonStats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${lessonStats.total > 0 ? (lessonStats.completed / lessonStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Cancellation Rate</span>
                  <span className="text-sm font-semibold text-amber-600">{lessonStats.cancellationRate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${lessonStats.cancellationRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">No-Show Rate</span>
                  <span className="text-sm font-semibold text-red-600">{lessonStats.noShowRate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${lessonStats.noShowRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers & At-Risk Students */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-slate-900">Top Performers</h3>
            </div>
            {topPerformers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.lessonsCompleted} lessons completed</p>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">+{student.progress}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="text-sm">No performance data yet</p>
              </div>
            )}
          </div>

          {/* At-Risk Students (Retention) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-semibold text-slate-900">At-Risk Students</h3>
              <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {atRiskStudents.length} need attention
              </span>
            </div>
            {atRiskStudents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {atRiskStudents.map((item, index) => (
                  <div key={item.client.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-semibold">
                      {item.client.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.client.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {item.daysSinceLastLesson !== null
                          ? `Last lesson ${item.daysSinceLastLesson} days ago`
                          : 'No lessons recorded'
                        }
                      </p>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                      Reach Out
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-600 font-medium">All students are engaged!</p>
                <p className="text-xs text-slate-400 mt-1">No at-risk students detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Quick Insights</h3>
              <p className="text-teal-100 text-sm">
                {studentMetrics.active > 0 && lessonStats.completed > 0 ? (
                  <>
                    Your academy has <span className="font-semibold text-white">{studentMetrics.active} active students</span> with an average of{' '}
                    <span className="font-semibold text-white">{lessonStats.avgPerWeek} lessons per week</span>.
                    {revenueMetrics.change > 0 && ` Revenue is up ${revenueMetrics.change}% compared to last period!`}
                    {lessonStats.cancellationRate > 15 && ` Consider following up on cancellations (${lessonStats.cancellationRate}% rate).`}
                  </>
                ) : (
                  'Start booking lessons to see insights about your academy performance!'
                )}
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
