'use client'

import { useState } from 'react'

interface LoginProps {
  onLogin: (type: 'admin' | 'student', userId?: number) => void
  onBack: () => void
  clients: Array<{ id?: number; fullName: string; email?: string }>
}

// Test credentials for demo
const TEST_CREDENTIALS = {
  admin: {
    email: 'sam@samswim.ae',
    password: 'admin123',
  },
  student: {
    email: 'ahmed@email.com',
    password: 'student123',
  },
}

export function Login({ onLogin, onBack, clients }: LoginProps) {
  const [mode, setMode] = useState<'select' | 'admin' | 'student'>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleAdminLogin = () => {
    if (email === TEST_CREDENTIALS.admin.email && password === TEST_CREDENTIALS.admin.password) {
      onLogin('admin')
    } else {
      setError('Invalid credentials. Check the test credentials below.')
    }
  }

  const handleStudentLogin = () => {
    if (!selectedStudent) {
      setError('Please select a student')
      return
    }
    if (password === TEST_CREDENTIALS.student.password) {
      onLogin('student', selectedStudent)
    } else {
      setError('Invalid password. Check the test credentials below.')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'admin') {
      handleAdminLogin()
    } else if (mode === 'student') {
      handleStudentLogin()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center">
          <button
            onClick={mode === 'select' ? onBack : () => { setMode('select'); setError(''); }}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="ml-2 text-lg font-semibold text-slate-900">
            {mode === 'select' ? 'Choose Account Type' : mode === 'admin' ? 'Admin Login' : 'Student Login'}
          </h1>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {mode === 'select' ? (
            /* Account Type Selection */
            <div className="space-y-4">
              <p className="text-center text-slate-600 mb-8">
                Select how you want to sign in
              </p>

              {/* Admin Option */}
              <button
                onClick={() => { setMode('admin'); setEmail(TEST_CREDENTIALS.admin.email); }}
                className="w-full bg-white rounded-2xl p-6 shadow-soft border border-slate-200 text-left hover:border-ocean-300 hover:shadow-medium transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-ocean-100 flex items-center justify-center flex-shrink-0 group-hover:bg-ocean-200 transition-colors">
                    <svg className="w-7 h-7 text-ocean-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Admin / Coach</h3>
                    <p className="text-sm text-slate-600">Manage clients, schedule, and settings</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-ocean-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Student Option */}
              <button
                onClick={() => setMode('student')}
                className="w-full bg-white rounded-2xl p-6 shadow-soft border border-slate-200 text-left hover:border-algae-300 hover:shadow-medium transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-algae-100 flex items-center justify-center flex-shrink-0 group-hover:bg-algae-200 transition-colors">
                    <svg className="w-7 h-7 text-algae-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Student</h3>
                    <p className="text-sm text-slate-600">View schedule and track progress</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-algae-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Test Credentials Box */}
              <div className="mt-8 bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-slate-700">Test Credentials</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-medium text-slate-900 mb-1">Admin Login:</p>
                    <p className="text-slate-600">Email: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{TEST_CREDENTIALS.admin.email}</code></p>
                    <p className="text-slate-600">Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{TEST_CREDENTIALS.admin.password}</code></p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-medium text-slate-900 mb-1">Student Login:</p>
                    <p className="text-slate-600">Select any student from list</p>
                    <p className="text-slate-600">Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{TEST_CREDENTIALS.student.password}</code></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'admin' ? (
                /* Admin Form */
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              ) : (
                /* Student Form */
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {clients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => setSelectedStudent(client.id!)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            selectedStudent === client.id
                              ? 'bg-algae-50 border-algae-300 text-algae-900'
                              : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-medium">{client.fullName}</p>
                          {client.email && <p className="text-sm text-slate-500">{client.email}</p>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-algae-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-coral-50 text-coral-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  mode === 'admin'
                    ? 'bg-ocean-500 hover:bg-ocean-600'
                    : 'bg-algae-500 hover:bg-algae-600'
                }`}
              >
                Sign In
              </button>

              {/* Test Credentials Reminder */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Test Credentials</span>
                </div>
                <div className="text-sm text-slate-600">
                  {mode === 'admin' ? (
                    <>
                      <p>Email: <code className="bg-white px-1.5 py-0.5 rounded">{TEST_CREDENTIALS.admin.email}</code></p>
                      <p>Password: <code className="bg-white px-1.5 py-0.5 rounded">{TEST_CREDENTIALS.admin.password}</code></p>
                    </>
                  ) : (
                    <p>Password: <code className="bg-white px-1.5 py-0.5 rounded">{TEST_CREDENTIALS.student.password}</code></p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
