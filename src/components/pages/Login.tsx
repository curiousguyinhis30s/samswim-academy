'use client'

import { useState } from 'react'

interface LoginProps {
  onLogin: (type: 'admin' | 'student', userId?: number) => void
  onBack: () => void
  clients: Array<{ id?: number; fullName: string; email?: string }>
}

// Demo credentials - loaded from environment or use defaults for demo mode
// These are intentionally simple demo credentials, not production secrets
const DEMO_CREDENTIALS = {
  coach: {
    email: process.env.NEXT_PUBLIC_DEMO_COACH_EMAIL || 'sam@samswim.ae',
    password: process.env.NEXT_PUBLIC_DEMO_COACH_PASS || 'demo',
  },
  student: {
    password: process.env.NEXT_PUBLIC_DEMO_STUDENT_PASS || 'demo',
  },
}

export function Login({ onLogin, onBack, clients }: LoginProps) {
  const [mode, setMode] = useState<'select' | 'coach' | 'student'>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleCoachLogin = () => {
    if (email === DEMO_CREDENTIALS.coach.email && password === DEMO_CREDENTIALS.coach.password) {
      onLogin('admin')
    } else {
      setError('Invalid credentials')
    }
  }

  const handleStudentLogin = () => {
    if (!selectedStudent) {
      setError('Please select your name')
      return
    }
    if (password === DEMO_CREDENTIALS.student.password) {
      onLogin('student', selectedStudent)
    } else {
      setError('Invalid password')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'coach') {
      handleCoachLogin()
    } else if (mode === 'student') {
      handleStudentLogin()
    }
  }

  const resetForm = () => {
    setMode('select')
    setError('')
    setEmail('')
    setPassword('')
    setSelectedStudent(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button
            onClick={mode === 'select' ? onBack : resetForm}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-slate-900">
              {mode === 'select' ? 'Sign In' : mode === 'coach' ? 'Coach Login' : 'Student Login'}
            </h1>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {mode === 'select' ? (
            /* Account Type Selection */
            <div className="space-y-3">
              <p className="text-slate-500 mb-6">
                Select how you'd like to sign in
              </p>

              {/* Coach Option */}
              <button
                onClick={() => { setMode('coach'); setEmail(DEMO_CREDENTIALS.coach.email); }}
                className="w-full bg-white rounded-xl p-5 border border-slate-200 text-left hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">Coach</h3>
                    <p className="text-sm text-slate-500">Manage lessons and students</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Student Option */}
              <button
                onClick={() => setMode('student')}
                className="w-full bg-white rounded-xl p-5 border border-slate-200 text-left hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">Student</h3>
                    <p className="text-sm text-slate-500">View schedule and progress</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Demo Mode</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Coach: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{DEMO_CREDENTIALS.coach.email}</code> / <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{DEMO_CREDENTIALS.coach.password}</code>
                    </p>
                    <p className="text-sm text-amber-700">
                      Student: Select name, password <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">{DEMO_CREDENTIALS.student.password}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'coach' ? (
                /* Coach Form */
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>
                </>
              ) : (
                /* Student Form */
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select your name</label>
                    <div className="space-y-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-2 bg-white">
                      {clients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => setSelectedStudent(client.id!)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                            selectedStudent === client.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <p className="font-medium">{client.fullName}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                  mode === 'coach'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Sign In
              </button>

              {/* Password hint */}
              <p className="text-center text-sm text-slate-500">
                Demo password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-700">
                  {mode === 'coach' ? DEMO_CREDENTIALS.coach.password : DEMO_CREDENTIALS.student.password}
                </code>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
