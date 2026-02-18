import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { useRestaurants, useMenuItems } from '@/hooks/useRestaurants';
import { useFavorites } from '@/hooks/useFavorites';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin, 
  Heart, 
  Plus, 
  Minus,
  ShoppingBag,
  Info,
  Flame,
  Search
} from 'lucide-react';
import type { MenuItem, Addon } from '@/types';
import { toast } from 'sonner';

interface RestaurantDetailProps {
  restaurantId: string;
  onNavigate: (page: string) => void;
}

export function RestaurantDetail({ restaurantId, onNavigate }: RestaurantDetailProps) {
  const { userProfile } = useAuthContext();
  const { addToCart, getItemCount } = useCartContext();
  const { getRestaurant } = useRestaurants();
  const { menuItems, loading: menuLoading } = useMenuItems(restaurantId);
  const { toggleFavorite, isFavorite } = useFavorites(userProfile?.uid);
  useReviews(restaurantId);
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadRestaurant = async () => {
      const data = await getRestaurant(restaurantId);
      setRestaurant(data);
      setLoading(false);
    };
    loadRestaurant();
  }, [restaurantId, getRestaurant]);

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const success = addToCart(selectedItem, quantity, specialInstructions, selectedAddons);
    
    if (success) {
      toast.success(`Added ${quantity}x ${selectedItem.name} to cart`);
      setSelectedItem(null);
      setQuantity(1);
      setSpecialInstructions('');
      setSelectedAddons([]);
    } else {
      toast.error('Cannot add items from different restaurants. Please clear your cart first.');
    }
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const getItemTotal = () => {
    if (!selectedItem) return 0;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return (selectedItem.price + addonsTotal) * quantity;
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Skeleton className="h-64 w-full" />
        <div className="p-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Image */}
      <div className="relative h-64 bg-gray-200">
        {restaurant.image ? (
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-8xl">🍽️</span>
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('restaurants')}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(restaurantId)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart 
            className={`h-5 w-5 ${isFavorite(restaurantId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white -mt-6 rounded-t-3xl relative z-10 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-500">{restaurant.cuisine.join(', ')}</p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
            <Star className="h-4 w-4 fill-green-500 text-green-500" />
            <span className="font-semibold text-green-700">{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>Min ${restaurant.minOrder.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Menu */}
      <Tabs defaultValue="all" className="w-full">
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <TabsList className="w-full justify-start rounded-none h-12 px-4 bg-white">
            <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="rounded-full">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="m-0">
          <MenuList 
            items={filteredItems} 
            loading={menuLoading}
            onItemClick={setSelectedItem}
          />
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="m-0">
            <MenuList 
              items={filteredItems.filter(item => item.category === category)}
              loading={menuLoading}
              onItemClick={setSelectedItem}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Add to Cart Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.image && (
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <p className="text-gray-600">{selectedItem.description}</p>
              
              {/* Addons */}
              {selectedItem.addons && selectedItem.addons.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Add-ons</h4>
                  <div className="space-y-2">
                    {selectedItem.addons.map((addon) => (
                      <div 
                        key={addon.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedAddons.some(a => a.id === addon.id)}
                            onCheckedChange={() => toggleAddon(addon)}
                          />
                          <span>{addon.name}</span>
                        </div>
                        <span className="text-gray-600">+${addon.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <h4 className="font-semibold mb-2">Special Instructions</h4>
                <Textarea
                  placeholder="Any special requests? (e.g., no onions, extra spicy)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="font-semibold">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add Button */}
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart - ${getItemTotal().toFixed(2)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 shadow-lg"
            onClick={() => onNavigate('cart')}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            View Cart ({getItemCount()} items)
          </Button>
        </div>
      )}
    </div>
  );
}

interface MenuListProps {
  items: MenuItem[];
  loading: boolean;
  onItemClick: (item: MenuItem) => void;
}

function MenuList({ items, loading, onItemClick }: MenuListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No items found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onItemClick(item)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                  {item.isPopular && (
                    <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center ml-2">
                      <Flame className="h-3 w-3 mr-1" /> Popular
                    </div>
                  )}
                </div>
                <p className="font-semibold text-orange-600 mt-2">${item.price.toFixed(2)}</p>
              </div>
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
