import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMenuItems } from '@/hooks/useRestaurants';
import { db, collection, query, where, onSnapshot } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Flame,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuManagementProps {
  onNavigate: (page: string) => void;
}

export function MenuManagement({ onNavigate }: MenuManagementProps) {
  const { userProfile } = useAuthContext();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Get restaurant for this owner
  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'restaurants'),
      where('ownerId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const restDoc = snapshot.docs[0];
        setRestaurant({ id: restDoc.id, ...restDoc.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const { menuItems, loading: itemsLoading, addMenuItem, updateMenuItem } = useMenuItems(restaurant?.id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    isPopular: false,
    preparationTime: '15',
  });

  const handleAddItem = async () => {
    if (!restaurant?.id) return;

    try {
      await addMenuItem({
        restaurantId: restaurant.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: '',
        category: formData.category,
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        preparationTime: parseInt(formData.preparationTime),
        addons: [],
      } as any);

      toast.success('Menu item added successfully');
      setShowAddDialog(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true,
        isPopular: false,
        preparationTime: '15',
      });
    } catch (error) {
      toast.error('Failed to add menu item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        preparationTime: parseInt(formData.preparationTime),
      });

      toast.success('Menu item updated successfully');
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to update menu item');
    }
  };

  const toggleAvailability = async (item: any) => {
    try {
      await updateMenuItem(item.id, {
        isAvailable: !item.isAvailable,
      });
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isAvailable: item.isAvailable,
      isPopular: item.isPopular,
      preparationTime: item.preparationTime.toString(),
    });
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-16 z-40 border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => onNavigate('restaurant-dashboard')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Menu Management</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{menuItems.length}</p>
              <p className="text-xs text-gray-500">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{menuItems.filter(i => i.isAvailable).length}</p>
              <p className="text-xs text-gray-500">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{menuItems.filter(i => i.isPopular).length}</p>
              <p className="text-xs text-gray-500">Popular</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items by Category */}
        {itemsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items</h3>
            <p className="text-gray-500 mb-4">Add your first menu item to get started</p>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="m-0 mt-4">
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <MenuItemCard 
                    key={item.id}
                    item={item}
                    onToggle={() => toggleAvailability(item)}
                    onEdit={() => openEditDialog(item)}
                  />
                ))}
              </div>
            </TabsContent>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="m-0 mt-4">
                <div className="space-y-3">
                  {filteredItems
                    .filter(item => item.category === category)
                    .map((item) => (
                      <MenuItemCard 
                        key={item.id}
                        item={item}
                        onToggle={() => toggleAvailability(item)}
                        onEdit={() => openEditDialog(item)}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={showAddDialog || !!editingItem} 
        onOpenChange={() => {
          setShowAddDialog(false);
          setEditingItem(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Item name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Main Course"
                />
              </div>
            </div>
            <div>
              <Label>Preparation Time (minutes)</Label>
              <Input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label>Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                />
                <Label>Popular</Label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={editingItem ? handleUpdateItem : handleAddItem}
              >
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MenuItemCardProps {
  item: any;
  onToggle: () => void;
  onEdit: () => void;
}

function MenuItemCard({ item, onToggle, onEdit }: MenuItemCardProps) {
  return (
    <Card className={`${!item.isAvailable ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{item.name}</h3>
              {item.isPopular && (
                <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                  <Flame className="h-3 w-3 mr-1" /> Popular
                </div>
              )}
              {!item.isAvailable && (
                <div className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">Unavailable</div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-semibold text-orange-600">${item.price.toFixed(2)}</span>
              <span className="text-gray-500">{item.category}</span>
              <span className="text-gray-500">{item.preparationTime} min</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`p-2 rounded-full ${item.isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-full bg-gray-100 text-gray-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
