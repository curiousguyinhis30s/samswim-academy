import PocketBase from 'pocketbase';

// Environment Configuration
const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

// Singleton Pattern for Client
let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (typeof window !== 'undefined') {
    // Client-side: return the singleton instance or create it
    if (!pbInstance) {
      pbInstance = new PocketBase(PB_URL);
    }
    return pbInstance;
  }

  // Server-side: return a new instance for every request to avoid shared state
  return new PocketBase(PB_URL);
}

// Type Definitions
export interface Student {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  skill_level: string;
  notes: string;
}

export interface Payment {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  student_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  reference: string;
  package_type?: string;
  stripe_session_id?: string;
}

export interface Booking {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  student_id: string;
  schedule_id: string;
  date: string;
  status: string;
}

export interface BookingCredit {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  student_id: string;
  credits: number;
  payment_id: string;
  expires_at: string;
}

export interface Subscription {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  student_id: string;
  subscription_id: string;
  status: string;
  plan_id: string;
}

export interface ActivityLog {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  action: string;
  details: Record<string, unknown>;
}

export interface Attendance {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  student_id: string;
  schedule_id: string;
  checked_in_at: string;
}

export interface Schedule {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  branch_id: string;
  coach_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

export interface LessonPackage {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  name: string;
  description: string;
  price_myr: number;
  lessons_count: number;
  validity_days: number;
}

export interface Enrollment {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  student_id: string;
  package_id: string;
  status: string;
  payment_reference: string;
}

export interface Branch {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  tenant_id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
}

export interface BranchStaff {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  branch_id: string;
  user_id: string;
  role: string;
}

export interface BranchSettings {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  branch_id: string;
  key: string;
  value: string;
}

// Collection helper types
export type Collections = {
  students: Student;
  payments: Payment;
  bookings: Booking;
  booking_credits: BookingCredit;
  subscriptions: Subscription;
  activity_logs: ActivityLog;
  attendance: Attendance;
  schedules: Schedule;
  lesson_packages: LessonPackage;
  enrollments: Enrollment;
  branches: Branch;
  branch_staff: BranchStaff;
  branch_settings: BranchSettings;
};

// Typed collection accessor
export function getCollection<T extends keyof Collections>(name: T) {
  return getPocketBase().collection(name);
}

export default getPocketBase;
