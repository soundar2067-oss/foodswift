import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodswift');
const db = mongoose.connection.db;

const totalRest = await db.collection('restaurants').countDocuments();
const totalFood = await db.collection('fooditems').countDocuments();
const totalVeg = await db.collection('fooditems').countDocuments({ isVeg: true });
const totalNonVeg = await db.collection('fooditems').countDocuments({ isVeg: false });
const categories = await db.collection('fooditems').aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray();

console.log('\n📊 DATABASE SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏪 Restaurants  :', totalRest);
console.log('🍽️  Total Foods  :', totalFood);
console.log('🥗 Veg Items    :', totalVeg);
console.log('🍗 Non-Veg Items:', totalNonVeg);
console.log('\n📂 Items per Category:');
categories.forEach(c => console.log(`   ${(c._id || 'Uncategorised').padEnd(28)} ${c.count}`));

await mongoose.disconnect();
