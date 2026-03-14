import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 'Administrator' | 'Visit Lead' | 'Ops Admin' | 'Finance Approver' | 'Read-only';

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  init: () => () => void;
}

async function fetchOrCreateUserProfile(firebaseUser: User): Promise<AuthUser> {
  try {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        name: data.name ?? firebaseUser.email ?? '',
        role: data.role ?? 'Administrator',
      };
    }
    const newUser: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: firebaseUser.email ?? '',
      role: 'Administrator',
    };
    await setDoc(ref, { name: newUser.name, email: newUser.email, role: newUser.role });
    return newUser;
  } catch (err) {
    console.warn('Firestore unavailable, using default profile:', err);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: firebaseUser.displayName ?? firebaseUser.email ?? '',
      role: 'Administrator',
    };
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ error: null, loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      set({ error: 'Invalid email or password.', loading: false });
    }
    // Safety fallback — reset loading if onAuthStateChanged never fires
    setTimeout(() => {
      useAuthStore.setState(s => s.loading ? { loading: false } : {});
    }, 8000);
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await fetchOrCreateUserProfile(firebaseUser);
          set({ user, loading: false });
        } catch (err) {
          console.error('Failed to load user profile:', err);
          set({ user: null, loading: false, error: 'Failed to load user profile. Check Firestore rules.' });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));
