'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/app'
import { Button, Card, Input, Select, Avatar } from '@/components/ui'
import { CURRENCIES } from '@/lib/db/seed'

// Sample profile photo
const PROFILE_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'

export function Settings() {
  const { tenant, currentUser, serviceTypes } = useAppStore()
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', label: 'Profile', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'business', label: 'Business', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { id: 'services', label: 'Services', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { id: 'notifications', label: 'Notifications', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
    { id: 'data', label: 'Data & Privacy', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )},
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-ocean-900 mb-6">Your Profile</h3>
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img
                      src={PROFILE_PHOTO}
                      alt={currentUser?.fullName || 'Profile'}
                      className="w-28 h-28 rounded-3xl object-cover ring-4 ring-ocean-100 shadow-lg"
                    />
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-ocean-500 rounded-xl flex items-center justify-center text-white shadow-ocean hover:bg-ocean-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-ocean-500">Change photo</p>
                </div>
                <div className="flex-1 space-y-5 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      id="fullName"
                      defaultValue={currentUser?.fullName}
                      placeholder="Your full name"
                    />
                    <Input
                      type="email"
                      label="Email"
                      id="email"
                      defaultValue={currentUser?.email}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="tel"
                      label="Phone"
                      id="phone"
                      defaultValue={currentUser?.phone}
                      placeholder="+971 50 123 4567"
                    />
                    <Select
                      label="Language"
                      id="language"
                      defaultValue="en"
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'ar', label: 'Arabic' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-ocean-100">
              <h4 className="font-bold text-ocean-900 mb-4">Security</h4>
              <div className="flex items-center justify-between p-5 bg-ocean-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-ocean-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-ocean-900">Password</p>
                    <p className="text-sm text-ocean-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button variant="secondary">Change Password</Button>
              </div>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-ocean-900 mb-6">Business Information</h3>
              <div className="space-y-5">
                <Input
                  label="Business Name"
                  id="businessName"
                  defaultValue={tenant?.name}
                  placeholder="Your business name"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Currency"
                    id="currency"
                    defaultValue={tenant?.currency || 'AED'}
                    options={CURRENCIES.map(c => ({
                      value: c.code,
                      label: `${c.symbol} ${c.name} (${c.code})`
                    }))}
                  />
                  <Select
                    label="Timezone"
                    id="timezone"
                    defaultValue={tenant?.timezone || 'Asia/Dubai'}
                    options={[
                      { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
                      { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
                      { value: 'Europe/London', label: 'London (GMT)' },
                      { value: 'America/New_York', label: 'New York (GMT-5)' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ocean-800 mb-2">Business Address</label>
                  <textarea
                    defaultValue="Dubai Marina, Dubai, UAE"
                    rows={2}
                    className="w-full px-4 py-3 bg-white border-2 border-ocean-200 rounded-2xl text-ocean-900 placeholder:text-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-ocean-100">
              <h4 className="font-bold text-ocean-900 mb-4">Working Hours</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Opening Time"
                  id="openTime"
                  defaultValue="06:00"
                />
                <Input
                  type="time"
                  label="Closing Time"
                  id="closeTime"
                  defaultValue="20:00"
                />
              </div>
            </div>
          </div>
        )

      case 'services':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-ocean-900">Lesson Types</h3>
              <Button size="sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Service
              </Button>
            </div>

            <div className="space-y-3">
              {serviceTypes.map((service, index) => {
                const colors = ['ocean', 'sea', 'tennis', 'wave']
                const colorClasses = {
                  ocean: 'bg-ocean-100 text-ocean-600',
                  sea: 'bg-sea-100 text-sea-600',
                  tennis: 'bg-tennis-100 text-tennis-600',
                  wave: 'bg-wave-100 text-wave-600',
                }
                const color = colors[index % colors.length] as keyof typeof colorClasses

                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-ocean-50/50 to-sea-50/50 border border-ocean-100 rounded-2xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-ocean-900">{service.name}</p>
                        <p className="text-sm text-ocean-500">{service.durationMinutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-ocean-900">
                          {CURRENCIES.find(c => c.code === (tenant?.currency || 'AED'))?.symbol} {service.pricePerSession}
                        </p>
                        <p className="text-xs text-ocean-500">per session</p>
                      </div>
                      <button className="p-2 hover:bg-ocean-100 rounded-xl transition-colors">
                        <svg className="w-5 h-5 text-ocean-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-ocean-900">Notification Preferences</h3>

            <div className="space-y-3">
              {[
                { id: 'booking_confirm', label: 'Booking Confirmations', desc: 'Get notified when a lesson is booked', icon: '📅' },
                { id: 'booking_remind', label: 'Lesson Reminders', desc: 'Reminder before scheduled lessons', icon: '⏰' },
                { id: 'payment', label: 'Payment Notifications', desc: 'Receive payment and invoice alerts', icon: '💳' },
                { id: 'progress', label: 'Progress Updates', desc: 'Updates on student skill achievements', icon: '🏆' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-ocean-50/50 to-sea-50/50 border border-ocean-100 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-ocean-900">{item.label}</p>
                      <p className="text-sm text-ocean-500">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-7 bg-ocean-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ocean-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-ocean-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ocean-500 shadow-inner"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-ocean-900">Data & Privacy</h3>

            <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Local Data Storage</p>
                  <p className="text-sm text-amber-700 mt-1">
                    All your data is stored locally on this device. Export regularly to prevent data loss.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-ocean-50/50 to-sea-50/50 border border-ocean-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-ocean-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-ocean-900">Export Data</p>
                    <p className="text-sm text-ocean-500">Download all your data as JSON</p>
                  </div>
                </div>
                <Button variant="secondary">
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-ocean-50/50 to-sea-50/50 border border-ocean-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sea-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-sea-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-ocean-900">Import Data</p>
                    <p className="text-sm text-ocean-500">Restore from a backup file</p>
                  </div>
                </div>
                <Button variant="secondary">
                  Import
                </Button>
              </div>

              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">Delete All Data</p>
                    <p className="text-sm text-red-700">Permanently remove all stored data</p>
                  </div>
                </div>
                <Button variant="danger">Delete</Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen ocean-bg">
      <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-ocean-900">Settings</h1>
          <p className="text-ocean-600 mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-ocean-100 shadow-sm p-3">
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-ocean'
                        : 'text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900'
                    }`}
                  >
                    <span className={activeSection === section.id ? 'text-white' : 'text-ocean-400'}>
                      {section.icon}
                    </span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Pro Badge */}
            <div className="mt-4 p-4 bg-gradient-to-br from-tennis-500 to-tennis-600 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Pro Plan</p>
                  <p className="text-xs text-tennis-100">All features unlocked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl border border-ocean-100 shadow-sm p-6 sm:p-8">
              {renderSection()}

              <div className="mt-8 pt-6 border-t border-ocean-100 flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="secondary" className="sm:w-auto">Cancel</Button>
                <Button className="sm:w-auto">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
