# FOODSWIFT – Online Food Delivery Platform (MERN Stack)
> **"Your Favourite Food, Delivered Fast."**  
> Focused on Salem, Tamil Nadu, India — Built with React (Vite), Node.js, Express, MongoDB & Socket.IO.

---

## 🌟 Executive Summary

**FOODSWIFT** is a complete, modern, production-grade food delivery web platform inspired by industry benchmarks like Swiggy and Zomato. Specifically customized for **Salem, Tamil Nadu, India**, FOODSWIFT features a database of **210+ verified Salem restaurants** across key localities (Fairlands, Suramangalam, Alagapuram, Meyyanur, Gugai, Seelanaickenpatti, Hasthampatti, Ammapet, Shevapet) and a food catalogue containing over **2,520 curated menu items** (1,410+ Vegetarian and 1,110+ Non-Vegetarian).

Every button, form, filter, cart workflow, checkout option, live Leaflet map tracking, and role-based portal (Customer, Restaurant Partner, Delivery Partner, Admin) is implemented and fully operational.

---

## 📦 Project Directory Structure

```text
foodswift/
├── client/                         # React Frontend (Vite + Tailwind CSS)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx          # Salem location selector, search, cart, auth
│   │   │   ├── Footer.jsx          # Salem coverage, policy & links
│   │   │   ├── MobileBottomNav.jsx # Mobile navigation bar
│   │   │   ├── RestaurantCard.jsx  # Restaurant card with offers, ratings, ETA
│   │   │   ├── FoodItemCard.jsx    # Dish card with portion customizer & +/- stepper
│   │   │   ├── CartDrawer.jsx      # Slide-over cart drawer with price breakdown
│   │   │   ├── LocationModal.jsx   # Salem neighborhood picker
│   │   │   ├── AuthModal.jsx       # Login, register & 1-click demo accounts
│   │   │   ├── ConflictModal.jsx   # Single-restaurant cart conflict handler
│   │   │   └── RatingModal.jsx     # Star rating & review submission
│   │   ├── context/                # Global React Context state
│   │   │   ├── AuthContext.jsx     # Session & user roles
│   │   │   ├── LocationContext.jsx # Salem locality management
│   │   │   └── CartContext.jsx     # Cart state & server sync
│   │   ├── pages/                  # Application views
│   │   │   ├── HomePage.jsx        # Landing page with hero & Salem specials
│   │   │   ├── RestaurantListingPage.jsx # Salem directory with filters & sort
│   │   │   ├── RestaurantDetailsPage.jsx # Restaurant menu & category tabs
│   │   │   ├── FoodSearchPage.jsx  # Live search with debounced suggestions
│   │   │   ├── CheckoutPage.jsx    # Address picker, instructions, COD & Razorpay
│   │   │   ├── OrderTrackingPage.jsx # Leaflet Salem map & Socket.IO timeline
│   │   │   ├── UserAccountPage.jsx # Order history, saved addresses, profile
│   │   │   ├── RestaurantDashboard.jsx # Partner kitchen portal & inventory
│   │   │   ├── DeliveryDashboard.jsx   # Rider online toggle, pickup & COD collection
│   │   │   └── AdminDashboard.jsx  # Governance metrics, restaurant moderation & coupons
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with JWT interceptors
│   │   ├── App.jsx                 # Client routes
│   │   ├── main.jsx                # React DOM render entry
│   │   └── index.css               # Tailwind directives & map styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                         # Express.js REST API & Sockets
│   ├── config/
│   │   └── db.js                   # Mongoose connection with MongoMemoryServer fallback
│   ├── controllers/                # Business logic controllers
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── foodController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── couponController.js
│   │   ├── addressController.js
│   │   ├── reviewController.js
│   │   ├── deliveryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & role authorization
│   │   └── errorHandler.js         # Centralized error handler
│   ├── models/                     # 18 Mongoose Schemas
│   │   ├── User.js
│   │   ├── Address.js
│   │   ├── Restaurant.js
│   │   ├── RestaurantBranch.js
│   │   ├── FoodCategory.js
│   │   ├── FoodItem.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Refund.js
│   │   ├── Coupon.js
│   │   ├── CouponRedemption.js
│   │   ├── Review.js
│   │   ├── DeliveryPartner.js
│   │   ├── Notification.js
│   │   ├── SupportTicket.js
│   │   ├── RestaurantSettlement.js
│   │   └── AuditLog.js
│   ├── routes/                     # API routes versioned under /api/v1
│   ├── sockets/
│   │   └── orderSocket.js          # Socket.IO live order room broadcaster
│   ├── utils/
│   │   ├── jwt.js                  # Token generator & verifier
│   │   └── orderCalculations.js    # Strict server-side bill recalculation
│   ├── seeds/
│   │   └── restaurants.seed.js     # Seeds 210 Salem restaurants & 2,520 dishes
│   ├── tests/
│   │   └── api.test.js             # Automated Jest & Supertest integration suite
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # HTTP server & Socket.IO listener
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json                    # Root package with concurrent run scripts
└── README.md
```

---

## 🚀 How to Run the Project Locally

### Step 1: Clone or Navigate to the Project Folder
```bash
cd "C:\Users\acer\.gemini\antigravity\scratch\foodswift"
```

### Step 2: Install All Dependencies
Run the root helper command which installs packages for root, backend, and frontend:
```bash
npm run install:all
```
*(Or install manually: `npm install`, `cd server && npm install`, `cd ../client && npm install --legacy-peer-deps`)*

### Step 3: Populate Database Seed Data
Run the high-capacity seeder script:
```bash
npm run seed
```
This automatically seeds:
- **210 Salem Restaurants** (including Domino's Suramangalam, Pizza Hut Alagapuram, Barbequeen Fairlands/Seelanaickenpatti, Selvi Mess, Rasikas, Sri Saravana Bhavan's Aasai Dosai, Cream Centre, HK Salem Special Thattuvadai Set, etc.)
- **2,520 Verified Food Dishes** (1,410+ Veg and 1,110+ Non-Veg)
- **4 Demo Accounts** with pre-configured roles
- **4 Active Promo Coupons** (`WELCOME50`, `FOODSWIFT10`, `SALEM20`, `FREEDELIVERY`)

### Step 4: Run the Backend & Frontend Concurrently
```bash
npm run dev
```

- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Step 5: Run Automated Tests
```bash
npm test
```
Runs the 12-point Jest & Supertest test suite validating authentication, search, cart recalculations, coupon limits, order placement, and admin routes.

---

## 🔑 Pre-Configured Demo Accounts

Use these credentials to sign in, or click any of the **1-Click Demo Login** buttons inside the Sign In modal:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@foodswift.com` | `customerpassword123` | Cart, Orders, Checkout, Address book, Rating |
| **Admin** | `admin@foodswift.com` | `adminpassword123` | Platform analytics, Restaurant approval, Coupons |
| **Restaurant Partner** | `partner@foodswift.com` | `partnerpassword123` | Kitchen orders, Status updates, Menu inventory |
| **Delivery Rider** | `delivery@foodswift.com` | `deliverypassword123` | Online/Offline, Pickups, COD collection, Earnings |

---

## 💳 Payment Options & Razorpay Integration

1. **Cash on Delivery (COD):**
   - Customer places order with zero online payment.
   - Status transitions to `placed`. Delivery rider records cash collection upon arrival.
2. **Razorpay Online Payments (UPI / Card / NetBanking):**
   - Integrates official Razorpay Checkout SDK.
   - **Test Simulator Mode:** If custom live Razorpay credentials are not provided in `.env`, FoodSwift automatically switches to its built-in development payment simulator, generating real verified orders and status transitions smoothly.
   - **Production Activation:** Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env` and `VITE_RAZORPAY_KEY_ID` in `client/.env`.

---

## 📡 Core API Endpoints (`/api/v1`)

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register customer or partner |
| **Auth** | `POST` | `/api/v1/auth/login` | Login with JWT cookie/bearer |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch active user session |
| **Restaurants** | `GET` | `/api/v1/restaurants` | List restaurants (locality, veg, rating, sort) |
| **Restaurants** | `GET` | `/api/v1/restaurants/:id` | Single restaurant info |
| **Restaurants** | `GET` | `/api/v1/restaurants/:id/menu` | Categorized dishes with add-ons |
| **Food Items** | `GET` | `/api/v1/foods/search` | Search dishes by name or category |
| **Cart** | `GET` | `/api/v1/cart` | Get cart with server recalculated totals |
| **Cart** | `POST` | `/api/v1/cart/items` | Add item (with single restaurant check) |
| **Orders** | `POST` | `/api/v1/orders` | Place verified order (COD / Online) |
| **Orders** | `GET` | `/api/v1/orders/my-orders` | Customer order history |
| **Orders** | `PATCH` | `/api/v1/orders/:id/cancel` | Cancel order within policy |
| **Payments** | `POST` | `/api/v1/payments/create-order` | Create Razorpay order |
| **Payments** | `POST` | `/api/v1/payments/verify` | Verify HMAC payment signature |
| **Coupons** | `POST` | `/api/v1/coupons/validate` | Validate promo code on server |
| **Reviews** | `POST` | `/api/v1/reviews` | Submit verified customer rating |
| **Delivery** | `PATCH` | `/api/v1/delivery/orders/:id/status`| Update delivery status & collect COD |
| **Admin** | `GET` | `/api/v1/admin/stats` | Platform analytics & revenue |

---

## 🌐 Deployment Guidelines

- **Database:** MongoDB Atlas M0 cluster or hosted instance. Paste URI into `MONGODB_URI`.
- **Backend (Render / Railway):**
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node server.js`
  - Add environment variables from `server/.env.example`.
- **Frontend (Vercel / Netlify):**
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Set `VITE_API_BASE_URL` to your production backend URL.
