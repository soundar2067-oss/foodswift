import axios from 'axios';
import {
  MOCK_RESTAURANTS,
  MOCK_FOODS,
  MOCK_COUPONS,
  MOCK_ADMIN_STATS,
  MOCK_ADMIN_ORDERS,
  MOCK_DELIVERY_PROFILE,
  MOCK_DELIVERY_ORDERS,
  getMockMenu,
} from '../data/mockShowcaseData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodswift_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses — if backend is sleeping or offline on Render, supply showcase data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkOr404 =
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 502 ||
      error.response.status === 503;

    if (isNetworkOr404 && error.config) {
      const url = error.config.url || '';
      const method = (error.config.method || 'get').toLowerCase();

      // ── Admin Portal API Fallbacks ──────────────────────────────
      if (url.includes('/admin/stats')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, stats: MOCK_ADMIN_STATS },
        });
      }

      if (url.includes('/admin/restaurants')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, data: MOCK_RESTAURANTS },
        });
      }

      if (url.includes('/admin/orders')) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: MOCK_ADMIN_ORDERS,
            total: MOCK_ADMIN_ORDERS.length,
            page: 1,
            totalPages: 1,
          },
        });
      }

      if (url.includes('/admin/coupons')) {
        if (method === 'post') {
          const body = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data || {};
          const newCoupon = { _id: 'cp_' + Date.now(), ...body };
          return Promise.resolve({ status: 201, data: { success: true, data: newCoupon } });
        }
        return Promise.resolve({
          status: 200,
          data: { success: true, data: MOCK_COUPONS },
        });
      }

      if (url.includes('/toggle-verification')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, data: { isVerified: true } },
        });
      }

      // ── Delivery Rider Fleet Portal API Fallbacks ────────────────
      if (url.includes('/delivery/profile')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, data: MOCK_DELIVERY_PROFILE },
        });
      }

      if (url.includes('/delivery/orders')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, data: MOCK_DELIVERY_ORDERS },
        });
      }

      if (url.includes('/delivery/toggle-availability')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, isAvailable: true },
        });
      }

      if (url.includes('/delivery/orders/') && (url.includes('/accept') || url.includes('/status'))) {
        return Promise.resolve({
          status: 200,
          data: { success: true, message: 'Order status updated successfully' },
        });
      }

      // ── Doorstep UPI QR Code API Fallbacks ────────────────────────
      if (url.includes('/payments/generate-upi-qr')) {
        const trRef = 'UPI9443' + Date.now().toString().slice(-6);
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: {
              orderId: 'mock_order',
              amount: 415,
              upiString: `upi://pay?pa=foodswift.salem@okaxis&pn=FoodSwift&am=415&cu=INR&tr=${trRef}`,
              qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=foodswift.salem@okaxis&pn=FoodSwift&am=415&cu=INR&tr=${trRef}`,
              transactionRef: trRef,
            },
          },
        });
      }

      if (url.includes('/payments/verify-upi-qr')) {
        return Promise.resolve({
          status: 200,
          data: { success: true, message: 'Doorstep payment verified successfully' },
        });
      }

      // ── Customer Restaurants & Menu Fallbacks ───────────────────
      if (url.includes('/restaurants') && !url.includes('/menu')) {
        const idMatch = url.match(/\/restaurants\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1] && !idMatch[1].startsWith('?')) {
          const reqId = idMatch[1];
          const found = MOCK_RESTAURANTS.find((r) => r._id === reqId || r.slug === reqId) || MOCK_RESTAURANTS[0];
          return Promise.resolve({
            status: 200,
            data: { success: true, data: found },
          });
        }

        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: MOCK_RESTAURANTS,
            total: MOCK_RESTAURANTS.length,
            pages: 1,
          },
        });
      }

      if (url.includes('/menu')) {
        const idMatch = url.match(/\/restaurants\/([a-zA-Z0-9_-]+)\/menu/);
        const reqId = idMatch ? idMatch[1] : null;
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: getMockMenu(reqId),
          },
        });
      }

      if (url.includes('/foods')) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: MOCK_FOODS,
            total: MOCK_FOODS.length,
          },
        });
      }

      if (url.includes('/coupons')) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: MOCK_COUPONS,
          },
        });
      }

      // ── Customer Order Creation Fallback ────────────────────────
      if (url.includes('/orders') && method === 'post') {
        const body = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data || {};
        const newOrder = {
          _id: 'ord_' + Date.now(),
          orderNumber: `FS-TN-${Date.now().toString().slice(-6)}`,
          orderStatus: 'out_for_delivery',
          paymentStatus: body.paymentMethod === 'cod' ? 'pending' : 'paid',
          paymentMethod: body.paymentMethod || 'upi_qr',
          isPaid: body.paymentMethod !== 'cod',
          subtotal: 390,
          deliveryFee: 25,
          totalAmount: 415,
          restaurantSnapshot: {
            name: 'Salem RR Biryani Unavagam',
            locality: 'Fairlands, Salem',
            coordinates: { lat: 11.6680, lng: 78.1430 },
          },
          deliveryAddress: {
            houseNo: body.deliveryAddress?.houseNo || 'No 45',
            street: body.deliveryAddress?.street || 'Saradha College Main Road',
            locality: body.deliveryAddress?.locality || 'Fairlands',
            city: body.deliveryAddress?.city || 'Salem',
            state: 'Tamil Nadu',
            pincode: '636016',
            coordinates: { lat: 11.6780, lng: 78.1415 },
          },
          items: [
            {
              _id: 'item_1',
              name: 'Salem Special Mutton Biryani (Seeraga Samba)',
              quantity: 1,
              price: 249,
              itemTotal: 249,
              isVeg: false,
              imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
            },
            {
              _id: 'item_2',
              name: 'Parotta with Salem Mutton Salna (3 pcs)',
              quantity: 1,
              price: 110,
              itemTotal: 110,
              isVeg: false,
              imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
            },
          ],
          deliveryPartnerDetails: {
            name: 'Karthik S (Tamil Nadu Fleet)',
            phone: '+919443200003',
            vehicleNumber: 'TN 30 BD 5521 (Hero Splendor)',
            currentLocation: { lat: 11.6710, lng: 78.1425 },
          },
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(`foodswift_order_${newOrder._id}`, JSON.stringify(newOrder));
        return Promise.resolve({
          status: 201,
          data: {
            success: true,
            data: newOrder,
          },
        });
      }

      // ── Customer Order Tracking Fetch Fallback ──────────────────
      if (url.includes('/orders/')) {
        const orderIdMatch = url.match(/\/orders\/([a-zA-Z0-9_-]+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : 'latest';
        const saved = localStorage.getItem(`foodswift_order_${orderId}`);

        const returnedOrder = saved
          ? JSON.parse(saved)
          : {
              _id: orderId,
              orderNumber: `FS-TN-${Date.now().toString().slice(-6)}`,
              orderStatus: 'out_for_delivery',
              paymentStatus: 'paid',
              paymentMethod: 'upi_qr',
              isPaid: true,
              totalAmount: 349,
              restaurantSnapshot: {
                name: 'Salem RR Biryani Unavagam',
                locality: 'Fairlands, Salem',
                coordinates: { lat: 11.6680, lng: 78.1430 },
              },
              deliveryAddress: {
                houseNo: 'No 45',
                street: 'Saradha College Main Road',
                locality: 'Fairlands',
                city: 'Salem',
                state: 'Tamil Nadu',
                pincode: '636016',
                coordinates: { lat: 11.6780, lng: 78.1415 },
              },
              items: [
                {
                  _id: 'item_1',
                  name: 'Salem Special Mutton Biryani (Seeraga Samba)',
                  quantity: 1,
                  price: 249,
                  itemTotal: 249,
                  isVeg: false,
                  imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
                },
              ],
              deliveryPartnerDetails: {
                name: 'Karthik S (Tamil Nadu Fleet)',
                phone: '+919443200003',
                vehicleNumber: 'TN 30 BD 5521 (Hero Splendor)',
                currentLocation: { lat: 11.6710, lng: 78.1425 },
              },
              createdAt: new Date().toISOString(),
            };

        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            data: returnedOrder,
          },
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
