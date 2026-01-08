'use client'

import { useState, useEffect, useMemo } from 'react'
import { Goal, getDb } from '@/lib/db'
import { Button, Input, Modal } from '@/components/ui'

interface StudentGoalsProps {
  studentId: number
}

type GoalType = 'skill' | 'time' | 'distance' | 'attendance' | 'custom'

interface GoalTemplate {
  title: string
  goalType: GoalType
  targetValue: number
  unit: string
  icon: string
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    title: 'Complete 10 lessons this month',
    goalType: 'attendance',
    targetValue: 10,
    unit: 'lessons',
    icon: '📅',
  },
  {
    title: 'Master freestyle stroke',
    goalType: 'skill',
    targetValue: 4,
    unit: 'level',
    icon: '🏊',
  },
  {
    title: 'Swim 50m without stopping',
    goalType: 'distance',
    targetValue: 50,
    unit: 'meters',
    icon: '📏',
  },
  {
    title: 'Improve 25m time by 5 seconds',
    goalType: 'time',
    targetValue: 5,
    unit: 'seconds',
    icon: '⏱️',
  },
]

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  skill: 'Skill Mastery',
  time: 'Time Improvement',
  distance: 'Distance Goal',
  attendance: 'Attendance',
  custom: 'Custom Goal',
}

const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  skill: '🎯',
  time: '⏱️',
  distance: '📏',
  attendance: '📅',
  custom: '✨',
}

const UNIT_OPTIONS: Record<GoalType, { value: string; label: string }[]> = {
  skill: [{ value: 'level', label: 'Level' }],
  time: [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
  ],
  distance: [
    { value: 'meters', label: 'Meters' },
    { value: 'laps', label: 'Laps' },
  ],
  attendance: [
    { value: 'lessons', label: 'Lessons' },
    { value: 'days', label: 'Days' },
  ],
  custom: [
    { value: 'points', label: 'Points' },
    { value: 'count', label: 'Count' },
    { value: 'custom', label: 'Custom' },
  ],
}

const MOTIVATIONAL_MESSAGES = [
  "Every stroke brings you closer to your goal!",
  "You're making waves of progress!",
  "Keep swimming, champion!",
  "Small wins lead to big victories!",
  "Your dedication is inspiring!",
  "One lap at a time!",
  "Champions are made in practice!",
  "You've got this!",
]

function getRandomMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
}

export function StudentGoals({ studentId }: StudentGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [motivationalMessage] = useState(getRandomMessage)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formGoalType, setFormGoalType] = useState<GoalType>('skill')
  const [formTargetValue, setFormTargetValue] = useState('')
  const [formUnit, setFormUnit] = useState('level')
  const [formDeadline, setFormDeadline] = useState('')

  // Load goals from database
  useEffect(() => {
    loadGoals()
  }, [studentId])

  async function loadGoals() {
    try {
      setLoading(true)
      const db = await getDb()
      const studentGoals = await db.goals
        .where('studentId')
        .equals(studentId)
        .toArray()
      setGoals(studentGoals)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Separate active and completed goals
  const { activeGoals, completedGoals } = useMemo(() => {
    const active = goals.filter(g => g.status === 'active')
    const completed = goals.filter(g => g.status === 'completed')
    return { activeGoals: active, completedGoals: completed }
  }, [goals])

  // Reset form
  function resetForm() {
    setFormTitle('')
    setFormDescription('')
    setFormGoalType('skill')
    setFormTargetValue('')
    setFormUnit('level')
    setFormDeadline('')
  }

  // Handle goal type change
  function handleGoalTypeChange(type: GoalType) {
    setFormGoalType(type)
    setFormUnit(UNIT_OPTIONS[type][0].value)
  }

  // Create goal from template
  function useTemplate(template: GoalTemplate) {
    setFormTitle(template.title)
    setFormGoalType(template.goalType)
    setFormTargetValue(template.targetValue.toString())
    setFormUnit(template.unit)
    setShowCreateModal(true)
  }

  // Create new goal
  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim() || !formTargetValue) return

    try {
      const db = await getDb()
      // Get tenant ID from existing goals or default to 1
      const tenantId = goals.length > 0 ? goals[0].tenantId : 1

      await db.goals.add({
        tenantId,
        studentId,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        goalType: formGoalType,
        targetValue: parseFloat(formTargetValue),
        currentValue: 0,
        unit: formUnit,
        deadline: formDeadline ? new Date(formDeadline) : undefined,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      resetForm()
      setShowCreateModal(false)
      await loadGoals()
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  // Open edit modal
  function openEditModal(goal: Goal) {
    setEditingGoal(goal)
    setFormTitle(goal.title)
    setFormDescription(goal.description || '')
    setFormGoalType(goal.goalType as GoalType)
    setFormTargetValue(goal.targetValue.toString())
    setFormUnit(goal.unit)
    setFormDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '')
    setShowEditModal(true)
  }

  // Update goal
  async function handleUpdateGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!editingGoal?.id || !formTitle.trim() || !formTargetValue) return

    try {
      const db = await getDb()
      await db.goals.update(editingGoal.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        goalType: formGoalType,
        targetValue: parseFloat(formTargetValue),
        unit: formUnit,
        deadline: formDeadline ? new Date(formDeadline) : undefined,
        updatedAt: new Date(),
      })

      resetForm()
      setShowEditModal(false)
      setEditingGoal(null)
      await loadGoals()
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  // Delete goal
  async function handleDeleteGoal(goalId: number) {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const db = await getDb()
      await db.goals.delete(goalId)
      await loadGoals()
      if (showEditModal) {
        setShowEditModal(false)
        setEditingGoal(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  // Update goal progress
  async function handleUpdateProgress(goalId: number, newValue: number) {
    try {
      const db = await getDb()
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const updates: Partial<Goal> = {
        currentValue: newValue,
        updatedAt: new Date(),
      }

      // Check if goal is completed
      if (newValue >= goal.targetValue) {
        updates.status = 'completed'
        updates.completedAt = new Date()
      }

      await db.goals.update(goalId, updates)
      await loadGoals()
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  // Calculate progress percentage
  function getProgressPercentage(goal: Goal) {
    if (goal.targetValue === 0) return 0
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
  }

  // Format deadline
  function formatDeadline(date: Date) {
    const now = new Date()
    const deadline = new Date(date)
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays <= 7) return `${diffDays} days left`
    return deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Goals</h1>
          <p className="text-slate-500 text-sm mt-1">{motivationalMessage}</p>
        </div>

        {/* Quick Templates */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Start</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GOAL_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => useTemplate(template)}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group"
              >
                <span className="text-xl mb-1 block">{template.icon}</span>
                <p className="text-xs font-medium text-slate-700 group-hover:text-teal-700 line-clamp-2">
                  {template.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Add Goal Button */}
        <Button
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="w-full mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Set New Goal
        </Button>

        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            Active Goals ({activeGoals.length})
          </h2>

          {activeGoals.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-slate-600 font-medium">No active goals yet</p>
              <p className="text-slate-400 text-sm mt-1">Set your first goal to start tracking progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const progress = getProgressPercentage(goal)
                const isNearComplete = progress >= 80

                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Goal Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{GOAL_TYPE_ICONS[goal.goalType as GoalType]}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                            <p className="text-xs text-slate-500">
                              {GOAL_TYPE_LABELS[goal.goalType as GoalType]}
                              {goal.deadline && (
                                <span className={`ml-2 ${
                                  new Date(goal.deadline) < new Date() ? 'text-red-500' : 'text-teal-600'
                                }`}>
                                  {formatDeadline(goal.deadline)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openEditModal(goal)}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-600">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                          <span className={`font-semibold ${isNearComplete ? 'text-teal-600' : 'text-slate-700'}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isNearComplete
                                ? 'bg-gradient-to-r from-teal-400 to-turquoise-400'
                                : 'bg-gradient-to-r from-teal-500 to-teal-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Progress Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Update:</span>
                        <div className="flex gap-1">
                          {[1, 5, 10].map((increment) => (
                            <button
                              key={increment}
                              onClick={() => handleUpdateProgress(goal.id!, goal.currentValue + increment)}
                              className="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                            >
                              +{increment}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              const value = prompt('Enter new value:', goal.currentValue.toString())
                              if (value) handleUpdateProgress(goal.id!, parseFloat(value))
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Custom
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Near Completion Banner */}
                    {isNearComplete && (
                      <div className="px-4 py-2 bg-gradient-to-r from-teal-500 to-turquoise-500 text-white text-sm font-medium text-center">
                        Almost there! Keep pushing!
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed Goals ({completedGoals.length})
            </h2>

            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl border border-emerald-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Celebration Icon */}
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                      <p className="text-xs text-emerald-600">
                        Completed {goal.completedAt && new Date(goal.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Celebration Animation */}
                    <div className="text-2xl animate-bounce">🎉</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Goal Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            resetForm()
          }}
          title="Set New Goal"
          size="lg"
        >
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <Input
              label="Goal Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., Master butterfly stroke"
              required
            />

            <Input
              label="Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Add more details about your goal..."
            />

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Goal Type</label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleGoalTypeChange(type)}
                    className={`p-2 rounded-xl text-center transition-all ${
                      formGoalType === type
                        ? 'bg-teal-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">{GOAL_TYPE_ICONS[type]}</span>
                    <span className="text-[10px] font-medium block">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Target Value"
                type="number"
                value={formTargetValue}
                onChange={(e) => setFormTargetValue(e.target.value)}
                placeholder="e.g., 50"
                required
                min="1"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Unit</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-300 transition-all"
                >
                  {UNIT_OPTIONS[formGoalType].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Deadline (optional)"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Goal
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Goal Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingGoal(null)
            resetForm()
          }}
          title="Edit Goal"
          size="lg"
        >
          <form onSubmit={handleUpdateGoal} className="space-y-4">
            <Input
              label="Goal Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., Master butterfly stroke"
              required
            />

            <Input
              label="Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Add more details about your goal..."
            />

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Goal Type</label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleGoalTypeChange(type)}
                    className={`p-2 rounded-xl text-center transition-all ${
                      formGoalType === type
                        ? 'bg-teal-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">{GOAL_TYPE_ICONS[type]}</span>
                    <span className="text-[10px] font-medium block">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Target Value"
                type="number"
                value={formTargetValue}
                onChange={(e) => setFormTargetValue(e.target.value)}
                placeholder="e.g., 50"
                required
                min="1"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Unit</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-300 transition-all"
                >
                  {UNIT_OPTIONS[formGoalType].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Deadline (optional)"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="danger"
                onClick={() => editingGoal?.id && handleDeleteGoal(editingGoal.id)}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingGoal(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
