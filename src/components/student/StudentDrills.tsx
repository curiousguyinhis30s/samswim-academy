'use client'

import { useState } from 'react'

interface DrillVideo {
  id: string
  title: string
  description: string
  duration: string
  category: 'warmup' | 'technique' | 'strength' | 'endurance' | 'cooldown'
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail: string
  videoUrl: string
}

const drillVideos: DrillVideo[] = [
  // Warm-up Drills
  {
    id: '1',
    title: 'Dynamic Arm Circles',
    description: 'Loosen up your shoulders before getting in the water',
    duration: '2 min',
    category: 'warmup',
    level: 'beginner',
    thumbnail: '🔄',
    videoUrl: '#'
  },
  {
    id: '2',
    title: 'Pool Edge Kicks',
    description: 'Flutter kicks while holding the pool edge',
    duration: '3 min',
    category: 'warmup',
    level: 'beginner',
    thumbnail: '🦶',
    videoUrl: '#'
  },
  // Technique Drills
  {
    id: '3',
    title: 'Catch-Up Freestyle',
    description: 'Perfect your arm timing and stroke coordination',
    duration: '5 min',
    category: 'technique',
    level: 'intermediate',
    thumbnail: '🏊',
    videoUrl: '#'
  },
  {
    id: '4',
    title: 'Fingertip Drag',
    description: 'Improve high elbow recovery in freestyle',
    duration: '4 min',
    category: 'technique',
    level: 'intermediate',
    thumbnail: '✋',
    videoUrl: '#'
  },
  {
    id: '5',
    title: 'Head-Up Breaststroke',
    description: 'Build stroke power and awareness',
    duration: '5 min',
    category: 'technique',
    level: 'advanced',
    thumbnail: '🐸',
    videoUrl: '#'
  },
  {
    id: '6',
    title: 'Single-Arm Backstroke',
    description: 'Focus on rotation and arm pull technique',
    duration: '4 min',
    category: 'technique',
    level: 'intermediate',
    thumbnail: '🔙',
    videoUrl: '#'
  },
  // Strength Drills
  {
    id: '7',
    title: 'Kick Board Sprints',
    description: 'Build leg strength and kicking power',
    duration: '6 min',
    category: 'strength',
    level: 'beginner',
    thumbnail: '💪',
    videoUrl: '#'
  },
  {
    id: '8',
    title: 'Paddle Power Sets',
    description: 'Increase arm strength with paddles',
    duration: '8 min',
    category: 'strength',
    level: 'advanced',
    thumbnail: '🎯',
    videoUrl: '#'
  },
  // Endurance Drills
  {
    id: '9',
    title: 'Pyramid Sets',
    description: '25-50-75-100-75-50-25 with rest intervals',
    duration: '15 min',
    category: 'endurance',
    level: 'intermediate',
    thumbnail: '📈',
    videoUrl: '#'
  },
  {
    id: '10',
    title: 'Long Slow Distance',
    description: 'Build aerobic base with continuous swimming',
    duration: '20 min',
    category: 'endurance',
    level: 'advanced',
    thumbnail: '🏔️',
    videoUrl: '#'
  },
  // Cool-down Drills
  {
    id: '11',
    title: 'Easy Backstroke Glide',
    description: 'Gentle movement to bring heart rate down',
    duration: '3 min',
    category: 'cooldown',
    level: 'beginner',
    thumbnail: '😌',
    videoUrl: '#'
  },
  {
    id: '12',
    title: 'Poolside Stretching',
    description: 'Post-swim stretches for flexibility',
    duration: '5 min',
    category: 'cooldown',
    level: 'beginner',
    thumbnail: '🧘',
    videoUrl: '#'
  },
]

const categories = [
  { id: 'all', label: 'All Drills', icon: '📚' },
  { id: 'warmup', label: 'Warm-up', icon: '🔥' },
  { id: 'technique', label: 'Technique', icon: '🎯' },
  { id: 'strength', label: 'Strength', icon: '💪' },
  { id: 'endurance', label: 'Endurance', icon: '🏃' },
  { id: 'cooldown', label: 'Cool-down', icon: '❄️' },
]

const levels = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

interface StudentDrillsProps {
  studentId: number
}

export function StudentDrills({ studentId }: StudentDrillsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const filteredVideos = drillVideos.filter(video => {
    const categoryMatch = selectedCategory === 'all' || video.category === selectedCategory
    const levelMatch = selectedLevel === 'all' || video.level === selectedLevel
    return categoryMatch && levelMatch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700'
      case 'intermediate': return 'bg-amber-100 text-amber-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'warmup': return 'from-orange-500 to-red-500'
      case 'technique': return 'from-teal-500 to-turquoise-500'
      case 'strength': return 'from-purple-500 to-pink-500'
      case 'endurance': return 'from-blue-500 to-indigo-500'
      case 'cooldown': return 'from-cyan-500 to-blue-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quick Drills</h1>
        <p className="text-slate-500 mt-1">Practice at home or poolside</p>
      </div>

      {/* Category Filter - Horizontal Scroll */}
      <div className="mb-4 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level Filter */}
      <div className="mb-6 flex gap-2">
        {levels.map(level => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedLevel === level.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="space-y-4">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏊</div>
            <p className="text-slate-500">No drills found for this filter</p>
          </div>
        ) : (
          filteredVideos.map(video => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Video Preview */}
              <div
                className={`relative h-32 bg-gradient-to-br ${getCategoryColor(video.category)} flex items-center justify-center cursor-pointer`}
                onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)}
              >
                {playingVideo === video.id ? (
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Video playing...</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <div className="text-5xl mb-2">{video.thumbnail}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white font-medium">
                  {video.duration}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{video.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{video.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(video.level)}`}>
                    {video.level.charAt(0).toUpperCase() + video.level.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Workout Builder */}
      <div className="mt-8 p-4 bg-gradient-to-br from-teal-50 to-turquoise-50 rounded-2xl border border-teal-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-teal-900">Suggested Workout</h3>
            <p className="text-sm text-teal-700">Based on your progress</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Dynamic Arm Circles (2 min)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Catch-Up Freestyle (5 min)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Kick Board Sprints (6 min)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>Easy Backstroke Glide (3 min)</span>
          </div>
        </div>
        <button className="mt-4 w-full py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors">
          Start Workout (16 min)
        </button>
      </div>
    </div>
  )
}
