'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerChildren,
  WaveText,
  FloatingElement,
  useParallax,
} from '@/lib/animations/gsap-hooks'
import {
  SwimmerFreestyle,
  WaterWaves,
  Trophy,
  LifeRing,
} from '@/components/icons/SwimmingIcons'

interface LandingProps {
  onEnterPortal: () => void
}

// Dynamically import Three.js scene to avoid SSR issues
const WaterScene = dynamic(
  () => import('../three/WaterScene').then(mod => mod.WaterScene),
  { ssr: false }
)

export function Landing({ onEnterPortal }: LandingProps) {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const parallaxBadgeRef = useParallax<HTMLDivElement>(0.15)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const stats = [
    { value: '500+', label: 'Students Trained' },
    { value: '10+', label: 'Years Experience' },
    { value: '98%', label: 'Success Rate' },
  ]

  const features = [
    {
      title: 'Private Lessons',
      desc: 'One-on-one attention tailored to your pace and goals',
      icon: <SwimmerFreestyle size={24} className="text-teal-400" />
    },
    {
      title: 'All Skill Levels',
      desc: 'From complete beginners to competitive swimmers',
      icon: <WaterWaves size={24} className="text-teal-400" />
    },
    {
      title: 'Progress Tracking',
      desc: 'See your improvement with our digital skill tracker',
      icon: <Trophy size={24} className="text-teal-400" />
    },
    {
      title: 'Certified & Safe',
      desc: 'Lifeguard certified with CPR & first aid training',
      icon: <LifeRing size={24} className="text-teal-400" />
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Al Maktoum',
      role: 'Parent',
      text: 'My son went from water-terrified to swimming laps in 8 weeks.',
      avatar: 'S'
    },
    {
      name: 'Ahmed Hassan',
      role: 'Adult Learner',
      text: 'At 35, I finally learned to swim. Patient and professional.',
      avatar: 'A'
    },
    {
      name: 'Jennifer Park',
      role: 'Parent',
      text: 'The progress tracking is incredible. We see improvement weekly.',
      avatar: 'J'
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Floating Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-turquoise-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <span className="text-white font-bold">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-white text-lg tracking-tight">Sam's Swim</span>
                <span className="text-teal-400 font-light ml-1">Academy</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">About</a>
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Reviews</a>
              <button
                onClick={onEnterPortal}
                className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Student Portal
              </button>
            </div>

            <button
              onClick={onEnterPortal}
              className="group relative px-6 py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-full overflow-hidden transition-all hover:shadow-lg hover:shadow-teal-400/30 hover:scale-105"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-turquoise-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Sign In</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with 3D Water */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* 3D Water Background */}
        <div className="absolute inset-0">
          <Suspense fallback={
            <div className="w-full h-full bg-gradient-to-b from-slate-900 via-blue-950 to-cyan-950" />
          }>
            <WaterScene />
          </Suspense>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />

        {/* Hero Content */}
        <div className="relative z-10 w-full pt-32 pb-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              {/* Badge with Parallax */}
              <FadeIn delay={0.2} y={20}>
                <div ref={parallaxBadgeRef} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span className="text-sm text-teal-300 font-medium">Now accepting students in Dubai</span>
                </div>
              </FadeIn>

              {/* Main Headline - Wave Text Animation */}
              <div className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                <WaveText
                  text="Learn to swim"
                  as="span"
                  className="block text-white"
                  delay={0.4}
                  stagger={0.04}
                />
                <WaveText
                  text="with confidence"
                  as="span"
                  className="block mt-2 bg-gradient-to-r from-teal-400 via-turquoise-400 to-teal-300 bg-clip-text text-transparent"
                  delay={0.8}
                  stagger={0.04}
                />
              </div>

              {/* Subheadline */}
              <FadeIn delay={1.2} y={30}>
                <p className="mt-8 text-xl text-slate-300 leading-relaxed max-w-xl">
                  Private lessons with Coach Sam Maysem. From first splash to competitive strokes —
                  transform your relationship with water.
                </p>
              </FadeIn>

              {/* CTA Buttons */}
              <FadeIn delay={1.4} y={30}>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={onEnterPortal}
                    className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-turquoise-500 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.02]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Book Your Lesson
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-turquoise-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <a
                    href="#about"
                    className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl font-semibold text-lg text-center hover:bg-white/10 transition-all"
                  >
                    Watch Video
                  </a>
                </div>
              </FadeIn>

              {/* Stats Row */}
              <FadeIn delay={1.6} y={30}>
                <div className="mt-16 pt-10 border-t border-white/10">
                  <StaggerChildren stagger={0.15} y={20} className="grid grid-cols-3 gap-8">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="text-center sm:text-left">
                        <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </StaggerChildren>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <FadeIn delay={2} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll</span>
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </FadeIn>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-400 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-white">
              Everything you need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-turquoise-400">
                become a swimmer
              </span>
            </h2>
          </FadeIn>

          <StaggerChildren stagger={0.12} y={40} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <ScaleIn key={idx} fromScale={0.85} delay={idx * 0.1}>
                <div className="group relative p-8 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-teal-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/10 h-full">
                  <FloatingElement amplitude={4} duration={4} delay={idx * 0.3}>
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 to-turquoise-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                  </FloatingElement>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </ScaleIn>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn delay={0.1}>
              <div>
                <span className="text-sm font-semibold text-teal-400 uppercase tracking-widest">Meet Your Coach</span>
                <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Hi, I'm Sam.
                  <span className="block text-slate-400 text-3xl lg:text-4xl mt-2 font-normal">
                    Let's get you swimming.
                  </span>
                </h2>
                <FadeIn delay={0.3}>
                  <div className="mt-8 space-y-6 text-lg text-slate-300 leading-relaxed">
                    <p>
                      For over a decade, I've helped hundreds of swimmers in Dubai — from toddlers
                      taking their first splash to adults overcoming lifelong fears.
                    </p>
                    <p>
                      My philosophy is simple: patience, encouragement, and proven techniques.
                      Every swimmer is unique, so every lesson is tailored to you.
                    </p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.5}>
                  <div className="mt-10 flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/50 rounded-xl border border-white/5">
                      <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                      <span className="text-sm font-medium text-white">Certified Instructor</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/50 rounded-xl border border-white/5">
                      <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-sm font-medium text-white">Dubai, UAE</span>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>

            <SlideIn direction="right" distance={80}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-teal-900/30 to-turquoise-900/30 overflow-hidden border border-white/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FloatingElement amplitude={8} duration={5}>
                        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-teal-500/20 to-turquoise-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-teal-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      </FloatingElement>
                      <p className="text-sm text-teal-400/50 font-medium">Coach photo</p>
                    </div>
                  </div>
                </div>
                {/* Floating Badge */}
                <ScaleIn fromScale={0.8} delay={0.4}>
                  <div className="absolute -bottom-6 -right-6 p-6 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-turquoise-500 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">98%</p>
                        <p className="text-sm text-slate-400">Success rate</p>
                      </div>
                    </div>
                  </div>
                </ScaleIn>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 lg:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-400 uppercase tracking-widest">Testimonials</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-white">
              Trusted by families
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-turquoise-400">
                across Dubai
              </span>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <SlideIn
                key={idx}
                direction={idx % 2 === 0 ? 'left' : 'right'}
                distance={60}
                delay={idx * 0.15}
              >
                <div className="p-8 bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-teal-500/20 transition-all h-full">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-turquoise-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{t.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-sm text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-turquoise-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.15),transparent_70%)]" />

        <FadeIn className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <WaveText
            text="Ready to dive in?"
            as="h2"
            className="text-4xl lg:text-6xl font-bold text-white leading-tight"
            stagger={0.05}
          />
          <FadeIn delay={0.3}>
            <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">
              Book your first lesson today. No commitment required — just a conversation about your swimming goals.
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="mt-10">
              <button
                onClick={onEnterPortal}
                className="group relative px-10 py-5 bg-white rounded-2xl font-semibold text-lg text-slate-900 overflow-hidden transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Started Today
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </FadeIn>
          <FadeIn delay={0.7}>
            <p className="mt-8 text-slate-400">
              Or call directly:{' '}
              <a href="tel:+971501234567" className="text-teal-400 font-medium hover:underline">
                +971 50 123 4567
              </a>
            </p>
          </FadeIn>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-turquoise-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-slate-400">Sam's Swim Academy</span>
              </div>
              <p className="text-sm text-slate-500">
                Dubai, UAE
              </p>
            </div>
          </FadeIn>
        </div>
      </footer>
    </div>
  )
}
