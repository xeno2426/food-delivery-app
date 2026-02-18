import { useState, useEffect, useCallback } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from '@/lib/firebase';
import type { LoyaltyTransaction } from '@/types';

export const useLoyalty = (userId?: string) => {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setPoints(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'loyaltyTransactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionList: LoyaltyTransaction[] = [];
      let totalPoints = 0;
      snapshot.forEach((doc) => {
        const transaction = { id: doc.id, ...doc.data() } as LoyaltyTransaction;
        transactionList.push(transaction);
        if (transaction.type === 'earned') {
          totalPoints += transaction.points;
        } else {
          totalPoints -= transaction.points;
        }
      });
      setTransactions(transactionList);
      setPoints(totalPoints);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const redeemPoints = useCallback(async (pointsToRedeem: number, description: string): Promise<boolean> => {
    if (!userId || points < pointsToRedeem) return false;

    const batch = {
      userId,
      points: pointsToRedeem,
      type: 'redeemed' as const,
      description,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'loyaltyTransactions'), batch);
    
    // Update user's loyalty points
    await updateDoc(doc(db, 'users', userId), {
      loyaltyPoints: increment(-pointsToRedeem),
    });

    return true;
  }, [userId, points]);

  const getPointsValue = useCallback((pts: number = points): number => {
    // 100 points = $1
    return pts / 100;
  }, []);

  return {
    transactions,
    points,
    loading,
    redeemPoints,
    getPointsValue,
  };
};
