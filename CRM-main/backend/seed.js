const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const Contact = require('./models/Contact');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_db';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Company.deleteMany();
    await Contact.deleteMany();

    // Create sample users
    const users = await User.insertMany([
      {
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Mike Davis',
        email: 'mike@example.com',
        password: 'password123',
        role: 'user'
      }
    ]);

    const user = users[0]; // Use the admin user for creating companies/contacts

    // Create sample companies
    const companies = await Company.insertMany([
      {
        name: 'Tech Solutions Inc',
        industry: 'Technology',
        website: 'https://techsolutions.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        description: 'Leading technology solutions provider',
        createdBy: user._id
      },
      {
        name: 'Global Marketing Agency',
        industry: 'Marketing',
        website: 'https://globalmarketing.com',
        phone: '+1-555-0456',
        address: {
          street: '456 Marketing Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        description: 'Full-service marketing agency',
        createdBy: user._id
      }
    ]);

    // Create sample contacts
    await Contact.insertMany([
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@techsolutions.com',
        phone: '+1-555-0789',
        company_id: companies[0]._id,
        position: 'CEO',
        isActive: true
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@globalmarketing.com',
        phone: '+1-555-0321',
        company_id: companies[1]._id,
        position: 'Marketing Director',
        isActive: true
      },
      {
        first_name: 'Mike',
        last_name: 'Davis',
        email: 'mike.davis@techsolutions.com',
        phone: '+1-555-0654',
        company_id: companies[0]._id,
        position: 'CTO',
        isActive: true
      }
    ].map(contact => ({ ...contact, createdBy: user._id })));

    console.log('Sample data seeded successfully!');
    console.log('Demo users created:');
    console.log('- admin@example.com / password123 (Admin)');
    console.log('- john@example.com / password123 (User)');
    console.log('- sarah@example.com / password123 (User)');
    console.log('- mike@example.com / password123 (User)');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});