'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
        <p className="text-slate-600 mb-4">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        {error.message && (
          <p className="text-xs text-red-500 bg-red-50 p-2 rounded mb-4 break-all">
            {error.message}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Refresh Page
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-slate-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
