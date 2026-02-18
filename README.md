# FoodDelivery App

A mobile-first food delivery web application built with React, Firebase, and OpenStreetMap.

![FoodDelivery App](https://via.placeholder.com/800x400?text=FoodDelivery+App)

## Features

### For Customers
- Browse restaurants and menus
- Trending dishes section
- Add to cart with special instructions
- Place orders with real-time tracking
- Favorites & quick reorder
- Loyalty points system
- Reviews with images

### For Restaurant Owners
- Dashboard with analytics
- Accept/reject orders
- Update order status in real-time
- Edit menu availability

### For Drivers
- Accept delivery requests
- Real-time location tracking
- Delivery history & earnings

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Firebase (Authentication + Firestore)
- **Maps**: OpenStreetMap + Leaflet
- **State Management**: React Context + Custom Hooks

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd fooddelivery-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Firebase Setup

1. Create a new project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Create a Firestore database in test mode
4. Copy your Firebase config to `.env`

See [SETUP.md](./SETUP.md) for detailed instructions.

## Project Structure

```
src/
├── components/     # UI components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utilities
├── pages/          # Page components
│   ├── customer/   # Customer pages
│   ├── restaurant/ # Restaurant owner pages
│   └── driver/     # Driver pages
├── types/          # TypeScript types
└── App.tsx         # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Add environment variables

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | password |
| Restaurant | restaurant@demo.com | password |
| Driver | driver@demo.com | password |

## Screenshots

| Home | Restaurant | Cart | Tracking |
|------|------------|------|----------|
| ![Home](screenshot1.png) | ![Restaurant](screenshot2.png) | ![Cart](screenshot3.png) | ![Tracking](screenshot4.png) |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@fooddelivery.app or join our Slack channel.

---

Built with ❤️ using React, Firebase, and OpenStreetMap.
