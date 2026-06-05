import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCkTkvEYXKYJjVqMcoijVF7aa6gszi6WXg',
  authDomain: 'second-brain-1619f.firebaseapp.com',
  databaseURL: 'https://second-brain-1619f-default-rtdb.firebaseio.com',
  projectId: 'second-brain-1619f',
  storageBucket: 'second-brain-1619f.firebasestorage.app',
  messagingSenderId: '192541189972',
  appId: '1:192541189972:web:3b216087a61b5bf6a90ac1',
};

const app  = initializeApp(firebaseConfig);
export const db   = getDatabase(app);
export const auth = getAuth(app);
