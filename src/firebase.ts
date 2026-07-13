import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC6uxvnl8LUyUGqH_fZwG0AVqoKnK6HZEw",
  authDomain: "beerdex-79231.firebaseapp.com",
  databaseURL: "https://beerdex-79231-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "beerdex-79231",
  storageBucket: "beerdex-79231.firebasestorage.app",
  messagingSenderId: "192552381552",
  appId: "1:192552381552:web:bdcbbb0ff7fd6a365118b5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
