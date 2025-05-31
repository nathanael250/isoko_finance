require('dotenv').config();
const { connectDB } = require('../config/database');

const runSeeder = async (seederFunction) => {
  try {
    console.log('🚀 Starting seeder...');
    
    // Connect to database first
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Run the seeder
    await seederFunction();
    
    console.log('🎉 Seeder completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    process.exit(0);
  }
};

module.exports = { runSeeder };
