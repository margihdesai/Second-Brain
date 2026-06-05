import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());
  const signOut = () => fbSignOut(auth);

  return { user, loading, signIn, signOut };
}
