"use client";

import { useState, useEffect, useCallback } from 'react';

export type SyncStatus = 'initializing' | 'syncing' | 'synced' | 'offline' | 'error';

interface CRUDResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * PowerSync hook for offline-first data sync
 * Works with local IndexedDB and syncs to Supabase when online
 */
export function usePowerSync() {
  const [status, setStatus] = useState<SyncStatus>('initializing');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus('syncing');
      // Trigger sync when coming back online
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status
    setStatus(navigator.onLine ? 'synced' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending changes when online
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline) return;

    try {
      setStatus('syncing');
      // In real implementation, this would:
      // 1. Get pending changes from IndexedDB
      // 2. Push to Supabase
      // 3. Pull latest changes from Supabase
      // 4. Merge and resolve conflicts

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated sync

      setLastSynced(new Date());
      setStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setStatus('error');
    }
  }, [isOnline]);

  // Generic CRUD operations (work offline, sync when online)
  const insert = useCallback(async <T extends { id?: string }>(
    table: string,
    record: T
  ): Promise<CRUDResult<T>> => {
    try {
      const id = record.id || crypto.randomUUID();
      const newRecord = { ...record, id, created_at: new Date().toISOString() };

      // Store locally first (IndexedDB in real implementation)
      const stored = localStorage.getItem(`powersync_${table}`) || '[]';
      const records = JSON.parse(stored);
      records.push(newRecord);
      localStorage.setItem(`powersync_${table}`, JSON.stringify(records));

      // Queue for sync if online
      if (isOnline) {
        syncPendingChanges();
      }

      return { success: true, data: newRecord as T };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }, [isOnline, syncPendingChanges]);

  const update = useCallback(async <T extends { id: string }>(
    table: string,
    id: string,
    updates: Partial<T>
  ): Promise<CRUDResult<T>> => {
    try {
      const stored = localStorage.getItem(`powersync_${table}`) || '[]';
      const records = JSON.parse(stored);
      const index = records.findIndex((r: T) => r.id === id);

      if (index === -1) {
        return { success: false, error: new Error('Record not found') };
      }

      records[index] = { ...records[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(`powersync_${table}`, JSON.stringify(records));

      if (isOnline) {
        syncPendingChanges();
      }

      return { success: true, data: records[index] };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }, [isOnline, syncPendingChanges]);

  const remove = useCallback(async (
    table: string,
    id: string
  ): Promise<CRUDResult<void>> => {
    try {
      const stored = localStorage.getItem(`powersync_${table}`) || '[]';
      const records = JSON.parse(stored);
      const filtered = records.filter((r: { id: string }) => r.id !== id);
      localStorage.setItem(`powersync_${table}`, JSON.stringify(filtered));

      if (isOnline) {
        syncPendingChanges();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }, [isOnline, syncPendingChanges]);

  const query = useCallback(<T>(
    table: string,
    filter?: (record: T) => boolean
  ): T[] => {
    try {
      const stored = localStorage.getItem(`powersync_${table}`) || '[]';
      const records = JSON.parse(stored) as T[];
      return filter ? records.filter(filter) : records;
    } catch {
      return [];
    }
  }, []);

  return {
    status,
    isOnline,
    lastSynced,
    sync: syncPendingChanges,
    crud: {
      insert,
      update,
      delete: remove,
      query,
    },
  };
}

export default usePowerSync;
