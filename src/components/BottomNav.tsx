import { Home, Search, ShoppingCart, ClipboardList, Heart } from 'lucide-react';
import { useCartContext } from '@/contexts/CartContext';

interface BottomNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function BottomNav({ onNavigate, currentPage }: BottomNavProps) {
  const { getItemCount } = useCartContext();
  const cartCount = getItemCount();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'restaurants', label: 'Explore', icon: Search },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'favorites', label: 'Saved', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
