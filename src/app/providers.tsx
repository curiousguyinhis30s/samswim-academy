'use client'

import { useEffect, useState } from 'react'
import { seedDemoData } from '@/lib/db/seed'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Seed demo data on first load
    seedDemoData()
      .then(() => {
        console.log('SamSwim Academy Ready!')
        setIsReady(true)
      })
      .catch((err) => {
        console.error('Failed to seed data:', err)
        setIsReady(true) // Continue anyway
      })
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Setting up demo data...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
