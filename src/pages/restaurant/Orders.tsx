import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  Package,
  Bike,
  Utensils,
  MapPin,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';

interface RestaurantOrdersProps {
  onNavigate: (page: string) => void;
  onOrderClick: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500' },
  preparing: { label: 'Preparing', color: 'bg-orange-500' },
  ready: { label: 'Ready', color: 'bg-purple-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export function RestaurantOrders({ onNavigate, onOrderClick }: RestaurantOrdersProps) {
  const { userProfile } = useAuthContext();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Get restaurant for this owner
  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'restaurants'),
      where('ownerId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const restDoc = snapshot.docs[0];
        setRestaurant({ id: restDoc.id, ...restDoc.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  // Get all orders
  useEffect(() => {
    if (!restaurant?.id) return;

    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', restaurant.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      orders.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setAllOrders(orders);
    });

    return () => unsubscribe();
  }, [restaurant?.id]);

  const pendingOrders = allOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
  const activeOrders = allOrders.filter(o => o.status === 'out_for_delivery');
  const completedOrders = allOrders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Order ${status.replace('_', ' ')}`);
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => onNavigate('restaurant-dashboard')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Orders</h1>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full rounded-none bg-gray-50 h-12">
            <TabsTrigger value="pending" className="flex-1 rounded-none">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 rounded-none">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-none">
              History ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="pending" className="m-0">
              <OrderList 
                orders={pendingOrders} 
                onOrderClick={setSelectedOrder}
              />
            </TabsContent>

            <TabsContent value="active" className="m-0">
              <OrderList 
                orders={activeOrders} 
                onOrderClick={onOrderClick}
              />
            </TabsContent>

            <TabsContent value="completed" className="m-0">
              <OrderList 
                orders={completedOrders} 
                onOrderClick={() => {}}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Customer</h4>
                <p className="font-medium">{selectedOrder.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>
                    {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.quantity}x {item.name}</p>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500">&quot;{item.specialInstructions}&quot;</p>
                        )}
                        {item.addons?.length > 0 && (
                          <p className="text-sm text-gray-500">
                            + {item.addons.map((a: any) => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span className="text-orange-600">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-red-500 border-red-200"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              )}

              {selectedOrder.status === 'confirmed' && (
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Start Preparing
                </Button>
              )}

              {selectedOrder.status === 'preparing' && (
                <Button 
                  className="w-full bg-purple-500 hover:bg-purple-600"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Ready
                </Button>
              )}

              {selectedOrder.status === 'ready' && (
                <Button 
                  className="w-full bg-indigo-500 hover:bg-indigo-600"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                >
                  <Bike className="h-4 w-4 mr-2" />
                  Hand to Driver
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OrderListProps {
  orders: any[];
  onOrderClick: (order: any) => void;
}

function OrderList({ orders, onOrderClick }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500">No orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const config = statusConfig[order.status as OrderStatus];

        return (
          <Card 
            key={order.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onOrderClick(order)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">#{order.id.slice(-6)}</h3>
                    <div className={`${config.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                      {config.label}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{order.customerName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.items.length} items • ${order.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.createdAt?.toDate().toLocaleTimeString()}
                  </p>
                </div>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
