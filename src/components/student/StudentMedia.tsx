'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ProgressMedia } from '@/lib/db'
import { Button, Modal, Input, Select } from '@/components/ui'
import { useAppStore } from '@/lib/store/app'

interface StudentMediaProps {
  studentId: number
  canUpload?: boolean
}

type MediaFilter = 'all' | 'photo' | 'video'
type ViewMode = 'grid' | 'timeline'
type DateFilter = 'all' | 'week' | 'month' | 'year' | 'custom'

// Mock media data for demonstration
const mockMediaData: ProgressMedia[] = [
  {
    id: 1,
    tenantId: 1,
    studentId: 1,
    mediaType: 'photo',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&h=150&fit=crop',
    title: 'First freestyle attempt',
    description: 'Great arm extension and breathing technique',
    skillId: 6,
    uploadedBy: 1,
    isPublic: true,
    createdAt: new Date('2024-11-15'),
  },
  {
    id: 2,
    tenantId: 1,
    studentId: 1,
    mediaType: 'video',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=200&h=150&fit=crop',
    title: 'Backstroke practice',
    description: 'Working on arm rotation and body position',
    skillId: 7,
    uploadedBy: 1,
    isPublic: true,
    createdAt: new Date('2024-11-20'),
  },
  {
    id: 3,
    tenantId: 1,
    studentId: 1,
    mediaType: 'photo',
    url: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400&h=300&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=200&h=150&fit=crop',
    title: 'Diving practice',
    description: 'Entry angle improving significantly',
    skillId: 16,
    uploadedBy: 1,
    isPublic: true,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 4,
    tenantId: 1,
    studentId: 1,
    mediaType: 'photo',
    url: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=400&h=300&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=200&h=150&fit=crop',
    title: 'Butterfly stroke intro',
    description: 'First attempt at dolphin kick',
    skillId: 11,
    uploadedBy: 1,
    isPublic: true,
    createdAt: new Date('2024-12-10'),
  },
  {
    id: 5,
    tenantId: 1,
    studentId: 1,
    mediaType: 'video',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&h=150&fit=crop',
    title: 'Flip turn progress',
    description: 'Much smoother rotation this week',
    skillId: 12,
    uploadedBy: 1,
    isPublic: true,
    createdAt: new Date('2024-12-15'),
  },
]

// Before/After comparison pairs (mock data)
const beforeAfterPairs = [
  {
    id: 1,
    skill: 'Freestyle Stroke',
    before: {
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop',
      date: new Date('2024-09-01'),
      note: 'Initial technique',
    },
    after: {
      url: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=300&h=200&fit=crop',
      date: new Date('2024-12-15'),
      note: 'Current form',
    },
  },
]

// LazyImage component for performance
function LazyImage({
  src,
  alt,
  className,
  onClick
}: {
  src: string
  alt: string
  className?: string
  onClick?: () => void
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={className} onClick={onClick}>
      {isInView ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-teal-100 animate-pulse rounded-lg" />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full bg-teal-50 animate-pulse rounded-lg" />
      )}
    </div>
  )
}

// Lightbox component
function Lightbox({
  media,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  skill,
}: {
  media: ProgressMedia
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  skill?: string
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Media content */}
      <div className="max-w-5xl max-h-[85vh] w-full mx-4">
        {media.mediaType === 'video' ? (
          <video
            src={media.url}
            controls
            autoPlay
            className="w-full max-h-[70vh] rounded-xl"
          />
        ) : (
          <img
            src={media.url}
            alt={media.title || 'Progress photo'}
            className="w-full max-h-[70vh] object-contain rounded-xl"
          />
        )}

        {/* Info panel */}
        <div className="mt-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{media.title || 'Untitled'}</h3>
              {media.description && (
                <p className="text-white/70 mt-1">{media.description}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/50 text-sm">
                {new Date(media.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {skill && (
                <span className="inline-block mt-2 px-3 py-1 bg-teal-500/30 text-teal-300 rounded-full text-sm">
                  {skill}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Upload Modal component
function UploadModal({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: { title: string; description: string; mediaType: 'photo' | 'video'; skillId?: number }) => void
}) {
  const { skills } = useAppStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo')
  const [skillId, setSkillId] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = () => {
    onUpload({
      title,
      description,
      mediaType,
      skillId: skillId ? parseInt(skillId) : undefined,
    })
    setTitle('')
    setDescription('')
    setMediaType('photo')
    setSkillId('')
    onClose()
  }

  const skillOptions = [
    { value: '', label: 'Select a skill (optional)' },
    ...skills.map(s => ({ value: s.id!.toString(), label: s.name })),
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Progress Media" size="lg">
      <div className="space-y-5">
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-teal-500 bg-teal-50'
              : 'border-slate-200 hover:border-teal-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Drag and drop your file here</p>
          <p className="text-slate-400 text-sm mt-1">or click to browse</p>
          <p className="text-teal-600 text-xs mt-3">Supports: JPG, PNG, MP4, MOV</p>
        </div>

        {/* Media type selector */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMediaType('photo')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              mediaType === 'photo'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photo
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              mediaType === 'video'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video
          </button>
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Freestyle improvement"
        />

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's happening in this media..."
            rows={3}
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all hover:border-teal-300"
          />
        </div>

        <Select
          label="Related Skill"
          value={skillId}
          onChange={(e) => setSkillId(e.target.value)}
          options={skillOptions}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Upload Media
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function StudentMedia({ studentId, canUpload = false }: StudentMediaProps) {
  const { skills } = useAppStore()

  // State
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedMedia, setSelectedMedia] = useState<ProgressMedia | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [media, setMedia] = useState<ProgressMedia[]>(mockMediaData.filter(m => m.studentId === studentId))

  // Get skill name by ID
  const getSkillName = useCallback((skillId?: number) => {
    if (!skillId) return undefined
    return skills.find(s => s.id === skillId)?.name
  }, [skills])

  // Filter media based on current filters
  const filteredMedia = useMemo(() => {
    let result = [...media]

    // Filter by type
    if (mediaFilter !== 'all') {
      result = result.filter(m => m.mediaType === mediaFilter)
    }

    // Filter by date
    const now = new Date()
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      result = result.filter(m => new Date(m.createdAt) >= weekAgo)
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      result = result.filter(m => new Date(m.createdAt) >= monthAgo)
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      result = result.filter(m => new Date(m.createdAt) >= yearAgo)
    }

    // Sort by date (newest first)
    return result.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [media, mediaFilter, dateFilter])

  // Group media by month for timeline view
  const mediaByMonth = useMemo(() => {
    const groups: Record<string, ProgressMedia[]> = {}
    filteredMedia.forEach(m => {
      const date = new Date(m.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    })
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => ({
        key,
        label: new Date(key + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        items,
      }))
  }, [filteredMedia])

  // Lightbox navigation
  const currentMediaIndex = selectedMedia
    ? filteredMedia.findIndex(m => m.id === selectedMedia.id)
    : -1

  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) {
      setSelectedMedia(filteredMedia[currentMediaIndex - 1])
    }
  }

  const handleNextMedia = () => {
    if (currentMediaIndex < filteredMedia.length - 1) {
      setSelectedMedia(filteredMedia[currentMediaIndex + 1])
    }
  }

  // Handle upload (mock)
  const handleUpload = (data: { title: string; description: string; mediaType: 'photo' | 'video'; skillId?: number }) => {
    const newMedia: ProgressMedia = {
      id: Date.now(),
      tenantId: 1,
      studentId,
      mediaType: data.mediaType,
      url: data.mediaType === 'photo'
        ? 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop'
        : 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&h=150&fit=crop',
      title: data.title,
      description: data.description,
      skillId: data.skillId,
      uploadedBy: 1,
      isPublic: true,
      createdAt: new Date(),
    }
    setMedia(prev => [newMedia, ...prev])
  }

  // Empty state
  if (media.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Progress Gallery</h1>
            <p className="text-slate-500 text-sm mt-1">Capture your swimming journey</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-teal-400 to-turquoise-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Start Your Visual Journey!</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Photos and videos are a great way to track progress. Capture those breakthrough moments!
            </p>
            {canUpload && (
              <Button onClick={() => setShowUploadModal(true)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Photo
              </Button>
            )}

            {/* Encouragement */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm text-teal-600 font-medium mb-3">Why track with photos?</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3">
                  <div className="text-2xl mb-1">📈</div>
                  <p className="text-xs text-slate-500">See your improvement</p>
                </div>
                <div className="p-3">
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="text-xs text-slate-500">Track technique</p>
                </div>
                <div className="p-3">
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-xs text-slate-500">Celebrate milestones</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Progress Gallery</h1>
            <p className="text-slate-500 text-sm mt-1">
              {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {canUpload && (
            <Button onClick={() => setShowUploadModal(true)} size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'photo', 'video'] as MediaFilter[]).map(type => (
                <button
                  key={type}
                  onClick={() => setMediaFilter(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mediaFilter === type
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'photo' ? 'Photos' : 'Videos'}
                </button>
              ))}
            </div>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All time</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>

            {/* View mode toggle */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Before/After Toggle */}
        <button
          onClick={() => setShowBeforeAfter(!showBeforeAfter)}
          className={`w-full mb-4 py-3 px-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 font-medium ${
            showBeforeAfter
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Before &amp; After Comparisons
        </button>

        {/* Before/After Section */}
        {showBeforeAfter && beforeAfterPairs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-4">Progress Comparisons</h3>
            {beforeAfterPairs.map(pair => (
              <div key={pair.id} className="mb-4 last:mb-0">
                <p className="text-sm font-medium text-teal-600 mb-2">{pair.skill}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 relative">
                      <img
                        src={pair.before.url}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/70 text-white text-xs rounded">
                        Before
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(pair.before.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 relative">
                      <img
                        src={pair.after.url}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-teal-500 text-white text-xs rounded">
                        After
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(pair.after.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredMedia.map((item, index) => {
              // Masonry-style heights
              const heightClass = index % 5 === 0 ? 'row-span-2' : ''

              return (
                <div
                  key={item.id}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden bg-slate-100 ${heightClass}`}
                  style={{
                    aspectRatio: heightClass ? '4/5' : '1/1',
                  }}
                  onClick={() => setSelectedMedia(item)}
                >
                  <LazyImage
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || 'Progress media'}
                    className="absolute inset-0"
                  />

                  {/* Video indicator */}
                  {item.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-medium text-sm truncate">
                        {item.title || 'Untitled'}
                      </p>
                      {item.skillId && (
                        <p className="text-teal-300 text-xs truncate">
                          {getSkillName(item.skillId)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {mediaByMonth.map(group => (
              <div key={group.key}>
                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  {group.label}
                </h3>
                <div className="space-y-3">
                  {group.items.map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 p-3 flex gap-4 cursor-pointer hover:border-teal-300 transition-colors"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.title || 'Progress media'}
                          className="w-full h-full object-cover"
                        />
                        {item.mediaType === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {item.title || 'Untitled'}
                        </p>
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {item.skillId && (
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs font-medium">
                              {getSkillName(item.skillId)}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {filteredMedia.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No media found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <Lightbox
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onPrev={handlePrevMedia}
          onNext={handleNextMedia}
          hasPrev={currentMediaIndex > 0}
          hasNext={currentMediaIndex < filteredMedia.length - 1}
          skill={getSkillName(selectedMedia.skillId)}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}
