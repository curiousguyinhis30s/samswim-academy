import Dexie, { Table } from 'dexie'

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

// Database class
class SamSwimDatabase extends Dexie {
  tenants!: Table<Tenant>
  users!: Table<User>
  userRelationships!: Table<UserRelationship>
  availabilitySchedules!: Table<AvailabilitySchedule>
  resources!: Table<Resource>
  serviceTypes!: Table<ServiceType>
  bookings!: Table<Booking>
  bookingParticipants!: Table<BookingParticipant>
  skillCategories!: Table<SkillCategory>
  skills!: Table<Skill>
  skillAssessments!: Table<SkillAssessment>
  invoices!: Table<Invoice>
  invoiceItems!: Table<InvoiceItem>
  creditPackages!: Table<CreditPackage>
  clientCredits!: Table<ClientCredit>
  expenses!: Table<Expense>
  messages!: Table<Message>
  auditLogs!: Table<AuditLog>

  constructor() {
    super('samswim-academy')

    this.version(1).stores({
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
    })
  }
}

export const db = new SamSwimDatabase()

// Helper to seed default swimming skills
export async function seedDefaultSwimmingSkills(tenantId: number) {
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
    const categoryId = await db.skillCategories.add({
      tenantId,
      ...category,
      isTemplate: false,
      createdAt: new Date(),
    })

    const categorySkills = skills[category.name] || []
    for (let i = 0; i < categorySkills.length; i++) {
      await db.skills.add({
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
