import { useState, useEffect, useCallback } from 'react';
import { db, collection, query, where, orderBy, limit, getDocs, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from '@/lib/firebase';
import type { Restaurant, MenuItem } from '@/types';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'restaurants'),
      where('isOpen', '==', true),
      orderBy('rating', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const restaurantList: Restaurant[] = [];
      snapshot.forEach((doc) => {
        restaurantList.push({ id: doc.id, ...doc.data() } as Restaurant);
      });
      setRestaurants(restaurantList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRestaurant = useCallback(async (restaurantId: string): Promise<Restaurant | null> => {
    const q = query(collection(db, 'restaurants'), where('__name__', '==', restaurantId));
    const docSnap = await getDocs(q);
    if (!docSnap.empty) {
      return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() } as Restaurant;
    }
    return null;
  }, []);

  const searchRestaurants = useCallback(async (searchTerm: string, cuisine?: string) => {
    let q = query(collection(db, 'restaurants'), where('isOpen', '==', true));
    
    if (cuisine) {
      q = query(q, where('cuisine', 'array-contains', cuisine));
    }
    
    const snapshot = await getDocs(q);
    const results: Restaurant[] = [];
    snapshot.forEach((doc) => {
      const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
      if (restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))) {
        results.push(restaurant);
      }
    });
    return results;
  }, []);

  return { restaurants, loading, getRestaurant, searchRestaurants };
};

export const useMenuItems = (restaurantId?: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      where('isAvailable', '==', true),
      orderBy('isPopular', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });
      setMenuItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  const getPopularItems = useCallback(async (limitCount: number = 10) => {
    const q = query(
      collection(db, 'menuItems'),
      where('isPopular', '==', true),
      where('isAvailable', '==', true),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as MenuItem);
    });
    return items;
  }, []);

  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addDoc(collection(db, 'menuItems'), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const updateMenuItem = useCallback(async (itemId: string, updates: Partial<MenuItem>) => {
    await updateDoc(doc(db, 'menuItems', itemId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }, []);

  return { menuItems, loading, getPopularItems, addMenuItem, updateMenuItem };
};
