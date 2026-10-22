require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const FoodItem = require('../models/FoodItem');
const { getAccurateDishImage } = require('../utils/dishImageResolver');

async function updateAllDishImages() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Fetching all food items from database...');
    const totalItems = await FoodItem.countDocuments();
    console.log(`Found ${totalItems} food items across Salem restaurants.`);

    const cursor = FoodItem.find().select('_id name categoryName isVeg imageUrl').cursor();

    let batch = [];
    let updatedCount = 0;
    const BATCH_SIZE = 1000;

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const accurateImage = getAccurateDishImage(doc.name, doc.categoryName, doc.isVeg);

      batch.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { imageUrl: accurateImage } },
        },
      });

      if (batch.length >= BATCH_SIZE) {
        await FoodItem.bulkWrite(batch, { ordered: false });
        updatedCount += batch.length;
        process.stdout.write(`Updated ${updatedCount}/${totalItems} dishes with accurate photos...\r`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await FoodItem.bulkWrite(batch, { ordered: false });
      updatedCount += batch.length;
    }

    console.log(`\n✅ Successfully updated all ${updatedCount} food items with accurate, verified dish photography!`);
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error updating dish images:', err);
    process.exit(1);
  }
}

updateAllDishImages();
