require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const setupSockets = require('./sockets/orderSocket');
const { initOrderProgression } = require('./services/orderProgressionService');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach io instance to express app for controllers to emit events
app.set('io', io);

// Setup socket listeners
setupSockets(io);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    initOrderProgression(io);
    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 FOODSWIFT Backend Server running on port ${PORT}`);
      console.log(`📍 Serving Salem, Tamil Nadu, India`);
      console.log(`🌐 Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`⚡ Socket.IO active for real-time order tracking`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
