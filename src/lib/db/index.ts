// Types for the database
export interface Tenant {
  id?: number
  name: string
  slug: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  coachingType: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id?: number
  tenantId: number
  email?: string
  passwordHash: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role: 'owner' | 'admin' | 'instructor' | 'client' | 'parent'
  status?: 'active' | 'inactive'
  hourlyRate?: number
  specializations?: string[]
  bio?: string
  dateOfBirth?: Date
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserRelationship {
  id?: number
  tenantId: number
  parentId: number
  childId: number
  relationshipType: 'parent' | 'guardian'
  canManageBookings: boolean
  canViewProgress: boolean
  createdAt: Date
}

export interface AvailabilitySchedule {
  id?: number
  tenantId: number
  instructorId: number
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string
  effectiveFrom: Date
  effectiveUntil?: Date
  isBlocked: boolean
  createdAt: Date
}

export interface Resource {
  id?: number
  tenantId: number
  name: string
  resourceType: 'lane' | 'court' | 'room' | 'equipment'
  capacity: number
  description?: string
  color?: string
  availableFrom?: string
  availableUntil?: string
  availableDays: number[]
  isActive: boolean
  createdAt: Date
}

export interface ServiceType {
  id?: number
  tenantId: number
  name: string
  description?: string
  durationMinutes: number
  pricePerSession: number
  isGroupClass: boolean
  maxParticipants: number
  minParticipants: number
  requiredResources?: string[]
  minSkillLevel?: number
  maxSkillLevel?: number
  color?: string
  isActive: boolean
  createdAt: Date
}

export interface Booking {
  id?: number
  tenantId: number
  serviceTypeId: number
  instructorId: number
  resourceId?: number
  startTime: Date
  endTime: Date
  recurrenceRule?: string
  recurrenceParentId?: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  cancellationReason?: string
  cancelledAt?: Date
  cancelledBy?: number
  price: number
  invoiceId?: number
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdBy: number
  createdAt: Date
  updatedAt: Date
}

export interface BookingParticipant {
  id?: number
  tenantId: number
  bookingId: number
  clientId: number
  attendanceStatus: 'expected' | 'present' | 'absent' | 'late' | 'excused'
  checkedInAt?: Date
  checkedInBy?: number
  notes?: string
  waitlistPosition?: number
  createdAt: Date
}

export interface SkillCategory {
  id?: number
  tenantId: number
  name: string
  description?: string
  displayOrder: number
  isTemplate: boolean
  templateCoachingType?: string
  createdAt: Date
}

export interface Skill {
  id?: number
  tenantId: number
  categoryId: number
  name: string
  description?: string
  maxLevel: number
  levelDescriptions?: Record<number, string>
  displayOrder: number
  isActive: boolean
  createdAt: Date
}

export interface SkillAssessment {
  id?: number
  tenantId: number
  studentId: number
  skillId: number
  level: number
  assessedBy: number
  assessedAt: Date
  notes?: string
  bookingId?: number
  createdAt: Date
}

export interface Invoice {
  id?: number
  tenantId: number
  invoiceNumber: string
  clientId: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded'
  issueDate: Date
  dueDate: Date
  paidAt?: Date
  paymentMethod?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  id?: number
  tenantId: number
  invoiceId: number
  description: string
  quantity: number
  unitPrice: number
  total: number
  bookingId?: number
  createdAt: Date
}

export interface CreditPackage {
  id?: number
  tenantId: number
  name: string
  description?: string
  credits: number
  price: number
  validityDays?: number
  applicableServiceTypes?: number[]
  isActive: boolean
  createdAt: Date
}

export interface ClientCredit {
  id?: number
  tenantId: number
  clientId: number
  packageId: number
  creditsPurchased: number
  creditsRemaining: number
  purchasedAt: Date
  expiresAt?: Date
  invoiceId?: number
  createdAt: Date
}

export interface Expense {
  id?: number
  tenantId: number
  category: string
  description: string
  amount: number
  expenseDate: Date
  receiptUrl?: string
  vendorName?: string
  isTaxDeductible: boolean
  createdBy: number
  createdAt: Date
}

export interface Message {
  id?: number
  tenantId: number
  threadId?: number
  parentId?: number
  senderId: number
  recipientId?: number
  subject?: string
  body: string
  messageType: 'direct' | 'broadcast' | 'system' | 'booking_notification'
  isRead: boolean
  readAt?: Date
  attachments?: { url: string; name: string; type: string }[]
  createdAt: Date
}

export interface AuditLog {
  id?: number
  tenantId: number
  userId: number
  action: 'create' | 'update' | 'delete'
  entityType: string
  entityId: number
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  createdAt: Date
}

export interface LessonNote {
  id?: number
  tenantId: number
  bookingId: number
  studentId: number
  coachId: number
  content: string
  mood?: 'excellent' | 'good' | 'okay' | 'struggling' | 'absent'
  highlights?: string[]
  areasToImprove?: string[]
  privateNote?: string  // Coach-only note not shared with parents
  createdAt: Date
  updatedAt: Date
}

// ===== NEW FEATURES =====

// Achievement Badges System
export interface Badge {
  id?: number
  tenantId: number
  name: string
  description: string
  icon: string  // emoji or icon name
  category: 'skill' | 'attendance' | 'milestone' | 'special'
  requirement: {
    type: 'skill_mastered' | 'lessons_completed' | 'streak_days' | 'personal_best' | 'custom'
    value: number
    skillId?: number
    customCheck?: string
  }
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isActive: boolean
  createdAt: Date
}

export interface StudentBadge {
  id?: number
  tenantId: number
  studentId: number
  badgeId: number
  earnedAt: Date
  notified: boolean
  createdAt: Date
}

// Goal Setting System
export interface Goal {
  id?: number
  tenantId: number
  studentId: number
  title: string
  description?: string
  goalType: 'skill' | 'time' | 'distance' | 'attendance' | 'custom'
  targetValue: number
  currentValue: number
  unit: string  // e.g., 'seconds', 'meters', 'lessons', 'skills'
  skillId?: number
  deadline?: Date
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Notification System
export interface Notification {
  id?: number
  tenantId: number
  userId: number
  title: string
  message: string
  notificationType: 'lesson_reminder' | 'badge_earned' | 'goal_completed' | 'feedback' | 'system' | 'streak'
  priority: 'low' | 'normal' | 'high'
  isRead: boolean
  readAt?: Date
  actionUrl?: string
  scheduledFor?: Date
  sentAt?: Date
  deliveryMethod: 'in_app' | 'email' | 'sms' | 'push'
  createdAt: Date
}

// Recurring Booking Patterns
export interface RecurringPattern {
  id?: number
  tenantId: number
  studentId: number
  serviceTypeId: number
  instructorId: number
  dayOfWeek: number  // 0-6 (Sunday-Saturday)
  startTime: string  // HH:mm format
  frequency: 'weekly' | 'biweekly' | 'monthly'
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Personal Best / Time Tracking
export interface PersonalBest {
  id?: number
  tenantId: number
  studentId: number
  eventType: 'freestyle_25m' | 'freestyle_50m' | 'freestyle_100m' | 'backstroke_25m' | 'backstroke_50m' | 'breaststroke_25m' | 'breaststroke_50m' | 'butterfly_25m' | 'butterfly_50m' | 'medley_100m' | 'custom'
  customEventName?: string
  timeSeconds: number  // stored in seconds with decimals
  previousBest?: number
  improvement?: number  // seconds improved
  recordedAt: Date
  bookingId?: number
  verifiedBy?: number
  notes?: string
  createdAt: Date
}

// Post-Lesson Feedback
export interface LessonFeedback {
  id?: number
  tenantId: number
  bookingId: number
  studentId: number
  rating: number  // 1-5 stars
  enjoymentLevel: 'loved_it' | 'liked_it' | 'okay' | 'not_great'
  difficultyLevel: 'too_easy' | 'just_right' | 'challenging' | 'too_hard'
  favoriteActivity?: string
  suggestions?: string
  wouldRecommend: boolean
  submittedAt: Date
  createdAt: Date
}

// Attendance Streaks & Gamification
export interface AttendanceStreak {
  id?: number
  tenantId: number
  studentId: number
  currentStreak: number
  longestStreak: number
  lastAttendanceDate?: Date
  totalLessonsAttended: number
  perfectWeeks: number  // weeks with no missed lessons
  level: number  // gamification level
  xpPoints: number
  createdAt: Date
  updatedAt: Date
}

// Progress Media (Photos/Videos)
export interface ProgressMedia {
  id?: number
  tenantId: number
  studentId: number
  mediaType: 'photo' | 'video'
  url: string
  thumbnailUrl?: string
  title?: string
  description?: string
  skillId?: number
  bookingId?: number
  uploadedBy: number
  isPublic: boolean  // visible to student/parent
  createdAt: Date
}

// Parent-Child Link (for parent portal)
export interface ParentLink {
  id?: number
  tenantId: number
  parentUserId: number
  studentId: number
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  canViewProgress: boolean
  canViewSchedule: boolean
  canReceiveNotifications: boolean
  canBookLessons: boolean
  createdAt: Date
}

// Lazy-loaded database singleton
let dbInstance: import('dexie').default | null = null
let dbPromise: Promise<import('dexie').default> | null = null

async function initDb(): Promise<import('dexie').default> {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be initialized on the client side')
  }

  if (dbInstance) return dbInstance

  if (!dbPromise) {
    dbPromise = (async () => {
      const Dexie = (await import('dexie')).default

      // Clear corrupted database if needed
      try {
        const testDb = new Dexie('samswim-academy')
        await testDb.open()
        testDb.close()
      } catch (openError) {
        console.warn('Database corrupted, clearing:', openError)
        await Dexie.delete('samswim-academy')
      }

      class SamSwimDatabase extends Dexie {
        tenants!: import('dexie').Table<Tenant>
        users!: import('dexie').Table<User>
        userRelationships!: import('dexie').Table<UserRelationship>
        availabilitySchedules!: import('dexie').Table<AvailabilitySchedule>
        resources!: import('dexie').Table<Resource>
        serviceTypes!: import('dexie').Table<ServiceType>
        bookings!: import('dexie').Table<Booking>
        bookingParticipants!: import('dexie').Table<BookingParticipant>
        skillCategories!: import('dexie').Table<SkillCategory>
        skills!: import('dexie').Table<Skill>
        skillAssessments!: import('dexie').Table<SkillAssessment>
        invoices!: import('dexie').Table<Invoice>
        invoiceItems!: import('dexie').Table<InvoiceItem>
        creditPackages!: import('dexie').Table<CreditPackage>
        clientCredits!: import('dexie').Table<ClientCredit>
        expenses!: import('dexie').Table<Expense>
        messages!: import('dexie').Table<Message>
        auditLogs!: import('dexie').Table<AuditLog>
        lessonNotes!: import('dexie').Table<LessonNote>
        // New feature tables
        badges!: import('dexie').Table<Badge>
        studentBadges!: import('dexie').Table<StudentBadge>
        goals!: import('dexie').Table<Goal>
        notifications!: import('dexie').Table<Notification>
        recurringPatterns!: import('dexie').Table<RecurringPattern>
        personalBests!: import('dexie').Table<PersonalBest>
        lessonFeedback!: import('dexie').Table<LessonFeedback>
        attendanceStreaks!: import('dexie').Table<AttendanceStreak>
        progressMedia!: import('dexie').Table<ProgressMedia>
        parentLinks!: import('dexie').Table<ParentLink>

        constructor() {
          super('samswim-academy')

          this.version(2).stores({
            tenants: '++id, slug',
            users: '++id, tenantId, email, role',
            userRelationships: '++id, tenantId, parentId, childId',
            availabilitySchedules: '++id, tenantId, instructorId, dayOfWeek',
            resources: '++id, tenantId, resourceType',
            serviceTypes: '++id, tenantId, isActive',
            bookings: '++id, tenantId, instructorId, startTime, status',
            bookingParticipants: '++id, tenantId, bookingId, clientId',
            skillCategories: '++id, tenantId, displayOrder',
            skills: '++id, tenantId, categoryId',
            skillAssessments: '++id, tenantId, studentId, skillId',
            invoices: '++id, tenantId, clientId, status',
            invoiceItems: '++id, tenantId, invoiceId',
            creditPackages: '++id, tenantId, isActive',
            clientCredits: '++id, tenantId, clientId',
            expenses: '++id, tenantId, category, expenseDate',
            messages: '++id, tenantId, senderId, recipientId, isRead',
            auditLogs: '++id, tenantId, userId, entityType, entityId',
            lessonNotes: '++id, tenantId, bookingId, studentId, coachId',
            // New feature tables
            badges: '++id, tenantId, category, isActive',
            studentBadges: '++id, tenantId, studentId, badgeId, earnedAt',
            goals: '++id, tenantId, studentId, status, goalType',
            notifications: '++id, tenantId, userId, isRead, notificationType',
            recurringPatterns: '++id, tenantId, studentId, isActive',
            personalBests: '++id, tenantId, studentId, eventType, recordedAt',
            lessonFeedback: '++id, tenantId, bookingId, studentId',
            attendanceStreaks: '++id, tenantId, studentId',
            progressMedia: '++id, tenantId, studentId, mediaType',
            parentLinks: '++id, tenantId, parentUserId, studentId',
          })
        }
      }

      dbInstance = new SamSwimDatabase()
      return dbInstance
    })()
  }

  return dbPromise
}

// Create a proxy that lazily initializes the database
type DbType = {
  tenants: import('dexie').Table<Tenant>
  users: import('dexie').Table<User>
  userRelationships: import('dexie').Table<UserRelationship>
  availabilitySchedules: import('dexie').Table<AvailabilitySchedule>
  resources: import('dexie').Table<Resource>
  serviceTypes: import('dexie').Table<ServiceType>
  bookings: import('dexie').Table<Booking>
  bookingParticipants: import('dexie').Table<BookingParticipant>
  skillCategories: import('dexie').Table<SkillCategory>
  skills: import('dexie').Table<Skill>
  skillAssessments: import('dexie').Table<SkillAssessment>
  invoices: import('dexie').Table<Invoice>
  invoiceItems: import('dexie').Table<InvoiceItem>
  creditPackages: import('dexie').Table<CreditPackage>
  clientCredits: import('dexie').Table<ClientCredit>
  expenses: import('dexie').Table<Expense>
  messages: import('dexie').Table<Message>
  auditLogs: import('dexie').Table<AuditLog>
  lessonNotes: import('dexie').Table<LessonNote>
  // New feature tables
  badges: import('dexie').Table<Badge>
  studentBadges: import('dexie').Table<StudentBadge>
  goals: import('dexie').Table<Goal>
  notifications: import('dexie').Table<Notification>
  recurringPatterns: import('dexie').Table<RecurringPattern>
  personalBests: import('dexie').Table<PersonalBest>
  lessonFeedback: import('dexie').Table<LessonFeedback>
  attendanceStreaks: import('dexie').Table<AttendanceStreak>
  progressMedia: import('dexie').Table<ProgressMedia>
  parentLinks: import('dexie').Table<ParentLink>
}

// Export a function to get the database (async)
export async function getDb(): Promise<DbType> {
  return initDb() as unknown as Promise<DbType>
}

// For backwards compatibility, export a synchronous db object
// that will be null on the server and properly initialized on the client
export const db: DbType = typeof window !== 'undefined'
  ? new Proxy({} as DbType, {
      get: (_target, prop: string) => {
        if (!dbInstance) {
          // Initialize synchronously if possible (for already-initialized case)
          // or throw if not yet initialized
          throw new Error(`Database not initialized. Call getDb() first or ensure seedDemoData() was called.`)
        }
        return (dbInstance as unknown as Record<string, unknown>)[prop]
      }
    })
  : new Proxy({} as DbType, {
      get: () => {
        // Return a safe no-op for SSR
        return new Proxy({}, {
          get: () => async () => undefined
        })
      }
    })

// Helper to seed default swimming skills
export async function seedDefaultSwimmingSkills(tenantId: number) {
  const database = await getDb()

  const categories = [
    { name: 'Water Safety', description: 'Essential safety skills', displayOrder: 1 },
    { name: 'Basic Strokes', description: 'Fundamental swimming strokes', displayOrder: 2 },
    { name: 'Advanced Strokes', description: 'Competition-level techniques', displayOrder: 3 },
    { name: 'Diving', description: 'Diving skills and techniques', displayOrder: 4 },
    { name: 'Endurance', description: 'Stamina and distance swimming', displayOrder: 5 },
  ]

  const skills: Record<string, string[]> = {
    'Water Safety': [
      'Water entry and exit',
      'Floating (front and back)',
      'Treading water',
      'Basic survival skills',
      'Pool rules awareness',
    ],
    'Basic Strokes': [
      'Freestyle (front crawl)',
      'Backstroke',
      'Breaststroke',
      'Elementary backstroke',
      'Sidestroke',
    ],
    'Advanced Strokes': [
      'Butterfly',
      'Flip turns',
      'Racing starts',
      'Streamline position',
      'Underwater dolphin kicks',
    ],
    'Diving': [
      'Sitting dive',
      'Kneeling dive',
      'Standing dive',
      'Competitive dive start',
    ],
    'Endurance': [
      '25m continuous swim',
      '50m continuous swim',
      '100m continuous swim',
      '200m continuous swim',
      '400m+ distance swimming',
    ],
  }

  for (const category of categories) {
    const categoryId = await database.skillCategories.add({
      tenantId,
      ...category,
      isTemplate: false,
      createdAt: new Date(),
    })

    const categorySkills = skills[category.name] || []
    for (let i = 0; i < categorySkills.length; i++) {
      await database.skills.add({
        tenantId,
        categoryId: categoryId as number,
        name: categorySkills[i],
        maxLevel: 5,
        levelDescriptions: {
          1: 'Introduced',
          2: 'Developing',
          3: 'Competent',
          4: 'Proficient',
          5: 'Mastered',
        },
        displayOrder: i + 1,
        isActive: true,
        createdAt: new Date(),
      })
    }
  }
}

// Seed default badges for gamification
export async function seedDefaultBadges(tenantId: number) {
  const database = await getDb()

  const defaultBadges: Omit<Badge, 'id' | 'createdAt'>[] = [
    // Skill badges
    { tenantId, name: 'Water Baby', description: 'Complete all water safety skills', icon: '🏊', category: 'skill', requirement: { type: 'skill_mastered', value: 5 }, points: 100, rarity: 'common', isActive: true },
    { tenantId, name: 'Stroke Master', description: 'Master all basic strokes', icon: '🏅', category: 'skill', requirement: { type: 'skill_mastered', value: 10 }, points: 250, rarity: 'rare', isActive: true },
    { tenantId, name: 'Freestyle Champion', description: 'Master freestyle technique', icon: '🥇', category: 'skill', requirement: { type: 'skill_mastered', value: 1, skillId: 1 }, points: 150, rarity: 'rare', isActive: true },
    { tenantId, name: 'Butterfly Legend', description: 'Master the butterfly stroke', icon: '🦋', category: 'skill', requirement: { type: 'skill_mastered', value: 1, skillId: 11 }, points: 300, rarity: 'epic', isActive: true },
    { tenantId, name: 'Complete Swimmer', description: 'Master all swimming skills', icon: '👑', category: 'skill', requirement: { type: 'skill_mastered', value: 20 }, points: 500, rarity: 'legendary', isActive: true },

    // Attendance badges
    { tenantId, name: 'First Splash', description: 'Complete your first lesson', icon: '💦', category: 'attendance', requirement: { type: 'lessons_completed', value: 1 }, points: 25, rarity: 'common', isActive: true },
    { tenantId, name: 'Getting Started', description: 'Complete 5 lessons', icon: '⭐', category: 'attendance', requirement: { type: 'lessons_completed', value: 5 }, points: 50, rarity: 'common', isActive: true },
    { tenantId, name: 'Dedicated Swimmer', description: 'Complete 25 lessons', icon: '🌟', category: 'attendance', requirement: { type: 'lessons_completed', value: 25 }, points: 200, rarity: 'rare', isActive: true },
    { tenantId, name: 'Swimming Star', description: 'Complete 50 lessons', icon: '💫', category: 'attendance', requirement: { type: 'lessons_completed', value: 50 }, points: 400, rarity: 'epic', isActive: true },
    { tenantId, name: 'Swimming Legend', description: 'Complete 100 lessons', icon: '🏆', category: 'attendance', requirement: { type: 'lessons_completed', value: 100 }, points: 1000, rarity: 'legendary', isActive: true },

    // Streak badges
    { tenantId, name: 'Week Warrior', description: 'Attend lessons for 2 weeks straight', icon: '🔥', category: 'milestone', requirement: { type: 'streak_days', value: 14 }, points: 75, rarity: 'common', isActive: true },
    { tenantId, name: 'Month Master', description: 'Maintain a 30-day streak', icon: '📅', category: 'milestone', requirement: { type: 'streak_days', value: 30 }, points: 200, rarity: 'rare', isActive: true },
    { tenantId, name: 'Consistency King', description: 'Maintain a 90-day streak', icon: '👑', category: 'milestone', requirement: { type: 'streak_days', value: 90 }, points: 500, rarity: 'epic', isActive: true },

    // Personal best badges
    { tenantId, name: 'Speed Demon', description: 'Beat your personal best', icon: '⚡', category: 'special', requirement: { type: 'personal_best', value: 1 }, points: 50, rarity: 'common', isActive: true },
    { tenantId, name: 'Record Breaker', description: 'Beat your PB 5 times', icon: '📈', category: 'special', requirement: { type: 'personal_best', value: 5 }, points: 150, rarity: 'rare', isActive: true },
    { tenantId, name: 'Elite Performer', description: 'Beat your PB 10 times', icon: '🚀', category: 'special', requirement: { type: 'personal_best', value: 10 }, points: 300, rarity: 'epic', isActive: true },
  ]

  for (const badge of defaultBadges) {
    await database.badges.add({
      ...badge,
      createdAt: new Date(),
    })
  }
}

// Initialize attendance streak for a student
export async function initializeAttendanceStreak(tenantId: number, studentId: number) {
  const database = await getDb()

  const existing = await database.attendanceStreaks
    .where('tenantId').equals(tenantId)
    .and(s => s.studentId === studentId)
    .first()

  if (!existing) {
    await database.attendanceStreaks.add({
      tenantId,
      studentId,
      currentStreak: 0,
      longestStreak: 0,
      totalLessonsAttended: 0,
      perfectWeeks: 0,
      level: 1,
      xpPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

// Re-export getDb as R for backwards compatibility with existing imports
export { seedDefaultSwimmingSkills as R }
