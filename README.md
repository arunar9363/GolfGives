<div align="center">

<br/>

<!-- GolfGives App Logo — matches the Heart icon used in Navbar/Sidebar -->
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <rect width="72" height="72" rx="18" fill="#22c55e"/>
  <path d="M36 52s-18-11.5-18-24a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 12.5-18 24-18 24z" fill="white"/>
</svg>

<br/><br/>

# GolfGives

### Play Golf. Win Prizes. Change Lives.

A full-stack subscription platform where golfers log Stableford scores,  
participate in monthly prize draws, and support their chosen charity —  
all with every subscription.

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

[🚀 Live Demo](https://golf-charity-frontend.onrender.com) · [🐛 Report Bug](https://github.com/your-username/golf-charity-platform/issues) · [💡 Request Feature](https://github.com/your-username/golf-charity-platform/issues)

<br/>

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Key Algorithms](#-key-algorithms)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About The Project

**GolfGives** is a subscription-based web application that combines golf performance tracking, monthly prize draws, and charitable giving into one seamless platform.

Users subscribe monthly or yearly, log their last 5 Stableford golf scores, and automatically participate in a monthly draw. Match 3, 4, or all 5 drawn numbers and win a share of the prize pool — while a portion of every subscription goes directly to a charity of their choice.

> Built as a trainee assignment for **Digital Heroes** (digitalheroes.co.in) — a premium full-stack development agency.

---

## ✨ Features

### 👤 User Features
- 🔐 **JWT Authentication** — Secure signup, login, and session management
- 💳 **Stripe Subscriptions** — Monthly (₹999) and Yearly (₹9,999) plans
- ⛳ **Score Tracking** — Log up to 5 Stableford scores (1–45), rolling logic
- 🎯 **Monthly Draw** — Automatic participation, real-time results
- 🏆 **Prize Claiming** — Proof upload, bank/UPI details, status tracking
- ❤️ **Charity Selection** — Choose from 10+ verified charities, set contribution %
- 🌙 **Light / Dark Mode** — Full theme toggle, saved to localStorage

### 🛡️ Admin Features
- 📊 **Dashboard** — Real-time stats, revenue estimates, user growth charts
- 👥 **User Management** — View, edit, activate/deactivate accounts
- 🎰 **Draw Engine** — Random or algorithmic draw, simulation mode, publish results
- 🏥 **Charity Management** — Full CRUD, featured charity control
- ✅ **Winner Verification** — Review proofs, approve/reject, mark as paid
- 📈 **Reports** — Charity donation totals, subscriber analytics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Payments** | Stripe (Checkout Sessions + Webhooks) |
| **Scheduling** | node-cron (auto monthly draw) |
| **File Upload** | Multer (winner proof screenshots) |
| **Charts** | Recharts |
| **Deployment** | Render (backend) + Render Static (frontend) |

---

## 📁 Project Structure

```
golf-charity-platform/
├── 📂 backend/
│   └── src/
│       ├── config/
│       │   └── db.js                 # MongoDB connection
│       ├── controllers/
│       │   ├── authController.js     # Register, login, me
│       │   ├── scoreController.js    # Rolling 5-score logic
│       │   ├── drawController.js     # Draw results & participation
│       │   ├── paymentController.js  # Stripe checkout + webhooks
│       │   ├── charityController.js  # Charity CRUD + selection
│       │   ├── winnerController.js   # Proof upload + verification
│       │   └── adminController.js    # Admin stats + user management
│       ├── middleware/
│       │   └── auth.js               # protect, adminOnly, requireSubscription
│       ├── models/
│       │   ├── User.js               # Auth + subscription + charity preference
│       │   ├── Score.js              # Rolling 5-score array
│       │   ├── Draw.js               # Monthly draw + winners + prize pool
│       │   ├── Winner.js             # Verification workflow
│       │   ├── Charity.js            # Charity profiles
│       │   └── Donation.js           # Charity contribution tracking
│       ├── routes/
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── scores.js
│       │   ├── payments.js
│       │   ├── draws.js
│       │   ├── charities.js
│       │   ├── winners.js
│       │   └── admin.js
│       ├── services/
│       │   └── drawEngine.js         # ⭐ Core draw algorithm
│       ├── utils/
│       │   ├── cronJobs.js           # Monthly auto-draw scheduler
│       │   └── seed.js               # Initial data seeding
│       └── server.js
│
└── 📂 frontend/
    └── src/
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── DashboardLayout.jsx
        │   │   └── AdminLayout.jsx
        │   └── ui/
        │       └── ThemeToggle.jsx    # Sun/Moon animated toggle
        ├── context/
        │   ├── AuthContext.jsx        # Global user state
        │   └── ThemeContext.jsx       # Light/Dark mode state
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── PricingPage.jsx
        │   ├── HowItWorksPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── charity/
        │   │   ├── CharitiesPage.jsx
        │   │   └── CharityDetailPage.jsx
        │   ├── dashboard/
        │   │   ├── DashboardOverview.jsx
        │   │   ├── ScoresPage.jsx
        │   │   ├── DrawPage.jsx
        │   │   ├── WinningsPage.jsx
        │   │   ├── CharitySelectionPage.jsx
        │   │   ├── ProfilePage.jsx
        │   │   └── ProofUploadPageComponent.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminUsers.jsx
        │       ├── AdminDraws.jsx
        │       ├── AdminCharities.jsx
        │       └── AdminWinners.jsx
        ├── services/
        │   └── api.js                 # Axios instance + interceptors
        └── styles/
            └── index.css              # CSS variables + Tailwind
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [Atlas](https://mongodb.com/atlas))
- Stripe account (free test mode)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run seed        # Seeds admin user + 6 charities
npm run dev         # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev         # Starts on http://localhost:3000
```

### 4. First Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@golfcharity.com` | `Admin@123456` |
| User | Register at `/register` | — |

> 💳 **Test Stripe Card:** `4242 4242 4242 4242` · Any future expiry · Any CVV

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/golf-charity

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxxxxxxxxxxxxx

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000

# Admin seed credentials
ADMIN_EMAIL=admin@golfcharity.com
ADMIN_PASSWORD=Admin@123456
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### How to get Stripe keys

1. Sign up at [stripe.com](https://stripe.com)
2. **Secret Key** → Dashboard → Developers → API Keys → Secret key
3. **Price IDs** → Dashboard → Product Catalog → Create 2 products:
   - Monthly: ₹999/month recurring
   - Yearly: ₹9,999/year recurring
4. **Webhook Secret** → Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## 🗃️ Database Schema

### Users
```javascript
{
  name, email, password,
  role: 'user' | 'admin',
  subscription: {
    status: 'active' | 'inactive' | 'cancelled' | 'past_due',
    plan: 'monthly' | 'yearly',
    stripeCustomerId, stripeSubscriptionId,
    currentPeriodEnd, cancelAtPeriodEnd
  },
  selectedCharity: ObjectId → Charity,
  charityPercentage: Number (min: 10)
}
```

### Scores
```javascript
{
  user: ObjectId → User,
  scores: [{ value: 1-45, datePlayed, course, notes }],  // max 5
  lastUpdated: Date
}
```

### Draw
```javascript
{
  month, year,               // unique compound index
  drawType: 'random' | 'algorithmic',
  status: 'pending' | 'published',
  winningNumbers: [Number],  // 5 numbers
  prizePool: { total, fiveMatch, fourMatch, threeMatch, jackpotRollover },
  winners: { fiveMatch: [], fourMatch: [], threeMatch: [] },
  jackpotCarriedForward: Boolean
}
```

### Winner
```javascript
{
  user, draw,
  matchType: 'three' | 'four' | 'five',
  prizeAmount: Number,
  verificationStatus: 'pending' → 'proof_submitted' → 'approved' → 'paid',
  proofFile, bankDetails: { accountName, accountNumber, ifscCode, upiId }
}
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | 🔒 |
| PUT | `/api/auth/change-password` | Change password | 🔒 |

### Scores
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/scores/my` | Get my scores | 🔒 Subscriber |
| POST | `/api/scores/add` | Add new score | 🔒 Subscriber |
| PUT | `/api/scores/:id` | Edit score | 🔒 Subscriber |
| DELETE | `/api/scores/:id` | Delete score | 🔒 Subscriber |

### Draws
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/draws` | All published draws | Public |
| GET | `/api/draws/latest` | Latest draw | Public |
| GET | `/api/draws/user/participation` | My draw history | 🔒 Subscriber |
| POST | `/api/draws/simulate` | Simulate draw | 🔒 Admin |
| POST | `/api/draws/execute` | Run & publish draw | 🔒 Admin |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-checkout` | Stripe checkout | 🔒 |
| POST | `/api/payments/cancel` | Cancel subscription | 🔒 |
| GET | `/api/payments/portal` | Billing portal link | 🔒 |
| POST | `/api/payments/webhook` | Stripe webhook | Stripe |

### Charities
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/charities` | List all charities | Public |
| GET | `/api/charities/:slug` | Charity detail | Public |
| PUT | `/api/charities/select` | Select charity | 🔒 |
| POST | `/api/charities` | Create charity | 🔒 Admin |
| PUT | `/api/charities/:id` | Update charity | 🔒 Admin |
| DELETE | `/api/charities/:id` | Deactivate charity | 🔒 Admin |

### Winners
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/winners/my` | My winnings | 🔒 |
| POST | `/api/winners/:id/upload-proof` | Upload proof | 🔒 |
| PUT | `/api/winners/:id/bank-details` | Save bank/UPI | 🔒 |
| GET | `/api/winners` | All winners | 🔒 Admin |
| PUT | `/api/winners/:id/review` | Approve/Reject | 🔒 Admin |
| PUT | `/api/winners/:id/mark-paid` | Mark paid | 🔒 Admin |

---

## ⚙️ Key Algorithms

### Score Rolling Logic
```
User adds new score
→ Prepend to scores array (unshift)
→ If scores.length > 5 → slice to first 5
→ Always newest first, max 5 entries
```

### Draw Engine — Random Mode
```
Generate Set of 5 unique numbers (1–45)
→ For each active subscriber:
   → Get stored score values
   → Intersect with winning numbers
   → 5 matches = jackpot winner
   → 4 matches = tier 2 winner
   → 3 matches = tier 3 winner
```

### Draw Engine — Algorithmic Mode
```
Aggregate all subscriber scores
→ Count frequency of each value (1–45)
→ Sort ascending (least common first)
→ Pick from rarest 15 values (weighted random)
→ Lower hit probability = prize sustainability
```

### Prize Distribution
```
Prize Pool = 50% of total monthly subscriptions
─────────────────────────────────────────────
5-Match pool  = Prize Pool × 0.40  + jackpot rollover
4-Match pool  = Prize Pool × 0.35
3-Match pool  = Prize Pool × 0.25
─────────────────────────────────────────────
Per-person prize = tier pool ÷ winners in tier
If no 5-match winner → jackpot carries to next month
```

---

## 🚢 Deployment

### Deploy to Render (Recommended — Free Tier)

**Backend:**
1. Render → New → Web Service → GitHub repo
2. Root Dir: `backend` | Build: `npm install` | Start: `node src/server.js`
3. Add all environment variables
4. Deploy → note your URL

**Frontend:**
1. Render → New → Static Site → Same repo
2. Root Dir: `frontend` | Build: `npm install && npm run build` | Publish: `dist`
3. Add `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

**After Deploy:**
```bash
# Run seed via Render Shell tab
node src/utils/seed.js
```

### Auto-Redeploy
Push to `main` branch → Render automatically redeploys both services.

```bash
git add .
git commit -m "your changes"
git push
```

> ⚠️ **Free tier:** Backend sleeps after 15min inactivity. First request may take ~30s.

---

## 🧪 Testing Checklist

- [x] User signup & login
- [x] Subscription flow (monthly & yearly via Stripe)
- [x] Score entry — 5-score rolling logic
- [x] Score edit and delete
- [x] Draw simulation (admin)
- [x] Draw execution and publish (admin)
- [x] Charity selection and % change
- [x] Winner proof upload
- [x] Admin winner approval / rejection
- [x] Admin mark as paid
- [x] User winnings page status tracking
- [x] Admin user management
- [x] Admin charity CRUD
- [x] Light / Dark mode toggle
- [x] Responsive design on mobile

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [Digital Heroes](https://digitalheroes.co.in) — Project brief and PRD
- [Stripe](https://stripe.com) — Payment infrastructure
- [Unsplash](https://unsplash.com) — Charity imagery
- [Lucide React](https://lucide.dev) — Icon library
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Recharts](https://recharts.org) — Admin analytics charts

---

<div align="center">

Made with ❤️ for a better world

**[⬆ Back to top](#-golfgives)**

</div>