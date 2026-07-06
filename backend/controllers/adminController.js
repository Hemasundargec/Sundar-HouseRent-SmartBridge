const User = require('../models/UserSchema');
const Property = require('../models/PropertySchema');
const Booking = require('../models/BookingSchema');

// Get Statistics for Admin Dashboard
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'Owner' });
    const totalTenants = await User.countDocuments({ role: 'Tenant' });

    const totalProperties = await Property.countDocuments();
    const availableProperties = await Property.countDocuments({ status: 'Available' });
    const bookedProperties = await Property.countDocuments({ status: 'Booked' });

    const totalBookings = await Booking.countDocuments();
    const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });

    // Calculate total rental volume (from approved bookings)
    const approvedBookingDetails = await Booking.find({ status: 'Approved' }).populate('propertyId');
    const totalRevenue = approvedBookingDetails.reduce((sum, b) => {
      if (b.propertyId && b.propertyId.rentAmount) {
        return sum + b.propertyId.rentAmount;
      }
      return sum;
    }, 0);

    return res.json({
      users: { total: totalUsers, owners: totalOwners, tenants: totalTenants },
      properties: { total: totalProperties, available: availableProperties, booked: bookedProperties },
      bookings: { total: totalBookings, approved: approvedBookings, pending: pendingBookings },
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({ message: 'Error retrieving system statistics' });
  }
};

// View all users in the system
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({ message: 'Error retrieving users list' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    // Clean up dependencies
    if (user.role === 'Owner') {
      // Find all property IDs owned by this user
      const ownerProperties = await Property.find({ ownerId: req.params.id }).select('_id');
      const propertyIds = ownerProperties.map((p) => p._id);
      
      // Delete properties
      await Property.deleteMany({ ownerId: req.params.id });
      // Delete bookings associated with these properties
      await Booking.deleteMany({ propertyId: { $in: propertyIds } });
    } else if (user.role === 'Tenant') {
      // Delete bookings created by this tenant
      await Booking.deleteMany({ tenantId: req.params.id });
    }

    return res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
};

// View all property listings
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('ownerId', 'name email phone').sort({ createdAt: -1 });
    return res.json(properties);
  } catch (error) {
    console.error('Get All Properties Error:', error);
    return res.status(500).json({ message: 'Error retrieving property listings' });
  }
};

// Delete any property listing
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await Property.findByIdAndDelete(req.params.id);
    await Booking.deleteMany({ propertyId: req.params.id });

    return res.json({ message: 'Property listing and associated bookings deleted successfully' });
  } catch (error) {
    console.error('Delete Property Error:', error);
    return res.status(500).json({ message: 'Error deleting property' });
  }
};

// Approve owner profile activation / toggle verification status
const approveOwner = async (req, res) => {
  const { userId, isVerified } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = isVerified !== undefined ? isVerified : true;
    await user.save();

    return res.json({ message: `Owner profile verification status set to ${user.isVerified}`, user });
  } catch (error) {
    console.error('Approve Owner Error:', error);
    return res.status(500).json({ message: 'Error updating owner approval status' });
  }
};

// Get all pending property listings
const getPendingProperties = async (req, res) => {
  try {
    const pendingListings = await Property.find({ status: 'Pending' })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(pendingListings);
  } catch (error) {
    console.error('Get Pending Properties Error:', error);
    return res.status(500).json({ message: 'Error fetching pending listings' });
  }
};

// Approve property and upgrade tenant to owner if necessary
const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Set property status to Available
    property.status = 'Available';
    await property.save();

    // Check ownerId profile and upgrade if Tenant
    const user = await User.findById(property.ownerId);
    if (user && user.role === 'Tenant') {
      user.role = 'Owner';
      user.isVerified = true; // Auto-verify upgraded owners
      await user.save();
      console.log(`User ${user.email} role upgraded to Owner due to property approval.`);
    }

    return res.json({
      message: 'Property listing approved successfully, user upgraded to Owner.',
      property,
    });
  } catch (error) {
    console.error('Approve Property Error:', error);
    return res.status(500).json({ message: 'Error approving property listing' });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
  approveOwner,
  getPendingProperties,
  approveProperty,
};
