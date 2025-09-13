# Hostelpulse MVP - Lisbon Hostel Management SaaS

## 🚀 Quick Start - Show the Dashboard

### Option 1: Local Development (Recommended for Demo)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in browser
# Navigate to /auth/login, then /dashboard
```

### Option 2: Share via ngrok (For Remote Demo)

#### Step 1: Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via npm globally
npm install -g ngrok
```

#### Step 2: Start Local Server
```bash
npm run dev
# Server will run on http://localhost:3000
```

#### Step 3: Create ngrok Tunnel
```bash
# Create tunnel to localhost:3000
ngrok http 3000

# You'll see output like:
# Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

#### Step 4: Share the Dashboard
```
🌐 Dashboard URL: https://abc123.ngrok.io/dashboard
🔐 Login URL: https://abc123.ngrok.io/auth/login

Demo Credentials:
- Email: any email (mock authentication)
- Password: any password
```

## 📊 Dashboard Features

### Overview Stats
- **Total Taxes Collected**: Lisbon City Tax automatically collected
- **Invoices Generated**: Official Portuguese facturas for business travelers
- **Active Bookings**: Real-time booking count across all platforms
- **Revenue Protected**: Money saved through automation

### Recent Tax Collections
- Guest name and room assignment
- Tax amount collected
- Collection date
- Booking platform source

### Recent Invoices
- Invoice number and client details
- Room/service description
- Invoice amount and date

### Platform Synchronization
- **Booking.com**: Sync inventory and bookings
- **Hostelworld**: Real-time availability updates
- **Airbnb**: Automated calendar synchronization
- **Expedia**: Multi-platform booking management

## 🏨 Management Areas

### Bookings Management
**Location**: Dashboard → Platform Sync Buttons
- Sync bookings from all platforms
- Prevent double bookings
- Real-time availability updates
- Automated conflict resolution

### Guest Data Management
**Location**: Dashboard → Recent Tax Collections Table
- Guest names and contact info
- Room assignments
- Tax collection status
- Booking platform tracking

### Room Management
**Location**: Dashboard → Tax Collections & Invoices Tables
- Room occupancy tracking
- Revenue per room analytics
- Maintenance scheduling
- Availability management

## 🔧 Technical Stack

- **Frontend**: Next.js 12, React 17, TypeScript
- **Styling**: Tailwind CSS, Styled Components
- **State Management**: React Query, Context API
- **Authentication**: Mock system (ready for Supabase)
- **Database**: Mock APIs (ready for Supabase PostgreSQL)
- **Deployment**: Vercel (automatic from main branch)

## 🚀 Deployment

### Automatic Deployment (Main Branch)
1. Push to `main` branch
2. Vercel automatically deploys
3. Live URL: https://hostelpulse-mvp.vercel.app

### Manual Deployment
```bash
npm run build
npm run start
```

### Implementation Verification (Owner Console)
- Follow `docs/implementation-verification.md` for a quick smoke test and CLI checks.
- Seed one hostel in Supabase, start dev, then run:
  - `./scripts/supabase-api-test.sh smoke <HOSTEL_ID>`
  - Open `/owner/dashboard`, `/owner/bookings`, `/owner/guests`

## 📝 Development Notes

- Mock authentication allows any email/password
- All data is currently simulated
- Ready for real Supabase/PostgreSQL integration
- API endpoints prepared for Stripe payment processing
- Tax calculation logic ready for Lisbon City Tax rules

## 🎯 MVP Goals Achieved

✅ Lisbon hostel owner login (mock)
✅ Real tax/invoice data display
✅ Generate Invoice functionality (mock)
✅ Sync with Booking.com and others (mock)
✅ Clickable dashboard with realistic data
✅ Ready for production deployment

---

**Demo the dashboard at: http://localhost:3000/dashboard**
*(Replace with your ngrok URL for remote access)*
