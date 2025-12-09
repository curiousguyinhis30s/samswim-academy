'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/lib/store/app'

interface StudentProgressProps {
  studentId: number
}

const LEVEL_LABELS = ['Not Started', 'Beginner', 'Developing', 'Proficient', 'Mastered']

export function StudentProgress({ studentId }: StudentProgressProps) {
  const { assessments, skills, skillCategories } = useAppStore()
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const studentAssessments = assessments.filter(a => a.studentId === studentId)
    const totalSkills = skills.length
    const masteredSkills = studentAssessments.filter(a => a.level >= 3).length
    const inProgressSkills = studentAssessments.filter(a => a.level > 0 && a.level < 3).length
    const percentage = totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0
    return { totalSkills, masteredSkills, inProgressSkills, percentage }
  }, [studentId, assessments, skills])

  // Get skills by category with progress
  const skillsByCategory = useMemo(() => {
    const studentAssessments = assessments.filter(a => a.studentId === studentId)
    return skillCategories.map(category => {
      const categorySkills = skills.filter(s => s.categoryId === category.id)
      const assessedSkills = categorySkills.map(skill => {
        const assessment = studentAssessments.find(a => a.skillId === skill.id)
        return {
          ...skill,
          level: assessment?.level || 0,
          notes: assessment?.notes
        }
      }).sort((a, b) => b.level - a.level)

      const mastered = assessedSkills.filter(s => s.level >= 3).length
      const total = categorySkills.length
      const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0
      return { ...category, skills: assessedSkills, mastered, total, percentage }
    }).sort((a, b) => b.percentage - a.percentage)
  }, [skillCategories, skills, assessments, studentId])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
          <p className="text-slate-500 text-sm mt-1">
            {overallStats.masteredSkills} of {overallStats.totalSkills} skills mastered
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#1E5AA8"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${overallStats.percentage * 2.14} 214`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{overallStats.percentage}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">{overallStats.masteredSkills}</p>
                <p className="text-xs text-slate-500">Mastered</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">{overallStats.inProgressSkills}</p>
                <p className="text-xs text-slate-500">In Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {skillsByCategory.map((category) => {
            const isExpanded = expandedCategory === category.id

            return (
              <div key={category.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id!)}
                  className="w-full px-4 py-3.5 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-900 truncate">{category.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{category.mastered}/{category.total} mastered</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ocean-500 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 w-8 text-right">{category.percentage}%</span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Skills List */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {category.skills.map((skill) => (
                      <div key={skill.id} className="px-4 py-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{skill.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Level bars */}
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`w-1.5 h-4 rounded-full ${
                                    skill.level >= lvl ? 'bg-ocean-500' : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500 w-16 text-right">
                              {LEVEL_LABELS[skill.level]}
                            </span>
                          </div>
                        </div>
                        {skill.notes && (
                          <p className="text-xs text-slate-400 mt-1.5 italic">{skill.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-3">Skill Levels</p>
          <div className="grid grid-cols-4 gap-2">
            {['Beginner', 'Developing', 'Proficient', 'Mastered'].map((label, i) => (
              <div key={label} className="text-center">
                <div className="flex justify-center gap-0.5 mb-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className={`w-1 h-3 rounded-full ${lvl <= i + 1 ? 'bg-ocean-500' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
