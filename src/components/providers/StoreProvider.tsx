'use client'

import { useEffect, useState, ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Immediately mark as hydrated - stores will handle their own hydration
    // This prevents blocking the UI while stores initialize
    let mounted = true

    const hydrateStores = async () => {
      try {
        // Dynamically import stores only on client side
        // This prevents any server-side access to localStorage or IndexedDB
        const [authModule, appModule] = await Promise.all([
          import('@/lib/store/auth'),
          import('@/lib/store/app'),
        ])

        // Only rehydrate if component is still mounted
        if (mounted) {
          // Wrap in try-catch to handle any rehydration errors gracefully
          try {
            authModule.useAuthStore.persist.rehydrate()
          } catch (e) {
            console.warn('[StoreProvider] Auth store rehydration failed:', e)
          }

          try {
            appModule.useAppStore.persist.rehydrate()
          } catch (e) {
            console.warn('[StoreProvider] App store rehydration failed:', e)
          }
        }
      } catch (error) {
        console.warn('[StoreProvider] Store import error:', error)
      }
    }

    // Run hydration in background, don't block rendering
    hydrateStores()

    // Mark hydrated immediately so UI renders
    setIsHydrated(true)

    return () => {
      mounted = false
    }
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
