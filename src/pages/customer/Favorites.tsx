import { useAuthContext } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Star, 
  Clock, 
  MapPin,
  ArrowLeft,
  Utensils
} from 'lucide-react';
import { toast } from 'sonner';

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
  onRestaurantClick: (restaurantId: string) => void;
}

export function FavoritesPage({ onNavigate, onRestaurantClick }: FavoritesPageProps) {
  const { userProfile } = useAuthContext();
  const { 
    favoriteRestaurants, 
    favoriteItems, 
    loading, 
    removeFavorite 
  } = useFavorites(userProfile?.uid);

  const handleRemoveFavorite = async (restaurantId?: string, menuItemId?: string) => {
    await removeFavorite(restaurantId, menuItemId);
    toast.success('Removed from favorites');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Favorites</h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="restaurants">
              Restaurants ({favoriteRestaurants.length})
            </TabsTrigger>
            <TabsTrigger value="items">
              Dishes ({favoriteItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="m-0">
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : favoriteRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorite restaurants</h3>
                <p className="text-gray-500 mb-6">Save your favorite restaurants for quick access</p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => onNavigate('restaurants')}
                >
                  Explore Restaurants
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteRestaurants.map((restaurant) => (
                  <Card 
                    key={restaurant.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onRestaurantClick(restaurant.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                          {restaurant.image ? (
                            <img 
                              src={restaurant.image} 
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-4xl">🍽️</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                              <p className="text-sm text-gray-500">{restaurant.cuisine.join(', ')}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(restaurant.id);
                              }}
                              className="p-1"
                            >
                              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{restaurant.deliveryTime}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="items" className="m-0">
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : favoriteItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorite dishes</h3>
                <p className="text-gray-500 mb-6">Save your favorite dishes for quick ordering</p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => onNavigate('restaurants')}
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
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
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveFavorite(undefined, item.id)}
                              className="p-1"
                            >
                              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-orange-600">${item.price.toFixed(2)}</span>
                            <Button 
                              size="sm" 
                              className="bg-orange-500 hover:bg-orange-600"
                              onClick={() => onRestaurantClick(item.restaurantId)}
                            >
                              Order
                            </Button>
                          </div>
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
    </div>
  );
}
