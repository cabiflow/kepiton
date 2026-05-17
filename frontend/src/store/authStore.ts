import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  tier: 'FREE' | 'PRO';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
