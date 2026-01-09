import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { User } from '../types';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const mapFirebaseUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email || '',
  displayName: user.displayName || undefined,
  photoURL: user.photoURL || undefined,
  emailVerified: user.emailVerified,
  createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
});

class AuthService {
  async register(email: string, password: string, displayName?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      // Update display name if provided
    }
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    return mapFirebaseUser(userCredential.user);
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(userCredential.user);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async verifyAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  getCurrentUser(): User | null {
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  }
}

export const authService = new AuthService();

