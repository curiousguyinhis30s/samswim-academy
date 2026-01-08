'use client'

import { useState, useRef, useEffect, ReactNode, MouseEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ChevronDown, LucideIcon } from 'lucide-react'

// ============================================================================
// CollapsibleCard - Card that expands/collapses content smoothly
// ============================================================================
interface CollapsibleCardProps {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleCard({
  title,
  icon,
  defaultOpen = false,
  children,
  className = '',
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current || !innerRef.current) return

    const content = contentRef.current
    const inner = innerRef.current

    if (isOpen) {
      gsap.to(content, {
        height: inner.offsetHeight,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      })
    } else {
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      })
    }
  }, [isOpen])

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-teal-500">{icon}</span>}
          <span className="font-semibold text-slate-900">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div ref={contentRef} className="overflow-hidden" style={{ height: defaultOpen ? 'auto' : 0 }}>
        <div ref={innerRef} className="p-5 pt-0 border-t border-slate-100">
          {children}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TabPanel - Animated tab switcher
// ============================================================================
interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface TabPanelProps {
  tabs: TabItem[]
  defaultTab?: string
  className?: string
}

export function TabPanel({ tabs, defaultTab, className = '' }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const underlineRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const contentRef = useRef<HTMLDivElement>(null)

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content

  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab)
    const underline = underlineRef.current

    if (activeButton && underline) {
      gsap.to(underline, {
        width: activeButton.offsetWidth,
        x: activeButton.offsetLeft,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          x: direction === 'right' ? 20 : -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        }
      )
    }
  }, [activeTab, direction])

  const handleTabClick = (tabId: string) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab)
    const newIndex = tabs.findIndex((t) => t.id === tabId)
    setDirection(newIndex > currentIndex ? 'right' : 'left')
    setActiveTab(tabId)
  }

  return (
    <div className={className}>
      <div className="relative flex gap-1 p-1.5 bg-slate-100 rounded-xl mb-6">
        <div
          ref={underlineRef}
          className="absolute bottom-1.5 h-[calc(100%-12px)] bg-white rounded-lg shadow-sm"
          style={{ width: 0 }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el)
            }}
            onClick={() => handleTabClick(tab.id)}
            className={`relative z-10 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div ref={contentRef} className="min-h-[100px]">
        {activeContent}
      </div>
    </div>
  )
}

// ============================================================================
// ProgressRing - Circular progress indicator with GSAP animation
// ============================================================================
interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  showValue?: boolean
  className?: string
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#14B8A6',
  bgColor = '#E2E8F0',
  showValue = true,
  className = '',
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  useGSAP(() => {
    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: offset,
          duration: 1.2,
          ease: 'power2.out',
        }
      )
    }

    if (valueRef.current && showValue) {
      gsap.fromTo(
        { val: 0 },
        { val: value },
        {
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: function () {
            if (valueRef.current) {
              valueRef.current.textContent = Math.round(this.targets()[0].val) + '%'
            }
          },
        }
      )
    }
  }, [value])

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="transition-colors"
        />
      </svg>
      {showValue && (
        <span
          ref={valueRef}
          className="absolute text-xl font-bold text-slate-900"
        >
          0%
        </span>
      )}
    </div>
  )
}

// ============================================================================
// StatCard - Stat display with count-up animation on scroll
// ============================================================================
interface StatCardProps {
  value: number
  label: string
  icon?: ReactNode
  suffix?: string
  prefix?: string
  className?: string
}

export function StatCard({
  value,
  label,
  icon,
  suffix = '',
  prefix = '',
  className = '',
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true

            if (valueRef.current) {
              gsap.fromTo(
                { val: 0 },
                { val: value },
                {
                  duration: 1.5,
                  ease: 'power2.out',
                  onUpdate: function () {
                    if (valueRef.current) {
                      const current = Math.round(this.targets()[0].val)
                      valueRef.current.textContent = `${prefix}${current.toLocaleString()}${suffix}`
                    }
                  },
                }
              )
            }

            gsap.from(cardRef.current, {
              y: 20,
              opacity: 0,
              duration: 0.5,
              ease: 'power2.out',
            })
          }
        })
      },
      { threshold: 0.3 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [value, prefix, suffix])

  return (
    <div
      ref={cardRef}
      className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-soft ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="p-3 bg-gradient-to-br from-teal-50 to-turquoise-50 rounded-xl text-teal-500">
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <span
          ref={valueRef}
          className="block text-3xl font-bold text-slate-900"
        >
          {prefix}0{suffix}
        </span>
        <span className="text-sm text-slate-500 font-medium">{label}</span>
      </div>
    </div>
  )
}

// ============================================================================
// FloatingCard - Card with subtle floating animation (CSS for performance)
// ============================================================================
interface FloatingCardProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FloatingCard({ children, delay = 0, className = '' }: FloatingCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-soft animate-float ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '6s',
      }}
    >
      {children}
    </div>
  )
}

// ============================================================================
// GlassCard - Glassmorphism card with backdrop blur
// ============================================================================
interface GlassCardProps {
  children: ReactNode
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: number
  className?: string
}

export function GlassCard({
  children,
  blur = 'md',
  opacity = 0.7,
  className = '',
}: GlassCardProps) {
  const blurValues = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  return (
    <div
      className={`${blurValues[blur]} rounded-2xl border border-white/20 shadow-lg ${className}`}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
    >
      {children}
    </div>
  )
}

// ============================================================================
// WaterButton - Button with water ripple effect on click
// ============================================================================
interface WaterButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function WaterButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  disabled = false,
}: WaterButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const variants = {
    primary:
      'bg-gradient-to-r from-teal-500 to-turquoise-500 text-white hover:from-teal-600 hover:to-turquoise-600 shadow-md',
    secondary:
      'bg-white text-teal-700 border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300',
    ghost: 'text-teal-600 hover:bg-teal-50 hover:text-teal-700',
  }

  const rippleColors = {
    primary: 'rgba(255, 255, 255, 0.4)',
    secondary: 'rgba(20, 184, 166, 0.2)',
    ghost: 'rgba(20, 184, 166, 0.15)',
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('span')
    ripple.className = 'absolute rounded-full pointer-events-none'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.backgroundColor = rippleColors[variant]
    ripple.style.transform = 'translate(-50%, -50%) scale(0)'
    ripple.style.width = '0px'
    ripple.style.height = '0px'

    button.appendChild(ripple)

    const maxDim = Math.max(button.offsetWidth, button.offsetHeight) * 2.5

    gsap.to(ripple, {
      width: maxDim,
      height: maxDim,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove(),
    })

    gsap.fromTo(
      ripple,
      { scale: 0 },
      { scale: 1, duration: 0.6, ease: 'power2.out' }
    )

    onClick?.()
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden px-5 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ============================================================================
// SkeletonLoader - Loading placeholder with shimmer animation
// ============================================================================
interface SkeletonLoaderProps {
  variant?: 'text' | 'avatar' | 'card'
  lines?: number
  className?: string
}

export function SkeletonLoader({
  variant = 'text',
  lines = 3,
  className = '',
}: SkeletonLoaderProps) {
  const shimmerClass =
    'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer'

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className={`w-12 h-12 rounded-full ${shimmerClass}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 rounded-lg w-3/4 ${shimmerClass}`} />
          <div className={`h-3 rounded-lg w-1/2 ${shimmerClass}`} />
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-soft ${className}`}
      >
        <div className={`h-40 rounded-xl mb-4 ${shimmerClass}`} />
        <div className="space-y-3">
          <div className={`h-5 rounded-lg w-3/4 ${shimmerClass}`} />
          <div className={`h-4 rounded-lg w-full ${shimmerClass}`} />
          <div className={`h-4 rounded-lg w-5/6 ${shimmerClass}`} />
        </div>
      </div>
    )
  }

  // Text variant
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-lg ${shimmerClass}`}
          style={{
            width: i === lines - 1 ? '60%' : i % 2 === 0 ? '100%' : '85%',
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// AnimatedCounter - Standalone counter component
// ============================================================================
interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (counterRef.current) {
      gsap.fromTo(
        { val: 0 },
        { val: value },
        {
          duration,
          ease: 'power2.out',
          onUpdate: function () {
            if (counterRef.current) {
              const current = Math.round(this.targets()[0].val)
              counterRef.current.textContent = `${prefix}${current.toLocaleString()}${suffix}`
            }
          },
        }
      )
    }
  }, [value])

  return (
    <span ref={counterRef} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

// ============================================================================
// PulseIndicator - Animated status indicator
// ============================================================================
interface PulseIndicatorProps {
  status?: 'online' | 'offline' | 'busy' | 'away'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulseIndicator({
  status = 'online',
  size = 'md',
  className = '',
}: PulseIndicatorProps) {
  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  }

  const pulseColors = {
    online: 'bg-emerald-400',
    offline: 'bg-slate-300',
    busy: 'bg-red-400',
    away: 'bg-amber-400',
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className={`${sizes[size]} ${statusColors[status]} rounded-full`}
      />
      {status !== 'offline' && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${pulseColors[status]} opacity-75 animate-ping`}
        />
      )}
    </span>
  )
}

// ============================================================================
// SlideIn - Wrapper for slide-in animations
// ============================================================================
interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    const directions = {
      left: { x: -50, y: 0 },
      right: { x: 50, y: 0 },
      up: { x: 0, y: 50 },
      down: { x: 0, y: -50 },
    }

    gsap.from(ref.current, {
      ...directions[direction],
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out',
    })
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// ============================================================================
// FadeIn - Wrapper for fade-in animations
// ============================================================================
interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out',
    })
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// ============================================================================
// ScaleIn - Wrapper for scale-in animations
// ============================================================================
interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      scale: 0.8,
      opacity: 0,
      duration,
      delay,
      ease: 'back.out(1.7)',
    })
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
