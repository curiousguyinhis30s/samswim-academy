'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store/app'
import { Button, Modal, Select, EmptyState } from '@/components/ui'

const SKILL_LEVELS = [
  { value: 0, label: 'Not Started', color: 'bg-ocean-200', textColor: 'text-ocean-600', ring: 'ring-ocean-200' },
  { value: 1, label: 'Introduced', color: 'bg-amber-400', textColor: 'text-amber-600', ring: 'ring-amber-200' },
  { value: 2, label: 'Practicing', color: 'bg-ocean-400', textColor: 'text-ocean-600', ring: 'ring-ocean-200' },
  { value: 3, label: 'Proficient', color: 'bg-sea-500', textColor: 'text-sea-600', ring: 'ring-sea-200' },
  { value: 4, label: 'Mastered', color: 'bg-tennis-500', textColor: 'text-tennis-700', ring: 'ring-tennis-200' },
]

// Sample student photos - in production these would come from the database
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
]

export function Progress() {
  const { clients, skillCategories, skills, assessments, addAssessment } = useAppStore()
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [showAssessModal, setShowAssessModal] = useState(false)
  const [assessingSkill, setAssessingSkill] = useState<string | null>(null)
  const [newLevel, setNewLevel] = useState(0)
  const [assessmentNotes, setAssessmentNotes] = useState('')

  const clientAssessments = useMemo(() => {
    if (!selectedClient) return {}
    const clientAss = assessments.filter(a => a.studentId === parseInt(selectedClient))
    return clientAss.reduce((acc, a) => {
      acc[a.skillId.toString()] = a
      return acc
    }, {} as Record<string, typeof assessments[0]>)
  }, [selectedClient, assessments])

  const getSkillLevel = (skillId: string) => {
    return clientAssessments[skillId]?.level || 0
  }

  const getCategoryProgress = (categoryId: number) => {
    const categorySkills = skills.filter(s => s.categoryId === categoryId)
    if (categorySkills.length === 0) return 0
    const totalLevel = categorySkills.reduce((sum, s) => sum + getSkillLevel(s.id!.toString()), 0)
    return Math.round((totalLevel / (categorySkills.length * 4)) * 100)
  }

  const getClientProgress = (clientId: number) => {
    const clientAss = assessments.filter(a => a.studentId === clientId)
    const totalSkills = skills.length
    if (totalSkills === 0) return 0
    const masteredCount = clientAss.filter(a => a.level >= 3).length
    return Math.round((masteredCount / totalSkills) * 100)
  }

  const handleAssess = async () => {
    if (!selectedClient || !assessingSkill) return

    await addAssessment({
      clientId: selectedClient,
      skillId: assessingSkill,
      level: newLevel,
      notes: assessmentNotes || undefined,
      assessedAt: new Date(),
      assessedBy: 'current-user',
    })

    setShowAssessModal(false)
    setAssessingSkill(null)
    setNewLevel(0)
    setAssessmentNotes('')
  }

  const openAssessModal = (skillId: number) => {
    setAssessingSkill(skillId.toString())
    setNewLevel(getSkillLevel(skillId.toString()))
    setAssessmentNotes(clientAssessments[skillId.toString()]?.notes || '')
    setShowAssessModal(true)
  }

  const selectedClientData = clients.find(c => c.id?.toString() === selectedClient)

  const overallStats = useMemo(() => {
    if (!selectedClient) return { total: 0, mastered: 0, inProgress: 0, percentage: 0 }
    const totalSkills = skills.length
    const mastered = skills.filter(s => getSkillLevel(s.id!.toString()) >= 3).length
    const inProgress = skills.filter(s => {
      const level = getSkillLevel(s.id!.toString())
      return level > 0 && level < 3
    }).length
    const percentage = totalSkills > 0 ? Math.round((mastered / totalSkills) * 100) : 0
    return { total: totalSkills, mastered, inProgress, percentage }
  }, [selectedClient, skills, clientAssessments])

  return (
    <div className="min-h-screen ocean-bg">
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ocean-900">Progress Tracking</h1>
              <p className="text-ocean-600 mt-1">Track swimming skills and celebrate achievements</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-ocean-100 text-ocean-700 rounded-full text-sm font-semibold">
                {clients.length} Students
              </span>
            </div>
          </div>
        </div>

        {/* Student Cards Grid - Apple-quality design */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-ocean-900 mb-4">Select Student</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {clients.map((client, index) => {
              const isSelected = client.id?.toString() === selectedClient
              const progress = getClientProgress(client.id!)
              const photoUrl = SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length]

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id!.toString())}
                  className={`group relative bg-white rounded-3xl p-4 transition-all duration-300 ${
                    isSelected
                      ? 'ring-4 ring-ocean-500 shadow-ocean scale-[1.02]'
                      : 'border border-ocean-100 hover:border-ocean-200 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                >
                  {/* Photo */}
                  <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-3">
                    <img
                      src={photoUrl}
                      alt={client.fullName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="46%"
                        fill="none"
                        stroke="#e0f2fe"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="46%"
                        fill="none"
                        stroke={progress >= 75 ? '#84cc16' : progress >= 50 ? '#14b8a6' : '#0ea5e9'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 2.9} 290`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    {/* Progress Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                      progress >= 75 ? 'bg-tennis-500 text-white' : progress >= 50 ? 'bg-sea-500 text-white' : 'bg-ocean-500 text-white'
                    }`}>
                      {progress}%
                    </div>
                  </div>

                  {/* Name & Info */}
                  <div className="text-center">
                    <p className="font-semibold text-ocean-900 truncate text-sm sm:text-base">
                      {client.fullName.split(' ')[0]}
                    </p>
                    <p className="text-xs text-ocean-500 truncate">{client.fullName.split(' ')[1] || ''}</p>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-ocean-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}

            {/* Add New Student Card */}
            <button className="group relative bg-gradient-to-br from-ocean-50 to-sea-50 rounded-3xl p-4 border-2 border-dashed border-ocean-200 hover:border-ocean-400 transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-12 h-12 rounded-2xl bg-ocean-100 flex items-center justify-center mb-2 group-hover:bg-ocean-200 transition-colors">
                <svg className="w-6 h-6 text-ocean-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-ocean-600">Add Student</p>
            </button>
          </div>
        </div>

        {!selectedClient ? (
          <div className="bg-white rounded-3xl border border-ocean-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-ocean-100 to-sea-100 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10 text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-ocean-900 mb-2">Select a Student</h3>
            <p className="text-ocean-500 max-w-sm mx-auto">
              Choose a student from the cards above to view and track their swimming progress
            </p>
          </div>
        ) : (
          <>
            {/* Selected Student Hero Card */}
            <div className="bg-gradient-to-br from-ocean-500 via-ocean-600 to-sea-600 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-ocean relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="waves" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 10 Q5 5, 10 10 T20 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#waves)"/>
                </svg>
              </div>

              <div className="relative flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    src={SAMPLE_PHOTOS[clients.findIndex(c => c.id?.toString() === selectedClient) % SAMPLE_PHOTOS.length]}
                    alt={selectedClientData?.fullName}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-3xl ring-4 ring-white/30"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-tennis-500 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg">
                    {overallStats.percentage}%
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">{selectedClientData?.fullName}</h2>
                  <p className="text-ocean-100 mb-4">{selectedClientData?.email}</p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                      <p className="text-2xl font-bold">{overallStats.mastered}</p>
                      <p className="text-xs text-ocean-100">Mastered</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                      <p className="text-2xl font-bold">{overallStats.inProgress}</p>
                      <p className="text-xs text-ocean-100">In Progress</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                      <p className="text-2xl font-bold">{overallStats.total - overallStats.mastered - overallStats.inProgress}</p>
                      <p className="text-xs text-ocean-100">Remaining</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                      <circle
                        cx="64" cy="64" r="56"
                        fill="none"
                        stroke="#84cc16"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${overallStats.percentage * 3.52} 352`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold">{overallStats.percentage}%</p>
                      <p className="text-xs text-ocean-100">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Categories */}
            <div className="space-y-6">
              {skillCategories.map(category => {
                const categorySkills = skills.filter(s => s.categoryId === category.id!)
                const progress = getCategoryProgress(category.id!)

                return (
                  <div key={category.id} className="bg-white rounded-3xl border border-ocean-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 border-b border-ocean-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-400 to-sea-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-ocean-900 text-lg">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-ocean-500">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-ocean-900">{progress}%</p>
                          <p className="text-xs text-ocean-500 font-medium">Complete</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-3 bg-ocean-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${progress}%`,
                            background: progress >= 75
                              ? 'linear-gradient(90deg, #84cc16, #22c55e)'
                              : progress >= 50
                              ? 'linear-gradient(90deg, #14b8a6, #06b6d4)'
                              : 'linear-gradient(90deg, #0ea5e9, #0891b2)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categorySkills.map(skill => {
                          const level = getSkillLevel(skill.id!.toString())
                          const levelInfo = SKILL_LEVELS[level]

                          return (
                            <button
                              key={skill.id}
                              onClick={() => openAssessModal(skill.id!)}
                              className="group flex items-center gap-4 p-4 bg-gradient-to-br from-ocean-50/50 to-sea-50/50 rounded-2xl hover:from-ocean-50 hover:to-sea-50 border border-ocean-100/50 hover:border-ocean-200 transition-all text-left"
                            >
                              <div className={`w-12 h-12 rounded-2xl ${levelInfo.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                                {level}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ocean-900 truncate">{skill.name}</p>
                                <p className={`text-sm font-medium ${levelInfo.textColor}`}>{levelInfo.label}</p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5 text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Skill Level Legend - Apple-style */}
            <div className="mt-8 bg-white rounded-3xl border border-ocean-100 p-6 shadow-sm">
              <h4 className="font-bold text-ocean-900 mb-4">Skill Levels</h4>
              <div className="flex flex-wrap gap-3">
                {SKILL_LEVELS.map(level => (
                  <div key={level.value} className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${level.ring} ring-2 bg-white`}>
                    <div className={`w-8 h-8 rounded-xl ${level.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {level.value}
                    </div>
                    <span className="text-sm font-medium text-ocean-700">{level.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assess Skill Modal - Refined */}
      <Modal
        isOpen={showAssessModal}
        onClose={() => {
          setShowAssessModal(false)
          setAssessingSkill(null)
        }}
        title="Update Skill Level"
        size="md"
      >
        {assessingSkill && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-ocean-50 rounded-2xl">
              <img
                src={SAMPLE_PHOTOS[clients.findIndex(c => c.id?.toString() === selectedClient) % SAMPLE_PHOTOS.length]}
                alt={selectedClientData?.fullName}
                className="w-14 h-14 object-cover rounded-xl"
              />
              <div>
                <p className="font-bold text-ocean-900">{selectedClientData?.fullName}</p>
                <p className="text-sm text-ocean-500">
                  {skills.find(s => s.id?.toString() === assessingSkill)?.name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ocean-800 mb-3">Select Level</label>
              <div className="grid grid-cols-5 gap-2">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setNewLevel(level.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      newLevel === level.value
                        ? 'border-ocean-500 bg-ocean-50 shadow-ocean'
                        : 'border-ocean-100 hover:border-ocean-200 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${level.color} flex items-center justify-center text-white font-bold shadow-sm`}>
                      {level.value}
                    </div>
                    <span className="text-xs text-ocean-600 text-center leading-tight font-medium">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ocean-800 mb-2">Notes (optional)</label>
              <textarea
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
                placeholder="Add observations, tips, or feedback..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-ocean-200 rounded-2xl text-ocean-900 placeholder:text-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowAssessModal(false)
                  setAssessingSkill(null)
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAssess}>
                Save Assessment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
