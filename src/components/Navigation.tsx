import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, User, LogOut, Store, Bike } from 'lucide-react';

interface NavigationProps {
  onNavigate: (page: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { userProfile, logout } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    onNavigate('login');
    setIsLoggingOut(false);
  };

  const getRoleIcon = () => {
    switch (userProfile?.role) {
      case 'restaurant':
        return <Store className="h-4 w-4" />;
      case 'driver':
        return <Bike className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (userProfile?.role) {
      case 'restaurant':
        return 'Restaurant Owner';
      case 'driver':
        return 'Driver';
      default:
        return 'Customer';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (userProfile?.role === 'customer') onNavigate('home');
              else if (userProfile?.role === 'restaurant') onNavigate('restaurant-dashboard');
              else if (userProfile?.role === 'driver') onNavigate('driver-dashboard');
            }}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">FoodDelivery</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userProfile?.name}</p>
                    <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                    <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                      {getRoleIcon()}
                      <span>{getRoleLabel()}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {userProfile?.role === 'customer' && (
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
