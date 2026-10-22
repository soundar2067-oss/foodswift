import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Since the mock helper is in place, we can just write directly to data/mockDB.json
// or use the models if mongoose is connected. Let's just generate the JSON for simplicity,
// as the user requested 2000 items and doing it via mock DB json is much faster.

const MOCK_DB_PATH = path.resolve('data/mockDB.json');

const generateSeedData = () => {
  const restaurants = [];
  const fooditems = [];

  const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India', 'Hyderabad, India', 'Pune, India'];
  
  // Generate 50 Restaurants
  for (let i = 0; i < 50; i++) {
    restaurants.push({
      _id: faker.database.mongodbObjectId(),
      name: faker.company.name() + ' Restaurant',
      location: faker.helpers.arrayElement(locations),
      deliveryTime: faker.number.int({ min: 15, max: 60 }) + ' mins',
      offers: faker.number.int({ min: 5, max: 30 }) + '% OFF up to ₹100',
      rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
      image: faker.image.urlLoremFlickr({ category: 'restaurant,food' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Generate 1000 Veg Items
  for (let i = 0; i < 1000; i++) {
    const originalPrice = faker.number.int({ min: 100, max: 800 });
    const offerPrice = Math.floor(originalPrice * 0.8); // 20% off
    fooditems.push({
      _id: faker.database.mongodbObjectId(),
      restaurantId: faker.helpers.arrayElement(restaurants)._id,
      name: faker.commerce.productName() + ' (Veg)',
      description: faker.commerce.productDescription(),
      ingredients: 'Fresh Vegetables, Spices, Oil',
      originalPrice,
      offerPrice,
      isVeg: true,
      rating: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
      image: faker.image.urlLoremFlickr({ category: 'vegetables,food' }),
      category: faker.helpers.arrayElement(['Main Course', 'Starter', 'Dessert', 'Beverage']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Generate 1000 Non-Veg Items
  for (let i = 0; i < 1000; i++) {
    const originalPrice = faker.number.int({ min: 150, max: 1200 });
    const offerPrice = Math.floor(originalPrice * 0.8); // 20% off
    fooditems.push({
      _id: faker.database.mongodbObjectId(),
      restaurantId: faker.helpers.arrayElement(restaurants)._id,
      name: faker.commerce.productName() + ' (Non-Veg)',
      description: faker.commerce.productDescription(),
      ingredients: 'Chicken/Mutton, Spices, Oil',
      originalPrice,
      offerPrice,
      isVeg: false,
      rating: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
      image: faker.image.urlLoremFlickr({ category: 'meat,food' }),
      category: faker.helpers.arrayElement(['Main Course', 'Starter', 'Biryani']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return { users: [], restaurants, fooditems, reviews: [], orders: [] };
};

const runSeed = () => {
  try {
    const data = generateSeedData();
    if (!fs.existsSync(path.dirname(MOCK_DB_PATH))) {
      fs.mkdirSync(path.dirname(MOCK_DB_PATH), { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
    console.log('Successfully seeded database with 50 restaurants, 1000 veg, and 1000 non-veg food items!');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
};

runSeed();
