'use client'

import { useState, useRef, useEffect } from 'react'
import { FadeIn, SlideIn, ScaleIn, WaveText, RippleButton, FloatingElement } from '@/lib/animations/gsap-hooks'
import { SwimmerFreestyle, WaterWaves, Whistle } from '@/components/icons/SwimmingIcons'
import gsap from 'gsap'

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

// Floating Bubble Component
function FloatingBubble({
  size,
  delay,
  duration,
  left
}: {
  size: number
  delay: number
  duration: number
  left: string
}) {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bubbleRef.current) return

    gsap.set(bubbleRef.current, {
      y: '100vh',
      x: 0,
      opacity: 0.3,
    })

    gsap.to(bubbleRef.current, {
      y: '-100vh',
      x: `random(-20, 20)`,
      opacity: 0,
      duration,
      delay,
      repeat: -1,
      ease: 'none',
    })
  }, [delay, duration])

  return (
    <div
      ref={bubbleRef}
      className="absolute rounded-full bg-gradient-to-br from-cyan-300/40 to-teal-400/20 backdrop-blur-sm"
      style={{
        width: size,
        height: size,
        left,
        bottom: 0,
      }}
    />
  )
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-100 flex flex-col relative overflow-hidden">
      {/* Animated Water Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient wave animation */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, rgba(20, 184, 166, 0.15) 100%)',
          }}
        />

        {/* Animated wave lines */}
        <svg
          className="absolute bottom-0 left-0 w-full h-48 opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(6, 182, 212, 0.3)"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave-slow"
          />
          <path
            fill="rgba(20, 184, 166, 0.2)"
            d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,218.7C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave-medium"
          />
        </svg>

        {/* Floating Bubbles */}
        <FloatingBubble size={12} delay={0} duration={8} left="10%" />
        <FloatingBubble size={8} delay={2} duration={10} left="25%" />
        <FloatingBubble size={16} delay={1} duration={7} left="40%" />
        <FloatingBubble size={10} delay={3} duration={9} left="55%" />
        <FloatingBubble size={14} delay={0.5} duration={11} left="70%" />
        <FloatingBubble size={9} delay={2.5} duration={8} left="85%" />
        <FloatingBubble size={11} delay={1.5} duration={10} left="95%" />
      </div>

      {/* Floating Decorative Elements */}
      <FloatingElement
        className="absolute top-20 right-10 text-cyan-300/30 hidden md:block"
        amplitude={15}
        duration={4}
      >
        <WaterWaves size={64} />
      </FloatingElement>

      <FloatingElement
        className="absolute bottom-40 left-10 text-teal-300/25 hidden md:block"
        amplitude={12}
        delay={1}
        duration={5}
      >
        <SwimmerFreestyle size={48} />
      </FloatingElement>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 relative z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <RippleButton
            onClick={mode === 'select' ? onBack : resetForm}
            className="p-2 -ml-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-all duration-300"
            rippleColor="rgba(6, 182, 212, 0.3)"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </RippleButton>
          <div className="ml-3">
            {mode === 'select' ? (
              <WaveText
                text="Sign In"
                as="h1"
                className="text-lg font-semibold text-cyan-900"
                stagger={0.05}
                duration={0.4}
              />
            ) : (
              <FadeIn duration={0.5} y={10}>
                <h1 className="text-lg font-semibold text-cyan-900">
                  {mode === 'coach' ? 'Coach Login' : 'Student Login'}
                </h1>
              </FadeIn>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg">
          {mode === 'select' ? (
            /* Account Type Selection */
            <div className="space-y-3">
              <FadeIn delay={0.1} duration={0.6}>
                <p className="text-cyan-700 mb-6">
                  Select how you'd like to sign in
                </p>
              </FadeIn>

              {/* Coach Option */}
              <SlideIn direction="left" delay={0.2} duration={0.6}>
                <RippleButton
                  onClick={() => { setMode('coach'); setEmail(DEMO_CREDENTIALS.coach.email); }}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-cyan-200 text-left hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-100/50 transition-all duration-300 group"
                  rippleColor="rgba(6, 182, 212, 0.2)"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-200/50 group-hover:scale-110 transition-transform duration-300">
                      <Whistle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-cyan-900">Coach</h3>
                      <p className="text-sm text-cyan-600">Manage lessons and students</p>
                    </div>
                    <svg className="w-5 h-5 text-cyan-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </RippleButton>
              </SlideIn>

              {/* Student Option */}
              <SlideIn direction="right" delay={0.35} duration={0.6}>
                <RippleButton
                  onClick={() => setMode('student')}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-cyan-200 text-left hover:border-teal-400 hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-300 group"
                  rippleColor="rgba(20, 184, 166, 0.2)"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200/50 group-hover:scale-110 transition-transform duration-300">
                      <SwimmerFreestyle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-cyan-900">Student</h3>
                      <p className="text-sm text-cyan-600">View schedule and progress</p>
                    </div>
                    <svg className="w-5 h-5 text-cyan-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </RippleButton>
              </SlideIn>

              {/* Demo Credentials */}
              <FadeIn delay={0.5} duration={0.6}>
                <div className="mt-8 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
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
              </FadeIn>
            </div>
          ) : (
            /* Login Form */
            <ScaleIn fromScale={0.95} duration={0.5}>
              <form onSubmit={handleSubmit} className="space-y-5 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-cyan-100 shadow-xl shadow-cyan-100/30">
                {mode === 'coach' ? (
                  /* Coach Form */
                  <>
                    <FadeIn delay={0.1} y={15}>
                      <div>
                        <label className="block text-sm font-medium text-cyan-800 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-cyan-200 rounded-xl text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                      </div>
                    </FadeIn>
                    <FadeIn delay={0.2} y={15}>
                      <div>
                        <label className="block text-sm font-medium text-cyan-800 mb-1.5">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-cyan-200 rounded-xl text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                      </div>
                    </FadeIn>
                  </>
                ) : (
                  /* Student Form */
                  <>
                    <FadeIn delay={0.1} y={15}>
                      <div>
                        <label className="block text-sm font-medium text-cyan-800 mb-1.5">Select your name</label>
                        <div className="space-y-2 max-h-56 overflow-y-auto rounded-xl border border-cyan-200 p-2 bg-white">
                          {clients.map((client, index) => (
                            <RippleButton
                              key={client.id}
                              type="button"
                              onClick={() => setSelectedStudent(client.id!)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                                selectedStudent === client.id
                                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-cyan-200/50'
                                  : 'bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
                              }`}
                              rippleColor={selectedStudent === client.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(6, 182, 212, 0.2)'}
                              style={{
                                animationDelay: `${index * 50}ms`
                              }}
                            >
                              <p className="font-medium">{client.fullName}</p>
                            </RippleButton>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                    <FadeIn delay={0.2} y={15}>
                      <div>
                        <label className="block text-sm font-medium text-cyan-800 mb-1.5">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-cyan-200 rounded-xl text-cyan-900 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                      </div>
                    </FadeIn>
                  </>
                )}

                {error && (
                  <FadeIn duration={0.3} y={10}>
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </div>
                  </FadeIn>
                )}

                <FadeIn delay={0.3} y={15}>
                  <RippleButton
                    type="submit"
                    className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                      mode === 'coach'
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-200/50'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-teal-200/50'
                    }`}
                    rippleColor="rgba(255, 255, 255, 0.3)"
                  >
                    Sign In
                  </RippleButton>
                </FadeIn>

                {/* Password hint */}
                <FadeIn delay={0.4} y={10}>
                  <p className="text-center text-sm text-cyan-600">
                    Demo password: <code className="bg-cyan-50 px-1.5 py-0.5 rounded text-xs text-cyan-700 border border-cyan-200">
                      {mode === 'coach' ? DEMO_CREDENTIALS.coach.password : DEMO_CREDENTIALS.student.password}
                    </code>
                  </p>
                </FadeIn>
              </form>
            </ScaleIn>
          )}
        </div>
      </div>

      {/* CSS for wave animations */}
      <style jsx>{`
        @keyframes wave-slow {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25px);
          }
        }

        @keyframes wave-medium {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(25px);
          }
        }

        .animate-wave-slow {
          animation: wave-slow 8s ease-in-out infinite;
        }

        .animate-wave-medium {
          animation: wave-medium 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
