import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { db, registerUser, loginUser, logoutUser, onAuthChange, doc, setDoc, getDoc, serverTimestamp } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, phone: string, role: UserRole = 'customer') => {
    const { user: newUser } = await registerUser(email, password);
    const userProfile: Omit<UserProfile, 'uid'> = {
      email,
      name,
      phone,
      role,
      loyaltyPoints: 0,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };
    await setDoc(doc(db, 'users', newUser.uid), userProfile);
    return newUser;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await loginUser(email, password);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    const updatedDoc = await getDoc(doc(db, 'users', user.uid));
    if (updatedDoc.exists()) {
      setUserProfile(updatedDoc.data() as UserProfile);
    }
  }, [user]);

  return {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isCustomer: userProfile?.role === 'customer',
    isRestaurant: userProfile?.role === 'restaurant',
    isDriver: userProfile?.role === 'driver',
  };
};
