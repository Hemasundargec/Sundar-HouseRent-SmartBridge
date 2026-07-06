const mongoose = require('mongoose');
const Property = require('../models/PropertySchema');
const User = require('../models/UserSchema');

// Database Seeder for initial properties and Admin profile
const seedDatabase = async () => {
  try {
    // Find or create default admin account for hemasundararaogec@gmail.com
    let admin = await User.findOne({ email: 'hemasundararaogec@gmail.com' });
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    if (!admin) {
      admin = await User.create({
        name: 'Hemasundara Rao',
        email: 'hemasundararaogec@gmail.com',
        phone: '9876543210',
        password: hashedPassword,
        role: 'Admin',
        isVerified: true,
      });
      console.log('Created Admin account for hemasundararaogec@gmail.com with password admin123');
    } else {
      admin.role = 'Admin';
      admin.isVerified = true;
      await admin.save();
      console.log('Upgraded existing user hemasundararaogec@gmail.com to Admin');
    }

    const count = await Property.countDocuments();
    if (count === 0) {
      console.log('Seeding initial properties to MongoDB...');
      await Property.create([
        {
          ownerId: admin._id,
          title: 'Imperial Glass Villa',
          description: 'A premium architectural villa with a private swimming pool, terrace garden, and premium brass fittings. Located in Bengaluru\'s prime Indiranagar neighborhood.',
          address: '12th Main Road, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          rentAmount: 75000,
          propertyType: 'Villa',
          furnishingStatus: 'Furnished',
          bedrooms: 4,
          bathrooms: 4,
          amenities: ['Pool', 'Gym', 'WiFi', 'Parking', 'Home Theater', 'Power Backup'],
          images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
          status: 'Available',
        },
        {
          ownerId: admin._id,
          title: 'Skyline Penthouse Bandra',
          description: 'Sea-facing high-rise penthouse with double-height ceiling, panoramic glass walls, private elevator, and modular kitchen. Located in Mumbai\'s upscale Bandra West.',
          address: 'Carter Road, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          rentAmount: 120000,
          propertyType: 'Apartment',
          furnishingStatus: 'Furnished',
          bedrooms: 3,
          bathrooms: 3,
          amenities: ['Concierge', 'Gym', 'WiFi', 'Rooftop Access', 'Sea View'],
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
          status: 'Available',
        },
        {
          ownerId: admin._id,
          title: 'Elegant Heritage Bungalow',
          description: 'Luxury colonial-style villa featuring a sprawling private courtyard, marble flooring, high ceilings, and 24/7 security. Prime location in Hyderabad\'s Jubilee Hills.',
          address: 'Road No. 36, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          rentAmount: 95000,
          propertyType: 'House',
          furnishingStatus: 'Semi-Furnished',
          bedrooms: 3,
          bathrooms: 3,
          amenities: ['Garden', 'Fireplace', 'Parking', 'WiFi', 'Servant Quarters'],
          images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
          status: 'Available',
        }
      ]);
      console.log('Database seeding finished successfully.');
    }
  } catch (error) {
    console.error('Error during database seeding:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/househunt');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run database seeder
    await seedDatabase();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
