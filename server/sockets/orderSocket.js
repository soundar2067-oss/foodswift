const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join order room for tracking updates
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined room order_${orderId}`);
    });

    // Join restaurant room for incoming orders
    socket.on('join_restaurant_room', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined restaurant room restaurant_${restaurantId}`);
    });

    // Driver location update
    socket.on('update_driver_location', ({ orderId, lat, lng }) => {
      io.to(`order_${orderId}`).emit('driver_location_updated', {
        orderId,
        currentLocation: { lat, lng },
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSockets;
