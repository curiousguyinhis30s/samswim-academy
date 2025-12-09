'use client'

import { useEffect, useState, ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [hydrationError, setHydrationError] = useState<string | null>(null)

  useEffect(() => {
    // Guard: Only run on client
    if (typeof window === 'undefined') {
      setIsHydrated(true)
      return
    }

    // Dynamically import stores only on client side
    // This prevents any server-side access to localStorage or IndexedDB
    const hydrateStores = async () => {
      try {
        console.log('[StoreProvider] Starting store hydration...')

        const authModule = await import('@/lib/store/auth')
        console.log('[StoreProvider] Auth store imported')

        const appModule = await import('@/lib/store/app')
        console.log('[StoreProvider] App store imported')

        authModule.useAuthStore.persist.rehydrate()
        console.log('[StoreProvider] Auth store rehydrated')

        appModule.useAppStore.persist.rehydrate()
        console.log('[StoreProvider] App store rehydrated')

      } catch (error) {
        console.error('[StoreProvider] Store hydration error:', error)
        setHydrationError(error instanceof Error ? error.message : 'Unknown error')
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
