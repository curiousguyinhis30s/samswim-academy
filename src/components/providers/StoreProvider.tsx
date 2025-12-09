'use client'

import { useEffect, useState, ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Dynamically import stores only on client side
    // This prevents any server-side access to localStorage or IndexedDB
    const hydrateStores = async () => {
      try {
        const { useAuthStore } = await import('@/lib/store/auth')
        const { useAppStore } = await import('@/lib/store/app')

        useAuthStore.persist.rehydrate()
        useAppStore.persist.rehydrate()
      } catch (error) {
        console.error('Store hydration error:', error)
      } finally {
        setIsHydrated(true)
      }
    }

    hydrateStores()
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
