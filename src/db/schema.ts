// src/db/schema.ts
import Dexie, { Table } from 'dexie';
import { useEffect, useState } from 'react';

// ------------------------------------------------------------------------------
// Interfaces
// ------------------------------------------------------------------------------

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin' | 'instructor';
  relatedUserId?: number;
  createdAt: Date;
}

export interface Class {
  id?: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'competitive';
  instructorId: number;
  capacity: number;
  dayOfWeek: number;
  time: string;
  duration: number;
  active: boolean;
}

export interface Booking {
  id?: number;
  classId: number;
  userId: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookingDate: Date;
}

export interface ProgressRecord {
  id?: number;
  userId: number;
  classId: number;
  date: Date;
  skill: string;
  notes: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface Badge {
  id?: number;
  name: string;
  description: string;
  iconUrl?: string;
  criteria: string;
}

export interface UserBadge {
  id?: number;
  userId: number;
  badgeId: number;
  awardedAt: Date;
}

// ------------------------------------------------------------------------------
// Database Class
// ------------------------------------------------------------------------------

export class SwimAcademyDB extends Dexie {
  users!: Table<User>;
  classes!: Table<Class>;
  bookings!: Table<Booking>;
  progress_records!: Table<ProgressRecord>;
  badges!: Table<Badge>;
  user_badges!: Table<UserBadge>;

  constructor() {
    super('SwimAcademyDB');

    this.version(1).stores({
      users: '++id, email, role, relatedUserId',
      classes: '++id, level, instructorId, active, dayOfWeek',
      bookings: '++id, [classId+userId], userId, status, bookingDate',
      progress_records: '++id, userId, classId, date',
      badges: '++id, name',
      user_badges: '++id, [userId+badgeId], userId, badgeId'
    });
  }
}

// Create database instance
export const db = new SwimAcademyDB();

// ------------------------------------------------------------------------------
// React Hooks
// ------------------------------------------------------------------------------

export function useDb() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    db.open().then(() => setIsDbReady(true));
  }, []);

  return { db, isDbReady };
}

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allClasses = await db.classes
          .where('active')
          .equals(1)
          .sortBy('dayOfWeek');

        setClasses(allClasses);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { classes, loading, error };
}

export function useBookings(userId?: number) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let result: Booking[];
        if (userId) {
          result = await db.bookings
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('bookingDate');
        } else {
          result = await db.bookings.reverse().sortBy('bookingDate');
        }
        setBookings(result);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { bookings, loading };
}
