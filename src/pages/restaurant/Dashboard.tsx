import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePendingOrders } from '@/hooks/useOrders';
import { db, collection, query, where, onSnapshot } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Utensils, 
  DollarSign, 
  ShoppingBag, 
  Star,
  Package,
  Menu
} from 'lucide-react';

interface RestaurantDashboardProps {
  onNavigate: (page: string) => void;
}

export function RestaurantDashboard({ onNavigate }: RestaurantDashboardProps) {
  const { userProfile } = useAuthContext();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

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

  // Get orders stats
  useEffect(() => {
    if (!restaurant?.id) return;

    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', restaurant.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalRevenue = 0;
      let totalOrders = 0;
      let todayOrders = 0;
      let todayRevenue = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach((doc) => {
        const order = doc.data();
        totalOrders++;
        totalRevenue += order.total || 0;

        const orderDate = order.createdAt?.toDate();
        if (orderDate && orderDate >= today) {
          todayOrders++;
          todayRevenue += order.total || 0;
        }
      });

      setStats({ totalOrders, totalRevenue, todayOrders, todayRevenue });
    });

    return () => unsubscribe();
  }, [restaurant?.id]);

  const { pendingOrders, loading: ordersLoading } = usePendingOrders(restaurant?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Skeleton className="h-32 rounded-xl mb-4" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Restaurant Found</h2>
            <p className="text-gray-500 mb-4">You haven&apos;t set up your restaurant yet.</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Set Up Restaurant
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className={`px-3 py-1 rounded-full text-sm ${restaurant.isOpen ? 'bg-white/20' : 'bg-red-500'}`}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </div>
        </div>
        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
        <div className="flex items-center gap-4 mt-2 text-orange-100">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{restaurant.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => onNavigate('restaurant-menu')}
          >
            <Menu className="h-6 w-6" />
            <span className="text-sm">Manage Menu</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => onNavigate('restaurant-orders')}
          >
            <Package className="h-6 w-6" />
            <span className="text-sm">View Orders</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Today&apos;s Revenue</span>
              </div>
              <p className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{stats.todayOrders} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Total Orders</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500">${stats.totalRevenue.toFixed(2)} revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Active Orders</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-orange-500"
                onClick={() => onNavigate('restaurant-orders')}
              >
                View All
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 3).map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => onNavigate('restaurant-orders')}
                  >
                    <div>
                      <p className="font-medium">#{order.id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items • ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs text-white ${
                      order.status === 'pending' ? 'bg-yellow-500' :
                      order.status === 'confirmed' ? 'bg-blue-500' :
                      order.status === 'preparing' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Customer Rating</span>
                  <span className="font-medium">{restaurant.rating?.toFixed(1) || '0.0'}/5.0</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${((restaurant.rating || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Order Acceptance Rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">On-Time Delivery</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
