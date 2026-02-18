import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'restaurant' | 'driver';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: Address;
  loyaltyPoints?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: Address;
  phone: string;
  isOpen: boolean;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  addons?: Addon[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string;
  selectedAddons: Addon[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  specialInstructions: string;
  driverId?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  estimatedDeliveryTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions: string;
  addons: Addon[];
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Timestamp;
}

export interface Favorite {
  id: string;
  userId: string;
  restaurantId?: string;
  menuItemId?: string;
  createdAt: Timestamp;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  orderId?: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  isRead: boolean;
  createdAt: Timestamp;
}
