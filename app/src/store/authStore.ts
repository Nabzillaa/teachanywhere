import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { logAudit } from '../services/auditService';

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

const ROLE_MAP: Record<string, UserRole> = {
  'administrator': 'Administrator',
  'visit lead': 'Visit Lead',
  'ops admin': 'Ops Admin',
  'finance approver': 'Finance Approver',
  'read-only': 'Read-only',
};

function normalizeRole(raw: string): UserRole {
  return ROLE_MAP[raw?.toLowerCase()] ?? (raw as UserRole) ?? 'Read-only';
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
        role: normalizeRole(data.role) ?? 'Read-only',
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

let _loginPending = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ error: null, loading: true });
    _loginPending = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      _loginPending = false;
      set({ error: 'Invalid email or password.', loading: false });
    }
    setTimeout(() => {
      useAuthStore.setState(s => s.loading ? { loading: false } : {});
    }, 8000);
  },

  logout: async () => {
    const user = useAuthStore.getState().user;
    if (user) {
      await logAudit({
        action: 'auth.logout',
        actorUid: user.uid,
        actorName: user.name,
        actorEmail: user.email,
      });
    }
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
          if (_loginPending) {
            _loginPending = false;
            logAudit({
              action: 'auth.login',
              actorUid: user.uid,
              actorName: user.name,
              actorEmail: user.email,
            });
          }
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
