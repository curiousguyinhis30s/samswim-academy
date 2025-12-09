'use client'

import { useState } from 'react'

interface LandingProps {
  onEnterPortal: () => void
}

export function Landing({ onEnterPortal }: LandingProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-ocean-500">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="waves" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
                <path d="M0 5 Q5 0 10 5 T20 5" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#waves)"/>
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-strong mb-8">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-ocean-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.5c-2.5 0-4.5-.5-6-1.5s-2.5-2.5-2.5-4.5c0-1.5.5-3 1.5-4s2.5-2 4.5-2c1.5 0 3 .5 4 1.5s1.5 2 1.5 3c0 .5-.5 1-1.5 1h-4c-.5 0-1-.5-1-1s.5-1 1-1h2.5c0-.5-.5-1-1.5-1s-2 .5-2.5 1.5-1 2-1 3c0 1.5.5 2.5 1.5 3s2.5 1 4.5 1 4-.5 5-1.5 1.5-2.5 1.5-4c0-2.5-1-4.5-3-6s-4.5-2.5-7.5-2.5c-1.5 0-3 .5-4 1s-2 1-2.5 1.5c-.5-.5-1-1-1-1.5s0-1 .5-1.5 1-1 2-1.5 2.5-1 4.5-1c3.5 0 6.5 1 8.5 3s3 4.5 3 7.5c0 2.5-1 4.5-3 6s-4.5 2.5-7.5 2.5z"/>
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Sam's Swim Academy
            </h1>
            <p className="text-lg sm:text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
              Professional swimming lessons in Dubai. Learn to swim with confidence.
            </p>

            {/* CTA Button - Very Obvious */}
            <button
              onClick={onEnterPortal}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`
                relative inline-flex items-center justify-center
                px-8 py-4 sm:px-12 sm:py-5
                text-lg sm:text-xl font-semibold
                bg-white text-ocean-600
                rounded-2xl
                shadow-strong
                transition-all duration-300 ease-out
                ${isHovered ? 'scale-105 shadow-xl' : ''}
              `}
            >
              <span>Enter Portal</span>
              <svg
                className={`ml-3 w-6 h-6 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* Sub-text */}
            <p className="mt-6 text-ocean-200 text-sm">
              For students and administrators
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Everything you need
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Manage your swimming lessons, track progress, and stay connected.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-ocean-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-ocean-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Scheduling</h3>
            <p className="text-slate-600 text-sm">View and manage your lesson schedule at a glance.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-algae-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-algae-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Track Progress</h3>
            <p className="text-slate-600 text-sm">Monitor swimming skills and celebrate achievements.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-soft sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-coral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Client Management</h3>
            <p className="text-slate-600 text-sm">Keep track of all students and their information.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            Sam's Swim Academy · Dubai, UAE
          </p>
        </div>
      </footer>
    </div>
  )
}
