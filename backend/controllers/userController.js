const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/UserSchema');
const Property = require('../models/PropertySchema');
const Booking = require('../models/BookingSchema');
const OTP = require('../models/OTPSchema');

// Generate a JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey_househunt_12345_secure', {
    expiresIn: '30d',
  });
};

// Send OTP via Nodemailer or Console Log Fallback
const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    // Check if user already exists and is verified
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Database
    await OTP.deleteMany({ email }); // Delete any prior OTPs
    await OTP.create({ email, otp: otpCode });

    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;

    if (smtpUser && smtpPass) {
      // Setup Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"HouseHunt" <${smtpUser}>`,
        to: email,
        subject: 'HouseHunt Registration Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px;">
            <h2 style="color: #6C5DD3; text-align: center;">HouseHunt</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p>Hello,</p>
            <p>Thank you for choosing HouseHunt. Please use the following verification code to complete your registration:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 10px 25px; border-radius: 5px; background-color: #F3F1FF; border: 1px dashed #6C5DD3; color: #6C5DD3; display: inline-block;">
                ${otpCode}
              </span>
            </div>
            <p style="color: #666; font-size: 13px;">This code is valid for 5 minutes. Do not share this code with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} HouseHunt Inc. All rights reserved.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        message: 'Verification code sent to Gmail successfully.',
      });
    } else {
      // Development Fallback Print
      console.log('=====================================================');
      console.log(`[EMAIL SIMULATOR] Registration OTP for ${email}: ${otpCode}`);
      console.log('=====================================================');
      return res.status(200).json({
        success: true,
        message: 'Verification code sent (Testing Mode: Code printed to backend server console).',
        otpCode: otpCode // Send back in response body for easier local testing/mocking if SMTP is not ready
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
};

// Register User
const register = async (req, res) => {
  const { name, email, phone, password, role, verificationCode, currentLocation } = req.body;

  if (!name || !email || !phone || !password || !role || !verificationCode) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 1. Verify OTP
    const storedOtp = await OTP.findOne({ email });
    if (!storedOtp || storedOtp.otp !== verificationCode) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // 2. Check User Duplication
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      currentLocation: currentLocation || '',
      isVerified: true,
    });

    // Delete utilized OTP
    await OTP.deleteMany({ email });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      currentLocation: user.currentLocation,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      currentLocation: user.currentLocation,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.currentLocation = req.body.currentLocation || user.currentLocation;

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    } else if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      currentLocation: updatedUser.currentLocation,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Browse & Filter Properties
const browseProperties = async (req, res) => {
  const { city, rentMin, rentMax, bedrooms, bathrooms, propertyType, furnishingStatus, search, amenities } = req.query;

  let query = { status: 'Available' };

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  if (rentMin || rentMax) {
    query.rentAmount = {};
    if (rentMin) query.rentAmount.$gte = Number(rentMin);
    if (rentMax) query.rentAmount.$lte = Number(rentMax);
  }

  if (bedrooms) {
    query.bedrooms = Number(bedrooms);
  }

  if (bathrooms) {
    query.bathrooms = Number(bathrooms);
  }

  if (propertyType) {
    query.propertyType = propertyType;
  }

  if (furnishingStatus) {
    query.furnishingStatus = furnishingStatus;
  }

  if (amenities) {
    // amenities can be a comma separated string
    const amenitiesList = amenities.split(',');
    query.amenities = { $all: amenitiesList.map(a => new RegExp(a.trim(), 'i')) };
  }

  try {
    const properties = await Property.find(query).populate('ownerId', 'name email phone');
    return res.json(properties);
  } catch (error) {
    console.error('Browse Properties Error:', error);
    return res.status(500).json({ message: 'Error retrieving properties' });
  }
};

// Request a booking
const bookProperty = async (req, res) => {
  const { propertyId, startDate, endDate } = req.body;

  if (!propertyId || !startDate || !endDate) {
    return res.status(400).json({ message: 'propertyId, startDate, and endDate are required' });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own property listing' });
    }

    if (property.status !== 'Available') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    const booking = await Booking.create({
      propertyId,
      tenantId: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'Pending',
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Book Property Error:', error);
    return res.status(500).json({ message: 'Error requesting booking' });
  }
};

// Get booking history for Tenant
const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantId: req.user.id })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error('Get Booking History Error:', error);
    return res.status(500).json({ message: 'Error retrieving bookings history' });
  }
};

// Get single property details
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    return res.json(property);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching property details' });
  }
};

// Submit property for approval (by Tenant)
const submitProperty = async (req, res) => {
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
      status: 'Pending', // Starts in Pending status
    });

    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Submit Property Error:', error);
    return res.status(500).json({ message: 'Server error submitting property listing', error: error.message });
  }
};

// Get property submissions made by the logged in user
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Property.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(submissions);
  } catch (error) {
    console.error('Get My Submissions Error:', error);
    return res.status(500).json({ message: 'Error retrieving property submissions history' });
  }
};

module.exports = {
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
};
