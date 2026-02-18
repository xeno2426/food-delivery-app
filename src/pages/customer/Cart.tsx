import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { useOrders } from '@/hooks/useOrders';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  CreditCard,
  Gift,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface CartPageProps {
  onNavigate: (page: string) => void;
  onOrderPlaced: (orderId: string) => void;
}

export function CartPage({ onNavigate, onOrderPlaced }: CartPageProps) {
  const { userProfile } = useAuthContext();
  const { cartItems, restaurantId, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCartContext();
  const { placeOrder } = useOrders(userProfile?.uid);
  const { points, getPointsValue, redeemPoints } = useLoyalty(userProfile?.uid);
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: userProfile?.address?.street || '',
    city: userProfile?.address?.city || '',
    state: userProfile?.address?.state || '',
    zipCode: userProfile?.address?.zipCode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const DELIVERY_FEE = 2.99;
  const TAX_RATE = 0.08;
  
  const subtotal = getCartTotal();
  const tax = subtotal * TAX_RATE;
  const pointsDiscount = usePoints ? Math.min(pointsToRedeem / 100, subtotal + DELIVERY_FEE + tax) : 0;
  const total = subtotal + DELIVERY_FEE + tax - pointsDiscount;

  const handlePlaceOrder = async () => {
    if (!restaurantId || !userProfile) return;
    
    if (!deliveryAddress.street || !deliveryAddress.city) {
      toast.error('Please enter a delivery address');
      return;
    }

    setPlacingOrder(true);

    try {
      // Get restaurant details
      const restaurantDoc = await import('@/lib/firebase').then(({ db, doc, getDoc }) => 
        getDoc(doc(db, 'restaurants', restaurantId))
      );
      const restaurantData = restaurantDoc.data();

      if (!restaurantData) {
        toast.error('Restaurant not found');
        return;
      }

      const orderId = await placeOrder(
        userProfile.uid,
        userProfile.name,
        userProfile.phone,
        deliveryAddress,
        restaurantId,
        restaurantData.name,
        cartItems,
        DELIVERY_FEE,
        tax,
        paymentMethod,
        specialInstructions
      );

      // Redeem points if used
      if (usePoints && pointsToRedeem > 0) {
        await redeemPoints(pointsToRedeem, `Redeemed for order #${orderId.slice(-6)}`);
      }

      clearCart();
      toast.success('Order placed successfully!');
      onOrderPlaced(orderId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items to get started</p>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => onNavigate('restaurants')}
        >
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => onNavigate('restaurants')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Your Cart</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Cart Items */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-4">Items ({cartItems.length})</h2>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.menuItem.image ? (
                      <img 
                        src={item.menuItem.image} 
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.menuItem.name}</h3>
                    {item.selectedAddons.length > 0 && (
                      <p className="text-sm text-gray-500">
                        + {item.selectedAddons.map(a => a.name).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-500 italic">
                        "{item.specialInstructions}"
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-orange-600">
                        ${((item.menuItem.price + item.selectedAddons.reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center ml-2 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-lg">Delivery Address</h2>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Street Address"
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                />
              </div>
              <Input
                placeholder="ZIP Code"
                value={deliveryAddress.zipCode}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3">Special Instructions</h2>
            <Textarea
              placeholder="Any special requests for the restaurant?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-lg">Payment Method</h2>
            </div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash on Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal">PayPal</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Loyalty Points */}
        {points > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-purple-500" />
                <h2 className="font-semibold text-lg">Loyalty Points</h2>
                <span className="text-sm text-gray-500">({points} points = ${getPointsValue().toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => {
                      setUsePoints(e.target.checked);
                      if (e.target.checked) {
                        setPointsToRedeem(Math.min(points, Math.floor((subtotal + DELIVERY_FEE + tax) * 100)));
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span>Use points for discount</span>
                </label>
              </div>
              {usePoints && (
                <div className="mt-3">
                  <Label>Points to use (max: ${(subtotal + DELIVERY_FEE + tax).toFixed(2)})</Label>
                  <Input
                    type="number"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Math.min(Number(e.target.value), points, Math.floor((subtotal + DELIVERY_FEE + tax) * 100)))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Discount: ${(pointsToRedeem / 100).toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {usePoints && pointsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Points Discount</span>
                  <span>-${pointsDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg"
          onClick={() => setShowCheckout(true)}
        >
          Place Order - ${total.toFixed(2)}
        </Button>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Order Total: ${total.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{cartItems.reduce((sum, i) => sum + i.quantity, 0)} items</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? 'Placing Order...' : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
