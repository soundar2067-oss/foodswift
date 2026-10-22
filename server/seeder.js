require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Category = require('./models/Category');
const Food = require('./models/Food');

mongoose.connect(process.env.MONGODB_URI);

const generateSeedData = async () => {
  try {
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Category.deleteMany();
    await Food.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@foodswift.com',
      phone: '1234567890',
      password,
      role: 'admin'
    });

    // 2. Create Categories
    const categoryNames = [
      'Pizza', 'Burgers', 'Biryani', 'Indian', 'Chinese',
      'South Indian', 'Desserts', 'Beverages', 'Fast Food', 'Healthy Food'
    ];

    const createdCategories = await Category.insertMany(
      categoryNames.map(name => ({ name, description: `Delicious ${name}` }))
    );

    // 3. Create Restaurant Owners
    const ownersData = Array.from({ length: 5 }).map((_, i) => ({
      name: `Owner ${i + 1}`,
      email: `owner${i + 1}@foodswift.com`,
      phone: `098765432${i}`,
      password,
      role: 'restaurant'
    }));
    const owners = await User.insertMany(ownersData);

    // 4. Create Restaurants
    const restaurantNames = ['Spice Route', 'Chennai Bites', 'Royal Biryani', 'South Feast', 'Urban Tandoor'];
    const createdRestaurants = await Restaurant.insertMany(
      owners.map((owner, i) => ({
        owner: owner._id,
        name: restaurantNames[i],
        description: `Best ${restaurantNames[i]} in town`,
        cuisine: ['Indian', 'Chinese'],
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500),
        deliveryTime: '30-45 min',
        deliveryFee: 40,
        minimumOrder: 150,
        isApproved: true
      }))
    );

    // 5. Create 1000+ Food Items
    const foodItems = [];
    const baseFoods = ['Biryani', 'Dosa', 'Pizza', 'Burger', 'Noodles', 'Pasta', 'Curry', 'Roll', 'Sandwich', 'Salad'];
    const modifiers = ['Spicy', 'Special', 'Supreme', 'Classic', 'Royal', 'Delight', 'Jumbo', 'Extra Cheese'];
    
    // Distribute foods across restaurants and categories
    for (let i = 0; i < 1100; i++) {
      const restaurant = createdRestaurants[i % createdRestaurants.length];
      const category = createdCategories[i % createdCategories.length];
      const baseName = baseFoods[Math.floor(Math.random() * baseFoods.length)];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      
      foodItems.push({
        restaurant: restaurant._id,
        category: category._id,
        name: `${modifier} ${baseName} ${i}`,
        description: `Our signature ${modifier} ${baseName}`,
        price: Math.floor(Math.random() * 400) + 99,
        isVeg: Math.random() > 0.5,
        isBestseller: Math.random() > 0.8,
        rating: (Math.random() * 2 + 3).toFixed(1)
      });
    }

    // Insert foods in batches to avoid memory issues
    const batchSize = 100;
    for(let i=0; i < foodItems.length; i+=batchSize) {
      await Food.insertMany(foodItems.slice(i, i+batchSize));
    }

    console.log('Data Imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

generateSeedData();
