const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, verifyRole } = require('../middlewares/authMiddleware');
const {
  addProperty,
  getOwnerProperties,
  updateProperty,
  deleteProperty,
  getOwnerBookings,
  updateBookingStatus,
} = require('../controllers/ownerController');

const router = express.Router();

// Multer storage configuration for property images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'property-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// All routes require authentication and 'Owner' role
router.use(protect);
router.use(verifyRole(['Owner']));

// Property CRUD
router.post('/properties', upload.array('images', 10), addProperty);
router.get('/properties', getOwnerProperties);
router.put('/properties/:id', upload.array('images', 10), updateProperty);
router.delete('/properties/:id', deleteProperty);

// Bookings management
router.get('/bookings', getOwnerBookings);
router.put('/bookings/status', updateBookingStatus);

module.exports = router;
