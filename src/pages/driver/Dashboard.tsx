import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Navigation,
  Package,
  Check,
  DollarSign,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface DriverDashboardProps {
  onNavigate: (page: string) => void;
  onOrderClick: (orderId: string) => void;
}

export function DriverDashboard({ onOrderClick }: DriverDashboardProps) {
  const { userProfile } = useAuthContext();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, earnings: 0, rating: 4.9 });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Get available orders (ready for pickup)
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'ready')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      setAvailableOrders(orders);
    });

    return () => unsubscribe();
  }, []);

  // Get my active deliveries
  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'orders'),
      where('driverId', '==', userProfile.uid),
      where('status', '==', 'out_for_delivery')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      setMyDeliveries(orders);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  // Get completed deliveries
  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'orders'),
      where('driverId', '==', userProfile.uid),
      where('status', '==', 'delivered')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      setCompletedDeliveries(orders);
      
      // Calculate stats
      const earnings = orders.reduce((sum, o) => sum + (o.deliveryFee || 0) * 0.7, 0);
      setStats({ total: orders.length, earnings, rating: 4.9 });
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const acceptOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        driverId: userProfile?.uid,
        status: 'out_for_delivery',
        updatedAt: serverTimestamp(),
      });
      toast.success('Order accepted!');
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to accept order');
    }
  };

  const markDelivered = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        updatedAt: serverTimestamp(),
      });
      toast.success('Order marked as delivered!');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Bike className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{userProfile?.name}</h1>
              <p className="text-green-100">Driver</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isOnline ? 'bg-white' : 'bg-white/30'
              }`}
            >
              <div className={`w-5 h-5 rounded-full transition-transform ${
                isOnline ? 'bg-green-500 translate-x-6' : 'bg-gray-400 translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-green-100">Deliveries</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">${stats.earnings.toFixed(0)}</p>
            <p className="text-xs text-green-100">Earnings</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <p className="text-2xl font-bold">{stats.rating}</p>
            </div>
            <p className="text-xs text-green-100">Rating</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="available">
              Available ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({myDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="m-0">
            {availableOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No available orders</p>
                <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map((order) => (
                  <Card 
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{order.restaurantName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {order.items.length} items • ${order.total.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">
                              {order.deliveryAddress.street}
                            </span>
                          </div>
                        </div>
                        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${(order.deliveryFee * 0.7).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="m-0">
            {myDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bike className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No active deliveries</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myDeliveries.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{order.restaurantName}</h3>
                          <p className="text-sm text-gray-500">
                            #{order.id.slice(-6)}
                          </p>
                        </div>
                        <Badge className="bg-indigo-500">In Progress</Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{order.deliveryAddress.street}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => onOrderClick(order.id)}
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Navigate
                        </Button>
                        <Button 
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => markDelivered(order.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Delivered
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="m-0">
            {completedDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedDeliveries.slice(0, 10).map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{order.restaurantName}</h3>
                          <p className="text-sm text-gray-500">
                            #{order.id.slice(-6)} • {order.items.length} items
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.updatedAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-500 mb-1">Completed</Badge>
                          <p className="text-sm font-medium text-green-600">
                            +${(order.deliveryFee * 0.7).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Accept Order Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Delivery?</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{selectedOrder.restaurantName}</h4>
                <p className="text-sm text-gray-500">
                  {selectedOrder.items.length} items • ${selectedOrder.total.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{selectedOrder.deliveryAddress.street}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Your Earnings</span>
                <span className="text-xl font-bold text-green-600">
                  ${(selectedOrder.deliveryFee * 0.7).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => acceptOrder(selectedOrder.id)}
                >
                  <Bike className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
