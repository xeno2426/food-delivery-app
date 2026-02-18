import { useState, useEffect, useCallback } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from '@/lib/firebase';
import type { Review } from '@/types';

export const useReviews = (restaurantId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!restaurantId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reviews'),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewList: Review[] = [];
      let totalRating = 0;
      snapshot.forEach((doc) => {
        const review = { id: doc.id, ...doc.data() } as Review;
        reviewList.push(review);
        totalRating += review.rating;
      });
      setReviews(reviewList);
      setAverageRating(reviewList.length > 0 ? totalRating / reviewList.length : 0);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const addReview = useCallback(async (
    orderId: string,
    customerId: string,
    customerName: string,
    restaurantId: string,
    rating: number,
    comment: string,
    images: string[] = []
  ) => {
    await addDoc(collection(db, 'reviews'), {
      orderId,
      customerId,
      customerName,
      restaurantId,
      rating,
      comment,
      images,
      createdAt: serverTimestamp(),
    });
  }, []);

  const canReview = useCallback(async (orderId: string, customerId: string): Promise<boolean> => {
    const q = query(
      collection(db, 'reviews'),
      where('orderId', '==', orderId),
      where('customerId', '==', customerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }, []);

  return {
    reviews,
    loading,
    averageRating,
    addReview,
    canReview,
  };
};

export const useUserReviews = (userId?: string) => {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUserReviews([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reviews'),
      where('customerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewList: Review[] = [];
      snapshot.forEach((doc) => {
        reviewList.push({ id: doc.id, ...doc.data() } as Review);
      });
      setUserReviews(reviewList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { userReviews, loading };
};
