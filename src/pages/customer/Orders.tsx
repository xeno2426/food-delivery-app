import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  ChevronRight, 
  Utensils,
  RotateCcw,
  Star
} from 'lucide-react';
import type { OrderStatus } from '@/types';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
  onOrderClick: (orderId: string) => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-orange-500',
  ready: 'bg-purple-500',
  out_for_delivery: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrdersPage({ onNavigate, onOrderClick }: OrdersPageProps) {
  const { userProfile } = useAuthContext();
  const { orders, loading } = useOrders(userProfile?.uid, 'customer');
  const [activeTab, setActiveTab] = useState('active');

  const activeOrders = orders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );
  
  const pastOrders = orders.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  );

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="p-4">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none bg-gray-50 h-12">
            <TabsTrigger value="active" className="flex-1 rounded-none data-[state=active]:bg-white">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-none data-[state=active]:bg-white">
              Past ({pastOrders.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'active' ? 'No active orders' : 'No past orders'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'active' 
                ? 'Hungry? Place your first order!' 
                : 'Your order history will appear here'}
            </p>
            {activeTab === 'active' && (
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => onNavigate('restaurants')}
              >
                Browse Restaurants
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onClick={() => onOrderClick(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: any;
  onClick: () => void;
}

function OrderCard({ order, onClick }: OrderCardProps) {
  const isDelivered = order.status === 'delivered';
  const isActive = !['delivered', 'cancelled'].includes(order.status);
  const status = order.status as OrderStatus;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{order.restaurantName}</h3>
            <p className="text-sm text-gray-500">
              Order #{order.id.slice(-6)} • {order.createdAt?.toDate().toLocaleDateString()}
            </p>
          </div>
          <Badge className={`${statusColors[status]} text-white`}>
            {statusLabels[status]}
          </Badge>
        </div>

        {/* Items */}
        <div className="text-sm text-gray-600 mb-3">
          {order.items.slice(0, 2).map((item: any, idx: number) => (
            <span key={idx}>
              {item.quantity}x {item.name}
              {idx < Math.min(order.items.length, 2) - 1 && ', '}
            </span>
          ))}
          {order.items.length > 2 && (
            <span className="text-gray-400"> +{order.items.length - 2} more</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg">${order.total.toFixed(2)}</span>
            {isActive && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>Track Order</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isDelivered && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Star className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}
            {isDelivered && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reorder
              </Button>
            )}
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
