import { create } from 'zustand';
import {
  login as loginApi,
  signup as signupApi,
  checkAuth as checkAuthApi,
  logout as logoutApi,
  type IUser,
  type Login,
  type SignupUser,
} from '../api/user';

interface UserStore {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  login: (credentials: Login) => Promise<boolean>;
  signup: (data: SignupUser) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const result = await loginApi(credentials);

      if (!result) {
        set({ error: 'Invalid email or password', isLoading: false });
        return false;
      }

      const userData = result.user || ((result as any).email ? result : null);

      if (userData) {
        set({
          user: userData as IUser,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({
          error: 'Invalid response from server',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      set({ error: 'Login failed', isLoading: false });
      throw error;
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await signupApi(data);

      if (!result) {
        set({ error: 'Signup failed', isLoading: false });
        return false;
      }

      const userData = result.user || ((result as any).email ? result : null);

      if (userData) {
        set({
          user: userData as IUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return true;
    } catch (error) {
      set({ error: 'Signup error', isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const user = await checkAuthApi();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutApi();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to logout' });
    }
  },

  clearError: () => set({ error: null }),
}));
