import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Try to connect to MongoDB with a short timeout to prevent hanging if MongoDB is not running
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodswift', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`\x1b[32m[MongoDB Connected]: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[MongoDB Connection Error]: ${error.message}\x1b[0m`);
    console.log('\n\x1b[33m💡 Tip: FoodSwift is automatically falling back to an in-memory/JSON-file database (backend/data/mockDB.json).\x1b[0m\n');
    global.useMockDB = true;
  }
};

export default connectDB;
