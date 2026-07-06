const express = require('express');
const { protect, verifyRole } = require('../middlewares/authMiddleware');
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
  approveOwner,
  getPendingProperties,
  approveProperty,
} = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication and 'Admin' role
router.use(protect);
router.use(verifyRole(['Admin']));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.delete('/properties/:id', deleteProperty);
router.put('/approve-owner', approveOwner);

// Pending listings moderation
router.get('/properties/pending', getPendingProperties);
router.put('/properties/:id/approve', approveProperty);

module.exports = router;
