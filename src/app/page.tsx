'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landing } from '@/components/pages/Landing'

export default function LandingPage() {
  const router = useRouter()
  const [isPortalPort, setIsPortalPort] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if we're on the portal port (3051)
    if (typeof window !== 'undefined') {
      const port = window.location.port
      if (port === '3051') {
        setIsPortalPort(true)
        router.push('/portal')
      } else {
        setIsChecking(false)
      }
    }
  }, [router])

  // Show loading while checking port or redirecting
  if (isChecking || isPortalPort) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-900 to-teal-700">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-teal-600 rounded-full" />
            <div className="absolute inset-0 border-4 border-teal-300 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-teal-100 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const handleEnterPortal = () => {
    // Redirect to portal on port 3051
    window.location.href = 'http://localhost:3051/portal'
  }

  return <Landing onEnterPortal={handleEnterPortal} />
}
