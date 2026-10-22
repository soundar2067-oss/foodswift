require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

// Models
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodCategory = require('../models/FoodCategory');
const FoodItem = require('../models/FoodItem');
const Coupon = require('../models/Coupon');
const Address = require('../models/Address');
const Review = require('../models/Review');
const DeliveryPartner = require('../models/DeliveryPartner');
const { masterVegCatalog, masterNonVegCatalog } = require('./foodCatalog');
const { getAccurateDishImage } = require('../utils/dishImageResolver');

// Initial 30 Salem restaurants specified in requirements
const baseCandidates = [
  { name: "Domino's Pizza", locality: "Suramangalam", branchAddress: "Opp. Railway Station, Junction Main Road, Suramangalam, Salem - 636005", cuisines: ["Pizza", "Fast Food", "Italian"], isPureVeg: false, priceRange: "₹₹", rating: 4.3, prepTime: 25 },
  { name: "Pizza Hut", locality: "Alagapuram", branchAddress: "Fairlands Main Road, Near Reliance Trends, Alagapuram, Salem - 636016", cuisines: ["Pizza", "Pasta", "Fast Food"], isPureVeg: false, priceRange: "₹₹", rating: 4.2, prepTime: 30 },
  { name: "Barbequeen Restaurant", locality: "Seelanaickenpatti", branchAddress: "NH 44 Bypass, Near Seelanaickenpatti Roundana, Salem - 636201", cuisines: ["Barbecue", "Biryani", "Arabian", "Tandoori"], isPureVeg: false, priceRange: "₹₹₹", rating: 4.4, prepTime: 35 },
  { name: "Barbequeen Restaurant", locality: "Fairlands", branchAddress: "Brindavan Road, 5th Cross, Fairlands, Salem - 636016", cuisines: ["Barbecue", "Grill", "Arabian", "Chinese"], isPureVeg: false, priceRange: "₹₹₹", rating: 4.5, prepTime: 35 },
  { name: "Barbequeen Restaurant", locality: "Meyyanur", branchAddress: "Near Sona College of Technology, Junction Main Road, Salem - 636005", cuisines: ["Grill", "Biryani", "Shawarma", "Arabian"], isPureVeg: false, priceRange: "₹₹₹", rating: 4.3, prepTime: 30 },
  { name: "Dindigul Thalappakatti", locality: "Seelanaickenpatti", branchAddress: "Trichy Main Road, Seelanaickenpatti, Salem - 636201", cuisines: ["Biryani", "South Indian Non-Veg", "Chettinad"], isPureVeg: false, priceRange: "₹₹₹", rating: 4.4, prepTime: 30 },
  { name: "Topi Vappa Biryani", locality: "Alagapuram Pudur", branchAddress: "Reddipatti Main Road, Alagapuram Pudur, Salem - 636016", cuisines: ["Biryani", "Mughlai", "Kebab"], isPureVeg: false, priceRange: "₹₹", rating: 4.3, prepTime: 25 },
  { name: "Rasikas Restaurant", locality: "Seelanaickenpatti", branchAddress: "Bangalore-Madurai Highway, Seelanaickenpatti, Salem - 636201", cuisines: ["South Indian", "North Indian", "Chinese"], isPureVeg: false, priceRange: "₹₹", rating: 4.1, prepTime: 25 },
  { name: "Rasikas Restaurant", locality: "Fairlands", branchAddress: "Omalur Main Road, Near New Bus Stand, Fairlands, Salem - 636004", cuisines: ["Multi-Cuisine", "Tandoori", "Biryani"], isPureVeg: false, priceRange: "₹₹", rating: 4.2, prepTime: 30 },
  { name: "Rasikas Restaurant Elements", locality: "Fairlands", branchAddress: "Ramakrishna Road, Fairlands, Salem - 636016", cuisines: ["Fusion", "Continental", "North Indian"], isPureVeg: false, priceRange: "₹₹₹", rating: 4.4, prepTime: 35 },
  { name: "Rasikas Grand Fusion", locality: "Fairlands", branchAddress: "Rajaji Road, Fairlands, Salem - 636009", cuisines: ["Multi-Cuisine", "Chinese", "Desserts"], isPureVeg: false, priceRange: "₹₹₹", rating: 4.3, prepTime: 35 },
  { name: "Selvi Mess", locality: "Seelanaickenpatti", branchAddress: "Attur Main Road, Seelanaickenpatti, Salem - 636201", cuisines: ["Salem Traditional Non-Veg", "Biryani", "Meals"], isPureVeg: false, priceRange: "₹₹", rating: 4.6, prepTime: 20 },
  { name: "Selvi Mess", locality: "Mamangam", branchAddress: "NH 44 Highway, Near Toll Plaza, Mamangam, Salem - 636302", cuisines: ["South Indian Non-Veg", "Mutton Chops", "Nattu Kozhi"], isPureVeg: false, priceRange: "₹₹", rating: 4.5, prepTime: 25 },
  { name: "Selvi Mess", locality: "Salem Town", branchAddress: "Station Road, Near Salem Town Railway Station, Salem - 636001", cuisines: ["Authentic Mess Meals", "Biryani", "Parotta"], isPureVeg: false, priceRange: "₹₹", rating: 4.5, prepTime: 20 },
  { name: "Cream Centre", locality: "Meyyanur", branchAddress: "Omalur Main Road, Opp. TVS Showroom, Meyyanur, Salem - 636004", cuisines: ["Pure Veg", "North Indian", "Italian", "Sizzlers"], isPureVeg: true, priceRange: "₹₹₹", rating: 4.4, prepTime: 30 },
  { name: "Sri Saravana Bhavan's Aasai Dosai", locality: "Suramangalam", branchAddress: "Junction Main Road, Opp. Central Bank, Salem - 636005", cuisines: ["Pure Veg", "South Indian", "Dosa Varieties", "Tiffin"], isPureVeg: true, priceRange: "₹₹", rating: 4.5, prepTime: 20 },
  { name: "Cafe Coffee Day", locality: "Fairlands", branchAddress: "Brindavan Road, Fairlands, Salem - 636016", cuisines: ["Coffee", "Beverages", "Snacks", "Sandwiches"], isPureVeg: false, priceRange: "₹₹", rating: 4.2, prepTime: 15 },
  { name: "Hotel Sri Parasakthi", locality: "Shevapet", branchAddress: "Fort Main Road, Shevapet, Salem - 636002", cuisines: ["Pure Veg Meals", "South Indian Thali", "Filter Coffee"], isPureVeg: true, priceRange: "₹", rating: 4.3, prepTime: 20 },
  { name: "Gramathu Virunthu", locality: "Kondalampatti", branchAddress: "Trichy Main Road, Kondalampatti Bypass, Salem - 636010", cuisines: ["Kongu Cuisine", "Country Chicken", "Biryani"], isPureVeg: false, priceRange: "₹₹", rating: 4.4, prepTime: 30 },
  { name: "Hotel Kongu", locality: "Vellakalpatti", branchAddress: "Omalur Bypass, Vellakalpatti, Salem - 636012", cuisines: ["Kongu Mess", "Mutton Sukka", "Parotta"], isPureVeg: false, priceRange: "₹₹", rating: 4.3, prepTime: 25 },
  { name: "Nandas Restaurant", locality: "Suramangalam", branchAddress: "Main Road, Suramangalam, Salem - 636005", cuisines: ["Multi-Cuisine", "Chinese", "Biryani"], isPureVeg: false, priceRange: "₹₹", rating: 4.1, prepTime: 25 },
  { name: "Royal Kitchen Family Restaurant", locality: "Ammapet", branchAddress: "Salem-Attur Road, Ammapet, Salem - 636003", cuisines: ["Tandoori", "Arabian", "Biryani", "BBQ"], isPureVeg: false, priceRange: "₹₹", rating: 4.2, prepTime: 30 },
  { name: "Royal Biryanis", locality: "Kitchipalayam", branchAddress: "Old Market Road, Kitchipalayam, Salem - 636015", cuisines: ["Biryani", "Kebab", "Fast Food"], isPureVeg: false, priceRange: "₹", rating: 4.1, prepTime: 20 },
  { name: "Selvas Family Restaurant", locality: "Kondalampatti", branchAddress: "Bangalore Highway, Kondalampatti, Salem - 636010", cuisines: ["South Indian", "North Indian", "Biryani"], isPureVeg: false, priceRange: "₹₹", rating: 4.2, prepTime: 30 },
  { name: "Sri Rajaganapathi Non Veg Restaurant", locality: "Alagapuram Pudur", branchAddress: "Sharada College Road, Alagapuram Pudur, Salem - 636016", cuisines: ["Chettinad", "Seafood", "Parotta"], isPureVeg: false, priceRange: "₹₹", rating: 4.3, prepTime: 25 },
  { name: "HK Salem Special Thattuvadai Set", locality: "Suramangalam", branchAddress: "Market Road, Suramangalam, Salem - 636005", cuisines: ["Salem Street Food", "Thattuvadai Set", "Snacks"], isPureVeg: true, priceRange: "₹", rating: 4.7, prepTime: 15 },
  { name: "Bismi Foods", locality: "Suramangalam", branchAddress: "Near Junction, Suramangalam, Salem - 636005", cuisines: ["Biryani", "Beef Fry", "Fast Food"], isPureVeg: false, priceRange: "₹", rating: 4.2, prepTime: 20 },
  { name: "Ammaayee Unavagam", locality: "Suramangalam", branchAddress: "Junction Bypass Road, Suramangalam, Salem - 636005", cuisines: ["Traditional Village Meals", "Nattu Kozhi", "Dosa"], isPureVeg: false, priceRange: "₹₹", rating: 4.4, prepTime: 25 },
  { name: "Suzzilla Briyani Paradise", locality: "Gorimedu", branchAddress: "Yercaud Main Road, Gorimedu, Salem - 636008", cuisines: ["Dum Biryani", "Shawarma", "Grill Chicken"], isPureVeg: false, priceRange: "₹₹", rating: 4.3, prepTime: 25 },
  { name: "Saravana Parottas", locality: "Sankar Nagar", branchAddress: "Mettur Road, Sankar Nagar, Salem - 636030", cuisines: ["Kothu Parotta", "Bun Parotta", "Salna"], isPureVeg: false, priceRange: "₹", rating: 4.4, prepTime: 20 }
];

// Salem Localities list for realistic geographic distribution
const salemLocalities = [
  "Fairlands", "Alagapuram", "Suramangalam", "Meyyanur", "Gugai",
  "Seelanaickenpatti", "Hasthampatti", "Ammapet", "Shevapet", "Kondalampatti",
  "Sankar Nagar", "Gorimedu", "Kitchipalayam", "Vellakalpatti", "Mamangam",
  "Salem Town", "Dadagapatty", "Swarnapuri", "Pallapatti", "Narasothipatti",
  "Kannankurichi", "Jagirammapalayam", "Reddipatti", "Ponnammapet", "Karungalpatty"
];

const restaurantNamePrefixes = [
  "Sri", "Hotel", "Salem", "New", "Grand", "Royal", "Annapoorna", "Aroma", "Classic", "Golden",
  "Kongu", "Green", "Taste of", "Madurai", "Chettinad", "Anjappar", "Bawarchi", "Zam Zam",
  "A2B", "Adyar Ananda Bhavan", "Murugan", "Aryas", "Vasanta Bhavan", "Junior Kuppanna",
  "Thalassery", "Sree", "Vasantham", "Kaveri", "Kalyan", "Mangalam"
];

const restaurantNameSuffixes = [
  "Mess", "Bhavan", "Kitchen", "Biryani Hub", "Restaurant", "Family Diner", "Dhabba",
  "Tiffin Centre", "Grill & BBQ", "Cafe", "Bake House", "Food Court", "Parotta Stall",
  "Sweets & Bakes", "Udupi Hotel", "Chaat Corner", "Juice Lounge", "Arabian Nights"
];

const cuisineSets = [
  ["South Indian", "Pure Veg", "Dosa Varieties", "Tiffin"],
  ["Biryani", "Chettinad", "Tandoori", "South Indian Non-Veg"],
  ["North Indian", "Chinese", "Tandoori", "Biryani"],
  ["Pizza", "Burgers", "Fast Food", "Beverages"],
  ["Salem Street Food", "Thattuvadai Set", "Snacks", "Chaat"],
  ["Arabian", "Shawarma", "Grill Chicken", "Barbecue"],
  ["Bakery", "Cakes & Pastries", "Desserts", "Snacks"],
  ["Beverages", "Fresh Juices", "Milkshakes", "Ice Cream"],
  ["Kongu Mess", "Mutton Chukka", "Nattu Kozhi", "Parotta"]
];

const bannerImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80"
];

const logoImages = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80"
];

// Verified high quality food category curated image map
const foodCategoryImages = {
  // Veg
  "Idli and Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80",
  "Pongal and Upma": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80",
  "South Indian Meals": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=80",
  "North Indian Meals": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80",
  "Paneer Dishes": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
  "Mushroom Dishes": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
  "Vegetable Curries": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
  "Biryani and Pulao (Veg)": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Veg Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80",
  "Noodles": "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80",
  "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
  "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
  "Sandwiches": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80",
  "Wraps and Rolls": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80",
  "Vegetarian Starters": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80",
  "Salem Thattuvadai Set": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=80",
  "Momos": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80",
  "Salads": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
  "Soups": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80",
  "Parotta and Chapati (Veg)": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
  "Bakery and Pastries": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80",
  "Ice Cream and Desserts": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=80",
  "Fresh Juices and Shakes": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80",
  "Tea and Coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",

  // Non-Veg
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Mutton Biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80",
  "Egg Biryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80",
  "Fish Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Chicken Curry": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80",
  "Mutton Curry": "https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=80",
  "Fish Curry": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80",
  "Seafood & Prawn Dishes": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&auto=format&fit=crop&q=80",
  "Grilled Chicken & BBQ": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80",
  "Tandoori Chicken": "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=500&auto=format&fit=crop&q=80",
  "Chicken 65 & Starters": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=80",
  "Chicken Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80",
  "Non-Veg Noodles": "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80",
  "Shawarma": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&auto=format&fit=crop&q=80",
  "Chicken Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
  "Chicken Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
  "Chicken Rolls": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80",
  "Kothu Parotta": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
  "Chicken Mandi": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
  "Mutton Mandi": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80",
  "Fish Fry": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
  "Kebabs": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
  "Non-Veg Meals": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=80",
  "Omelettes & Egg Dosa": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80",
  "Chicken Soups": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80"
};

// Generates 210 distinct Salem restaurants
function generateRestaurants() {
  const list = [...baseCandidates];

  let idCounter = 31;
  while (list.length < 210) {
    const prefix = restaurantNamePrefixes[idCounter % restaurantNamePrefixes.length];
    const suffix = restaurantNameSuffixes[Math.floor(idCounter / 3) % restaurantNameSuffixes.length];
    const locality = salemLocalities[idCounter % salemLocalities.length];
    const isPureVeg = idCounter % 3 === 0;
    const name = `${prefix} ${locality} ${suffix}`;
    
    // Check if name already exists in list
    if (list.some(r => r.name === name)) {
      idCounter++;
      continue;
    }

    const cuisines = isPureVeg 
      ? ["Pure Veg", "South Indian", "Tiffin", "Meals"]
      : cuisineSets[idCounter % cuisineSets.length];

    const rating = Math.round((3.9 + (idCounter % 10) * 0.1) * 10) / 10;
    const prepTime = 20 + (idCounter % 4) * 5;
    const priceRange = idCounter % 4 === 0 ? "₹₹₹" : (idCounter % 2 === 0 ? "₹₹" : "₹");

    list.push({
      name,
      locality,
      branchAddress: `${10 + (idCounter % 80)}, Main Road, Near Bus Stand, ${locality}, Salem - ${636001 + (idCounter % 20)}`,
      cuisines,
      isPureVeg,
      priceRange,
      rating: Math.min(4.9, rating),
      prepTime
    });
    idCounter++;
  }

  return list;
}

// Master lists for generating realistic menu dishes
const vegDishesByCategory = {
  "Idli and Dosa": [
    { name: "Salem Podi Ghee Roast Dosa", price: 120, desc: "Crispy golden dosa roasted in pure ghee and spiced with authentic Salem gun powder", bestseller: true },
    { name: "Special Masala Dosa", price: 95, desc: "Crispy dosa filled with spiced potato masala and served with 3 chutneys and sambar", bestseller: true },
    { name: "Mini Ghee Podi Idli (14 Pcs)", price: 110, desc: "Bite-sized soft idlis tossed in pure Salem ghee and idli podi", bestseller: true },
    { name: "Salem Thattu Idli with Vada Curry", price: 130, desc: "Large flat steamed idli topped with spicy traditional vada curry", bestseller: false },
    { name: "Onion Rava Masala Dosa", price: 125, desc: "Crispy semolina crepe studded with chopped onions, green chillies, and potato masala", bestseller: false },
    { name: "Cheese Burst Dosa", price: 160, desc: "Modern fusion dosa layered with molten mozzarella cheese and spiced herbs", bestseller: false },
    { name: "Kanchipuram Idli (2 Pcs)", price: 85, desc: "Steamed seasoned idli tempered with cumin, pepper, and dried ginger", bestseller: false },
    { name: "Plain Paper Roast Dosa", price: 90, desc: "Thin, long paper crispy golden dosa served with coconut chutney", bestseller: false }
  ],
  "Pongal and Upma": [
    { name: "Traditional Salem Ghee Pongal", price: 90, desc: "Creamy rice and moong dal mash tempered with cashews, cumin, and black pepper", bestseller: true },
    { name: "Rava Kichadi with Coconut Chutney", price: 80, desc: "Spiced semolina and vegetable pot with roasted cashews", bestseller: false },
    { name: "Millet Ven Pongal", price: 110, desc: "Healthy little millet ghee pongal with golden cashews", bestseller: false },
    { name: "Tomato Semiya Upma", price: 75, desc: "Tangy spiced vermicelli upma with fresh coriander and peas", bestseller: false }
  ],
  "South Indian Meals": [
    { name: "Special Salem Banana Leaf Meals", price: 180, desc: "Steamed Ponni rice, Sambar, Rasam, Kara Kuzhambu, Kootu, Poriyal, Appalam, Curd & Payasam", bestseller: true },
    { name: "Executive Mini Veg Meals", price: 130, desc: "Rice, Sambar, Rasam, Poriyal, Curd, and Appalam", bestseller: false },
    { name: "Curd Rice with Salem Pomegranate & Vadouvan", price: 90, desc: "Cool tempered curd rice garnished with juicy pomegranate seeds and pickle", bestseller: true },
    { name: "Sambar Rice with Salem Potato Fry", price: 110, desc: "Hot piping traditional sambar rice served with spicy pan-roasted potato", bestseller: true },
    { name: "Bisibelebath with Boondi", price: 120, desc: "Karnataka-style spiced lentil and vegetable rice served with crispy spiced boondi", bestseller: false }
  ],
  "Paneer Dishes": [
    { name: "Paneer Butter Masala", price: 220, desc: "Soft cottage cheese cubes simmered in rich creamy tomato and cashew gravy", bestseller: true },
    { name: "Kadai Paneer", price: 230, desc: "Cottage cheese cooked with bell peppers, onions, and freshly ground kadai spices", bestseller: false },
    { name: "Palak Paneer", price: 210, desc: "Fresh cottage cheese in a velvety spinach gravy finished with cream", bestseller: false },
    { name: "Paneer Tikka Masala", price: 250, desc: "Charcoal-smoked marinated paneer cubes in spicy tandoori gravy", bestseller: true },
    { name: "Paneer Lababdar", price: 240, desc: "Grated and cubed paneer cooked in sweet and tangy spiced gravy", bestseller: false }
  ],
  "Vegetable Curries": [
    { name: "Salem Ennai Kathirikai Kuzhambu", price: 160, desc: "Stuffed tender Salem brinjals cooked in tangy, spiced sesame oil gravy", bestseller: true },
    { name: "Mixed Vegetable Kurma", price: 170, desc: "Assorted vegetables simmered in a coconut, poppy seed, and cashew paste", bestseller: false },
    { name: "Aloo Gobi Masala", price: 180, desc: "Potatoes and cauliflower florets tossed in dry onion and tomato masala", bestseller: false },
    { name: "Chettinad Veg Salna", price: 140, desc: "Aromatic thin road-side style salna made for parotta and chapati", bestseller: true },
    { name: "Mushroom Chettinad Masala", price: 210, desc: "Button mushrooms simmered in freshly roasted Chettinad spices and pepper", bestseller: true }
  ],
  "Biryani and Pulao (Veg)": [
    { name: "Salem Special Veg Dum Biryani", price: 170, desc: "Fragrant basmati rice layered with fresh vegetables and Salem biryani spices, served with raita", bestseller: true },
    { name: "Paneer Tikka Biryani", price: 210, desc: "Smoky tandoori paneer layered with aged basmati rice and saffron", bestseller: true },
    { name: "Mushroom Seeraga Samba Biryani", price: 190, desc: "Tamil Nadu traditional Seeraga Samba rice cooked with button mushrooms and whole spices", bestseller: true },
    { name: "Kashmiri Pulao with Dry Fruits", price: 195, desc: "Mild aromatic sweet and savory pulao with roasted cashews, raisins, and fruits", bestseller: false }
  ],
  "Veg Fried Rice & Noodles": [
    { name: "Veg Schezwan Fried Rice", price: 160, desc: "Wok-tossed rice with vegetables in fiery homemade Schezwan sauce", bestseller: true },
    { name: "Classic Veg Hakka Noodles", price: 150, desc: "Stir-fried noodles with crunchy cabbage, bell peppers, and scallions", bestseller: true },
    { name: "Paneer Fried Rice", price: 180, desc: "Basmati rice wok-tossed with golden paneer cubes and vegetables", bestseller: false },
    { name: "Chilli Garlic Veg Noodles", price: 165, desc: "Spicy noodles tossed with burnt garlic and red chilli flakes", bestseller: false }
  ],
  "Pizza & Burgers (Veg)": [
    { name: "Margherita Supreme Pizza", price: 240, desc: "San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves", bestseller: true },
    { name: "Spicy Paneer Tikka Pizza", price: 299, desc: "Loaded with spiced paneer, onions, capsicum, and melted mozzarella", bestseller: true },
    { name: "Farmhouse Fresh Veggie Pizza", price: 280, desc: "Mushrooms, black olives, sweet corn, bell peppers, and golden cheese", bestseller: false },
    { name: "Crispy Veggie Crunch Burger", price: 120, desc: "Crispy vegetable patty with lettuce, tomatoes, and chef secret sauce", bestseller: true },
    { name: "Spicy Paneer King Burger", price: 160, desc: "Crispy fried paneer slab layered with chipotle mayo and pickles", bestseller: false }
  ],
  "Salem Street Specials & Snacks": [
    { name: "Authentic Salem Thattuvadai Set (4 Pcs)", price: 70, desc: "Crispy Salem thattuvadai sandwiched with beetroot, carrot, onion slaw, and tangy green and red chutneys", bestseller: true },
    { name: "Salem Norukkal Mixture Set", price: 80, desc: "Crushed thattuvadai tossed with grated veggies and spicy tangy chutneys", bestseller: true },
    { name: "Onion Samosa (3 Pcs)", price: 50, desc: "Crispy triangular pastry stuffed with spiced onion and spices", bestseller: false },
    { name: "Banana Bajjis with Coconut Chutney (4 Pcs)", price: 60, desc: "Deep-fried raw plantain fritters served crisp with chutney", bestseller: false },
    { name: "Paneer 65 Crisp", price: 190, desc: "Deep-fried cottage cheese cubes marinated in spicy South Indian 65 batter", bestseller: true }
  ],
  "Desserts & Beverages": [
    { name: "Salem Mango Kulfi Slice", price: 90, desc: "Rich and creamy kulfi made from famous Salem Alphonso mangoes", bestseller: true },
    { name: "Gulab Jamun with Ice Cream", price: 110, desc: "Warm soft milk dumplings served with rich vanilla bean ice cream", bestseller: true },
    { name: "Authentic Salem Kumbakonam Degree Coffee", price: 45, desc: "Piping hot South Indian filter coffee brewed with chicory and fresh cow milk", bestseller: true },
    { name: "Jigarthanda Madurai Special", price: 95, desc: "Famous cooling drink made with almond gum, nannari syrup, milk, and basundi ice cream", bestseller: true },
    { name: "Fresh Royal Falooda", price: 140, desc: "Layered rose syrup, vermicelli, sabja seeds, milk, dry fruits, and strawberry ice cream", bestseller: false },
    { name: "Fresh Sweet Lime (Mosambi) Juice", price: 70, desc: "Freshly squeezed sweet lime juice with mint", bestseller: false }
  ]
};

const nonVegDishesByCategory = {
  "Chicken Biryani": [
    { name: "Salem Thalappakatti Chicken Biryani", price: 240, desc: "Authentic Seeraga samba rice cooked with tender farm chicken and regional spices", bestseller: true },
    { name: "Ambur Dum Chicken Biryani", price: 230, desc: "Arcot style chicken biryani with curd pachadi and brinjal ennai kathirikai", bestseller: true },
    { name: "Hyderabadi Chicken Dum Biryani", price: 250, desc: "Long grain basmati rice slow cooked under dum with marinated spiced chicken", bestseller: true },
    { name: "Nattu Kozhi Biryani (Country Chicken)", price: 290, desc: "Country chicken cooked with small onions, garlic, and seeraga samba rice", bestseller: true },
    { name: "Salem Ghee Roast Chicken Biryani", price: 270, desc: "Flavorful biryani topped with Salem spicy ghee roast chicken pieces", bestseller: false },
    { name: "Boneless Chicken 65 Biryani", price: 260, desc: "Aromatic biryani layered with crispy spicy boneless chicken 65", bestseller: true }
  ],
  "Mutton Biryani": [
    { name: "Salem Special Mutton Chukka Biryani", price: 340, desc: "Tender goat mutton cooked to perfection in aromatic Seeraga samba rice", bestseller: true },
    { name: "Dindigul Thalappakatti Mutton Biryani", price: 360, desc: "Signature tender mutton biryani served with dalcha and onion raita", bestseller: true },
    { name: "Chettinad Spicy Mutton Biryani", price: 350, desc: "Fiery mutton biryani flavored with stone flower, marathi moggu, and kalpasi", bestseller: false }
  ],
  "Seafood & Fish Biryani": [
    { name: "Salem Vanjaram Fish Biryani", price: 320, desc: "Seeraga samba biryani cooked with marinated fresh King Fish (Vanjaram)", bestseller: true },
    { name: "Spicy Prawn Thokku Biryani", price: 310, desc: "Succulent sea prawns tossed in spicy onion-tomato gravy and layered with biryani rice", bestseller: true },
    { name: "Egg Dum Biryani (2 Eggs)", price: 170, desc: "Flavorful spiced rice with golden fried boiled eggs and salna", bestseller: false }
  ],
  "Chicken Curries & Gravies": [
    { name: "Kongu Nattu Kozhi Kuzhambu", price: 280, desc: "Authentic Kongu country chicken curry made with shallots and fresh ground masala", bestseller: true },
    { name: "Butter Chicken Masala", price: 260, desc: "Tender tandoori chicken cooked in rich velvety makhani gravy", bestseller: true },
    { name: "Chettinad Pepper Chicken Masala", price: 250, desc: "Spicy chicken curry infused with black pepper, curry leaves, and fennel", bestseller: true },
    { name: "Chicken Tikka Masala", price: 270, desc: "Charcoal grilled boneless chicken chunks in rich onion tomato gravy", bestseller: false },
    { name: "Chicken Salna for Parotta", price: 180, desc: "Roadside Salem style aromatic thin chicken gravy loaded with flavour", bestseller: true }
  ],
  "Mutton & Seafood Curries": [
    { name: "Salem Mutton Chukka Varuval", price: 330, desc: "Tender baby goat pieces pan-fried dry with shallots, garlic, and Salem spices", bestseller: true },
    { name: "Kongu Mutton Curry", price: 340, desc: "Traditional home-style mutton curry with coconut and coriander gravy", bestseller: true },
    { name: "Meen Kuzhambu (Salem Village Style Fish Curry)", price: 260, desc: "Tangy tamarind and shallot fish curry simmered in clay pot", bestseller: true },
    { name: "Prawn Pepper Masala", price: 310, desc: "Fresh prawns tossed with crushed black peppercorns and curry leaves", bestseller: false }
  ],
  "Tandoori, BBQ & Grill": [
    { name: "Salem Special Tandoori Chicken (Half)", price: 240, desc: "Clay-oven roasted chicken marinated in yogurt, Kashmiri chilli, and tandoori spices", bestseller: true },
    { name: "Arabian Alfaham Grilled Chicken", price: 260, desc: "Slow char-grilled chicken marinated with Arabian spices and served with garlic mayo", bestseller: true },
    { name: "Chicken Seekh Kebab", price: 250, desc: "Minced chicken seasoned with fresh mint, coriander, and skewered on charcoal", bestseller: false },
    { name: "Tandoori Chicken Wings (6 Pcs)", price: 220, desc: "Juicy chicken wings coated in smoky tandoori marinade", bestseller: false },
    { name: "Chicken Malai Tikka", price: 270, desc: "Mild and creamy chicken skewers infused with cardamom, cheese, and cream", bestseller: true }
  ],
  "Starters & Fried Chicken": [
    { name: "Authentic Salem Chicken 65 (Boneless)", price: 210, desc: "Crispy deep-fried chicken cubes with curry leaves and green chillies", bestseller: true },
    { name: "Chicken Lollipop (5 Pcs)", price: 230, desc: "Crispy chicken winglets served with spicy Schezwan dipping sauce", bestseller: true },
    { name: "Vanjaram Fish Fry (1 Big Slice)", price: 290, desc: "Tava fried fresh King Fish slice marinated in spicy red chilli masala", bestseller: true },
    { name: "Nethili Meen Varuval (Anchovy Fry)", price: 220, desc: "Crispy deep fried small anchovy fish seasoned with lemon and spices", bestseller: false },
    { name: "Egg Bonda / Egg 65", price: 120, desc: "Batter-fried spiced boiled eggs served with onion salad", bestseller: false }
  ],
  "Parotta & Non-Veg Fast Food": [
    { name: "Salem Special Chicken Kothu Parotta", price: 180, desc: "Flaky parotta shredded on hot griddle with chicken, eggs, and rich salna", bestseller: true },
    { name: "Mutton Kothu Parotta", price: 240, desc: "Shredded parotta tossed with tender minced mutton and spicy gravy", bestseller: true },
    { name: "Egg Kothu Parotta", price: 140, desc: "Flaky minced parotta cooked with eggs, onions, green chillies, and gravy", bestseller: false },
    { name: "Bun Parotta (2 Pcs) with Chicken Salna", price: 120, desc: "Madurai style crispy puffy bun parotta served with piping hot salna", bestseller: true },
    { name: "Chicken Shawarma Roll", price: 130, desc: "Spit-roasted chicken slices rolled in pita bread with garlic toum and pickled vegetables", bestseller: true },
    { name: "Jumbo Peri Peri Chicken Burger", price: 180, desc: "Crispy fried chicken breast topped with peri peri seasoning and cheddar", bestseller: true },
    { name: "Chicken Schezwan Fried Rice", price: 210, desc: "Wok tossed basmati rice with shredded chicken, scrambled eggs, and spicy sauce", bestseller: true }
  ]
};

// Main seed executor
async function seedDatabase() {
  console.log('--- Starting FoodSwift Salem Database Seeder ---');
  await connectDB();

  try {
    // 1. Clear existing collections for a clean, deterministic seed
    console.log('Clearing existing records...');
    await mongoose.connection.collection('reviews').drop().catch(() => {});
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await FoodCategory.deleteMany({});
    await FoodItem.deleteMany({});
    await Coupon.deleteMany({});
    await Address.deleteMany({});
    await DeliveryPartner.deleteMany({});

    // 2. Seed Default Demo Users
    console.log('Creating demo users...');
    const adminUser = await User.create({
      name: 'FoodSwift Admin',
      email: 'admin@foodswift.com',
      password: 'adminpassword123',
      phone: '+91 94432 00001',
      role: 'admin',
      dietaryPreference: 'any'
    });

    const partnerUser = await User.create({
      name: 'Salem Kitchen Partner',
      email: 'partner@foodswift.com',
      password: 'partnerpassword123',
      phone: '+91 94432 00002',
      role: 'restaurant',
      dietaryPreference: 'any'
    });

    const deliveryUser = await User.create({
      name: 'Karthik Delivery Partner',
      email: 'delivery@foodswift.com',
      password: 'deliverypassword123',
      phone: '+91 94432 00003',
      role: 'delivery',
      dietaryPreference: 'any'
    });

    const customerUser = await User.create({
      name: 'Praveen Customer',
      email: 'customer@foodswift.com',
      password: 'customerpassword123',
      phone: '+91 98421 12345',
      role: 'customer',
      dietaryPreference: 'any'
    });

    // Create delivery partner profile
    await DeliveryPartner.create({
      user: deliveryUser._id,
      vehicleType: 'Bike',
      vehicleNumber: 'TN 30 BD 5521',
      drivingLicenseNumber: 'DL-TN30-2022-7788',
      isAvailable: true,
      currentLocation: { lat: 11.6643, lng: 78.1460 },
      totalDeliveries: 42,
      rating: 4.8,
      todayEarnings: 240,
      cashInHand: 480
    });

    // 3. Seed Demo Addresses in Salem
    console.log('Creating customer addresses...');
    await Address.create([
      {
        user: customerUser._id,
        label: 'Home',
        houseNo: 'Plot No. 42',
        street: 'Brindavan Road, 4th Cross',
        locality: 'Fairlands',
        landmark: 'Near Sarada College',
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636016',
        coordinates: { lat: 11.6780, lng: 78.1415 },
        isDefault: true
      },
      {
        user: customerUser._id,
        label: 'Work',
        houseNo: 'Tech Park B-2',
        street: 'Junction Main Road',
        locality: 'Suramangalam',
        landmark: 'Opposite Railway Station',
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636005',
        coordinates: { lat: 11.6643, lng: 78.1250 },
        isDefault: false
      }
    ]);

    // 4. Seed Promo Coupons
    console.log('Creating demo coupons...');
    await Coupon.create([
      {
        code: 'WELCOME50',
        title: '50% OFF up to ₹100',
        description: 'Enjoy 50% discount on your first FoodSwift delivery in Salem',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscount: 100,
        minOrderValue: 149,
        isActive: true
      },
      {
        code: 'FOODSWIFT10',
        title: '10% OFF Every Order',
        description: 'Flat 10% discount on all food orders above ₹99',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 50,
        minOrderValue: 99,
        isActive: true
      },
      {
        code: 'SALEM20',
        title: '20% OFF Salem Special',
        description: 'Special 20% discount on top rated Salem restaurants',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 120,
        minOrderValue: 249,
        isActive: true
      },
      {
        code: 'FREEDELIVERY',
        title: 'Free Delivery',
        description: 'Zero delivery fee on orders above ₹199 across Salem',
        discountType: 'free_delivery',
        discountValue: 35,
        maxDiscount: 35,
        minOrderValue: 199,
        isActive: true
      }
    ]);

    // 5. Seed Food Categories
    console.log('Creating food categories...');
    const categoryDocMap = {};
    const categoriesToCreate = [
      { name: "Idli and Dosa", isVeg: true, displayOrder: 1 },
      { name: "South Indian Meals", isVeg: true, displayOrder: 2 },
      { name: "Biryani & Rice", isVeg: false, displayOrder: 3 },
      { name: "Salem Street Food", isVeg: true, displayOrder: 4 },
      { name: "Chicken & Mutton Curries", isVeg: false, displayOrder: 5 },
      { name: "Tandoori & Grill", isVeg: false, displayOrder: 6 },
      { name: "Parotta & Salna", isVeg: false, displayOrder: 7 },
      { name: "Pizza & Burgers", isVeg: false, displayOrder: 8 },
      { name: "Chinese & Noodles", isVeg: false, displayOrder: 9 },
      { name: "Desserts & Shakes", isVeg: true, displayOrder: 10 },
      { name: "Beverages & Coffee", isVeg: true, displayOrder: 11 },
      { name: "Pure Veg Specials", isVeg: true, displayOrder: 12 }
    ];

    for (const cat of categoriesToCreate) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const doc = await FoodCategory.create({
        name: cat.name,
        slug,
        isVegCategory: cat.isVeg,
        displayOrder: cat.displayOrder,
        image: cat.isVeg
          ? "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80"
      });
      categoryDocMap[cat.name] = doc._id;
    }

    // 6. Generate and Seed 200+ Salem Restaurants
    console.log('Generating and inserting 200+ Salem restaurants...');
    const generatedRestaurantData = generateRestaurants();
    const createdRestaurants = [];

    for (let i = 0; i < generatedRestaurantData.length; i++) {
      const r = generatedRestaurantData[i];
      const slug = `${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${r.locality.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`;
      
      const banner = bannerImages[i % bannerImages.length];
      const logo = logoImages[i % logoImages.length];

      const doc = await Restaurant.create({
        name: r.name,
        slug,
        description: `Authentic taste in ${r.locality}, Salem. Fresh ingredients, lightning delivery, and hygiene guaranteed.`,
        cuisines: r.cuisines,
        branchAddress: r.branchAddress,
        locality: r.locality,
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001',
        coordinates: {
          lat: 11.6643 + (Math.random() - 0.5) * 0.08,
          lng: 78.1460 + (Math.random() - 0.5) * 0.08
        },
        logoUrl: logo,
        bannerUrl: banner,
        phone: `+91 427 2${Math.floor(100000 + Math.random() * 900000)}`,
        email: `contact@${slug.slice(0, 15)}.in`,
        openingHours: '08:00 AM - 11:30 PM',
        isOpen: true,
        minOrderAmount: r.priceRange === '₹₹₹' ? 199 : (r.priceRange === '₹₹' ? 120 : 70),
        deliveryFee: i % 5 === 0 ? 0 : 30 + (i % 3) * 5,
        estimatedDeliveryTime: r.prepTime || 25,
        serviceArea: `Within 8 km of ${r.locality}`,
        rating: r.rating || 4.2,
        reviewCount: 30 + (i * 7) % 350,
        isPureVeg: r.isPureVeg,
        hasNonVeg: !r.isPureVeg,
        priceRange: r.priceRange,
        isActive: true,
        isVerified: true,
        owner: i === 0 ? partnerUser._id : undefined,
        featured: i < 15
      });

      createdRestaurants.push(doc);
    }

    console.log(`Successfully seeded ${createdRestaurants.length} Salem restaurants!`);

    // 7. Generate and Seed 100+ Food Items Per Restaurant across all Salem restaurants
    console.log('Generating 100+ food items for EACH of the 210 Salem restaurants (Total: ~24,000 items)...');

    const foodItemsToInsert = [];
    let vegCount = 0;
    let nonVegCount = 0;

    for (let rIdx = 0; rIdx < createdRestaurants.length; rIdx++) {
      const rest = createdRestaurants[rIdx];
      const isPureVegRest = rest.isPureVeg;
      const catalog = isPureVegRest ? masterVegCatalog : masterNonVegCatalog;

      for (let itemIdx = 0; itemIdx < catalog.length; itemIdx++) {
        const template = catalog[itemIdx];

        // Give signature touches to items per restaurant
        const dishName = (rIdx > 0 && itemIdx % 4 === 0)
          ? `${rest.name.split(' ')[0]} Special ${template.name}`
          : template.name;

        const itemSlug = `${dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${rest._id.toString().slice(-4)}-${itemIdx}`;

        const imageUrl = getAccurateDishImage(dishName, template.category, template.isVeg);

        foodItemsToInsert.push({
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
          prepTime: rest.estimatedDeliveryTime,
          portionSizes: template.isVeg ? [
            { name: 'Standard', price: template.price },
            { name: 'Large', price: Math.round(template.price * 1.5) }
          ] : [
            { name: 'Half / Regular', price: template.price },
            { name: 'Full / Jumbo', price: Math.round(template.price * 1.6) }
          ],
          addOns: template.isVeg ? [
            { name: 'Extra Chutney / Sambar', price: 20 },
            { name: 'Pure Ghee Topping', price: 25 }
          ] : [
            { name: 'Extra Salna / Gravy', price: 25 },
            { name: 'Boiled Egg (1 Pc)', price: 15 },
            { name: 'Mayonnaise Dip', price: 20 }
          ],
          spiceLevel: template.isVeg ? (itemIdx % 3 === 0 ? 'Spicy' : 'Medium') : (itemIdx % 2 === 0 ? 'Spicy' : 'Medium'),
          rating: Math.round((4.0 + (itemIdx % 9) * 0.1) * 10) / 10,
          ratingCount: 15 + (rIdx * 2 + itemIdx) % 80
        });

        if (template.isVeg) {
          vegCount++;
        } else {
          nonVegCount++;
        }
      }
    }

    console.log(`Inserting ${foodItemsToInsert.length} food items into database in chunks of 2,000... (Veg: ${vegCount}, Non-Veg: ${nonVegCount})`);
    
    // Batch insert in chunks of 2,000 for rapid insertion
    const chunkSize = 2000;
    for (let c = 0; c < foodItemsToInsert.length; c += chunkSize) {
      const slice = foodItemsToInsert.slice(c, c + chunkSize);
      await FoodItem.insertMany(slice, { ordered: false });
      console.log(`Inserted chunk ${Math.floor(c / chunkSize) + 1}/${Math.ceil(foodItemsToInsert.length / chunkSize)}`);
    }

    // 8. Add sample reviews for top restaurants
    console.log('Adding verified customer reviews for top restaurants...');
    const topRestaurants = createdRestaurants.slice(0, 5);
    for (const r of topRestaurants) {
      await Review.create([
        {
          user: customerUser._id,
          restaurant: r._id,
          rating: 5,
          comment: `Outstanding food quality from ${r.name}! Arrived piping hot in Salem Fairlands within 25 minutes. Packaging was spill-proof.`,
          isVerifiedPurchase: true
        },
        {
          user: adminUser._id,
          restaurant: r._id,
          rating: 4.5,
          comment: `Classic Salem taste! The authentic spice blend and quick preparation makes it one of my regular go-tos on FoodSwift.`,
          isVerifiedPurchase: true
        }
      ]);
    }

    console.log('====================================================');
    console.log('🎉 FOODSWIFT SEED COMPLETED SUCCESSFULLY!');
    console.log(`📍 City: Salem, Tamil Nadu, India`);
    console.log(`🏪 Total Restaurants: ${createdRestaurants.length} (Target: 200+)`);
    console.log(`🥗 Total Veg Food Items: ${vegCount} (Target: 1,000+)`);
    console.log(`🍗 Total Non-Veg Food Items: ${nonVegCount} (Target: 1,000+)`);
    console.log(`📦 Grand Total Items: ${foodItemsToInsert.length}`);
    console.log(`🔑 Demo Accounts:`);
    console.log(`   Customer:   customer@foodswift.com   / customerpassword123`);
    console.log(`   Admin:      admin@foodswift.com      / adminpassword123`);
    console.log(`   Restaurant: partner@foodswift.com    / partnerpassword123`);
    console.log(`   Delivery:   delivery@foodswift.com   / deliverypassword123`);
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    await disconnectDB();
    process.exit(1);
  }
}

seedDatabase();
