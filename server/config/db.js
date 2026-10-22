const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodswift';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Direct connection to ${uri} failed (${err.message}). Starting MongoMemoryServer development fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'foodswift'
        }
      });
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Successfully connected to in-memory MongoDB: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing database connection:', memErr);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
