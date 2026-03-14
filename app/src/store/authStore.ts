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
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: data.name ?? firebaseUser.email ?? '',
      role: data.role ?? 'Read-only',
    };
  }
  const newUser: AuthUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    name: firebaseUser.email ?? '',
    role: 'Read-only',
  };
  await setDoc(ref, { name: newUser.name, email: newUser.email, role: newUser.role });
  return newUser;
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
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await fetchOrCreateUserProfile(firebaseUser);
        set({ user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));
