import { create } from 'zustand';
import { api } from '../lib/api';
import { isDemoMode, supabase } from '../lib/supabase';
import { vi } from '../i18n/vi';
import { demoUser } from '../lib/demoData';

export interface AuthUser {
  id: string;
  email: string;
  tier: 'FREE' | 'PRO';
  isAdmin: boolean;
  timezone: string;
  uploadCount: number;
  remindAt7Days: boolean;
  remindAt3Days: boolean;
  remindAt1Day: boolean;
  remindAtDeadline: boolean;
  dailyDigest: boolean;
  darkMode: boolean;
}

export type AuthSettingsInput = Partial<
  Pick<
    AuthUser,
    | 'timezone'
    | 'remindAt7Days'
    | 'remindAt3Days'
    | 'remindAt1Day'
    | 'remindAtDeadline'
    | 'dailyDigest'
    | 'darkMode'
  >
>;

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  updateSettings: (input: AuthSettingsInput) => Promise<boolean>;
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

interface ChromeStorageLocal {
  set: (items: Record<string, string>) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

interface ChromeApi {
  storage?: {
    local?: ChromeStorageLocal;
  };
}

declare const chrome: ChromeApi | undefined;

async function saveExtensionToken(token: string) {
  if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
    await chrome.storage.local.set({ kepiton_token: token });
  }
}

async function removeExtensionToken() {
  if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
    await chrome.storage.local.remove('kepiton_token');
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      if (isDemoMode) {
        set({ user: demoUser });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        throw new Error('LOGIN_FAILED');
      }

      const response = await api.get<{ user: AuthUser }>('/auth/me');
      await saveExtensionToken(data.session.access_token);
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
      if (isDemoMode) {
        set({ user: demoUser });
        return;
      }

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
      if (isDemoMode) {
        set({ user: demoUser });
        return;
      }

      await api.post('/auth/logout');
      await supabase.auth.signOut();
      await removeExtensionToken();
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
      if (isDemoMode) {
        set({ user: demoUser });
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        await removeExtensionToken();
        set({ user: null });
        return;
      }

      const response = await api.get<{ user: AuthUser }>('/auth/me');
      await saveExtensionToken(data.session.access_token);
      set({ user: response.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
  updateSettings: async (input) => {
    set({ error: null, isLoading: true });
    try {
      if (isDemoMode) {
        set((state) => ({ user: state.user ? { ...state.user, ...input } : demoUser }));
        return true;
      }

      const response = await api.put<{ user: AuthUser }>('/auth/me/settings', input);
      set({ user: response.data.user });
      return true;
    } catch {
      set({ error: vi.settings.saveError });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
