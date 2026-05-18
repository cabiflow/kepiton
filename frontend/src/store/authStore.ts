import { create } from 'zustand';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { vi } from '../i18n/vi';

export interface AuthUser {
  id: string;
  email: string;
  tier: 'FREE' | 'PRO';
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        throw new Error('LOGIN_FAILED');
      }

      const response = await api.get<{ user: AuthUser }>('/auth/me');
      set({ user: response.data.user });
    } catch {
      set({ error: vi.auth.loginError });
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        throw new Error('REGISTER_FAILED');
      }

      if (data.session) {
        const response = await api.get<{ user: AuthUser }>('/auth/me');
        set({ user: response.data.user });
      }
    } catch {
      set({ error: vi.auth.registerError });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    set({ error: null, isLoading: true });
    try {
      await api.post('/auth/logout');
      await supabase.auth.signOut();
      set({ user: null });
    } catch {
      set({ error: vi.auth.logoutError });
    } finally {
      set({ isLoading: false });
    }
  },
  loadMe: async () => {
    set({ error: null, isLoading: true });
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        set({ user: null });
        return;
      }

      const response = await api.get<{ user: AuthUser }>('/auth/me');
      set({ user: response.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
