import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  getDb, Tenant, User, Booking, BookingParticipant, ServiceType, Resource,
  SkillCategory, Skill, SkillAssessment, LessonNote,
  // New feature types
  Badge, StudentBadge, Goal, Notification, RecurringPattern,
  PersonalBest, LessonFeedback, AttendanceStreak, ProgressMedia, ParentLink
} from '@/lib/db'

// SSR-safe localStorage wrapper
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(name, value)
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

interface AppState {
  tenant: Tenant | null
  currentUser: User | null
  isInitialized: boolean

  // Data
  clients: User[]
  instructors: User[]
  bookings: Booking[]
  participants: BookingParticipant[]
  serviceTypes: ServiceType[]
  resources: Resource[]
  skillCategories: SkillCategory[]
  skills: Skill[]
  assessments: SkillAssessment[]
  lessonNotes: LessonNote[]

  // New feature data
  badges: Badge[]
  studentBadges: StudentBadge[]
  goals: Goal[]
  notifications: Notification[]
  recurringPatterns: RecurringPattern[]
  personalBests: PersonalBest[]
  lessonFeedback: LessonFeedback[]
  attendanceStreaks: AttendanceStreak[]
  progressMedia: ProgressMedia[]
  parentLinks: ParentLink[]

  // Actions
  initialize: () => Promise<void>
  refreshData: () => Promise<void>

  // Client actions
  addClient: (client: Omit<User, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'passwordHash'>) => Promise<number>
  updateClient: (id: string, updates: Partial<User>) => Promise<void>
  deleteClient: (id: string) => Promise<void>

  // Booking actions
  addBooking: (booking: Omit<Booking, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'paymentStatus'> & { clientId: string }) => Promise<number>
  updateBooking: (id: number, updates: Partial<Booking>) => Promise<void>
  deleteBooking: (id: number) => Promise<void>
  updateAttendance: (participantId: number, status: BookingParticipant['attendanceStatus']) => Promise<void>

  // Assessment actions
  addAssessment: (assessment: { clientId: string; skillId: string; level: number; notes?: string; assessedAt: Date; assessedBy: string }) => Promise<void>

  // Lesson notes actions
  addLessonNote: (note: { bookingId: number; studentId: number; content: string; mood?: LessonNote['mood']; highlights?: string[]; areasToImprove?: string[]; privateNote?: string }) => Promise<number>
  updateLessonNote: (id: number, updates: Partial<LessonNote>) => Promise<void>

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'currentValue' | 'status'>) => Promise<number>
  updateGoal: (id: number, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: number) => Promise<void>

  // Personal best actions
  addPersonalBest: (pb: Omit<PersonalBest, 'id' | 'tenantId' | 'createdAt'>) => Promise<number>

  // Feedback actions
  addLessonFeedback: (feedback: Omit<LessonFeedback, 'id' | 'tenantId' | 'createdAt'>) => Promise<number>

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'tenantId' | 'createdAt' | 'isRead'>) => Promise<number>
  markNotificationRead: (id: number) => Promise<void>
  markAllNotificationsRead: () => Promise<void>

  // Streak actions
  updateStreak: (studentId: number) => Promise<void>

  // Media actions
  addProgressMedia: (media: Omit<ProgressMedia, 'id' | 'tenantId' | 'createdAt'>) => Promise<number>

  // Recurring pattern actions
  addRecurringPattern: (pattern: Omit<RecurringPattern, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Promise<number>
  deleteRecurringPattern: (id: number) => Promise<void>

  // Badge actions
  awardBadge: (studentId: number, badgeId: number) => Promise<void>
  checkAndAwardBadges: (studentId: number) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tenant: null,
      currentUser: null,
      isInitialized: false,
      clients: [],
      instructors: [],
      bookings: [],
      participants: [],
      serviceTypes: [],
      resources: [],
      skillCategories: [],
      skills: [],
      assessments: [],
      lessonNotes: [],
      // New feature initial states
      badges: [],
      studentBadges: [],
      goals: [],
      notifications: [],
      recurringPatterns: [],
      personalBests: [],
      lessonFeedback: [],
      attendanceStreaks: [],
      progressMedia: [],
      parentLinks: [],

      initialize: async () => {
        // Guard: Only run on client side
        if (typeof window === 'undefined') {
          console.log('initialize skipped - running on server')
          return
        }

        try {
          const db = await getDb()
          const tenant = await db.tenants.toCollection().first()
          if (!tenant) {
            set({ isInitialized: true })
            return
          }

          const currentUser = await db.users.where('tenantId').equals(tenant.id!).and(u => u.role === 'owner').first()

          set({ tenant, currentUser, isInitialized: true })
          await get().refreshData()
        } catch (error) {
          console.error('Error initializing app:', error)
          set({ isInitialized: true })
        }
      },

      refreshData: async () => {
        const { tenant } = get()
        if (!tenant?.id) return

        const db = await getDb()
        const [
          clients, instructors, bookings, participants, serviceTypes, resources,
          skillCategories, skills, assessments, lessonNotes,
          badges, studentBadges, goals, notifications, recurringPatterns,
          personalBests, lessonFeedback, attendanceStreaks, progressMedia, parentLinks
        ] = await Promise.all([
          db.users.where('tenantId').equals(tenant.id).and(u => u.role === 'client').toArray(),
          db.users.where('tenantId').equals(tenant.id).and(u => u.role === 'instructor' || u.role === 'owner').toArray(),
          db.bookings.where('tenantId').equals(tenant.id).toArray(),
          db.bookingParticipants.where('tenantId').equals(tenant.id).toArray(),
          db.serviceTypes.where('tenantId').equals(tenant.id).toArray(),
          db.resources.where('tenantId').equals(tenant.id).toArray(),
          db.skillCategories.where('tenantId').equals(tenant.id).toArray(),
          db.skills.where('tenantId').equals(tenant.id).toArray(),
          db.skillAssessments.where('tenantId').equals(tenant.id).toArray(),
          db.lessonNotes.where('tenantId').equals(tenant.id).toArray(),
          // New feature data
          db.badges.where('tenantId').equals(tenant.id).toArray(),
          db.studentBadges.where('tenantId').equals(tenant.id).toArray(),
          db.goals.where('tenantId').equals(tenant.id).toArray(),
          db.notifications.where('tenantId').equals(tenant.id).toArray(),
          db.recurringPatterns.where('tenantId').equals(tenant.id).toArray(),
          db.personalBests.where('tenantId').equals(tenant.id).toArray(),
          db.lessonFeedback.where('tenantId').equals(tenant.id).toArray(),
          db.attendanceStreaks.where('tenantId').equals(tenant.id).toArray(),
          db.progressMedia.where('tenantId').equals(tenant.id).toArray(),
          db.parentLinks.where('tenantId').equals(tenant.id).toArray(),
        ])

        set({
          clients, instructors, bookings, participants, serviceTypes, resources,
          skillCategories, skills, assessments, lessonNotes,
          badges, studentBadges, goals, notifications, recurringPatterns,
          personalBests, lessonFeedback, attendanceStreaks, progressMedia, parentLinks
        })
      },

      addClient: async (clientData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const id = await db.users.add({
          ...clientData,
          tenantId: tenant.id,
          passwordHash: '',
          role: 'client',
          status: 'active',
          notificationPreferences: { email: true, sms: false, push: true },
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await get().refreshData()
        return id as number
      },

      updateClient: async (id, updates) => {
        const db = await getDb()
        await db.users.update(parseInt(id), { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },

      deleteClient: async (id) => {
        const db = await getDb()
        await db.users.delete(parseInt(id))
        await get().refreshData()
      },

      addBooking: async (bookingData) => {
        const { tenant, currentUser } = get()
        if (!tenant?.id || !currentUser?.id) throw new Error('No tenant or user')

        const { clientId, ...bookingFields } = bookingData
        const clientIdNum = parseInt(clientId)

        const db = await getDb()
        const bookingId = await db.bookings.add({
          ...bookingFields,
          tenantId: tenant.id,
          createdBy: currentUser.id,
          paymentStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await db.bookingParticipants.add({
          tenantId: tenant.id,
          bookingId: bookingId as number,
          clientId: clientIdNum,
          attendanceStatus: 'expected',
          createdAt: new Date(),
        })

        await get().refreshData()
        return bookingId as number
      },

      updateBooking: async (id, updates) => {
        const db = await getDb()
        await db.bookings.update(id, { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },

      deleteBooking: async (id) => {
        const db = await getDb()
        await db.bookingParticipants.where('bookingId').equals(id).delete()
        await db.bookings.delete(id)
        await get().refreshData()
      },

      updateAttendance: async (participantId, status) => {
        const db = await getDb()
        await db.bookingParticipants.update(participantId, {
          attendanceStatus: status,
          checkedInAt: status === 'present' ? new Date() : undefined,
        })
        await get().refreshData()
      },

      addAssessment: async (assessment) => {
        const { tenant, currentUser } = get()
        if (!tenant?.id || !currentUser?.id) throw new Error('No tenant or user')

        const db = await getDb()
        // Check if assessment already exists for this client + skill
        const existing = await db.skillAssessments
          .where('tenantId').equals(tenant.id)
          .and(a => a.studentId === parseInt(assessment.clientId) && a.skillId === parseInt(assessment.skillId))
          .first()

        if (existing) {
          // Update existing
          await db.skillAssessments.update(existing.id!, {
            level: assessment.level,
            notes: assessment.notes,
            assessedAt: assessment.assessedAt,
            assessedBy: currentUser.id,
          })
        } else {
          // Create new
          await db.skillAssessments.add({
            tenantId: tenant.id,
            studentId: parseInt(assessment.clientId),
            skillId: parseInt(assessment.skillId),
            level: assessment.level,
            assessedBy: currentUser.id,
            assessedAt: assessment.assessedAt,
            notes: assessment.notes,
            createdAt: new Date(),
          })
        }

        await get().refreshData()
      },

      addLessonNote: async (noteData) => {
        const { tenant, currentUser } = get()
        if (!tenant?.id || !currentUser?.id) throw new Error('No tenant or user')

        const db = await getDb()
        const noteId = await db.lessonNotes.add({
          tenantId: tenant.id,
          bookingId: noteData.bookingId,
          studentId: noteData.studentId,
          coachId: currentUser.id,
          content: noteData.content,
          mood: noteData.mood,
          highlights: noteData.highlights,
          areasToImprove: noteData.areasToImprove,
          privateNote: noteData.privateNote,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await get().refreshData()
        return noteId as number
      },

      updateLessonNote: async (id, updates) => {
        const db = await getDb()
        await db.lessonNotes.update(id, { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },

      // Goal actions
      addGoal: async (goalData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const goalId = await db.goals.add({
          ...goalData,
          tenantId: tenant.id,
          currentValue: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await get().refreshData()
        return goalId as number
      },

      updateGoal: async (id, updates) => {
        const db = await getDb()
        await db.goals.update(id, { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },

      deleteGoal: async (id) => {
        const db = await getDb()
        await db.goals.delete(id)
        await get().refreshData()
      },

      // Personal best actions
      addPersonalBest: async (pbData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const pbId = await db.personalBests.add({
          ...pbData,
          tenantId: tenant.id,
          createdAt: new Date(),
        })

        await get().refreshData()
        return pbId as number
      },

      // Feedback actions
      addLessonFeedback: async (feedbackData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const feedbackId = await db.lessonFeedback.add({
          ...feedbackData,
          tenantId: tenant.id,
          createdAt: new Date(),
        })

        await get().refreshData()
        return feedbackId as number
      },

      // Notification actions
      addNotification: async (notificationData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const notificationId = await db.notifications.add({
          ...notificationData,
          tenantId: tenant.id,
          isRead: false,
          createdAt: new Date(),
        })

        await get().refreshData()
        return notificationId as number
      },

      markNotificationRead: async (id) => {
        const db = await getDb()
        await db.notifications.update(id, { isRead: true, readAt: new Date() })
        await get().refreshData()
      },

      markAllNotificationsRead: async () => {
        const { tenant, notifications } = get()
        if (!tenant?.id) return

        const db = await getDb()
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id!)
        await Promise.all(
          unreadIds.map(id => db.notifications.update(id, { isRead: true, readAt: new Date() }))
        )
        await get().refreshData()
      },

      // Streak actions
      updateStreak: async (studentId) => {
        const { tenant, attendanceStreaks } = get()
        if (!tenant?.id) return

        const db = await getDb()
        const existingStreak = attendanceStreaks.find(s => s.studentId === studentId)
        const today = new Date()

        if (existingStreak) {
          const lastAttendance = existingStreak.lastAttendanceDate
          const lastDate = lastAttendance ? new Date(lastAttendance) : null
          const daysDiff = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999

          let newStreak = existingStreak.currentStreak
          if (daysDiff === 1) {
            newStreak += 1
          } else if (daysDiff > 1) {
            newStreak = 1
          }

          await db.attendanceStreaks.update(existingStreak.id!, {
            currentStreak: newStreak,
            longestStreak: Math.max(existingStreak.longestStreak, newStreak),
            lastAttendanceDate: today,
            totalLessonsAttended: existingStreak.totalLessonsAttended + 1,
            xpPoints: existingStreak.xpPoints + 10,
            updatedAt: today,
          })
        } else {
          await db.attendanceStreaks.add({
            tenantId: tenant.id,
            studentId,
            currentStreak: 1,
            longestStreak: 1,
            lastAttendanceDate: today,
            totalLessonsAttended: 1,
            perfectWeeks: 0,
            level: 1,
            xpPoints: 10,
            createdAt: today,
            updatedAt: today,
          })
        }

        await get().refreshData()
      },

      // Media actions
      addProgressMedia: async (mediaData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const mediaId = await db.progressMedia.add({
          ...mediaData,
          tenantId: tenant.id,
          createdAt: new Date(),
        })

        await get().refreshData()
        return mediaId as number
      },

      // Recurring pattern actions
      addRecurringPattern: async (patternData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

        const db = await getDb()
        const patternId = await db.recurringPatterns.add({
          ...patternData,
          tenantId: tenant.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await get().refreshData()
        return patternId as number
      },

      deleteRecurringPattern: async (id) => {
        const db = await getDb()
        await db.recurringPatterns.delete(id)
        await get().refreshData()
      },

      // Badge actions
      awardBadge: async (studentId, badgeId) => {
        const { tenant, studentBadges } = get()
        if (!tenant?.id) throw new Error('No tenant')

        // Check if already awarded
        const alreadyAwarded = studentBadges.some(
          sb => sb.studentId === studentId && sb.badgeId === badgeId
        )
        if (alreadyAwarded) return

        const db = await getDb()
        await db.studentBadges.add({
          tenantId: tenant.id,
          studentId,
          badgeId,
          earnedAt: new Date(),
          notified: false,
          createdAt: new Date(),
        })

        await get().refreshData()
      },

      checkAndAwardBadges: async (studentId) => {
        const { tenant, badges, studentBadges, attendanceStreaks, assessments } = get()
        if (!tenant?.id) return

        const streak = attendanceStreaks.find(s => s.studentId === studentId)
        const studentAssessments = assessments.filter(a => a.studentId === studentId)
        const masteredSkills = studentAssessments.filter(a => a.level >= 4).length

        for (const badge of badges) {
          const alreadyEarned = studentBadges.some(
            sb => sb.studentId === studentId && sb.badgeId === badge.id
          )
          if (alreadyEarned) continue

          let earned = false
          switch (badge.requirement.type) {
            case 'lessons_completed':
              if (streak && streak.totalLessonsAttended >= badge.requirement.value) {
                earned = true
              }
              break
            case 'streak_days':
              if (streak && streak.currentStreak >= badge.requirement.value) {
                earned = true
              }
              break
            case 'skill_mastered':
              if (masteredSkills >= badge.requirement.value) {
                earned = true
              }
              break
          }

          if (earned) {
            await get().awardBadge(studentId, badge.id!)
          }
        }
      },
    }),
    {
      name: 'samswim-app',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        isInitialized: state.isInitialized,
      }),
      skipHydration: true,
    }
  )
)
