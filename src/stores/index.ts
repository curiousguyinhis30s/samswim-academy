import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Types & Interfaces ---

type UserRole = 'student' | 'parent' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

interface SwimmingClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  pool: string;
  level: string;
}

interface Booking {
  id: string;
  classId: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  classDetails: SwimmingClass;
}

interface BookingState {
  selectedClass: SwimmingClass | null;
  bookings: Booking[];
  setSelectedClass: (classInfo: SwimmingClass) => void;
  addBooking: (classId: string, date: string) => Promise<void>;
  cancelBooking: (bookingId: string) => void;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
}

interface StudentState {
  progress: number;
  badges: Badge[];
  streaks: number;
  goals: Goal[];
  addBadge: (badge: Badge) => void;
  updateProgress: (amount: number) => void;
  setStreak: (count: number) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, progress: number) => void;
}

// --- Stores ---

// 1. Auth Store (with persistence)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Simulate API call
        const mockUser: User = {
          id: '1',
          name: 'Jane Doe',
          email,
          role: 'student',
        };
        set({ user: mockUser, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      setRole: (role) => {
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        }));
      },
    }),
    {
      name: 'swim-academy-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 2. Booking Store
export const useBookingStore = create<BookingState>((set, get) => ({
  selectedClass: null,
  bookings: [],

  setSelectedClass: (classInfo) => {
    set({ selectedClass: classInfo });
  },

  addBooking: async (classId, date) => {
    const currentClass = get().selectedClass;
    if (!currentClass) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      classId,
      date,
      status: 'confirmed',
      classDetails: currentClass,
    };

    set((state) => ({
      bookings: [...state.bookings, newBooking],
      selectedClass: null,
    }));
  },

  cancelBooking: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== bookingId),
    }));
  },
}));

// 3. Student Store
export const useStudentStore = create<StudentState>((set) => ({
  progress: 0,
  badges: [],
  streaks: 0,
  goals: [],

  addBadge: (badge) => {
    set((state) => ({
      badges: [...state.badges, badge],
    }));
  },

  updateProgress: (amount) => {
    set({ progress: amount });
  },

  setStreak: (count) => {
    set({ streaks: count });
  },

  addGoal: (goal) => {
    set((state) => ({
      goals: [...state.goals, goal],
    }));
  },

  updateGoal: (goalId, progress) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, current: progress } : g
      ),
    }));
  },
}));
