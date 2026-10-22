const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');

jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();
}, 30000);

afterAll(async () => {
  await disconnectDB();
}, 30000);

describe('FOODSWIFT API Integration Tests', () => {
  let customerToken = '';
  let adminToken = '';
  let testRestaurantId = '';
  let testFoodId = '';
  let testOrderId = '';

  // 1. Health check
  test('GET /api/health should return online status for Salem', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.city).toContain('Salem');
  });

  // 2. Authentication: Login
  test('POST /api/v1/auth/login with valid credentials should return token', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'customer@foodswift.com',
      password: 'customerpassword123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    customerToken = res.body.token;
  });

  test('POST /api/v1/auth/login with invalid password should fail', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'customer@foodswift.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 3. Admin Login & Role Check
  test('POST /api/v1/auth/login as Admin', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@foodswift.com',
      password: 'adminpassword123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  // 4. Restaurant Discovery & Filtering
  test('GET /api/v1/restaurants should return seeded Salem restaurants', async () => {
    const res = await request(app).get('/api/v1/restaurants?limit=10');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    testRestaurantId = res.body.data[0]._id;
  });

  test('GET /api/v1/restaurants with Salem locality filter', async () => {
    const res = await request(app).get('/api/v1/restaurants?locality=Fairlands');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 5. Food Catalogue & Search
  test('GET /api/v1/foods/search?q=Biryani should return Biryani dishes and restaurants', async () => {
    const res = await request(app).get('/api/v1/foods/search?q=Biryani');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.foods.length).toBeGreaterThan(0);
    testFoodId = res.body.foods[0]._id;
  });

  // 6. Cart Management
  test('POST /api/v1/cart/items should add item to customer cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        foodItemId: testFoodId,
        quantity: 2,
        forceClear: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.subtotal).toBeGreaterThan(0);
  });

  // 7. Coupon Validation
  test('POST /api/v1/coupons/validate with WELCOME50', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        code: 'WELCOME50',
        subtotal: 300,
        restaurantId: testRestaurantId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discount).toBeGreaterThan(0);
  });

  // 8. Order Placement (COD)
  test('POST /api/v1/orders should create a verified order with server calculation', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: testRestaurantId,
        items: [
          {
            foodItem: testFoodId,
            quantity: 2,
          },
        ],
        deliveryAddress: {
          houseNo: '24',
          street: 'Fairlands Main Road',
          locality: 'Fairlands',
          city: 'Salem',
          state: 'Tamil Nadu',
          pincode: '636016',
        },
        paymentMethod: 'cod',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toContain('FS-SLM');
    expect(res.body.data.orderStatus).toBe('placed');
    testOrderId = res.body.data._id;
  });

  // 9. Payment Verification (Simulated Test Mode)
  test('POST /api/v1/payments/verify with simulated transaction', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: testOrderId,
        razorpayOrderId: 'order_sim_test_123',
        razorpayPaymentId: 'pay_sim_test_456',
        razorpaySignature: 'simulated_sig',
        isSimulated: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('paid');
  });

  // 10. Admin Protected Stats
  test('GET /api/v1/admin/stats with Admin Token', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalRestaurants).toBeGreaterThanOrEqual(200);
    expect(res.body.stats.totalFoods).toBeGreaterThanOrEqual(2000);
  });

  // 11. 30-Minute Automatic Order Progression & Manual Advance
  test('POST /api/v1/orders/:id/advance-step should advance order to next lifecycle stage', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${testOrderId}/advance-step`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // Since payment verification set it to 'confirmed', next step is 'accepted'
    expect(res.body.data.orderStatus).toBe('accepted');
  });

  test('PATCH /api/v1/orders/:id/progression-config should update progression speed and mode', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${testOrderId}/progression-config`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ speed: 'fast', autoProgress: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progressionSpeed).toBe('fast');
    expect(res.body.data.autoProgress).toBe(true);
  });
});
