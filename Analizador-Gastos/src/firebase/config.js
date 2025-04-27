import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAUecPrVb0-SOIlI_g8HynKqoCPCH9YErs",
  authDomain: "analizador-de-gastos.firebaseapp.com",
  projectId: "analizador-de-gastos",
  storageBucket: "analizador-de-gastos.firebasestorage.app",
  messagingSenderId: "723926254351",
  appId: "1:723926254351:web:6237fe2d72c025bdf0747a",
  measurementId: "G-1EC9TVG79H"
};

let app;
let auth;
let db;
let functions;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);

  // Enable offline persistence
  setPersistence(auth, browserLocalPersistence)
    .catch(error => console.error('Auth persistence error:', error));

  enableIndexedDbPersistence(db)
    .catch(error => {
      if (error.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (error.code === 'unimplemented') {
        console.warn('Browser doesn\'t support persistence');
      }
    });

  if (process.env.NODE_ENV === 'development') {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, db, functions };