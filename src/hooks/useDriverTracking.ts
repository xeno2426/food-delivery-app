import { useState, useEffect, useCallback, useRef } from 'react';
import { db, doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where } from '@/lib/firebase';
import type { Order } from '@/types';

interface Location {
  lat: number;
  lng: number;
}

export const useDriverTracking = (orderId?: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setDriverLocation(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (doc) => {
      if (doc.exists()) {
        const orderData = { id: doc.id, ...doc.data() } as Order;
        setOrder(orderData);
        if (orderData.driverLocation) {
          setDriverLocation(orderData.driverLocation);
        }
      } else {
        setOrder(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    if (!orderId) return;
    
    await updateDoc(doc(db, 'orders', orderId), {
      driverLocation: { lat, lng },
      updatedAt: serverTimestamp(),
    });
  }, [orderId]);

  // Simulate driver movement between two points
  const simulateDriverMovement = useCallback((
    startLocation: Location,
    endLocation: Location,
    durationMinutes: number = 5,
    steps: number = 50
  ) => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }

    const latStep = (endLocation.lat - startLocation.lat) / steps;
    const lngStep = (endLocation.lng - startLocation.lng) / steps;
    let currentStep = 0;
    const intervalMs = (durationMinutes * 60 * 1000) / steps;

    simulationInterval.current = setInterval(async () => {
      currentStep++;
      const newLocation = {
        lat: startLocation.lat + latStep * currentStep,
        lng: startLocation.lng + lngStep * currentStep,
      };

      await updateLocation(newLocation.lat, newLocation.lng);

      if (currentStep >= steps) {
        if (simulationInterval.current) {
          clearInterval(simulationInterval.current);
        }
      }
    }, intervalMs);

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [updateLocation]);

  // Start simulation from restaurant to customer
  const startDeliverySimulation = useCallback(() => {
    if (!order) return;

    const restaurantLocation = {
      lat: order.restaurantId ? 37.7749 : 37.7749, // Default SF coords, replace with actual
      lng: order.restaurantId ? -122.4194 : -122.4194,
    };

    const customerLocation = {
      lat: order.deliveryAddress.coordinates?.lat || 37.7849,
      lng: order.deliveryAddress.coordinates?.lng || -122.4094,
    };

    // If we have driver location, start from there, otherwise from restaurant
    const startLoc = driverLocation || restaurantLocation;

    return simulateDriverMovement(startLoc, customerLocation, 3, 30);
  }, [order, driverLocation, simulateDriverMovement]);

  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  return {
    order,
    driverLocation,
    loading,
    updateLocation,
    simulateDriverMovement,
    startDeliverySimulation,
  };
};

// Hook for restaurant to track all active deliveries
export const useActiveDeliveries = (restaurantId?: string) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setActiveOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', restaurantId),
      where('status', 'in', ['out_for_delivery'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setActiveOrders(orders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  return { activeOrders, loading };
};
