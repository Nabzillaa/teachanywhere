import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'REDACTED_API_KEY',
  authDomain: 'techanywhere-95fd2.firebaseapp.com',
  projectId: 'techanywhere-95fd2',
  storageBucket: 'techanywhere-95fd2.firebasestorage.app',
  messagingSenderId: '628199570215',
  appId: '1:628199570215:web:c960c099dae6c558c58702',
  measurementId: 'G-KX5ZQ2JBZZ',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
