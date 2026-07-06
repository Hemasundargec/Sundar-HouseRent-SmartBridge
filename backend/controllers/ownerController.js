const Property = require('../models/PropertySchema');
const Booking = require('../models/BookingSchema');

// Add new property
const addProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      rentAmount,
      propertyType,
      furnishingStatus,
      bedrooms,
      bathrooms,
      amenities,
    } = req.body;

    if (!title || !description || !address || !city || !state || !rentAmount || !propertyType || !furnishingStatus || !bedrooms || !bathrooms) {
      return res.status(400).json({ message: 'All required property fields must be filled' });
    }

    // Process files
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // amenities might be sent as string or array
    let processedAmenities = [];
    if (amenities) {
      processedAmenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim()).filter((a) => a);
    }

    const newProperty = await Property.create({
      ownerId: req.user.id,
      title,
      description,
      address,
      city,
      state,
      rentAmount: Number(rentAmount),
      propertyType,
      furnishingStatus,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      amenities: processedAmenities,
      images,
      status: 'Available',
    });

    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Add Property Error:', error);
    return res.status(500).json({ message: 'Server error listing property', error: error.message });
  }
};

// Get properties listed by the logged-in owner
const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(properties);
  } catch (error) {
    console.error('Get Owner Properties Error:', error);
    return res.status(500).json({ message: 'Error retrieving owner properties' });
  }
};

// Update property listing
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Verify ownership
    if (property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You are not the owner of this property' });
    }

    const {
      title,
      description,
      address,
      city,
      state,
      rentAmount,
      propertyType,
      furnishingStatus,
      bedrooms,
      bathrooms,
      amenities,
      status,
    } = req.body;

    property.title = title || property.title;
    property.description = description || property.description;
    property.address = address || property.address;
    property.city = city || property.city;
    property.state = state || property.state;
    property.rentAmount = rentAmount ? Number(rentAmount) : property.rentAmount;
    property.propertyType = propertyType || property.propertyType;
    property.furnishingStatus = furnishingStatus || property.furnishingStatus;
    property.bedrooms = bedrooms ? Number(bedrooms) : property.bedrooms;
    property.bathrooms = bathrooms ? Number(bathrooms) : property.bathrooms;
    property.status = status || property.status;

    if (amenities) {
      property.amenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim()).filter((a) => a);
    }

    // Handle image uploads (add new images if uploaded)
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        property.images.push(`/uploads/${file.filename}`);
      });
    }

    // Allow deleting specific images if requested
    if (req.body.deletedImages) {
      const deletedImages = Array.isArray(req.body.deletedImages)
        ? req.body.deletedImages
        : req.body.deletedImages.split(',');
      property.images = property.images.filter((img) => !deletedImages.includes(img));
    }

    const updatedProperty = await property.save();
    return res.json(updatedProperty);
  } catch (error) {
    console.error('Update Property Error:', error);
    return res.status(500).json({ message: 'Server error updating property' });
  }
};

// Delete property listing
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Verify ownership
    if (property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You are not the owner of this property' });
    }

    await Property.findByIdAndDelete(req.params.id);
    
    // Also delete any associated bookings
    await Booking.deleteMany({ propertyId: req.params.id });

    return res.json({ message: 'Property and its associated bookings deleted successfully' });
  } catch (error) {
    console.error('Delete Property Error:', error);
    return res.status(500).json({ message: 'Error deleting property' });
  }
};

// View booking requests on owner's properties
const getOwnerBookings = async (req, res) => {
  try {
    // 1. Find all properties listed by this owner
    const ownerProperties = await Property.find({ ownerId: req.user.id }).select('_id');
    const propertyIds = ownerProperties.map((p) => p._id);

    // 2. Find bookings linked to those property IDs
    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId')
      .populate('tenantId', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error('Get Owner Bookings Error:', error);
    return res.status(500).json({ message: 'Error retrieving booking requests' });
  }
};

// Approve or Reject booking
const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  if (!bookingId || !status) {
    return res.status(400).json({ message: 'bookingId and status are required' });
  }

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Choose Approved or Rejected.' });
  }

  try {
    const booking = await Booking.findById(bookingId).populate('propertyId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Verify ownership of the property
    if (booking.propertyId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You do not own this property' });
    }

    booking.status = status;
    await booking.save();

    // If booking is approved, mark the property status as 'Booked' and cancel other pending bookings for the same property
    if (status === 'Approved') {
      await Property.findByIdAndUpdate(booking.propertyId._id, { status: 'Booked' });
      
      // Auto-reject other pending bookings on this property
      await Booking.updateMany(
        {
          _id: { $ne: bookingId },
          propertyId: booking.propertyId._id,
          status: 'Pending',
        },
        { status: 'Rejected' }
      );
    }

    return res.json({ message: `Booking status updated to ${status} successfully`, booking });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    return res.status(500).json({ message: 'Error updating booking status' });
  }
};

module.exports = {
  addProperty,
  getOwnerProperties,
  updateProperty,
  deleteProperty,
  getOwnerBookings,
  updateBookingStatus,
};
