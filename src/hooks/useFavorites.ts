import { useState, useEffect, useCallback } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, serverTimestamp } from '@/lib/firebase';
import type { Favorite, Restaurant, MenuItem } from '@/types';

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's favorites list
  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favList: Favorite[] = [];
      snapshot.forEach((doc) => {
        favList.push({ id: doc.id, ...doc.data() } as Favorite);
      });
      setFavorites(favList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Fetch favorite restaurants details
  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      const restaurantIds = favorites.filter(f => f.restaurantId).map(f => f.restaurantId);
      const itemIds = favorites.filter(f => f.menuItemId).map(f => f.menuItemId);

      if (restaurantIds.length > 0) {
        const restaurantPromises = restaurantIds.map(async (id) => {
          const q = query(collection(db, 'restaurants'), where('__name__', '==', id));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Restaurant;
          }
          return null;
        });
        const restaurants = (await Promise.all(restaurantPromises)).filter(r => r !== null) as Restaurant[];
        setFavoriteRestaurants(restaurants);
      } else {
        setFavoriteRestaurants([]);
      }

      if (itemIds.length > 0) {
        const itemPromises = itemIds.map(async (id) => {
          const q = query(collection(db, 'menuItems'), where('__name__', '==', id));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MenuItem;
          }
          return null;
        });
        const items = (await Promise.all(itemPromises)).filter(i => i !== null) as MenuItem[];
        setFavoriteItems(items);
      } else {
        setFavoriteItems([]);
      }
    };

    if (favorites.length > 0) {
      fetchFavoriteDetails();
    } else {
      setFavoriteRestaurants([]);
      setFavoriteItems([]);
    }
  }, [favorites]);

  const addFavorite = useCallback(async (restaurantId?: string, menuItemId?: string) => {
    if (!userId) return;
    
    // Check if already exists
    const exists = favorites.some(f => 
      (restaurantId && f.restaurantId === restaurantId) ||
      (menuItemId && f.menuItemId === menuItemId)
    );
    
    if (exists) return;

    await addDoc(collection(db, 'favorites'), {
      userId,
      restaurantId: restaurantId || null,
      menuItemId: menuItemId || null,
      createdAt: serverTimestamp(),
    });
  }, [userId, favorites]);

  const removeFavorite = useCallback(async (restaurantId?: string, menuItemId?: string) => {
    if (!userId) return;

    const favorite = favorites.find(f => 
      (restaurantId && f.restaurantId === restaurantId) ||
      (menuItemId && f.menuItemId === menuItemId)
    );

    if (favorite) {
      await deleteDoc(doc(db, 'favorites', favorite.id));
    }
  }, [userId, favorites]);

  const isFavorite = useCallback((restaurantId?: string, menuItemId?: string): boolean => {
    return favorites.some(f => 
      (restaurantId && f.restaurantId === restaurantId) ||
      (menuItemId && f.menuItemId === menuItemId)
    );
  }, [favorites]);

  const toggleFavorite = useCallback(async (restaurantId?: string, menuItemId?: string) => {
    if (isFavorite(restaurantId, menuItemId)) {
      await removeFavorite(restaurantId, menuItemId);
    } else {
      await addFavorite(restaurantId, menuItemId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    favoriteRestaurants,
    favoriteItems,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
