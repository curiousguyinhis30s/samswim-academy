/**
 * PowerSync Configuration for SamSwim Academy
 * Offline-first sync with Supabase backend
 */

import { Schema, Table, Column, ColumnType } from '@powersync/web';

// Database Schema matching Supabase tables
export const AppSchema = new Schema([
  new Table({
    name: 'tenants',
    columns: [
      new Column({ name: 'id', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'slug', type: ColumnType.TEXT }),
      new Column({ name: 'settings', type: ColumnType.TEXT }), // JSON stored as text
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'users',
    columns: [
      new Column({ name: 'id', type: ColumnType.TEXT }),
      new Column({ name: 'tenant_id', type: ColumnType.TEXT }),
      new Column({ name: 'email', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'role', type: ColumnType.TEXT }),
      new Column({ name: 'avatar_url', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'students',
    columns: [
      new Column({ name: 'id', type: ColumnType.TEXT }),
      new Column({ name: 'tenant_id', type: ColumnType.TEXT }),
      new Column({ name: 'parent_id', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'dob', type: ColumnType.TEXT }),
      new Column({ name: 'level', type: ColumnType.TEXT }),
      new Column({ name: 'notes', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'schedules',
    columns: [
      new Column({ name: 'id', type: ColumnType.TEXT }),
      new Column({ name: 'tenant_id', type: ColumnType.TEXT }),
      new Column({ name: 'name', type: ColumnType.TEXT }),
      new Column({ name: 'day_of_week', type: ColumnType.INTEGER }),
      new Column({ name: 'start_time', type: ColumnType.TEXT }),
      new Column({ name: 'end_time', type: ColumnType.TEXT }),
      new Column({ name: 'capacity', type: ColumnType.INTEGER }),
      new Column({ name: 'coach_id', type: ColumnType.TEXT }),
      new Column({ name: 'level', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'bookings',
    columns: [
      new Column({ name: 'id', type: ColumnType.TEXT }),
      new Column({ name: 'tenant_id', type: ColumnType.TEXT }),
      new Column({ name: 'schedule_id', type: ColumnType.TEXT }),
      new Column({ name: 'student_id', type: ColumnType.TEXT }),
      new Column({ name: 'date', type: ColumnType.TEXT }),
      new Column({ name: 'status', type: ColumnType.TEXT }),
      new Column({ name: 'created_at', type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: 'attendance',
    columns: [
      new Column({ name: 'id', type: ColumnType.TEXT }),
      new Column({ name: 'booking_id', type: ColumnType.TEXT }),
      new Column({ name: 'checked_in_at', type: ColumnType.TEXT }),
      new Column({ name: 'notes', type: ColumnType.TEXT }),
    ],
  }),
]);

export default AppSchema;
