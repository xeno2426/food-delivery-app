import { useEffect, useState } from 'react';
import { useOrder } from '@/hooks/useOrders';
import { useDriverTracking } from '@/hooks/useDriverTracking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  MapPin,
  CheckCircle2,
  Circle,
  Utensils,
  Bike,
  Home
} from 'lucide-react';
import type { OrderStatus } from '@/types';

interface OrderTrackingProps {
  orderId: string;
  onNavigate: (page: string) => void;
}

const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Order Received',
  confirmed: 'Order Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusIcons: Record<OrderStatus, any> = {
  pending: Utensils,
  confirmed: CheckCircle2,
  preparing: Utensils,
  ready: CheckCircle2,
  out_for_delivery: Bike,
  delivered: Home,
  cancelled: Circle,
};

export function OrderTracking({ orderId, onNavigate }: OrderTrackingProps) {
  const { order, loading: orderLoading } = useOrder(orderId);
  const { driverLocation } = useDriverTracking(orderId);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leafletModules, setLeafletModules] = useState<any>(null);

  // Dynamically import Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      const L = await import('leaflet');
      const reactLeaflet = await import('react-leaflet');
      
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setLeafletModules({ L, ...reactLeaflet });
      setMapLoaded(true);
    };
    loadLeaflet();
  }, []);

  if (orderLoading || !mapLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Skeleton className="h-64 w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  const { MapContainer, TileLayer, Marker, Popup } = leafletModules || {};

  // Default coordinates (San Francisco)
  const restaurantLocation = [37.7749, -122.4194];
  const customerLocation = [
    order.deliveryAddress.coordinates?.lat || 37.7849,
    order.deliveryAddress.coordinates?.lng || -122.4094,
  ];
  const driverLoc = driverLocation ? [driverLocation.lat, driverLocation.lng] : restaurantLocation;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => onNavigate('orders')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Order #{order.id.slice(-6)}</h1>
            <p className="text-sm text-gray-500">{order.restaurantName}</p>
          </div>
        </div>
      </div>

      {/* Map */}
      {mapLoaded && leafletModules && (
        <div className="h-64 w-full relative">
          <MapContainer
            center={driverLoc as any}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Restaurant Marker */}
            <Marker position={restaurantLocation as any}>
              <Popup>Restaurant</Popup>
            </Marker>
            
            {/* Customer Marker */}
            <Marker position={customerLocation as any}>
              <Popup>Your Location</Popup>
            </Marker>
            
            {/* Driver Marker */}
            {order.status === 'out_for_delivery' && driverLocation && (
              <Marker position={driverLoc as any}>
                <Popup>Driver Location</Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Map Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    {order.status === 'out_for_delivery' ? (
                      <Bike className="h-6 w-6 text-orange-600" />
                    ) : (
                      <Utensils className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{statusLabels[order.status]}</p>
                    <p className="text-sm text-gray-500">
                      {order.status === 'out_for_delivery' 
                        ? 'Driver is on the way' 
                        : 'Estimated delivery: 30-45 min'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Order Progress</span>
                <span className="text-orange-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = statusIcons[step];
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div 
                    key={step}
                    className={`flex items-center gap-3 ${
                      isCompleted ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? isCurrent 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrent ? 'text-orange-600' : ''}`}>
                        {statusLabels[step]}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500">
                          {step === 'out_for_delivery' 
                            ? 'Your food is on the way!' 
                            : 'In progress...'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-1">
                  <span>Total</span>
                  <span className="text-orange-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Delivery Address</h3>
            </div>
            <p className="text-gray-600">
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
            </p>
          </CardContent>
        </Card>

        {/* Contact Buttons */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call Restaurant
            </Button>
            {order.driverId && (
              <Button variant="outline" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Driver
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
