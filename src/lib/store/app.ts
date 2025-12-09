import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, Tenant, User, Booking, BookingParticipant, ServiceType, Resource, SkillCategory, Skill, SkillAssessment, LessonNote } from '@/lib/db'

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

      initialize: async () => {
        const tenant = await db.tenants.toCollection().first()
        if (!tenant) return

        const currentUser = await db.users.where('tenantId').equals(tenant.id!).and(u => u.role === 'owner').first()

        set({ tenant, currentUser, isInitialized: true })
        await get().refreshData()
      },

      refreshData: async () => {
        const { tenant } = get()
        if (!tenant?.id) return

        const [clients, instructors, bookings, participants, serviceTypes, resources, skillCategories, skills, assessments, lessonNotes] = await Promise.all([
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
        ])

        set({ clients, instructors, bookings, participants, serviceTypes, resources, skillCategories, skills, assessments, lessonNotes })
      },

      addClient: async (clientData) => {
        const { tenant } = get()
        if (!tenant?.id) throw new Error('No tenant')

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
        await db.users.update(parseInt(id), { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },

      deleteClient: async (id) => {
        await db.users.delete(parseInt(id))
        await get().refreshData()
      },

      addBooking: async (bookingData) => {
        const { tenant, currentUser } = get()
        if (!tenant?.id || !currentUser?.id) throw new Error('No tenant or user')

        const { clientId, ...bookingFields } = bookingData
        const clientIdNum = parseInt(clientId)

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
        await db.bookings.update(id, { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },

      deleteBooking: async (id) => {
        await db.bookingParticipants.where('bookingId').equals(id).delete()
        await db.bookings.delete(id)
        await get().refreshData()
      },

      updateAttendance: async (participantId, status) => {
        await db.bookingParticipants.update(participantId, {
          attendanceStatus: status,
          checkedInAt: status === 'present' ? new Date() : undefined,
        })
        await get().refreshData()
      },

      addAssessment: async (assessment) => {
        const { tenant, currentUser } = get()
        if (!tenant?.id || !currentUser?.id) throw new Error('No tenant or user')

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
        await db.lessonNotes.update(id, { ...updates, updatedAt: new Date() })
        await get().refreshData()
      },
    }),
    {
      name: 'samswim-app',
      partialize: (state) => ({
        isInitialized: state.isInitialized,
      }),
    }
  )
)
