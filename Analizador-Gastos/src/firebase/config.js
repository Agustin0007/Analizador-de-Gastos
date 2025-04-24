import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUecPrVb0-SOIlI_g8HynKqoCPCH9YErs",
  authDomain: "analizador-de-gastos.firebaseapp.com",
  projectId: "analizador-de-gastos",
  storageBucket: "analizador-de-gastos.firebasestorage.app",
  messagingSenderId: "723926254351",
  appId: "1:723926254351:web:6237fe2d72c025bdf0747a",
  measurementId: "G-1EC9TVG79H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);

export { auth, db };