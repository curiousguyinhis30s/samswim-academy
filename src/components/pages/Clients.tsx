'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { Button, Card, Badge, Avatar, Modal, Input, Select, Tabs, EmptyState, formatCurrency } from '@/components/ui'
import { FadeIn, SlideIn, StaggerChildren, ScaleIn, FloatingElement } from '@/lib/animations/gsap-hooks'
import { SwimmerFreestyle, Goggles } from '@/components/icons/SwimmingIcons'

type TabType = 'all' | 'active' | 'inactive'

interface ClientsProps {
  onViewAsStudent?: (studentId: number) => void
}

// Sample photos for clients
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
]

export function Clients({ onViewAsStudent }: ClientsProps) {
  const { clients, bookings, assessments, skills, addClient, updateClient, deleteClient, tenant } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // New client form state
  const [newClient, setNewClient] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  })

  const filteredClients = useMemo(() => {
    let filtered = clients

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      )
    }

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(c => c.status === 'active')
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(c => c.status !== 'active')
    }

    return filtered
  }, [clients, searchQuery, activeTab])

  const { participants } = useAppStore()

  const getClientStats = (clientId: number) => {
    // Get booking IDs for this client through participants
    const clientParticipants = participants.filter(p => p.clientId === clientId)
    const clientBookingIds = clientParticipants.map(p => p.bookingId)
    const clientBookings = bookings.filter(b => clientBookingIds.includes(b.id!))
    const completedLessons = clientBookings.filter(b => b.status === 'completed').length
    const totalSpent = clientBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0)
    const clientAssessments = assessments.filter(a => a.studentId === clientId)
    const skillsLearned = clientAssessments.filter(a => a.level >= 3).length

    return { completedLessons, totalSpent, skillsLearned }
  }

  const handleAddClient = async () => {
    if (!newClient.fullName) return

    await addClient({
      fullName: newClient.fullName,
      email: newClient.email || '',
      phone: newClient.phone || undefined,
      dateOfBirth: newClient.dateOfBirth ? new Date(newClient.dateOfBirth) : undefined,
      emergencyContact: newClient.emergencyContact || undefined,
      emergencyPhone: newClient.emergencyPhone || undefined,
      notes: newClient.notes || undefined,
      role: 'client',
      status: 'active',
      notificationPreferences: { email: true, sms: false, push: true },
    })

    setShowAddClient(false)
    setNewClient({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
    })
  }

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId)
    setShowDeleteConfirm(null)
  }

  const getClientPhoto = (index: number) => {
    return SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length]
  }

  const selectedClientData = selectedClient ? clients.find(c => c.id?.toString() === selectedClient) : null
  const selectedClientStats = selectedClient ? getClientStats(parseInt(selectedClient)) : null
  const selectedClientIndex = selectedClient ? clients.findIndex(c => c.id?.toString() === selectedClient) : 0

  const tabs = [
    { id: 'all', label: 'All Clients', count: clients.length },
    { id: 'active', label: 'Active', count: clients.filter(c => c.status === 'active').length },
    { id: 'inactive', label: 'Inactive', count: clients.filter(c => c.status !== 'active').length },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        {/* Header with SlideIn animation and Goggles icon */}
        <SlideIn direction="left" duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Goggles size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Clients</h1>
                <p className="text-slate-500 mt-1">Manage your swimming students</p>
              </div>
            </div>
            <Button onClick={() => setShowAddClient(true)} className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </Button>
          </div>
        </SlideIn>

        {/* Search and Filters */}
        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="relative flex-1 w-full sm:max-w-md">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200/50 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Client Grid */}
        {filteredClients.length === 0 ? (
          <FadeIn delay={0.3}>
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-50 to-teal-100 rounded-xl flex items-center justify-center">
                <SwimmerFreestyle size={40} className="text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                {searchQuery ? 'Try adjusting your search' : 'Add your first client to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowAddClient(true)} className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700">Add Client</Button>
              )}
            </div>
          </FadeIn>
        ) : (
          <StaggerChildren stagger={0.08} y={20} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredClients.map((client, index) => {
              const stats = getClientStats(client.id!)
              const photoUrl = getClientPhoto(index)
              const progress = stats.skillsLearned > 0 ? Math.min(100, (stats.skillsLearned / 10) * 100) : 0

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id!.toString())}
                  className="group bg-white rounded-xl border border-slate-200 p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-300 hover:scale-[1.02]"
                  style={{ opacity: 1 }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    {/* Photo with progress ring and float animation */}
                    <div className="relative">
                      <FloatingElement amplitude={3} frequency={4} rotationAmplitude={0} duration={4} className="w-16 h-16">
                        <img
                          src={photoUrl}
                          alt={client.fullName}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      </FloatingElement>
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke={progress >= 75 ? '#14B8A6' : progress >= 50 ? '#06B6D4' : '#22D3EE'}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${progress * 2.83} 283`}
                          className="transition-all duration-500"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 truncate">{client.fullName}</h3>
                      </div>
                      <Badge variant={client.status === 'active' ? 'success' : 'default'}>
                        {client.status}
                      </Badge>
                      {client.email && (
                        <p className="text-sm text-slate-500 truncate mt-2">{client.email}</p>
                      )}
                      {client.phone && (
                        <p className="text-sm text-slate-500 mt-0.5">{client.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-5 border-t border-slate-100">
                    <div className="text-center p-2 bg-slate-50 rounded-lg group-hover:bg-cyan-50 transition-colors">
                      <p className="text-xl font-bold text-slate-900">{stats.completedLessons}</p>
                      <p className="text-xs text-slate-500 font-medium">Lessons</p>
                    </div>
                    <div className="text-center p-2 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                      <p className="text-xl font-bold text-cyan-700">{stats.skillsLearned}</p>
                      <p className="text-xs text-slate-500 font-medium">Skills</p>
                    </div>
                    <div className="text-center p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                      <p className="text-lg font-bold text-teal-700">
                        {formatCurrency(stats.totalSpent, tenant?.currency || 'AED')}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">Spent</p>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="flex items-center justify-center gap-2 mt-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">View Details</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}

            {/* Add New Client Card with ScaleIn animation */}
            <ScaleIn fromScale={0.9} delay={filteredClients.length * 0.08}>
              <button
                onClick={() => setShowAddClient(true)}
                className="group bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border-2 border-dashed border-cyan-300 p-6 flex flex-col items-center justify-center min-h-[280px] w-full transition-all duration-300 hover:border-cyan-400 hover:bg-gradient-to-br hover:from-cyan-100 hover:to-teal-100 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-200 to-teal-200 flex items-center justify-center mb-4 group-hover:from-cyan-300 group-hover:to-teal-300 transition-colors">
                  <svg className="w-8 h-8 text-cyan-700 group-hover:text-cyan-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-cyan-800">Add New Client</p>
                <p className="text-sm text-cyan-600 mt-1">Register a swimmer</p>
              </button>
            </ScaleIn>
          </StaggerChildren>
        )}
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        title="Add New Client"
        size="lg"
      >
        <div className="space-y-5">
          <Input
            label="Full Name"
            id="fullName"
            value={newClient.fullName}
            onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
            placeholder="Enter client's full name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              label="Email"
              id="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              placeholder="email@example.com"
            />
            <Input
              type="tel"
              label="Phone"
              id="phone"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              placeholder="+971 50 123 4567"
            />
          </div>

          <Input
            type="date"
            label="Date of Birth"
            id="dateOfBirth"
            value={newClient.dateOfBirth}
            onChange={(e) => setNewClient({ ...newClient, dateOfBirth: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emergency Contact"
              id="emergencyContact"
              value={newClient.emergencyContact}
              onChange={(e) => setNewClient({ ...newClient, emergencyContact: e.target.value })}
              placeholder="Parent/Guardian name"
            />
            <Input
              type="tel"
              label="Emergency Phone"
              id="emergencyPhone"
              value={newClient.emergencyPhone}
              onChange={(e) => setNewClient({ ...newClient, emergencyPhone: e.target.value })}
              placeholder="+971 50 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Notes</label>
            <textarea
              value={newClient.notes}
              onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddClient(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700" onClick={handleAddClient} disabled={!newClient.fullName}>
              Add Client
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client Detail Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title="Client Details"
        size="lg"
      >
        {selectedClientData && selectedClientStats && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl">
              <div className="relative">
                <img
                  src={getClientPhoto(selectedClientIndex)}
                  alt={selectedClientData.fullName}
                  className="w-24 h-24 rounded-xl object-cover ring-4 ring-white shadow-md"
                />
                {selectedClientData.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedClientData.fullName}</h3>
                <Badge variant={selectedClientData.status === 'active' ? 'success' : 'default'} size="md">
                  {selectedClientData.status}
                </Badge>
                <p className="text-slate-500 mt-2 text-sm">
                  Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-bold text-slate-900">{selectedClientStats.completedLessons}</p>
                <p className="text-sm text-slate-500 font-medium">Total Lessons</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-xl">
                <p className="text-3xl font-bold text-cyan-700">{selectedClientStats.skillsLearned}</p>
                <p className="text-sm text-slate-500 font-medium">Skills Mastered</p>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-xl">
                <p className="text-2xl font-bold text-teal-700">
                  {formatCurrency(selectedClientStats.totalSpent, tenant?.currency || 'AED')}
                </p>
                <p className="text-sm text-slate-500 font-medium">Total Spent</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedClientData.email && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Email</p>
                    <p className="text-slate-900 font-medium">{selectedClientData.email}</p>
                  </div>
                )}
                {selectedClientData.phone && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-slate-900 font-medium">{selectedClientData.phone}</p>
                  </div>
                )}
                {selectedClientData.dateOfBirth && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="text-slate-900 font-medium">
                      {new Date(selectedClientData.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {selectedClientData.emergencyContact && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Emergency Contact</p>
                    <p className="text-slate-900 font-medium">{selectedClientData.emergencyContact}</p>
                    {selectedClientData.emergencyPhone && (
                      <p className="text-slate-600 text-sm">{selectedClientData.emergencyPhone}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedClientData.notes && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Notes</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">{selectedClientData.notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(selectedClientData.id!.toString())}
              >
                Delete Client
              </Button>
              <div className="flex gap-3 flex-1">
                <Button variant="secondary" className="flex-1" onClick={() => setSelectedClient(null)}>
                  Close
                </Button>
                {onViewAsStudent && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700"
                    onClick={() => {
                      setSelectedClient(null)
                      onViewAsStudent(selectedClientData.id!)
                    }}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View as Student
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Client"
        size="sm"
      >
        <div className="space-y-5">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-900">This action cannot be undone</p>
                <p className="text-sm text-red-700">All data for this client will be permanently deleted.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => showDeleteConfirm && handleDeleteClient(showDeleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
