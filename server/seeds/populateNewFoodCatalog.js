require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const { masterVegCatalog, masterNonVegCatalog } = require('./foodCatalog');
const { getAccurateDishImage } = require('../utils/dishImageResolver');

async function syncAllNewFoods() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Fetching restaurants...');
    const restaurants = await Restaurant.find().select('_id name isPureVeg estimatedDeliveryTime locality');
    console.log(`Found ${restaurants.length} restaurants in Salem.`);

    let insertedCount = 0;
    const batchSize = 1000;
    let batch = [];

    for (let rIdx = 0; rIdx < restaurants.length; rIdx++) {
      const rest = restaurants[rIdx];
      const catalog = rest.isPureVeg ? masterVegCatalog : masterNonVegCatalog;

      for (let itemIdx = 0; itemIdx < catalog.length; itemIdx++) {
        const template = catalog[itemIdx];
        const dishName = (rIdx > 0 && itemIdx % 5 === 0)
          ? `${rest.name.split(' ')[0]} Special ${template.name}`
          : template.name;

        const itemSlug = `${dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${rest._id.toString().slice(-4)}-${itemIdx}`;

        // Check if item already exists for this restaurant
        const exists = await FoodItem.exists({ restaurant: rest._id, slug: itemSlug });
        if (!exists) {
          const imageUrl = getAccurateDishImage(dishName, template.category, template.isVeg);
          batch.push({
            restaurant: rest._id,
            name: dishName,
            slug: itemSlug,
            description: template.desc,
            categoryName: template.category,
            isVeg: template.isVeg,
            price: template.price,
            discountPrice: itemIdx % 4 === 0 ? Math.round(template.price * 0.85) : null,
            imageUrl: imageUrl,
            isAvailable: true,
            isBestseller: template.bestseller || (itemIdx === 0),
            prepTime: rest.estimatedDeliveryTime || 25,
            portionSizes: [
              { name: 'Standard', price: template.price },
              { name: 'Large', price: Math.round(template.price * 1.5) },
            ],
            addOns: template.isVeg
              ? [{ name: 'Extra Ghee', price: 20 }, { name: 'Extra Chutney', price: 15 }]
              : [{ name: 'Extra Gravy / Salna', price: 30 }, { name: 'Boiled Egg', price: 15 }],
          });

          if (batch.length >= batchSize) {
            await FoodItem.insertMany(batch);
            insertedCount += batch.length;
            process.stdout.write(`Inserted ${insertedCount} new food items...\r`);
            batch = [];
          }
        }
      }
    }

    if (batch.length > 0) {
      await FoodItem.insertMany(batch);
      insertedCount += batch.length;
    }

    const totalFoods = await FoodItem.countDocuments();
    console.log(`\n✅ Finished syncing! Inserted ${insertedCount} new items. Total food catalog in DB: ${totalFoods} items across Salem.`);
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error syncing foods:', err);
    process.exit(1);
  }
}

syncAllNewFoods();
