# GolfGives — Golf Charity Subscription Platform

> Play golf. Win prizes. Change lives.

A full-stack subscription platform where golfers log Stableford scores, participate in monthly prize draws, and support their chosen charity with every subscription.

---

## 🗂 Project Structure

```
golf-charity-platform/
├── backend/                  # Node.js + Express + MongoDB
│   └── src/
│       ├── config/           # DB connection
│       ├── controllers/      # Route handlers (auth, scores, draws, payments, etc.)
│       ├── middleware/        # JWT auth, subscription guard, admin guard
│       ├── models/           # Mongoose schemas (User, Score, Draw, Winner, Charity, Donation)
│       ├── routes/           # Express routers
│       ├── services/         # Draw engine algorithm
│       ├── utils/            # Cron jobs, DB seed
│       └── server.js
└── frontend/                 # React + Vite + Tailwind CSS
    └── src/
        ├── components/       # Navbar, Footer, DashboardLayout, AdminLayout
        ├── context/          # AuthContext (global user state)
        ├── pages/
        │   ├── dashboard/    # Overview, Scores, Draw, Winnings, Charity, Profile, ProofUpload
        │   ├── admin/        # Dashboard, Users, Draws, Charities, Winners
        │   └── charity/      # CharitiesPage, CharityDetailPage
        ├── services/         # Axios API client
        └── styles/           # Global CSS + Tailwind
```

---

## ⚙️ Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB + Mongoose                  |
| Auth        | JWT (jsonwebtoken + bcryptjs)       |
| Payments    | Stripe (Checkout + Webhooks)        |
| Scheduling  | node-cron (monthly draw automation) |
| File Upload | Multer (proof screenshots)          |
| Charts      | Recharts                            |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Stripe account (test mode)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run seed        # Seeds admin user + 6 charities
npm run dev         # Starts on port 5000
```

**Backend `.env` values:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/golf-charity
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d

STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID=price_YOUR_YEARLY_PRICE_ID

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:3000

ADMIN_EMAIL=admin@golfcharity.com
ADMIN_PASSWORD=Admin@123456
```

---

### 2. Stripe Setup

1. Go to [stripe.com](https://stripe.com) and create a test account
2. Create two **Recurring prices** in your Stripe Dashboard:
   - Monthly: £9.99/month → copy the `price_xxx` ID → `STRIPE_MONTHLY_PRICE_ID`
   - Yearly: £99.99/year → copy the `price_xxx` ID → `STRIPE_YEARLY_PRICE_ID`
3. Set up a webhook endpoint pointing to `http://localhost:5000/api/payments/webhook`
4. Subscribe to events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`
6. For local webhook testing: install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
# Create a .env file:
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev         # Starts on port 3000
```

---

### 4. First Run

1. Visit `http://localhost:3000`
2. Register a new user account
3. Subscribe via Pricing page (use Stripe test card: `4242 4242 4242 4242`)
4. Log scores in the Dashboard
5. Admin panel: `http://localhost:3000/admin` — log in with admin credentials from `.env`

---

## 🗃 Database Schema

### Users
| Field | Type | Notes |
|-------|------|-------|
| name, email, password | String | Auth fields |
| role | `user` / `admin` | |
| subscription | Object | status, plan, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd |
| selectedCharity | ObjectId → Charity | |
| charityPercentage | Number | Min 10 |

### Scores
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | Unique per user |
| scores | Array (max 5) | { value 1–45, datePlayed, course, notes } |

### Draw
| Field | Type | Notes |
|-------|------|-------|
| month, year | Number | Unique compound index |
| winningNumbers | [Number] | 5 numbers drawn |
| prizePool | Object | total, fiveMatch, fourMatch, threeMatch |
| winners | Object | fiveMatch[], fourMatch[], threeMatch[] |
| jackpotCarriedForward | Boolean | |

### Winner
| Field | Type | Notes |
|-------|------|-------|
| user, draw | ObjectId refs | |
| matchType | `three` / `four` / `five` | |
| prizeAmount | Number | |
| verificationStatus | `pending` → `proof_submitted` → `approved` → `paid` | |
| proofFile | String | File path |
| bankDetails | Object | |

### Charity
| Field | Type | Notes |
|-------|------|-------|
| name, slug | String | slug is unique |
| description, shortDescription | String | |
| category | Enum | health, education, environment... |
| totalSubscribers, totalReceived | Number | Auto-managed |
| isFeatured | Boolean | |

---

## 🎮 Key Algorithms

### Score Rolling Logic
```
User adds new score
→ Prepend to scores array
→ If scores.length > 5: remove last element
→ Save — always max 5 entries, newest first
```

### Draw Engine (Random Mode)
```
Generate a Set of 5 unique numbers (1–45)
→ For each active subscriber:
   → Get their stored score values
   → Count how many are in the winning set
   → 5 matches = fiveMatch winner
   → 4 matches = fourMatch winner
   → 3 matches = threeMatch winner
```

### Draw Engine (Algorithmic Mode)
```
Aggregate all active subscriber scores
→ Count frequency of each value 1–45
→ Sort by frequency ascending (least common first)
→ Weight draw toward rarest 15 values
→ Select 5 from this weighted pool
```

### Prize Distribution
```
Prize Pool = 50% of total monthly subscriptions
fiveMatch pool  = prizePool × 0.40  (+ jackpot rollover if any)
fourMatch pool  = prizePool × 0.35
threeMatch pool = prizePool × 0.25

Per-person prize = tier pool ÷ number of winners in tier
```

---

## 🔐 Auth & Middleware

| Middleware | Purpose |
|-----------|---------|
| `protect` | Verifies JWT, attaches `req.user` |
| `adminOnly` | Allows only `role === 'admin'` |
| `requireSubscription` | Allows only `subscription.status === 'active'` |

---

## 📋 Testing Checklist

- [ ] User signup & login
- [ ] Subscription flow (monthly and yearly via Stripe)
- [ ] Score entry — 5-score rolling logic
- [ ] Score edit and delete
- [ ] Draw simulation (admin)
- [ ] Draw execution and publish (admin)
- [ ] Charity selection and percentage change
- [ ] Winner proof upload
- [ ] Admin winner approval / rejection
- [ ] Admin mark as paid
- [ ] User winnings page status tracking
- [ ] Admin user management (edit, deactivate)
- [ ] Admin charity CRUD
- [ ] Responsive design on mobile

---

## 🧩 Environment Variables Summary

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe price ID for monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | Stripe price ID for yearly plan |
| `FRONTEND_URL` | Your frontend origin (for CORS) |
| `ADMIN_EMAIL` | Admin account email (used in seed) |
| `ADMIN_PASSWORD` | Admin account password (used in seed) |

---

## 🚢 Deployment Notes

**Backend (Railway / Render / Heroku):**
- Set all env vars in your hosting dashboard
- Set `FRONTEND_URL` to your deployed frontend URL
- MongoDB: use MongoDB Atlas free tier

**Frontend (Vercel / Netlify):**
- Set `VITE_API_URL` to your deployed backend URL
- `npm run build` outputs to `dist/`

---

Built with ❤️ — Golf Charity Platform PRD by Digital Heroes
