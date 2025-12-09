import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, User, Tenant, seedDefaultSwimmingSkills } from '@/lib/db'

interface AuthState {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: SignupData) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

interface SignupData {
  email: string
  password: string
  fullName: string
  businessName: string
  phone?: string
}

// Simple hash function (for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          // Find user by email
          const user = await db.users.where('email').equals(email.toLowerCase()).first()

          if (!user) {
            set({ error: 'Invalid email or password', isLoading: false })
            return false
          }

          // Verify password
          const isValid = await verifyPassword(password, user.passwordHash)
          if (!isValid) {
            set({ error: 'Invalid email or password', isLoading: false })
            return false
          }

          // Get tenant
          const tenant = await db.tenants.get(user.tenantId)
          if (!tenant) {
            set({ error: 'Account configuration error', isLoading: false })
            return false
          }

          set({
            user,
            tenant,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          set({ error: 'Login failed. Please try again.', isLoading: false })
          return false
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null })

        try {
          // Check if email already exists
          const existingUser = await db.users.where('email').equals(data.email.toLowerCase()).first()
          if (existingUser) {
            set({ error: 'Email already registered', isLoading: false })
            return false
          }

          // Create tenant
          const slug = data.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')

          const tenantId = await db.tenants.add({
            name: data.businessName,
            slug,
            primaryColor: '#3b82f6',
            secondaryColor: '#f5f5f7',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: 'USD',
            coachingType: 'swimming',
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          // Hash password
          const passwordHash = await hashPassword(data.password)

          // Create owner user
          const userId = await db.users.add({
            tenantId: tenantId as number,
            email: data.email.toLowerCase(),
            passwordHash,
            fullName: data.fullName,
            phone: data.phone,
            role: 'owner',
            notificationPreferences: {
              email: true,
              sms: true,
              push: true,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          // Seed default swimming skills
          await seedDefaultSwimmingSkills(tenantId as number)

          // Get the created records
          const tenant = await db.tenants.get(tenantId)
          const user = await db.users.get(userId)

          if (tenant && user) {
            set({
              user,
              tenant,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return true
          }

          set({ error: 'Account creation failed', isLoading: false })
          return false
        } catch (error) {
          console.error('Signup error:', error)
          set({ error: 'Signup failed. Please try again.', isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          tenant: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'samswim-auth',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
