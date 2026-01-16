import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import Constants from 'expo-constants';
import { User } from '../types';

// Get environment variables with fallback to Constants.expoConfig.extra
const getEnvVar = (key: string): string => {
  return process.env[key] || Constants.expoConfig?.extra?.[key] || '';
};

// Firebase config
const firebaseConfig = {
  apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
  measurementId: getEnvVar('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID')
};

// Initialize Firebase with error handling
let app: any = null;
let auth: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Auth will remain null - methods will throw appropriate errors
}

const mapFirebaseUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email || '',
  displayName: user.displayName || undefined,
  photoURL: user.photoURL || undefined,
  emailVerified: user.emailVerified,
  createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
});

class AuthService {
  private checkAuth() {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized. Please check your configuration.');
    }
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    this.checkAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    
    return mapFirebaseUser(userCredential.user);
  }

  async login(email: string, password: string): Promise<User> {
    this.checkAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(userCredential.user);
  }

  async signInWithGoogle(idToken: string): Promise<{ user: User; isNewUser: boolean }> {
    this.checkAuth();
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Check if this is a new user
      const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
      
      // Send welcome email for new users
      if (isNewUser && userCredential.user.email) {
        await sendEmailVerification(userCredential.user);
        console.log('New user registered:', userCredential.user.email);
      }
      
      return {
        user: mapFirebaseUser(userCredential.user),
        isNewUser
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  async logout(): Promise<void> {
    this.checkAuth();
    await signOut(auth);
  }

  async verifyAuth(): Promise<boolean> {
    if (!auth) return false;
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  getCurrentUser(): User | null {
    if (!auth) return null;
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  }
}

export const authService = new AuthService();


