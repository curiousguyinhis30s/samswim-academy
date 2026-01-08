'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store/app'
import PaymentHistory from '@/components/payments/PaymentHistory'
import PaymentModal from '@/components/payments/PaymentModal'
import { FadeIn, SlideIn, StaggerChildren, ScaleIn } from '@/lib/animations/gsap-hooks'
import { WaterDrop, Stopwatch } from '@/components/icons/SwimmingIcons'

interface PaymentSummary {
  totalRevenue: number
  pendingPayments: number
  successfulPayments: number
  refundCount: number
  isDemo?: boolean
}

export function Payments() {
  const { clients } = useAppStore()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null)
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [status, setStatus] = useState<'checking' | 'live' | 'demo'>('checking')

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics?type=payment-summary')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setSummary(data)
      setStatus(data.isDemo ? 'demo' : 'live')
    } catch {
      // Fallback demo data
      setSummary({
        totalRevenue: 12450,
        pendingPayments: 450,
        successfulPayments: 142,
        refundCount: 2,
        isDemo: true,
      })
      setStatus('demo')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSummary()
  }

  const handleNewPayment = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName })
    setIsPaymentModalOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/30 via-slate-50 to-teal-50/30">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <SlideIn direction="left" duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                <WaterDrop size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
                <p className="text-slate-500 text-sm mt-1">Manage student payments and view transaction history</p>
              </div>
            </div>
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              {status === 'checking' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                  <span className="text-xs text-slate-500">Checking...</span>
                </>
              )}
              {status === 'live' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-700 font-medium">Live</span>
                </>
              )}
              {status === 'demo' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-amber-700 font-medium">Demo Mode</span>
                </>
              )}
            </div>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-cyan-300 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        </SlideIn>

        {/* Quick Actions & Stats */}
        <StaggerChildren stagger={0.1} y={20}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* New Payment Card */}
            <ScaleIn fromScale={0.95} delay={0}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-300 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">New Payment</h3>
                </div>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  onChange={(e) => {
                    const client = clients.find(c => c.id?.toString() === e.target.value)
                    if (client) {
                      handleNewPayment(client.id?.toString() || '', client.fullName)
                    }
                  }}
                  value=""
                >
                  <option value="">Select student...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id?.toString()}>
                      {client.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </ScaleIn>

            {/* Total Revenue */}
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-300 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">This Month</h3>
                </div>
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.totalRevenue || 0)}</p>
                    <p className="text-sm text-emerald-600">+12% from last month</p>
                  </>
                )}
              </div>
            </FadeIn>

            {/* Successful Payments */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-300 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Completed</h3>
                </div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{summary?.successfulPayments || 0}</p>
                    <p className="text-sm text-slate-500">Successful payments</p>
                  </>
                )}
              </div>
            </FadeIn>

            {/* Pending */}
            <FadeIn delay={0.3}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-300 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <Stopwatch size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Pending</h3>
                </div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.pendingPayments || 0)}</p>
                    <p className="text-sm text-amber-600">Awaiting confirmation</p>
                  </>
                )}
              </div>
            </FadeIn>
          </div>
        </StaggerChildren>

        {/* Payment History */}
        <FadeIn delay={0.4}>
          <PaymentHistory />
        </FadeIn>

        {/* Payment Modal */}
        {selectedStudent && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false)
              setSelectedStudent(null)
            }}
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
          />
        )}
      </div>
    </div>
  )
}
