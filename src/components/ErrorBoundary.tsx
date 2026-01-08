'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  isResetting: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, isResetting: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isResetting: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = async () => {
    this.setState({ isResetting: true })

    try {
      // Clear all IndexedDB databases
      if (typeof indexedDB !== 'undefined') {
        const databases = await indexedDB.databases?.()
        if (databases) {
          for (const db of databases) {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
            }
          }
        }
        // Also try direct delete
        indexedDB.deleteDatabase('samswim-academy')
      }

      // Clear localStorage crash markers
      localStorage.removeItem('samswim-db-crash')

      // Clear Dexie specifically
      const Dexie = (await import('dexie')).default
      await Dexie.delete('samswim-academy')

      // Reload page
      window.location.href = window.location.pathname
    } catch (resetError) {
      console.error('Failed to reset:', resetError)
      // Force reload anyway
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      const isDatabaseError = this.state.error?.message?.includes("reading 'S'") ||
                              this.state.error?.message?.includes('Database') ||
                              this.state.error?.message?.includes('Dexie') ||
                              this.state.error?.message?.includes('IndexedDB')

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-slate-50 to-teal-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {isDatabaseError ? 'Database Error' : 'Something Went Wrong'}
            </h2>

            <p className="text-slate-600 mb-6">
              {isDatabaseError
                ? 'The local database got corrupted. Click below to reset and start fresh.'
                : 'An unexpected error occurred. Please try resetting the app.'}
            </p>

            {this.state.error && (
              <div className="bg-slate-100 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs font-mono text-slate-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              disabled={this.state.isResetting}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {this.state.isResetting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Database & Reload
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 mt-4">
              This will clear all local data and reload the demo.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
