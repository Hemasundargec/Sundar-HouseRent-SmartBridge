# HouseHunt – Complete MERN Stack House Rental Platform
## Project Documentation

---

### 1. Introduction
* **Project Title**: **HouseHunt** – A premium, production-quality MERN Stack House Rental Platform.
* **Team Members**:
  - **Hemasundararao Meesala** (Lead MERN Developer, Security Architect, & UI/UX Designer)
  - **Dona Sri Divya Nerusu** (Team Lead)
  - **Rajani Meesala** (Member)
  - **Harshitha Nulu** (Member)
  - **Varshitha Nagadasi** (Member)

---

### 2. Project Overview
* **Purpose**: 
  HouseHunt is designed to streamline home rental listings and lease management in India's major metropolitan areas. The application implements a decentralized **Tenant-to-Owner role progression model**, where verified tenant listings upgrade the user account to an Owner role upon admin verification.
* **Key Features**:
  - **Secure Authentication & Registration**: Uses custom JWT tokens, password hashing, and **Google Mail OTP (One-Time Password) Verification** with automatic database expiry.
  - **Premium UI/UX layout**: Modern, glassmorphic layout system with a split-hero banner, top horizontal filter bar, and a responsive grid of property cards.
  - **Dual Light/Dark (Sun & Moon) Themes**: High-contrast styles that adapt to light and dark modes.
  - **Flexible Booking Flow**: Owners can list properties and also book listings from other owners. Self-booking protection blocks them from booking their own listings.
  - **List Your Property Form**: Allows tenants to publish new listings with multi-image uploads.
  - **Admin Audit Panel**: Enables administrators to review pending submissions, activate properties, delete users/listings, and view server statistics.

---

### 3. Architecture

The application is built using a decoupled MERN stack architecture:

```
┌────────────────────────────────────────────────────────┐
│               React.js Frontend (Vite)                 │
│   (Bootstrap 5, Material-UI, Glassmorphic variables)   │
└───────────┬────────────────────────────────┬───────────┘
            │ (REST API Requests)            │ (Static images)
            ▼                                ▼
┌────────────────────────────────────────────────────────┐
│            Express.js Node.js Backend API              │
│  (JWT Auth, Multer Multi-Uploads, Mail Verification)   │
└───────────────────────────┬────────────────────────────┘
                            ▼ (Mongoose ODM)
┌────────────────────────────────────────────────────────┐
│                     MongoDB Database                   │
│        (Users, Properties, Bookings, OTPs)             │
└────────────────────────────────────────────────────────┘
```

#### A. Frontend (React client)
* Built on top of **Vite** for fast hot-module replacement (HMR).
* Styled using **Vanilla CSS Custom Properties (variables)** for theme states (`[data-theme='dark']` and `:root`) and **Bootstrap 5** for grid responsiveness.
* Features a shared context/parent state for authentication tracking and temporary feedback notifications (Toast messages).
* Uses Vite proxy settings in `vite.config.js` to forward `/api` and `/uploads` requests directly to the backend.

#### B. Backend (Node.js Server)
* Developed using **Express.js** API endpoints.
* Handles file uploads securely using **Multer** storage engines (profile avatars and property image arrays).
* Features role verification middlewares (`verifyRole`) that restrict endpoints to `Admin`, `Owner`, or `Tenant` users.
* Integrates **Nodemailer** SMTP for email verification, including a terminal fallback simulator for easy developer testing.

#### C. Database (MongoDB + Mongoose Schemas)
* **Users (`UserSchema`)**: Holds registration info, hashed passwords, roles (`Tenant`, `Owner`, `Admin`), verification flag, and profile photos.
* **Properties (`PropertySchema`)**: Holds house titles, descriptions, address, city, state, rent pricing, bedrooms, bathrooms, amenities array, image paths, and verification status (`Pending`, `Available`, `Booked`, `Inactive`).
* **Bookings (`BookingSchema`)**: Connects property IDs and tenant IDs with start/end lease dates and status (`Pending`, `Approved`, `Rejected`).
* **OTPs (`OTPSchema`)**: Holds active authentication codes mapped to user emails. Includes a 5-minute TTL index for automatic document deletion.

---

### 4. Setup Instructions

#### Prerequisites
- **Node.js** (v16.0.0 or higher recommended)
- **npm** (Node Package Manager)
- **MongoDB Community Server** running locally on default port `27017`

#### Installation
1. **Clone or Extract** the project files to your directory.
2. **Setup Environment Variables**:
   Create a `.env` file inside the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/househunt
   JWT_SECRET=super_secret_jwt_token_key_98765
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
   *(Note: If `EMAIL_USER` and `EMAIL_PASS` are left empty, the server defaults to simulated OTP testing mode and logs OTP codes directly to the terminal console).*

3. **Install Dependencies**:
   - For backend server:
     ```bash
     cd backend
     npm install
     ```
   - For frontend client:
     ```bash
     cd ../frontend
     npm install
     ```

---

### 5. Folder Structure

```
HouseHunt/
├── backend/
│   ├── config/
│   │   └── connect.js          # MongoDB connection and database seeding logic
│   ├── controllers/
│   │   ├── adminController.js  # Stats, audits, user deletion logic
│   │   ├── ownerController.js  # Landlord listings & lease status handlers
│   │   └── userController.js   # Auth, booking, browsing controllers
│   ├── middlewares/
│   │   └── authMiddleware.js   # Token validations and role-guard middlewares
│   ├── models/
│   │   ├── BookingSchema.js    # Lease bookings model
│   │   ├── OTPSchema.js        # OTP validation token schema (5-minute TTL)
│   │   ├── PropertySchema.js   # House details model
│   │   └── UserSchema.js       # User profiles model
│   ├── routes/
│   │   ├── adminRoutes.js      # Moderation endpoints mapping
│   │   ├── ownerRoutes.js      # Landlord endpoints mapping
│   │   └── userRoutes.js       # Public and Renter endpoints mapping
│   ├── uploads/                # Stores uploaded images (profile & house photos)
│   ├── index.js                # App entry launcher script
│   └── package.json            # Backend dependency mappings
│
└── frontend/
    ├── public/                 # Static public files
    ├── src/
    │   ├── modules/
    │   │   ├── admin/
    │   │   │   ├── AdminHome.jsx   # Metrics board view
    │   │   │   ├── AllBookings.jsx # Lease records audit list
    │   │   │   ├── AllProperty.jsx # Houses verification and delete controls
    │   │   │   └── AllUsers.jsx    # User role review table
    │   │   ├── common/
    │   │   │   ├── ForgotPassword.jsx
    │   │   │   ├── Home.jsx        # Redesigned Split-Hero search page
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx    # Signup OTP verification screen
    │   │   │   └── Toast.jsx       # Alert helper component
    │   │   └── user/
    │   │       ├── owner/
    │   │       │   ├── AddProperty.jsx  # Property submission screen
    │   │       │   ├── AllBookings.jsx  # Booking requests history
    │   │       │   ├── AllProperties.jsx# Listing updates list
    │   │       │   └── OwnerHome.jsx    # Landlord hub with placed bookings
    │   │       ├── renter/
    │   │       │   ├── AllProperties.jsx# Houses browser
    │   │       │   └── RenterHome.jsx   # Tenant Hub (forms & submissions status)
    │   │       └── AllPropertiesCards.jsx # Listing cards layout
    │   ├── App.css
    │   ├── App.jsx             # Routes declaration and Global state manager
    │   ├── index.css           # Global Theme CSS system and variables
    │   └── main.jsx
    ├── vite.config.js          # Vite config & API/Uploads proxy settings
    └── package.json            # Frontend dependency mappings
```

---

### 6. Running the Application

To launch both backend and frontend servers:

* **Backend Server**:
  Navigate to the `backend` folder and run:
  ```bash
  npm run dev
  ```
  *(Launches the hot-reloading development server on http://localhost:5000)*

* **Frontend Client**:
  Navigate to the `frontend` folder and run:
  ```bash
  npm run dev
  ```
  *(Launches the Vite React app on http://localhost:5173 or http://localhost:5174)*

---

### 7. API Documentation

Here is a summary of the backend API routes:

#### Auth & Registration (Public)
* **`POST /api/users/send-otp`**
  - Description: Generates a 6-digit OTP code and emails it to the user.
  - Body: `{ "email": "user@gmail.com" }`
* **`POST /api/users/register`**
  - Description: Validates OTP and registers the user profile.
  - Body: `{ "name": "John", "email": "user@gmail.com", "phone": "9876", "password": "123", "role": "Tenant", "verificationCode": "123456" }`
* **`POST /api/users/login`**
  - Description: Logs in the user and returns a JWT token.
  - Body: `{ "email": "user@gmail.com", "password": "123" }`

#### House Listing Queries (Public/Protected)
* **`GET /api/users/properties`**
  - Description: Searches and filters active listings.
  - Query Params: `city`, `propertyType`, `rentMax`, `bedrooms`, `search`
* **`POST /api/users/properties/submit`**
  - Description: Allows Tenants to upload images and submit house listings. (Requires JWT; Role: `Tenant`).
  - Body: `FormData` (title, description, price, city, state, bed/bath size, amenities, files)

#### Booking Actions (Protected)
* **`POST /api/users/bookings`**
  - Description: Places a booking request on a listing. Self-booking is protected. (Requires JWT; Role: `Tenant` or `Owner`).
  - Body: `{ "propertyId": "id", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }`
* **`GET /api/users/bookings`**
  - Description: Returns the list of bookings requested by the current user. (Requires JWT; Role: `Tenant` or `Owner`).

#### Landlord Control Endpoints (Protected; Role: `Owner`)
* **`GET /api/owners/properties`**
  - Description: Lists all properties owned by the current owner.
* **`POST /api/owners/properties`**
  - Description: Adds a new property listing directly in `'Available'` status.
* **`PUT /api/owners/bookings/status`**
  - Description: Approves or rejects a booking request.
  - Body: `{ "bookingId": "id", "status": "Approved" }`

#### Admin Endpoints (Protected; Role: `Admin`)
* **`GET /api/admins/stats`**
  - Description: Returns database metrics summaries.
* **`GET /api/admins/properties/pending`**
  - Description: Fetches property listings awaiting verification.
* **`PUT /api/admins/properties/:id/approve`**
  - Description: Approves a listing, publishes it, and upgrades the submitting tenant to an Owner.
* **`DELETE /api/admins/properties/:id`**
  - Description: Deletes a listing and associated bookings.
* **`DELETE /api/admins/users/:id`**
  - Description: Deletes a user profile.

---

### 8. Authentication

* **JWT Strategy**: Authentication is handled via stateless **JSON Web Tokens (JWT)**.
* **Protected Routes**: Upon successful login, the server responds with a signed token containing the user's ID and Role. The client stores this in `localStorage` and appends it to subsequent request headers as an `Authorization` header (`Bearer <token>`).
* **Route Protection**: The backend verifies the token signatures using the `protect` middleware.
* **Access Control**: Roles are checked using the `verifyRole(['Admin', 'Owner', 'Tenant'])` middleware to restrict access.
* **Gmail OTP System**: New registration requests must be verified by email. Verification keys are stored in a self-expiring database collection.

---

### 9. User Interface

The UI layout utilizes CSS Variables and glassmorphism styling for an outstanding user experience:
1. **Redesigned Home Page**: Features a split-hero layout (prominent typography on the left, floating listing graphic on the right) and a top horizontal filter bar.
2. **Dynamic Badging**: Statuses (`Pending`, `Approved`, `Rejected`, `Available`) display with custom themed badges.
3. **Responsive Grids**: Flexbox and Bootstrap columns ensure lists scale beautifully from mobile displays up to widescreen monitors.
4. **Theme Toggler**: Located in the header navigation, this toggles between Sun (Light) and Moon (Dark) modes.

---

### 10. Testing

#### Verification Checklists
1. **Signup Flow**:
   - Navigate to `/register`.
   - Submit your email address. Verify that the simulated OTP code is logged in the backend terminal console.
   - Enter your registration details, password, and the OTP code. Submit to complete signup.
2. **Admin Portal Login**:
   - Log in using email `hemasundararaogec@gmail.com` and password `admin123`.
   - Open the **Admin Hub** and verify access to stats, user control logs, property verification queues, and booking databases.
3. **Role Upgrade Flow**:
   - Log in as a Tenant and go to the **Tenant Hub**.
   - Open the **List Your Property** form, fill in house details, select image files, and submit.
   - Go to the **Listings Submissions** tab. Verify the status is `'Pending'`.
   - Log in as Admin (`hemasundararaogec@gmail.com`). Locate the pending house request in the audit list and click **Approve & List**.
   - Log back in as the tenant. Verify that the listing is approved, and your account role is upgraded to **Owner**, unlocking access to the Landlord Hub.
4. **Owner-to-Owner Booking**:
   - Log in as Owner-A. Check the homepage feed and click **Book** on a house owned by Owner-B.
   - Enter the lease dates. Click submit.
   - Access your Landlord Hub dashboard and verify that the request is recorded under the **"Bookings I Placed"** panel.
   - Try to book your own property. Verify that the system blocks you.

---

### 11. Screenshots or Demo

* **Local Development Link**: **[http://localhost:5173](http://localhost:5173)** or **[http://localhost:5174](http://localhost:5174)**
* **Database URI**: `mongodb://127.0.0.1:27017/househunt`

---

### 12. Known Issues

* **Windows Vite Cache Locking**: Vite may occasionally throw an `EPERM` error when writing to its temporary optimization folder if a previous dev process exited abruptly. Deleting `frontend/node_modules/.vite` resolves the issue.
* **Email SMTP Credentials**: To enable actual email delivery for Gmail accounts, you must specify your credentials in `backend/.env`. Otherwise, the server defaults to simulated verification mode.

---

### 13. Future Enhancements

* **Direct Chat**: Real-time communication between landlords and tenants.
* **Payment Integration**: Razorpay gateway integration to support secure rental and deposit transactions.
* **Map Views**: Integration with Google Maps API to search properties visually by geolocation.
