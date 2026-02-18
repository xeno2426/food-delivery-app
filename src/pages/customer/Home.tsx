import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRestaurants, useMenuItems } from '@/hooks/useRestaurants';
import { useFavorites } from '@/hooks/useFavorites';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Star, 
  Clock, 
  Heart, 
  TrendingUp, 
  Search, 
  Flame,
  Gift,
  ChevronRight
} from 'lucide-react';
import type { MenuItem } from '@/types';

interface CustomerHomeProps {
  onNavigate: (page: string) => void;
  onRestaurantClick: (restaurantId: string) => void;
}

export function CustomerHome({ onNavigate, onRestaurantClick }: CustomerHomeProps) {
  const { userProfile } = useAuthContext();
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { getPopularItems } = useMenuItems();
  const { toggleFavorite, isFavorite } = useFavorites(userProfile?.uid);
  const { points, getPointsValue } = useLoyalty(userProfile?.uid);
  
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    const loadPopularItems = async () => {
      const items = await getPopularItems(8);
      setPopularItems(items);
      setTrendingLoading(false);
    };
    loadPopularItems();
  }, [getPopularItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('restaurants');
    }
  };

  const categories = [
    { name: 'All', icon: '🍽️' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Burger', icon: '🍔' },
    { name: 'Sushi', icon: '🍣' },
    { name: 'Asian', icon: '🍜' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Healthy', icon: '🥗' },
    { name: 'Mexican', icon: '🌮' },
  ];

  return (
    <div className="pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-orange-100 text-sm">Deliver to</p>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Current Location</span>
            </div>
          </div>
          {points > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <Gift className="h-4 w-4" />
                <span className="font-bold">{points}</span>
              </div>
              <p className="text-xs text-orange-100">points</p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search restaurants, dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 bg-white border-0 shadow-lg text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </form>
      </div>

      <div className="px-4 -mt-4">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.name}
              className="flex flex-col items-center min-w-[70px] bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className="text-xs font-medium text-gray-700">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Loyalty Banner */}
        {points > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Your Rewards</p>
                  <p className="text-2xl font-bold">${getPointsValue().toFixed(2)}</p>
                  <p className="text-purple-100 text-xs">{points} points available</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Gift className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending Dishes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Trending Now</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-500">
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {trendingLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="min-w-[200px] h-[240px] rounded-xl" />
              ))
            ) : (
              popularItems.map((item) => (
                <div 
                  key={item.id} 
                  className="min-w-[200px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="relative h-32 bg-gray-200">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Flame className="h-3 w-3 mr-1" /> Popular
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-orange-600">${item.price.toFixed(2)}</span>
                      <Button size="sm" className="h-8 bg-orange-500 hover:bg-orange-600">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Featured Restaurants</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-orange-500"
              onClick={() => onNavigate('restaurants')}
            >
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {restaurantsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : (
              restaurants.slice(0, 5).map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant}
                  onClick={() => onRestaurantClick(restaurant.id)}
                  isFavorite={isFavorite(restaurant.id)}
                  onToggleFavorite={() => toggleFavorite(restaurant.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface RestaurantCardProps {
  restaurant: any;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function RestaurantCard({ restaurant, onClick, isFavorite, onToggleFavorite }: RestaurantCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
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
                  onToggleFavorite();
                }}
                className="p-1"
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                <span className="text-gray-500">({restaurant.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500">
                Delivery: <span className="font-medium text-gray-700">${restaurant.deliveryFee.toFixed(2)}</span>
              </span>
              <span className="text-sm text-gray-500">
                Min: <span className="font-medium text-gray-700">${restaurant.minOrder.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
