import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useFavorites } from '@/hooks/useFavorites';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Star, 
  Clock, 
  Heart, 
  MapPin, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface RestaurantsPageProps {
  onNavigate: (page: string) => void;
  onRestaurantClick: (restaurantId: string) => void;
}

export function RestaurantsPage({ onRestaurantClick }: RestaurantsPageProps) {
  const { userProfile } = useAuthContext();
  const { restaurants, loading, searchRestaurants } = useRestaurants();
  const { toggleFavorite, isFavorite } = useFavorites(userProfile?.uid);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'deliveryFee'>('rating');

  const cuisines = ['All', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean'];

  useEffect(() => {
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  useEffect(() => {
    const filterRestaurants = async () => {
      let results = [...restaurants];

      if (searchQuery) {
        results = await searchRestaurants(searchQuery, selectedCuisine || undefined);
      } else if (selectedCuisine && selectedCuisine !== 'All') {
        results = results.filter(r => r.cuisine.includes(selectedCuisine));
      }

      // Sort results
      results.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'deliveryTime':
            return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
          case 'deliveryFee':
            return a.deliveryFee - b.deliveryFee;
          default:
            return 0;
        }
      });

      setFilteredRestaurants(results);
    };

    filterRestaurants();
  }, [searchQuery, selectedCuisine, sortBy, restaurants, searchRestaurants]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${showFilters ? 'bg-orange-50 border-orange-200' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine === 'All' ? null : cuisine)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    (cuisine === 'All' && !selectedCuisine) || selectedCuisine === cuisine
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          {showFilters && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500 py-1">Sort by:</span>
              {[
                { key: 'rating', label: 'Rating' },
                { key: 'deliveryTime', label: 'Delivery Time' },
                { key: 'deliveryFee', label: 'Delivery Fee' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key as any)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    sortBy === option.key
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading restaurants...' : `${filteredRestaurants.length} restaurants found`}
        </p>

        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => (
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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative h-48 bg-gray-200">
          {restaurant.image ? (
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="bg-white/90 text-gray-900 backdrop-blur-sm px-2 py-1 rounded-full flex items-center text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {restaurant.rating.toFixed(1)}
            </div>
            {restaurant.rating >= 4.5 && (
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                Top Rated
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </button>

          {/* Delivery Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-4 text-white text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900">{restaurant.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine.join(', ')}</p>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
              Min. order ${restaurant.minOrder.toFixed(2)}
            </div>
            {restaurant.isOpen ? (
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Open</div>
            ) : (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Closed</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
