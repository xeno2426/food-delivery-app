# FoodDelivery App - Complete Setup Guide

A mobile-first food delivery web app built with React, Vite, TailwindCSS, Firebase, and OpenStreetMap.

## Features

### Customer Features
- Browse restaurants and menus
- Trending dishes section
- Add to cart with special instructions
- Place orders (stored in Firebase)
- Live order status updates
- Favorites & quick reorder
- Loyalty points system
- Reviews with images

### Restaurant Owner Features
- Dashboard with analytics
- Accept/reject orders
- Update order status
- Edit menu availability

### Driver Features
- Accept delivery requests
- Real-time location tracking
- Delivery history & earnings

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Firebase (Auth + Firestore)
- **Maps**: OpenStreetMap + Leaflet
- **State Management**: React Context + Hooks

---

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup
3. Enable Google Analytics (optional)

### 2. Enable Authentication
1. Go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Save

### 3. Create Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location close to your users

### 4. Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click the web icon (</>)
3. Register app with a nickname
4. Copy the firebaseConfig object

### 5. Set Environment Variables
Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Firestore Collections Schema

### users
```javascript
{
  uid: string,
  email: string,
  name: string,
  phone: string,
  role: 'customer' | 'restaurant' | 'driver',
  avatar?: string,
  address?: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    coordinates?: { lat: number, lng: number }
  },
  loyaltyPoints: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### restaurants
```javascript
{
  id: string,
  name: string,
  description: string,
  image: string,
  cuisine: string[],
  rating: number,
  reviewCount: number,
  deliveryTime: string,
  deliveryFee: number,
  minOrder: number,
  address: Address,
  phone: string,
  isOpen: boolean,
  ownerId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### menuItems
```javascript
{
  id: string,
  restaurantId: string,
  name: string,
  description: string,
  price: number,
  image: string,
  category: string,
  isAvailable: boolean,
  isPopular: boolean,
  preparationTime: number,
  addons?: [{ id: string, name: string, price: number }],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### orders
```javascript
{
  id: string,
  customerId: string,
  customerName: string,
  customerPhone: string,
  deliveryAddress: Address,
  restaurantId: string,
  restaurantName: string,
  items: [{
    menuItemId: string,
    name: string,
    price: number,
    quantity: number,
    specialInstructions: string,
    addons: [{ id: string, name: string, price: number }]
  }],
  subtotal: number,
  deliveryFee: number,
  tax: number,
  total: number,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled',
  paymentMethod: string,
  specialInstructions: string,
  driverId?: string,
  driverLocation?: { lat: number, lng: number },
  estimatedDeliveryTime?: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### favorites
```javascript
{
  id: string,
  userId: string,
  restaurantId?: string,
  menuItemId?: string,
  createdAt: timestamp
}
```

### reviews
```javascript
{
  id: string,
  orderId: string,
  customerId: string,
  customerName: string,
  restaurantId: string,
  rating: number,
  comment: string,
  images: string[],
  createdAt: timestamp
}
```

### loyaltyTransactions
```javascript
{
  id: string,
  userId: string,
  orderId?: string,
  points: number,
  type: 'earned' | 'redeemed',
  description: string,
  createdAt: timestamp
}
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd fooddelivery-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

---

## Android Deployment (SPCK + GitHub + Netlify)

### Method 1: SPCK Editor (Recommended for Android)

#### Step 1: Install SPCK Editor
1. Install **SPCK Editor** from Google Play Store
2. Open the app and sign in with GitHub

#### Step 2: Clone Repository
1. Tap "+" to create new project
2. Select "Clone from Git"
3. Enter your GitHub repository URL
4. Choose a local folder

#### Step 3: Install Dependencies
1. Open terminal in SPCK (swipe from bottom)
2. Run:
```bash
npm install
```

#### Step 4: Configure Firebase
1. Edit `.env` file with your Firebase credentials
2. Save the file

#### Step 5: Build the App
```bash
npm run build
```

#### Step 6: Deploy to Netlify (via SPCK)
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

Or use drag-and-drop:
1. Go to [Netlify](https://app.netlify.com/)
2. Drag the `dist` folder to deploy

---

### Method 2: GitHub + Netlify (Traditional)

#### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fooddelivery-app.git
git push -u origin main
```

#### Step 2: Deploy on Netlify
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Select GitHub and authorize
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

#### Step 3: Environment Variables on Netlify
1. Go to Site settings > Environment variables
2. Add all Firebase environment variables from `.env`
3. Redeploy

---

## Folder Structure

```
fooddelivery-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Navigation.tsx
│   │   └── BottomNav.tsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useRestaurants.ts
│   │   ├── useOrders.ts
│   │   ├── useFavorites.ts
│   │   ├── useReviews.ts
│   │   ├── useLoyalty.ts
│   │   └── useDriverTracking.ts
│   ├── lib/               # Utilities
│   │   ├── firebase.ts
│   │   └── utils.ts
│   ├── pages/             # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── customer/
│   │   │   ├── Home.tsx
│   │   │   ├── Restaurants.tsx
│   │   │   ├── RestaurantDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderTracking.tsx
│   │   │   ├── Favorites.tsx
│   │   │   └── Profile.tsx
│   │   ├── restaurant/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MenuManagement.tsx
│   │   │   └── Orders.tsx
│   │   └── driver/
│   │       └── Dashboard.tsx
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Creating Sample Data

### Add Sample Restaurant (Firestore Console)

1. Go to Firestore Database
2. Create collection `restaurants`
3. Add document:

```javascript
{
  name: "Burger King",
  description: "Flame-grilled burgers since 1954",
  image: "https://example.com/burger.jpg",
  cuisine: ["American", "Burgers", "Fast Food"],
  rating: 4.5,
  reviewCount: 128,
  deliveryTime: "25-35 min",
  deliveryFee: 2.99,
  minOrder: 10.00,
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102"
  },
  phone: "+1 (555) 123-4567",
  isOpen: true,
  ownerId: "restaurant-owner-uid",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Add Sample Menu Items

Create `menuItems` collection with documents:

```javascript
{
  restaurantId: "restaurant-doc-id",
  name: "Whopper",
  description: "Our signature flame-grilled beef patty with fresh toppings",
  price: 6.99,
  image: "https://example.com/whopper.jpg",
  category: "Burgers",
  isAvailable: true,
  isPopular: true,
  preparationTime: 10,
  addons: [
    { id: "1", name: "Extra Cheese", price: 1.00 },
    { id: "2", name: "Bacon", price: 1.50 }
  ],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

---

## User Roles & Testing

### Create Test Accounts

1. **Customer Account**
   - Email: customer@demo.com
   - Password: password
   - Role: customer

2. **Restaurant Owner Account**
   - Email: restaurant@demo.com
   - Password: password
   - Role: restaurant

3. **Driver Account**
   - Email: driver@demo.com
   - Password: password
   - Role: driver

### Role-Based Routing
- Customers → Home page with restaurants
- Restaurant Owners → Dashboard with orders & menu
- Drivers → Delivery dashboard

---

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Restaurants are publicly readable
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'restaurant' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Menu items are publicly readable
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - customers can create, restaurants can update
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.customerId ||
         request.auth.uid == resource.data.restaurantId ||
         request.auth.uid == resource.data.driverId);
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Favorites
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Loyalty transactions
    match /loyaltyTransactions/{transactionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Troubleshooting

### Common Issues

1. **Firebase Auth not working**
   - Check environment variables
   - Ensure Email/Password provider is enabled

2. **Firestore permission denied**
   - Update security rules
   - Check user authentication

3. **Map not showing**
   - Verify Leaflet CSS is imported
   - Check for ad blockers

4. **Build fails**
   - Run `npm install` again
   - Clear node_modules and reinstall

### Contact & Support

For issues or questions:
- Firebase Docs: https://firebase.google.com/docs
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

---

## License

MIT License - Free for personal and commercial use.
