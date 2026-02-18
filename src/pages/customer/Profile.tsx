import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Gift, 
  Star,
  Edit2,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { userProfile, logout, updateProfile } = useAuthContext();
  const { points, getPointsValue, transactions, loading: loyaltyLoading } = useLoyalty(userProfile?.uid);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showLoyaltyHistory, setShowLoyaltyHistory] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    street: userProfile?.address?.street || '',
    city: userProfile?.address?.city || '',
    state: userProfile?.address?.state || '',
    zipCode: userProfile?.address?.zipCode || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {userProfile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
            <p className="text-orange-100">{userProfile?.email}</p>
            <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full inline-block mt-2">
              {userProfile?.role === 'customer' && 'Customer'}
              {userProfile?.role === 'restaurant' && 'Restaurant Owner'}
              {userProfile?.role === 'driver' && 'Driver'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Loyalty Card */}
        <Card 
          className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowLoyaltyHistory(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-5 w-5" />
                  <span className="font-medium">Loyalty Points</span>
                </div>
                <p className="text-3xl font-bold">{points}</p>
                <p className="text-purple-100 text-sm">= ${getPointsValue().toFixed(2)}</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <Star className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <span className="text-sm">View history</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{userProfile?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userProfile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{userProfile?.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Default Address</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                {userProfile?.address?.street ? (
                  <>
                    <p className="font-medium">{userProfile.address.street}</p>
                    <p className="text-gray-500">
                      {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zipCode}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No address saved</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full text-red-500 border-red-200 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loyalty History Dialog */}
      <Dialog open={showLoyaltyHistory} onOpenChange={setShowLoyaltyHistory}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loyalty Points History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
              <p className="text-sm opacity-80">Current Balance</p>
              <p className="text-3xl font-bold">{points} points</p>
              <p className="text-sm opacity-80">= ${getPointsValue().toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Recent Transactions</h4>
              {loyaltyLoading ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {transaction.type === 'earned' ? (
                          <Gift className="h-5 w-5 text-green-600" />
                        ) : (
                          <Star className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.createdAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
