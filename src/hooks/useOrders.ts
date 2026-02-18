import { useState, useEffect, useCallback } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, increment } from '@/lib/firebase';
import type { Order, OrderStatus, CartItem, Address } from '@/types';

export const useOrders = (userId?: string, role: 'customer' | 'restaurant' | 'driver' = 'customer') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let q;
    if (role === 'customer') {
      q = query(
        collection(db, 'orders'),
        where('customerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (role === 'restaurant') {
      q = query(
        collection(db, 'orders'),
        where('restaurantId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'orders'),
        where('driverId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList: Order[] = [];
      snapshot.forEach((doc) => {
        orderList.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(orderList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, role]);

  const placeOrder = useCallback(async (
    customerId: string,
    customerName: string,
    customerPhone: string,
    deliveryAddress: Address,
    restaurantId: string,
    restaurantName: string,
    cartItems: CartItem[],
    deliveryFee: number,
    tax: number,
    paymentMethod: string,
    specialInstructions: string
  ): Promise<string> => {
    const subtotal = cartItems.reduce((sum, item) => {
      const addonsTotal = item.selectedAddons.reduce((a, addon) => a + addon.price, 0);
      return sum + (item.menuItem.price + addonsTotal) * item.quantity;
    }, 0);

    const orderItems = cartItems.map(item => ({
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
      addons: item.selectedAddons,
    }));

    const orderData = {
      customerId,
      customerName,
      customerPhone,
      deliveryAddress,
      restaurantId,
      restaurantName,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total: subtotal + deliveryFee + tax,
      status: 'pending' as OrderStatus,
      paymentMethod,
      specialInstructions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // Add loyalty points (1 point per $1 spent)
    const loyaltyPoints = Math.floor(subtotal);
    const userRef = doc(db, 'users', customerId);
    await updateDoc(userRef, {
      loyaltyPoints: increment(loyaltyPoints),
    });

    // Add loyalty transaction record
    await addDoc(collection(db, 'loyaltyTransactions'), {
      userId: customerId,
      orderId: docRef.id,
      points: loyaltyPoints,
      type: 'earned',
      description: `Points earned from order #${docRef.id.slice(-6)}`,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, driverId?: string) => {
    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (driverId) {
      updates.driverId = driverId;
    }
    await updateDoc(doc(db, 'orders', orderId), updates);
  }, []);

  const assignDriver = useCallback(async (orderId: string, driverId: string) => {
    await updateDoc(doc(db, 'orders', orderId), {
      driverId,
      status: 'out_for_delivery',
      updatedAt: serverTimestamp(),
    });
  }, []);

  const updateDriverLocation = useCallback(async (orderId: string, lat: number, lng: number) => {
    await updateDoc(doc(db, 'orders', orderId), {
      driverLocation: { lat, lng },
      updatedAt: serverTimestamp(),
    });
  }, []);

  return {
    orders,
    loading,
    placeOrder,
    updateOrderStatus,
    assignDriver,
    updateDriverLocation,
  };
};

export const useOrder = (orderId?: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
      } else {
        setOrder(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading };
};

export const usePendingOrders = (restaurantId?: string) => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setPendingOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', restaurantId),
      where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setPendingOrders(orders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  return { pendingOrders, loading };
};
