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
      await updateProfile(userCredential.user, { displayName });
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

  async signInWithGoogle(idToken: string): Promise<{ user: User; isNewUser: boolean }> {
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

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  }
}

export const authService = new AuthService();


