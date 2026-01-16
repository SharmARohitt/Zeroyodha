import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  setHasSeenOnboarding: (value: boolean) => Promise<void>;
}

const ONBOARDING_KEY = '@wealth_warrior_onboarding_seen';
const USER_KEY = '@wealth_warrior_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasSeenOnboarding: false,

  login: async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    try {
      const user = await authService.register(email, password, displayName);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    try {
      const { user, isNewUser } = await authService.signInWithGoogle(idToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      
      // Show welcome message for new users
      if (isNewUser) {
        console.log('Welcome! A verification email has been sent to:', user.email);
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    await AsyncStorage.removeItem(USER_KEY);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      // Check if user has seen onboarding
      const onboardingSeen = await AsyncStorage.getItem(ONBOARDING_KEY);
      const hasSeenOnboarding = onboardingSeen === 'true';
      
      // Check if user is authenticated
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const isValid = await authService.verifyAuth();
          if (isValid) {
            set({ user, isAuthenticated: true, isLoading: false, hasSeenOnboarding });
          } else {
            await AsyncStorage.removeItem(USER_KEY);
            set({ user: null, isAuthenticated: false, isLoading: false, hasSeenOnboarding });
          }
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          await AsyncStorage.removeItem(USER_KEY);
          set({ user: null, isAuthenticated: false, isLoading: false, hasSeenOnboarding });
        }
      } else {
        set({ isLoading: false, hasSeenOnboarding });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ isLoading: false, user: null, isAuthenticated: false });
    }
  },

  updateUser: (user: User) => {
    set({ user });
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setHasSeenOnboarding: async (value: boolean) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, value.toString());
    set({ hasSeenOnboarding: value });
  },
}));

