const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, verifyRole } = require('../middlewares/authMiddleware');
const {
  sendOTP,
  register,
  login,
  getProfile,
  updateProfile,
  browseProperties,
  bookProperty,
  getBookingHistory,
  getPropertyById,
  submitProperty,
  getMySubmissions,
} = require('../controllers/userController');

const router = express.Router();

// Multer Config for Profile Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Multer Config for Property Images
const propertyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'property-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});
const uploadPropertyImages = multer({ storage: propertyStorage });

// Public Auth routes
router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);

// Public listings search routes
router.get('/properties', browseProperties);
router.get('/properties/:id', getPropertyById);

// Protected routes (Tenant or any logged-in user profile)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// Booking routes (Tenants and Owners can create bookings, retrieve history)
router.post('/bookings', protect, verifyRole(['Tenant', 'Owner']), bookProperty);
router.get('/bookings', protect, verifyRole(['Tenant', 'Owner']), getBookingHistory);

// Property Submission route for role progression (Tenants can submit property listings)
router.post('/properties/submit', protect, verifyRole(['Tenant']), uploadPropertyImages.array('images', 10), submitProperty);
router.get('/properties/submissions', protect, verifyRole(['Tenant', 'Owner']), getMySubmissions);

module.exports = router;
