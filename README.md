# HouseHunt 🏠 – Premium House Rental MERN Platform

HouseHunt is a production-grade, highly polished House Rental Platform built with the **MERN (MongoDB, Express, React, Node.js) Stack**. The application matches modern SaaS platforms like Airbnb and NoBroker in appearance and includes key corporate features: role-based access management, light/dark theme toggles, and email verification.

---

## Key Features

1. **Google Mail OTP Verification**: Active email verification upon registration. Codes are sent dynamically to the user's email.
2. **Sun & Moon Theme Layouts**: A responsive layout with quick Dark and Light toggles, designed with glassmorphic cards and typography.
3. **Role-Based Access Control**:
   - **Tenants**: Explore listings, search by price, location, bedrooms, bathrooms, and request bookings.
   - **Owners**: Full CRUD controls on house listings, upload multiple photos, and approve or reject lease requests.
   - **Admins**: Platform aggregate statistics panel, audit listed properties, list and delete users.
4. **Interactive Filters**: Dynamic city, rent, property type, bed/bath size search index.

---

## Folder Structure

```
HouseHunt
├── backend
│   ├── config
│   │   └── connect.js          # Mongoose DB connector
│   ├── controllers
│   │   ├── adminController.js  # Moderation & aggregate stats
│   │   ├── ownerController.js  # House CRUD & image uploads
│   │   └── userController.js   # Auth, profiles & tenant lease booking
│   ├── middlewares
│   │   └── authMiddleware.js   # JWT token role validator
│   ├── models
│   │   ├── BookingSchema.js    # Lease schedules
│   │   ├── OTPSchema.js        # Gmail verification codes
│   │   ├── PropertySchema.js   # House inventory
│   │   └── UserSchema.js       # User profiles
│   ├── routes
│   │   ├── adminRoutes.js
│   │   ├── ownerRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/                # Property photo storage
│   ├── .env
│   ├── index.js                # Express app launcher
│   └── package.json
│
└── frontend
    ├── src
    │   ├── modules
    │   │   ├── admin
    │   │   │   ├── AdminHome.jsx
    │   │   │   ├── AllBookings.jsx
    │   │   │   ├── AllProperty.jsx
    │   │   │   └── AllUsers.jsx
    │   │   ├── common
    │   │   │   ├── ForgotPassword.jsx
    │   │   │   ├── Home.jsx
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx
    │   │   │   └── Toast.jsx
    │   │   └── user
    │   │       ├── owner
    │   │       │   ├── AddProperty.jsx
    │   │       │   ├── AllBookings.jsx
    │   │       │   ├── AllProperties.jsx
    │   │       │   └── OwnerHome.jsx
    │   │       ├── renter
    │   │       │   ├── AllProperties.jsx
    │   │       │   └── RenterHome.jsx
    │   │       └── AllPropertiesCards.jsx
    │   ├── App.css
    │   ├── App.jsx             # React router and contexts
    │   ├── index.css           # Global themes & CSS tokens
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Gmail account with **App Passwords** enabled (required if using real SMTP)

### 1. Setup Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the template:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/househunt
   JWT_SECRET=supersecretkey_househunt_12345_secure
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   FRONTEND_URL=http://localhost:5173
   ```
   > [!NOTE]
   > If `EMAIL_USER` and `EMAIL_PASS` are left empty, the server automatically falls back to **Console Simulation Mode**. In this mode, verification codes are logged directly to the server terminal, letting you test registration immediately without SMTP setup.

4. Start the server:
   ```bash
   npm run start
   # Or for development with nodemon:
   npm run dev
   ```

### 2. Setup Frontend Client
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Run the development build:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## Backend API Endpoints Documentation

### User / Tenant APIs (`/api/users`)
- `POST /send-otp` - Generates a 6-digit random code and dispatches it via nodemailer.
- `POST /register` - Registers a verified user profile (verifies OTP).
- `POST /login` - Issues a JWT token on success.
- `GET /profile` - Fetches authenticated user profile details.
- `PUT /profile` - Edits user name, phone, city, or updates password (handles profile photos).
- `GET /properties` - Searches all available properties with filters.
- `POST /bookings` - Request a lease booking (Tenant role only).
- `GET /bookings` - Lists lease bookings history (Tenant role only).

### Owner APIs (`/api/owners`)
- `POST /properties` - Adds a property listing with multiple photos.
- `GET /properties` - Lists properties listed by the owner.
- `PUT /properties/:id` - Edits property details and status.
- `DELETE /properties/:id` - Deletes property and its associated bookings.
- `GET /bookings` - Lists all bookings requests received.
- `PUT /bookings/status` - Approves (`Approved`) or rejects (`Rejected`) requests.

### Admin APIs (`/api/admins`)
- `GET /stats` - Returns site statistics (occupancies, roles, revenue).
- `GET /users` - Lists all registered users.
- `DELETE /users/:id` - Deletes user accounts.
- `GET /properties` - Audits all properties on the site.
- `DELETE /properties/:id` - Removes properties.
- `PUT /approve-owner` - Verifies or toggles owner credentials.
