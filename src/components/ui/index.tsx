'use client'

import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

// Button Component with Ocean/Tennis themes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tennis'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-gradient-to-r from-teal-500 to-turquoise-500 text-white hover:from-teal-600 hover:to-turquoise-600 focus-visible:ring-teal-500 shadow-md active:scale-[0.98]',
      secondary: 'bg-white text-teal-700 border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 focus-visible:ring-teal-400',
      ghost: 'text-teal-600 hover:bg-teal-50 hover:text-teal-700 focus-visible:ring-teal-400',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500 shadow-md',
      tennis: 'bg-gradient-to-r from-coral-400 to-coral-500 text-white hover:from-coral-500 hover:to-coral-600 focus-visible:ring-coral-500 shadow-md active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Input Component with Ocean theme
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-slate-800 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 hover:border-teal-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-teal-600">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Select Component with Ocean theme
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-slate-800 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer transition-all ${
            error ? 'border-red-300' : 'border-slate-200 hover:border-teal-300'
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2314b8a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.25em 1.25em',
            paddingRight: '2.5rem',
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// Card Component with Ocean glass effect
interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'glass' | 'stat'
}

export function Card({ children, className = '', hover = false, padding = 'md', variant = 'default' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    glass: 'glass-card',
    stat: 'bg-white border border-slate-200 shadow-sm stat-card',
  }

  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${
        hover ? 'card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Badge Component with Ocean/Tennis themes
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'tennis'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-teal-100 text-teal-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-turquoise-100 text-turquoise-700',
    tennis: 'bg-coral-100 text-coral-700',
  }

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

// Avatar Component with Ocean colors
interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Modern teal/turquoise color palette
  const colors = [
    'bg-gradient-to-br from-teal-400 to-teal-600',
    'bg-gradient-to-br from-turquoise-400 to-turquoise-600',
    'bg-gradient-to-br from-teal-500 to-turquoise-500',
    'bg-gradient-to-br from-ocean-400 to-ocean-600',
    'bg-gradient-to-br from-emerald-400 to-emerald-600',
    'bg-gradient-to-br from-teal-600 to-teal-800',
    'bg-gradient-to-br from-turquoise-500 to-teal-500',
    'bg-gradient-to-br from-ocean-500 to-turquoise-500',
  ]
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-teal-100 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold shadow-md ${className}`}
    >
      {initials}
    </div>
  )
}

// Modal Component with Ocean theme
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-backdrop absolute inset-0" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl ${sizes[size]} w-full animate-slideUp`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Empty State Component with Ocean theme
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-teal-300 mb-6">{icon}</div>}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

// Tabs Component with Ocean theme
interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1.5 bg-teal-100 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === tab.id
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === tab.id ? 'bg-teal-100 text-teal-600' : 'bg-teal-200/50 text-teal-500'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Skeleton Loader with Ocean theme
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-teal-100 rounded-lg ${className}`} />
}

// Currency formatter helper
export function formatCurrency(amount: number, currency: string = 'AED'): string {
  const symbols: Record<string, string> = {
    AED: 'د.إ',
    USD: '$',
    EUR: '€',
    GBP: '£',
    SAR: '﷼',
  }

  const symbol = symbols[currency] || currency
  return `${symbol} ${amount.toLocaleString()}`
}

// Date formatter helper
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-AE', {
    timeZone: 'Asia/Dubai',
    ...options,
  }).format(new Date(date))
}

export function formatTime(date: Date): string {
  return formatDate(date, { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDateShort(date: Date): string {
  return formatDate(date, { month: 'short', day: 'numeric' })
}

export function formatDateFull(date: Date): string {
  return formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
