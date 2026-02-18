import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CustomerHome } from '@/pages/customer/Home';
import { RestaurantsPage } from '@/pages/customer/Restaurants';
import { RestaurantDetail } from '@/pages/customer/RestaurantDetail';
import { CartPage } from '@/pages/customer/Cart';
import { OrdersPage } from '@/pages/customer/Orders';
import { OrderTracking } from '@/pages/customer/OrderTracking';
import { FavoritesPage } from '@/pages/customer/Favorites';
import { ProfilePage } from '@/pages/customer/Profile';
import { RestaurantDashboard } from '@/pages/restaurant/Dashboard';
import { MenuManagement } from '@/pages/restaurant/MenuManagement';
import { RestaurantOrders } from '@/pages/restaurant/Orders';
import { DriverDashboard } from '@/pages/driver/Dashboard';
import { Navigation } from '@/components/Navigation';
import { BottomNav } from '@/components/BottomNav';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';

type Page = 
  | 'login' | 'register'
  | 'home' | 'restaurants' | 'restaurant-detail' | 'cart' | 'orders' | 'tracking' | 'favorites' | 'profile'
  | 'restaurant-dashboard' | 'restaurant-menu' | 'restaurant-orders'
  | 'driver-dashboard';

function AppContent() {
  const { userProfile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Initial auth check - only run once when loading completes
  useEffect(() => {
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      if (!userProfile) {
        setCurrentPage('login');
      } else {
        // Redirect based on role
        if (userProfile.role === 'restaurant') {
          setCurrentPage('restaurant-dashboard');
        } else if (userProfile.role === 'driver') {
          setCurrentPage('driver-dashboard');
        } else {
          setCurrentPage('home');
        }
      }
    }
  }, [userProfile, loading, hasCheckedAuth]);

  const navigateTo = (page: string) => setCurrentPage(page as Page);

  const handleRestaurantClick = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentPage('restaurant-detail');
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentPage('tracking');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'register':
        return <RegisterPage onNavigate={navigateTo} />;
      case 'home':
        return <CustomerHome onNavigate={navigateTo} onRestaurantClick={handleRestaurantClick} />;
      case 'restaurants':
        return <RestaurantsPage onNavigate={navigateTo} onRestaurantClick={handleRestaurantClick} />;
      case 'restaurant-detail':
        return selectedRestaurantId ? (
          <RestaurantDetail 
            restaurantId={selectedRestaurantId} 
            onNavigate={navigateTo}
          />
        ) : (
          <RestaurantsPage onNavigate={navigateTo} onRestaurantClick={handleRestaurantClick} />
        );
      case 'cart':
        return <CartPage onNavigate={navigateTo} onOrderPlaced={handleOrderClick} />;
      case 'orders':
        return <OrdersPage onNavigate={navigateTo} onOrderClick={handleOrderClick} />;
      case 'tracking':
        return selectedOrderId ? (
          <OrderTracking orderId={selectedOrderId} onNavigate={navigateTo} />
        ) : (
          <OrdersPage onNavigate={navigateTo} onOrderClick={handleOrderClick} />
        );
      case 'favorites':
        return <FavoritesPage onNavigate={navigateTo} onRestaurantClick={handleRestaurantClick} />;
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case 'restaurant-dashboard':
        return <RestaurantDashboard onNavigate={navigateTo} />;
      case 'restaurant-menu':
        return <MenuManagement onNavigate={navigateTo} />;
      case 'restaurant-orders':
        return <RestaurantOrders onNavigate={navigateTo} onOrderClick={handleOrderClick} />;
      case 'driver-dashboard':
        return <DriverDashboard onNavigate={navigateTo} onOrderClick={handleOrderClick} />;
      default:
        return <LoginPage onNavigate={navigateTo} />;
    }
  };

  const showBottomNav = userProfile?.role === 'customer' && 
    ['home', 'restaurants', 'cart', 'orders', 'favorites', 'profile'].includes(currentPage);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userProfile && <Navigation onNavigate={navigateTo} />}
      <main className={`${userProfile ? 'pt-16' : ''} ${showBottomNav ? 'pb-20' : ''}`}>
        {renderPage()}
      </main>
      {showBottomNav && <BottomNav onNavigate={navigateTo} currentPage={currentPage} />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
