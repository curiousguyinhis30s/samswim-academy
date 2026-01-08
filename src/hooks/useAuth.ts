'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPocketBase } from '@/lib/pocketbase/client';
import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tenant_id?: string;
}

export function useAuth() {
  const router = useRouter();
  const pb = getPocketBase();

  const [user, setUser] = useState<User | null>(pb.authStore.model as User | null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extract tenant_id from subdomain (e.g., tenant-name.domain.com)
  const getTenantId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const host = window.location.hostname;
    const parts = host.split('.');

    // academy1.samswim.com -> academy1
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }

    // Development fallback
    return localStorage.getItem('tenant_id') || 'demo';
  }, []);

  // Monitor auth state changes
  useEffect(() => {
    const unsub = pb.authStore.onChange((_token, model) => {
      setUser(model as User | null);
    });

    return () => unsub();
  }, [pb.authStore]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);

      const tenantId = getTenantId();
      const userTenantId = (authData.record as User).tenant_id;

      // Verify user belongs to this tenant
      if (tenantId && userTenantId && userTenantId !== tenantId) {
        pb.authStore.clear();
        throw new Error('You do not have access to this academy.');
      }

      setUser(authData.record as User);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pb, router, getTenantId]);

  const signup = useCallback(async (data: { email: string; password: string; name: string }) => {
    setLoading(true);
    setError(null);

    try {
      const tenantId = getTenantId();

      // Create user
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.password,
        name: data.name,
        tenant_id: tenantId,
      });

      // Auto login after signup
      await login(data.email, data.password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pb, login, getTenantId]);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authData = await pb.collection('users').authWithOAuth2({
        provider: 'google',
      });

      setUser(authData.record as User);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pb, router]);

  const logout = useCallback(async () => {
    pb.authStore.clear();
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [pb, router]);

  const getUser = useCallback(() => {
    return pb.authStore.model as User | null;
  }, [pb.authStore.model]);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    loginWithGoogle,
    getUser,
    getTenantId,
    isAuthenticated: pb.authStore.isValid,
  };
}

export default useAuth;
