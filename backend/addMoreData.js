import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// ──────────────────────────────────────────────
// Connect
// ──────────────────────────────────────────────
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodswift');
console.log('✅ Connected to MongoDB\n');

const db = mongoose.connection.db;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const now = () => new Date().toISOString();
const randFloat = (min, max, dec = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ──────────────────────────────────────────────
// Admin user (existing)
// ──────────────────────────────────────────────
const adminUser = await db.collection('users').findOne({ role: 'admin' });
if (!adminUser) { console.error('No admin user found!'); process.exit(1); }
const adminId = adminUser._id;
console.log(`👤 Using admin: ${adminUser.name} (${adminId})\n`);

// ──────────────────────────────────────────────
// 25 New Restaurants
// ──────────────────────────────────────────────
const restaurantTemplates = [
  { name: 'Pizza Planet',          cuisine: ['Italian'],                 address: '12 Margherita Lane, Food Hub',         image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60' },
  { name: 'Burger Barn',           cuisine: ['American'],                address: '45 Patty Street, Grill Square',        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60' },
  { name: 'Wok & Roll',            cuisine: ['Chinese'],                 address: '7 Dragon Road, Asia Town',            image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=60' },
  { name: 'Royal Taj Kitchen',     cuisine: ['Indian'],                  address: '22 Curry Boulevard, Spice District',  image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=60' },
  { name: 'Taco Fiesta',           cuisine: ['Mexican'],                 address: '9 Salsa Street, Flavor Town',         image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60' },
  { name: 'Sakura Sushi',          cuisine: ['Japanese'],                address: '3 Sakura Avenue, East Quarter',       image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=60' },
  { name: 'Bangkok Spice',         cuisine: ['Thai'],                    address: '18 Lemongrass Road, Spice Quarter',   image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=60' },
  { name: 'The Green Bowl',        cuisine: ['Healthy', 'Salads'],       address: '55 Leafy Lane, Wellness Block',       image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60' },
  { name: 'Sweet Treats Bakery',   cuisine: ['Bakery', 'Desserts'],      address: '8 Sugar Street, Confection Corner',   image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60' },
  { name: 'Olive Grove',           cuisine: ['Mediterranean'],           address: '31 Olive Road, Euro Quarter',         image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60' },
  { name: 'Pasta Palace',          cuisine: ['Italian'],                 address: '14 Farfalle Way, Pasta District',     image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60' },
  { name: 'Slider Station',        cuisine: ['American'],                address: '60 Slider Street, Burger Town',       image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60' },
  { name: 'Golden Dragon',         cuisine: ['Chinese'],                 address: '5 Dragon Boulevard, Chinatown',       image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60' },
  { name: 'Cantina Mexicana',      cuisine: ['Mexican'],                 address: '27 Guacamole Road, Latin Quarter',    image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=600&auto=format&fit=crop&q=60' },
  { name: 'Tokyo Diner',           cuisine: ['Japanese'],                address: '11 Ramen Road, Japan Town',           image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=60' },
  { name: 'Thai Lotus',            cuisine: ['Thai'],                    address: '4 Basil Boulevard, East District',    image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&auto=format&fit=crop&q=60' },
  { name: 'Guilt-Free Cafe',       cuisine: ['Healthy', 'Vegan'],        address: '99 Quinoa Avenue, Wellness Park',     image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=60' },
  { name: 'Cupcake Corner',        cuisine: ['Bakery', 'Desserts'],      address: '16 Frosting Street, Sweet Lane',      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&auto=format&fit=crop&q=60' },
  { name: 'Athens Grill',          cuisine: ['Mediterranean', 'Greek'],  address: '20 Feta Road, Mediterranean Corner',  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60' },
  { name: 'Mumbai Masala',         cuisine: ['Indian', 'Street Food'],   address: '33 Chaat Chowk, Foodie Street',       image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&auto=format&fit=crop&q=60' },
  { name: 'Kerala Kitchen',        cuisine: ['Indian', 'South Indian'],  address: '77 Coconut Road, South Block',        image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&auto=format&fit=crop&q=60' },
  { name: 'Dhaba Express',         cuisine: ['Indian', 'Punjabi'],       address: '2 Sarson Da Saag Lane, Punjab Nagar', image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=600&auto=format&fit=crop&q=60' },
  { name: 'BBQ Nation House',      cuisine: ['American', 'BBQ'],         address: '50 Smoky Street, Grill Quarter',      image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60' },
  { name: 'Seafood Harbour',       cuisine: ['Seafood', 'Coastal'],      address: '1 Marina Drive, Harbour Front',       image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=60' },
  { name: 'Noodle Nest',           cuisine: ['Chinese', 'Pan Asian'],    address: '6 Noodle Street, Asia Hub',           image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop&q=60' },
];

console.log(`🏪 Inserting ${restaurantTemplates.length} new restaurants...`);
const restaurantDocs = restaurantTemplates.map(t => ({
  name: t.name,
  description: `Experience authentic ${t.cuisine.join(' & ')} cuisine crafted by expert chefs using the finest ingredients.`,
  cuisine: t.cuisine,
  address: t.address,
  image: t.image,
  rating: randFloat(3.5, 5.0),
  reviewCount: randInt(30, 800),
  deliveryTime: `${randInt(15, 20)}-${randInt(30, 50)} min`,
  deliveryFee: pick([0, 20, 30, 40, 50]),
  minimumOrder: pick([99, 150, 200, 250]),
  location: { type: 'Point', coordinates: [0, 0] },
  owner: adminId,
  isOpen: true,
  isApproved: true,
  isBlocked: false,
  createdAt: now(),
  updatedAt: now(),
}));
const insertedRestaurants = await db.collection('restaurants').insertMany(restaurantDocs);
const newRestaurantIds = Object.values(insertedRestaurants.insertedIds);
console.log(`   ✅ Inserted ${newRestaurantIds.length} restaurants.\n`);

// ──────────────────────────────────────────────
// All restaurant IDs (existing + new)
// ──────────────────────────────────────────────
const allRestaurants = await db.collection('restaurants').find({}).toArray();
const allRestaurantIds = allRestaurants.map(r => r._id);
console.log(`📋 Total restaurants now: ${allRestaurantIds.length}\n`);

// ──────────────────────────────────────────────
// Food item data pools
// ──────────────────────────────────────────────
const vegImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1484723091739-30990dd1drop?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&auto=format&fit=crop&q=60',
];
const nonVegImages = [
  'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60',
];

// ── VEG ITEMS ──────────────────────────────────
const vegItems = [
  // Pizzas (veg)
  { name: 'Margherita Pizza', category: 'Pizza', price: 249, desc: 'Classic tomato sauce, fresh mozzarella, and basil leaves on a hand-tossed crust.' },
  { name: 'Farmhouse Pizza', category: 'Pizza', price: 279, desc: 'Capsicum, onions, tomatoes, mushrooms, and baby corn on a zesty tomato base.' },
  { name: 'Paneer Tikka Pizza', category: 'Pizza', price: 299, desc: 'Tandoori paneer cubes, red onions, and bell peppers with mint chutney base.' },
  { name: 'Double Cheese Burst Pizza', category: 'Pizza', price: 319, desc: 'Cheese-filled crust loaded with four cheese blend and fresh herbs.' },
  { name: 'BBQ Veggie Pizza', category: 'Pizza', price: 289, desc: 'Smoky BBQ sauce, corn, mushrooms, and assorted veggies with mozzarella.' },
  { name: 'Pesto Garden Pizza', category: 'Pizza', price: 299, desc: 'Fresh basil pesto, cherry tomatoes, olives, and zucchini.' },
  { name: 'Mexican Wave Pizza', category: 'Pizza', price: 309, desc: 'Jalapenos, red kidney beans, corn, and salsa with spicy sauce.' },
  { name: 'Mushroom & Truffle Pizza', category: 'Pizza', price: 349, desc: 'Wild mushrooms, truffle oil, gruyere cheese on a thin crust.' },
  { name: 'Spicy Paneer Pizza', category: 'Pizza', price: 299, desc: 'Marinated spicy paneer with green chillies and coriander.' },
  { name: 'Hawaiian Veggie Pizza', category: 'Pizza', price: 289, desc: 'Pineapple, bell peppers, mushrooms, and mozzarella on tomato base.' },

  // Burgers (veg)
  { name: 'Veggie Crunch Burger', category: 'Burgers', price: 149, desc: 'Crispy veggie patty with fresh lettuce, tomatoes, and special sauce.' },
  { name: 'Paneer Tikka Burger', category: 'Burgers', price: 169, desc: 'Tandoori paneer patty with mint chutney, onion rings and coleslaw.' },
  { name: 'Mushroom Swiss Burger', category: 'Burgers', price: 179, desc: 'Sautéed mushrooms, Swiss cheese, caramelized onions on brioche bun.' },
  { name: 'Aloo Tikki Burger', category: 'Burgers', price: 129, desc: 'Spiced potato patty with tangy chutney and fresh veggies.' },
  { name: 'Black Bean Burger', category: 'Burgers', price: 189, desc: 'Hearty black bean patty with avocado, jalapeños, and chipotle mayo.' },
  { name: 'Corn & Cheese Burger', category: 'Burgers', price: 159, desc: 'Sweet corn and cheese patty with coleslaw and mustard sauce.' },
  { name: 'Double Veggie Burger', category: 'Burgers', price: 199, desc: 'Double veggie patty with extra cheese, pickles, and special sauce.' },
  { name: 'Spinach Falafel Burger', category: 'Burgers', price: 179, desc: 'Crispy falafel with spinach, tahini, and tomatoes on pita bun.' },
  { name: 'Cheese Burst Burger', category: 'Burgers', price: 189, desc: 'Molten cheese-filled veggie patty with crispy onion rings.' },
  { name: 'Peri Peri Veggie Burger', category: 'Burgers', price: 169, desc: 'Spicy peri-peri coated veggie patty with cooling coleslaw.' },

  // Pasta (veg)
  { name: 'Penne Arrabbiata', category: 'Pasta', price: 199, desc: 'Spicy tomato sauce with garlic and chili flakes on penne pasta.' },
  { name: 'Fettuccine Alfredo', category: 'Pasta', price: 229, desc: 'Creamy parmesan sauce with butter and garlic on fettuccine.' },
  { name: 'Pasta Primavera', category: 'Pasta', price: 219, desc: 'Fresh seasonal vegetables in light olive oil and herb sauce.' },
  { name: 'Mushroom Pesto Pasta', category: 'Pasta', price: 239, desc: 'Wild mushrooms, basil pesto, sun-dried tomatoes on rigatoni.' },
  { name: 'Mac & Cheese', category: 'Pasta', price: 189, desc: 'Creamy four-cheese béchamel sauce on elbow macaroni.' },
  { name: 'Rose Sauce Pasta', category: 'Pasta', price: 229, desc: 'Blend of tomato and cream sauce with fresh basil on penne.' },
  { name: 'Spinach Lasagna', category: 'Pasta', price: 259, desc: 'Layered pasta with ricotta, spinach, and rich tomato sauce.' },
  { name: 'Aglio e Olio', category: 'Pasta', price: 189, desc: 'Simple spaghetti with garlic, olive oil, and parsley.' },
  { name: 'Paneer Pasta', category: 'Pasta', price: 219, desc: 'Indian fusion pasta with paneer cubes in spiced tomato cream sauce.' },
  { name: 'Truffle Mushroom Pasta', category: 'Pasta', price: 279, desc: 'Gourmet pasta with truffle oil, mixed mushrooms, and parmesan.' },

  // Indian Curries (veg)
  { name: 'Palak Paneer', category: 'Indian Curries', price: 199, desc: 'Fresh cottage cheese in creamy spinach gravy with aromatic spices.' },
  { name: 'Dal Makhani', category: 'Indian Curries', price: 179, desc: 'Slow-cooked black lentils in buttery tomato gravy.' },
  { name: 'Chana Masala', category: 'Indian Curries', price: 169, desc: 'Spiced chickpeas in tangy onion-tomato gravy.' },
  { name: 'Paneer Butter Masala', category: 'Indian Curries', price: 219, desc: 'Soft paneer in rich, creamy tomato butter sauce.' },
  { name: 'Aloo Gobi', category: 'Indian Curries', price: 159, desc: 'Potatoes and cauliflower cooked with turmeric and cumin.' },
  { name: 'Malai Kofta', category: 'Indian Curries', price: 229, desc: 'Fried vegetable dumplings in rich cream and cashew sauce.' },
  { name: 'Baingan Bharta', category: 'Indian Curries', price: 169, desc: 'Smoky roasted eggplant with onions, tomatoes, and spices.' },
  { name: 'Kadhai Paneer', category: 'Indian Curries', price: 219, desc: 'Paneer with bell peppers in spiced tomato onion gravy.' },
  { name: 'Matar Paneer', category: 'Indian Curries', price: 199, desc: 'Green peas and paneer in aromatic onion-tomato gravy.' },
  { name: 'Mix Veg Curry', category: 'Indian Curries', price: 179, desc: 'Seasonal vegetables in rich onion-tomato masala gravy.' },

  // Salads
  { name: 'Caesar Salad', category: 'Salads', price: 149, desc: 'Romaine lettuce, croutons, parmesan with classic Caesar dressing.' },
  { name: 'Greek Salad', category: 'Salads', price: 159, desc: 'Tomatoes, cucumbers, olives, feta with oregano and olive oil.' },
  { name: 'Quinoa Power Bowl', category: 'Salads', price: 179, desc: 'Quinoa, roasted veggies, chickpeas, and lemon tahini dressing.' },
  { name: 'Avocado Garden Salad', category: 'Salads', price: 189, desc: 'Fresh avocado, cherry tomatoes, cucumber, and citrus dressing.' },
  { name: 'Asian Sesame Salad', category: 'Salads', price: 169, desc: 'Shredded cabbage, edamame, carrots with sesame ginger dressing.' },
  { name: 'Caprese Salad', category: 'Salads', price: 169, desc: 'Buffalo mozzarella, tomatoes, basil with balsamic glaze.' },
  { name: 'Spinach Walnut Salad', category: 'Salads', price: 179, desc: 'Baby spinach, walnuts, cranberries with honey mustard dressing.' },
  { name: 'Mexican Corn Salad', category: 'Salads', price: 149, desc: 'Grilled corn, black beans, avocado, jalapeños and lime dressing.' },
  { name: 'Watermelon Feta Salad', category: 'Salads', price: 159, desc: 'Juicy watermelon, mint, feta, and cucumber with lemon.' },
  { name: 'Rainbow Buddha Bowl', category: 'Salads', price: 199, desc: 'Colorful veggies, hummus, grains, and seeds in a vibrant bowl.' },

  // Sandwiches & Wraps (veg)
  { name: 'Grilled Veggie Sandwich', category: 'Sandwiches & Wraps', price: 129, desc: 'Grilled zucchini, peppers, and cheese on sourdough.' },
  { name: 'Paneer Tikka Wrap', category: 'Sandwiches & Wraps', price: 149, desc: 'Spiced paneer with mint chutney, onions in a soft tortilla.' },
  { name: 'Club Sandwich (Veg)', category: 'Sandwiches & Wraps', price: 159, desc: 'Triple-decker with cheese, lettuce, tomatoes, and cucumber.' },
  { name: 'Avocado Toast Sandwich', category: 'Sandwiches & Wraps', price: 169, desc: 'Smashed avocado on multigrain bread with sprouts.' },
  { name: 'Falafel Wrap', category: 'Sandwiches & Wraps', price: 149, desc: 'Crispy falafel, tahini, pickled veggies in pita bread.' },
  { name: 'Hummus & Veggie Wrap', category: 'Sandwiches & Wraps', price: 139, desc: 'Creamy hummus, roasted veggies, and herbs in whole wheat wrap.' },
  { name: 'Caprese Panini', category: 'Sandwiches & Wraps', price: 179, desc: 'Mozzarella, tomato, basil pesto pressed panini.' },
  { name: 'BLT Veggie Wrap', category: 'Sandwiches & Wraps', price: 139, desc: 'Beetroot, lettuce, tomato with yogurt dressing in a wrap.' },

  // Sushi (veg)
  { name: 'Avocado Roll', category: 'Sushi', price: 249, desc: 'Fresh avocado, cucumber, and sesame in nori-wrapped sushi roll.' },
  { name: 'Vegetable Tempura Roll', category: 'Sushi', price: 279, desc: 'Crispy tempura veggies with pickled ginger and wasabi.' },
  { name: 'Cucumber Maki', category: 'Sushi', price: 199, desc: 'Simple and fresh cucumber rolled in seasoned sushi rice.' },
  { name: 'Sweet Potato Roll', category: 'Sushi', price: 229, desc: 'Caramelized sweet potato with cream cheese and cucumber.' },
  { name: 'Rainbow Veg Roll', category: 'Sushi', price: 289, desc: 'Colorful veggies layered on top of a California-style roll.' },

  // Soups
  { name: 'Tomato Basil Soup', category: 'Soups', price: 99, desc: 'Creamy blended tomato soup with fresh basil and cream swirl.' },
  { name: 'Mushroom Cream Soup', category: 'Soups', price: 119, desc: 'Velvety mushroom and garlic cream soup with croutons.' },
  { name: 'Minestrone Soup', category: 'Soups', price: 129, desc: 'Italian vegetable soup with pasta, beans, and herbs.' },
  { name: 'Sweet Corn Soup', category: 'Soups', price: 109, desc: 'Indo-Chinese style sweet corn veggie soup.' },
  { name: 'Lentil Shorba', category: 'Soups', price: 109, desc: 'Spiced red lentil soup with cumin and coriander.' },
  { name: 'Hot & Sour Soup', category: 'Soups', price: 119, desc: 'Tangy-spicy Indo-Chinese soup with tofu and veggies.' },
  { name: 'French Onion Soup', category: 'Soups', price: 129, desc: 'Caramelized onion broth with gruyere crouton topping.' },
  { name: 'Pumpkin Bisque', category: 'Soups', price: 119, desc: 'Smooth roasted pumpkin soup with nutmeg and cream.' },

  // Desserts
  { name: 'Chocolate Lava Cake', category: 'Desserts', price: 149, desc: 'Warm chocolate cake with a molten center, served with ice cream.' },
  { name: 'Gulab Jamun (4 pcs)', category: 'Desserts', price: 99, desc: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup.' },
  { name: 'Tiramisu', category: 'Desserts', price: 169, desc: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone.' },
  { name: 'Cheesecake Slice', category: 'Desserts', price: 149, desc: 'New York style baked cheesecake with strawberry compote.' },
  { name: 'Kheer', category: 'Desserts', price: 99, desc: 'Traditional rice pudding with saffron, cardamom, and almonds.' },
  { name: 'Brownie Sundae', category: 'Desserts', price: 159, desc: 'Warm fudge brownie topped with vanilla ice cream and hot chocolate sauce.' },
  { name: 'Mango Kulfi', category: 'Desserts', price: 119, desc: 'Frozen Indian ice cream with real mango pulp and pistachios.' },
  { name: 'Rasmalai (2 pcs)', category: 'Desserts', price: 129, desc: 'Spongy paneer discs in sweetened saffron-flavored milk.' },
  { name: 'Waffles with Nutella', category: 'Desserts', price: 169, desc: 'Crispy Belgian waffles with Nutella, banana, and whipped cream.' },
  { name: 'Panna Cotta', category: 'Desserts', price: 159, desc: 'Silky Italian cream dessert with berry coulis.' },

  // Beverages
  { name: 'Mango Lassi', category: 'Beverages', price: 89, desc: 'Chilled yogurt drink blended with fresh Alphonso mangoes.' },
  { name: 'Masala Chai', category: 'Beverages', price: 49, desc: 'Spiced Indian tea with ginger, cardamom, and milk.' },
  { name: 'Cold Coffee', category: 'Beverages', price: 99, desc: 'Frothy cold coffee with ice cream, perfect pick-me-up.' },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 59, desc: 'Chilled sparkling water with fresh lime, salt, and mint.' },
  { name: 'Watermelon Juice', category: 'Beverages', price: 79, desc: 'Fresh blended watermelon juice with a pinch of black salt.' },
  { name: 'Virgin Mojito', category: 'Beverages', price: 99, desc: 'Sparkling water with fresh mint, lime, and sugar.' },
  { name: 'Strawberry Milkshake', category: 'Beverages', price: 119, desc: 'Thick strawberry milkshake with fresh berries and cream.' },
  { name: 'Blue Lagoon Mocktail', category: 'Beverages', price: 129, desc: 'Blue curacao syrup, sprite, lemon, and mint garnish.' },
  { name: 'Rose Lemonade', category: 'Beverages', price: 89, desc: 'Refreshing lemonade infused with rose syrup and basil seeds.' },
  { name: 'Coconut Water', category: 'Beverages', price: 69, desc: 'Fresh tender coconut water served chilled with pulp.' },

  // Breakfast Specialties
  { name: 'Masala Dosa', category: 'Breakfast Specialties', price: 129, desc: 'Crispy rice crepe stuffed with spiced potato filling, served with chutneys.' },
  { name: 'Idli Sambar (4 pcs)', category: 'Breakfast Specialties', price: 109, desc: 'Fluffy steamed rice cakes with lentil vegetable stew.' },
  { name: 'Poha', category: 'Breakfast Specialties', price: 89, desc: 'Flattened rice cooked with onions, mustard seeds, and turmeric.' },
  { name: 'Upma', category: 'Breakfast Specialties', price: 89, desc: 'Semolina porridge with vegetables and curry leaves.' },
  { name: 'Avocado Toast', category: 'Breakfast Specialties', price: 149, desc: 'Smashed avocado on multigrain toast with poached egg and seeds.' },
  { name: 'Pancakes Stack', category: 'Breakfast Specialties', price: 169, desc: 'Fluffy buttermilk pancakes with maple syrup and fresh berries.' },
  { name: 'French Toast', category: 'Breakfast Specialties', price: 139, desc: 'Brioche dipped in egg batter, pan-fried with powdered sugar and syrup.' },
  { name: 'Paratha with Butter', category: 'Breakfast Specialties', price: 99, desc: 'Whole wheat layered flatbread with white butter and pickle.' },
  { name: 'Chole Bhature', category: 'Breakfast Specialties', price: 149, desc: 'Spiced chickpea curry with fried puffed bread.' },
  { name: 'Pav Bhaji', category: 'Breakfast Specialties', price: 129, desc: 'Spiced mashed vegetable curry with buttered bread rolls.' },

  // Spring Rolls & Momos
  { name: 'Veg Spring Rolls (6 pcs)', category: 'Spring Rolls & Momos', price: 129, desc: 'Crispy rolls filled with shredded cabbage, carrots, and noodles.' },
  { name: 'Steamed Veg Momos (8 pcs)', category: 'Spring Rolls & Momos', price: 119, desc: 'Soft steamed dumplings with spiced vegetable filling.' },
  { name: 'Fried Veg Momos (8 pcs)', category: 'Spring Rolls & Momos', price: 139, desc: 'Crispy fried dumplings with tangy chilli dipping sauce.' },
  { name: 'Corn Spring Rolls (6 pcs)', category: 'Spring Rolls & Momos', price: 139, desc: 'Sweet corn and cheese filled crispy spring rolls.' },
  { name: 'Paneer Momos (8 pcs)', category: 'Spring Rolls & Momos', price: 149, desc: 'Steamed dumplings stuffed with spiced paneer and herbs.' },

  // Vegan Bowls
  { name: 'Acai Bowl', category: 'Vegan Bowls', price: 189, desc: 'Blended acai base with granola, banana, berries, and coconut flakes.' },
  { name: 'Tofu Stir-Fry Bowl', category: 'Vegan Bowls', price: 179, desc: 'Pan-seared tofu with bok choy, edamame, and teriyaki sauce over rice.' },
  { name: 'Lentil & Veggie Bowl', category: 'Vegan Bowls', price: 169, desc: 'Spiced red lentils with roasted sweet potato and greens.' },
  { name: 'Mexican Burrito Bowl', category: 'Vegan Bowls', price: 189, desc: 'Cilantro lime rice, black beans, salsa, guacamole, and corn.' },
  { name: 'Mediterranean Grain Bowl', category: 'Vegan Bowls', price: 199, desc: 'Farro, roasted veggies, hummus, olives, and za\'atar dressing.' },

  // Kids Meals
  { name: 'Mini Cheese Pizza', category: 'Kids Meals', price: 129, desc: 'Personal-sized pizza with tomato sauce and mozzarella.' },
  { name: 'Veg Nuggets (8 pcs)', category: 'Kids Meals', price: 119, desc: 'Crispy breaded vegetable nuggets with ketchup and cheese dip.' },
  { name: 'Mac & Cheese Kids Bowl', category: 'Kids Meals', price: 109, desc: 'Creamy macaroni in cheese sauce, easy on the spice.' },
  { name: 'Mini Sliders (3 pcs)', category: 'Kids Meals', price: 129, desc: 'Bite-sized veggie sliders with mild toppings.' },
  { name: 'Fruit Yogurt Parfait', category: 'Kids Meals', price: 99, desc: 'Layered yogurt, granola, and mixed fruits in a cup.' },

  // Pastries & Donuts
  { name: 'Croissant', category: 'Pastries & Donuts', price: 79, desc: 'Buttery flaky French croissant, baked fresh daily.' },
  { name: 'Glazed Donut', category: 'Pastries & Donuts', price: 59, desc: 'Classic ring donut with sweet glaze.' },
  { name: 'Chocolate Éclair', category: 'Pastries & Donuts', price: 89, desc: 'Choux pastry filled with cream and topped with chocolate ganache.' },
  { name: 'Blueberry Muffin', category: 'Pastries & Donuts', price: 79, desc: 'Moist muffin loaded with fresh blueberries.' },
  { name: 'Cinnamon Roll', category: 'Pastries & Donuts', price: 99, desc: 'Soft swirled roll with cinnamon sugar and cream cheese frosting.' },
  { name: 'Red Velvet Cupcake', category: 'Pastries & Donuts', price: 89, desc: 'Moist red velvet cupcake with cream cheese frosting.' },

  // Coffee & Tea
  { name: 'Cappuccino', category: 'Coffee & Tea', price: 99, desc: 'Espresso with steamed milk and thick foam topping.' },
  { name: 'Café Latte', category: 'Coffee & Tea', price: 109, desc: 'Smooth espresso with steamed milk, lightly frothed.' },
  { name: 'Green Tea', category: 'Coffee & Tea', price: 69, desc: 'Premium Japanese green tea leaves steeped to perfection.' },
  { name: 'Americano', category: 'Coffee & Tea', price: 89, desc: 'Double espresso diluted with hot water.' },
  { name: 'Chai Latte', category: 'Coffee & Tea', price: 99, desc: 'Masala chai syrup with steamed frothy milk.' },
  { name: 'Matcha Latte', category: 'Coffee & Tea', price: 119, desc: 'Premium Japanese matcha whisked with oat milk.' },
  { name: 'Cold Brew', category: 'Coffee & Tea', price: 129, desc: '24-hour slow-steeped coffee, served over ice.' },
];

// ── NON-VEG ITEMS ─────────────────────────────
const nonVegItems = [
  // Chicken Dishes
  { name: 'Butter Chicken', category: 'Chicken Dishes', price: 279, desc: 'Tender chicken in rich, creamy tomato butter sauce. A classic favourite.' },
  { name: 'Chicken Tikka Masala', category: 'Chicken Dishes', price: 289, desc: 'Grilled chicken pieces simmered in spiced tomato masala gravy.' },
  { name: 'Chicken Biryani', category: 'Chicken Dishes', price: 299, desc: 'Fragrant basmati rice layered with slow-cooked spiced chicken.' },
  { name: 'Chicken Korma', category: 'Chicken Dishes', price: 269, desc: 'Mild, creamy chicken curry with cashew and coconut milk.' },
  { name: 'Tandoori Chicken Half', category: 'Chicken Dishes', price: 299, desc: 'Marinated half chicken roasted in a clay oven until smoky.' },
  { name: 'Chicken 65', category: 'Chicken Dishes', price: 229, desc: 'Deep-fried chicken with South Indian spices and curry leaves.' },
  { name: 'Chilli Chicken (Dry)', category: 'Chicken Dishes', price: 239, desc: 'Indo-Chinese crispy chicken tossed with peppers and chilli sauce.' },
  { name: 'Chicken Rogan Josh', category: 'Chicken Dishes', price: 279, desc: 'Kashmiri-style chicken in aromatic fennel and cardamom gravy.' },
  { name: 'Chicken Keema Pav', category: 'Chicken Dishes', price: 199, desc: 'Spiced minced chicken served with buttered bread rolls.' },
  { name: 'Chicken Shawarma Wrap', category: 'Chicken Dishes', price: 199, desc: 'Marinated chicken shavings with garlic sauce in a pita wrap.' },
  { name: 'BBQ Chicken Wings (6 pcs)', category: 'Chicken Dishes', price: 249, desc: 'Sticky smoky BBQ-glazed wings with blue cheese dip.' },
  { name: 'Chicken Stroganoff', category: 'Chicken Dishes', price: 299, desc: 'Russian-style chicken in sour cream and mushroom sauce.' },
  { name: 'Lemon Herb Grilled Chicken', category: 'Chicken Dishes', price: 279, desc: 'Marinated chicken breast grilled with lemon, garlic, and herbs.' },
  { name: 'Chicken Quesadilla', category: 'Chicken Dishes', price: 229, desc: 'Grilled chicken, cheese, and peppers folded in a crisp tortilla.' },
  { name: 'Nashville Hot Chicken', category: 'Chicken Dishes', price: 269, desc: 'Fiery southern-style fried chicken with pickles on brioche.' },

  // Burgers (non-veg)
  { name: 'Classic Beef Burger', category: 'Burgers', price: 249, desc: 'Juicy beef patty with lettuce, tomato, pickles, and special sauce.' },
  { name: 'Double Smash Burger', category: 'Burgers', price: 299, desc: 'Two smashed beef patties with American cheese and caramelized onions.' },
  { name: 'Chicken Crispy Burger', category: 'Burgers', price: 199, desc: 'Crunchy fried chicken fillet with honey mustard and slaw.' },
  { name: 'BBQ Bacon Burger', category: 'Burgers', price: 279, desc: 'Beef patty with crispy bacon strips, BBQ sauce, and cheese.' },
  { name: 'Spicy Chicken Burger', category: 'Burgers', price: 209, desc: 'Hot and spicy fried chicken with jalapeños and sriracha mayo.' },
  { name: 'Lamb Seekh Burger', category: 'Burgers', price: 269, desc: 'Grilled seekh kebab patty with mint chutney and onion rings.' },
  { name: 'Fish Burger', category: 'Burgers', price: 229, desc: 'Crispy beer-battered fish fillet with tartar sauce and coleslaw.' },
  { name: 'Truffle Mushroom Beef Burger', category: 'Burgers', price: 319, desc: 'Premium beef patty with truffle mayo, mushrooms, and aged cheddar.' },

  // Mutton/Lamb
  { name: 'Mutton Biryani', category: 'Biryani', price: 349, desc: 'Slow-cooked tender mutton with fragrant basmati rice and saffron.' },
  { name: 'Mutton Rogan Josh', category: 'Indian Curries', price: 319, desc: 'Kashmiri braised mutton in bold spice gravy.' },
  { name: 'Lamb Chops', category: 'Kebabs & Grills', price: 399, desc: 'Marinated lamb rib chops grilled to perfection with mint sauce.' },
  { name: 'Mutton Keema Naan', category: 'Breads & Naans', price: 179, desc: 'Naan bread stuffed with spiced minced mutton.' },
  { name: 'Mutton Seekh Kebab', category: 'Kebabs & Grills', price: 299, desc: 'Minced mutton with herbs and spices skewered and grilled.' },
  { name: 'Mutton Curry', category: 'Indian Curries', price: 309, desc: 'Tender mutton pieces in fiery Kolhapuri-style gravy.' },

  // Seafood
  { name: 'Fish & Chips', category: 'Seafood Specialties', price: 299, desc: 'Classic beer-battered fish fillets with thick-cut chips and tartar sauce.' },
  { name: 'Prawn Masala', category: 'Seafood Specialties', price: 319, desc: 'Juicy prawns in tangy onion-tomato masala.' },
  { name: 'Grilled Salmon', category: 'Seafood Specialties', price: 399, desc: 'Atlantic salmon with lemon butter, capers, and dill.' },
  { name: 'Crab Curry', category: 'Seafood Specialties', price: 449, desc: 'Fresh crab cooked in coconut milk and red chilli gravy.' },
  { name: 'Garlic Butter Prawns', category: 'Seafood Specialties', price: 349, desc: 'Jumbo prawns sautéed in garlic butter and white wine.' },
  { name: 'Fish Tikka', category: 'Seafood Specialties', price: 269, desc: 'Spiced fish chunks grilled in a tandoor, served with chutney.' },
  { name: 'Lobster Thermidor', category: 'Seafood Specialties', price: 699, desc: 'Whole lobster with creamy brandy-cheese sauce, gratinéed.' },
  { name: 'Calamari Rings', category: 'Seafood Specialties', price: 249, desc: 'Crispy fried squid rings with garlic aioli dipping sauce.' },
  { name: 'Prawn Biryani', category: 'Biryani', price: 329, desc: 'Spiced prawns layered with fragrant basmati rice and fried onions.' },
  { name: 'Tuna Tartare', category: 'Seafood Specialties', price: 349, desc: 'Fresh tuna with sesame, soy, avocado, and wonton crisps.' },

  // Biryani
  { name: 'Egg Biryani', category: 'Biryani', price: 229, desc: 'Boiled eggs marinated in spices, cooked with aromatic basmati rice.' },
  { name: 'Fish Biryani', category: 'Biryani', price: 319, desc: 'Coastal-style fish pieces with basmati rice and whole spices.' },
  { name: 'Hyderabadi Chicken Biryani', category: 'Biryani', price: 319, desc: 'Authentic dum-cooked Hyderabadi biryani with mirchi ka salan.' },
  { name: 'Kolkata Biryani', category: 'Biryani', price: 309, desc: 'Light fragrant biryani with potato, egg, and slow-cooked meat.' },
  { name: 'Keema Biryani', category: 'Biryani', price: 289, desc: 'Minced meat biryani with crispy fried onions.' },

  // Kebabs & Grills
  { name: 'Chicken Malai Tikka', category: 'Kebabs & Grills', price: 269, desc: 'Creamy cheese-marinated chicken tikka, grilled until juicy.' },
  { name: 'Murgh Boti Kebab', category: 'Kebabs & Grills', price: 259, desc: 'Spiced chicken chunks grilled on skewers with peppers.' },
  { name: 'Reshmi Kebab', category: 'Kebabs & Grills', price: 279, desc: 'Silky smooth chicken mince kebab with cream and cashew.' },
  { name: 'Galouti Kebab', category: 'Kebabs & Grills', price: 299, desc: 'Melt-in-your-mouth Awadhi minced meat kebab.' },
  { name: 'Beef Steak (250g)', category: 'Kebabs & Grills', price: 499, desc: 'Grilled premium beef steak, cooked to your preference with sides.' },
  { name: 'Mixed Grill Platter', category: 'Kebabs & Grills', price: 549, desc: 'Assorted kebabs — chicken tikka, seekh, boti, and roti.' },

  // Tandoori Starters
  { name: 'Tandoori Prawns', category: 'Tandoori Starters', price: 329, desc: 'Jumbo prawns marinated in tandoori spices, grilled in clay oven.' },
  { name: 'Chicken Tandoori (Full)', category: 'Tandoori Starters', price: 449, desc: 'Whole chicken marinated overnight and tandoor-roasted.' },
  { name: 'Fish Amritsari', category: 'Tandoori Starters', price: 279, desc: 'Crispy battered fish in Amritsari style, fried golden.' },
  { name: 'Mutton Chap', category: 'Tandoori Starters', price: 349, desc: 'Lamb rib marinated in bold spices and charcoal-grilled.' },
  { name: 'Chicken Achari Tikka', category: 'Tandoori Starters', price: 259, desc: 'Chicken marinated in pickling spices and grilled.' },

  // Pizza (non-veg)
  { name: 'Pepperoni Pizza', category: 'Pizza', price: 319, desc: 'Classic pepperoni slices with mozzarella on tomato sauce.' },
  { name: 'BBQ Chicken Pizza', category: 'Pizza', price: 329, desc: 'Smoky BBQ chicken with red onions and mozzarella.' },
  { name: 'Chicken Supreme Pizza', category: 'Pizza', price: 339, desc: 'Loaded with chicken, peppers, onions, olives, and cheese.' },
  { name: 'Meat Lovers Pizza', category: 'Pizza', price: 369, desc: 'Pepperoni, chicken, bacon, and sausage on rich tomato sauce.' },
  { name: 'Spicy Chicken Pizza', category: 'Pizza', price: 329, desc: 'Fiery chicken with jalapeños and ghost pepper sauce.' },
  { name: 'Prawn & Garlic Pizza', category: 'Pizza', price: 359, desc: 'Garlic butter base with jumbo prawns and herb topping.' },

  // Pasta (non-veg)
  { name: 'Chicken Bolognese', category: 'Pasta', price: 259, desc: 'Slow-cooked chicken mince ragù over spaghetti.' },
  { name: 'Prawn Linguine', category: 'Pasta', price: 299, desc: 'Garlic white wine prawn sauce over linguine pasta.' },
  { name: 'Chicken Carbonara', category: 'Pasta', price: 269, desc: 'Creamy egg and parmesan sauce with chicken and pancetta.' },
  { name: 'Tuna Pasta Bake', category: 'Pasta', price: 249, desc: 'Baked pasta with tuna, corn, and creamy cheese sauce.' },
  { name: 'Lamb Bolognese', category: 'Pasta', price: 289, desc: 'Rich lamb ragù with red wine over pappardelle.' },

  // Appetizers / Starters
  { name: 'Chicken Lollipop (6 pcs)', category: 'Appetizers', price: 249, desc: 'Crispy fried chicken wings shaped into lollipops with chilli sauce.' },
  { name: 'Prawn Cocktail', category: 'Appetizers', price: 249, desc: 'Chilled prawns with Marie Rose sauce and lettuce cups.' },
  { name: 'Devilled Eggs with Bacon', category: 'Appetizers', price: 149, desc: 'Hard-boiled eggs with creamy yolk filling and crispy bacon bits.' },
  { name: 'Chicken Gyoza (6 pcs)', category: 'Appetizers', price: 229, desc: 'Pan-fried Japanese dumplings with chicken filling and ponzu sauce.' },
  { name: 'Nachos with Chicken', category: 'Appetizers', price: 219, desc: 'Loaded nachos with shredded chicken, cheese, jalapeños, and guacamole.' },

  // Noodles (non-veg)
  { name: 'Chicken Hakka Noodles', category: 'Noodles & Rice', price: 199, desc: 'Stir-fried noodles with shredded chicken and veggies in soy sauce.' },
  { name: 'Prawn Pad Thai', category: 'Noodles & Rice', price: 249, desc: 'Rice noodles with prawns, peanuts, bean sprouts, and tamarind.' },
  { name: 'Beef Ramen', category: 'Japanese Ramen', price: 299, desc: 'Rich pork and beef bone broth with noodles, chashu, and soft egg.' },
  { name: 'Chicken Udon', category: 'Japanese Ramen', price: 249, desc: 'Thick udon noodles in light chicken dashi broth with tempura.' },
  { name: 'Egg Fried Rice', category: 'Noodles & Rice', price: 149, desc: 'Wok-tossed rice with scrambled eggs, spring onions and soy.' },
  { name: 'Chicken Fried Rice', category: 'Noodles & Rice', price: 199, desc: 'Fragrant fried rice with chicken, veggies and soy sauce.' },
  { name: 'Prawn Fried Rice', category: 'Noodles & Rice', price: 229, desc: 'Wok-fried rice with juicy prawns and Asian seasonings.' },

  // Thai Curries
  { name: 'Green Chicken Curry', category: 'Thai Curries', price: 279, desc: 'Authentic Thai green curry with coconut milk and chicken.' },
  { name: 'Red Prawn Curry', category: 'Thai Curries', price: 309, desc: 'Fiery Thai red curry with prawns and kaffir lime leaves.' },
  { name: 'Massaman Beef Curry', category: 'Thai Curries', price: 319, desc: 'Rich, mild Thai curry with beef, potatoes, and peanuts.' },

  // Sushi (non-veg)
  { name: 'Salmon Nigiri (2 pcs)', category: 'Sushi', price: 189, desc: 'Fresh Atlantic salmon over seasoned sushi rice.' },
  { name: 'Tuna Roll', category: 'Sushi', price: 229, desc: 'Fresh tuna with cucumber in nori-wrapped sushi roll.' },
  { name: 'Dragon Roll', category: 'Sushi', price: 299, desc: 'Ebi tempura inside, avocado outside with eel sauce.' },
  { name: 'Spicy Tuna Roll', category: 'Sushi', price: 249, desc: 'Tuna with sriracha and sesame in a spicy maki roll.' },
  { name: 'Philadelphia Roll', category: 'Sushi', price: 259, desc: 'Smoked salmon with cream cheese and cucumber.' },

  // Wings and Fried
  { name: 'Buffalo Wings (8 pcs)', category: 'Chicken Dishes', price: 289, desc: 'Crispy wings tossed in tangy buffalo sauce with ranch dip.' },
  { name: 'Honey Garlic Wings (8 pcs)', category: 'Chicken Dishes', price: 279, desc: 'Sticky honey garlic glazed crispy chicken wings.' },
  { name: 'Korean Fried Chicken', category: 'Chicken Dishes', price: 289, desc: 'Double-fried crispy chicken with gochujang glaze and sesame.' },
  { name: 'Fried Chicken Platter', category: 'Chicken Dishes', price: 329, desc: 'Signature Southern fried chicken with coleslaw and fries.' },

  // Sandwiches & Wraps (non-veg)
  { name: 'Club Sandwich (Chicken)', category: 'Sandwiches & Wraps', price: 189, desc: 'Triple-decker with grilled chicken, cheese, and veggies.' },
  { name: 'BLT Sandwich', category: 'Sandwiches & Wraps', price: 169, desc: 'Bacon, lettuce, tomato with mayo on toasted bread.' },
  { name: 'Chicken Caesar Wrap', category: 'Sandwiches & Wraps', price: 179, desc: 'Grilled chicken, romaine, parmesan, and Caesar in a wrap.' },
  { name: 'Tuna Melt Sandwich', category: 'Sandwiches & Wraps', price: 179, desc: 'Tuna salad with melted cheese on sourdough.' },
  { name: 'Beef Shawarma', category: 'Sandwiches & Wraps', price: 199, desc: 'Slow-roasted beef with garlic sauce in pita bread.' },

  // Mocktails & Shakes (non-veg adjacent)
  { name: 'Salted Caramel Shake', category: 'Mocktails & Shakes', price: 139, desc: 'Thick milkshake with salted caramel, vanilla ice cream and cream.' },
  { name: 'Mango Tango Mocktail', category: 'Mocktails & Shakes', price: 119, desc: 'Mango nectar, orange juice, and ginger ale over crushed ice.' },
  { name: 'Passion Fruit Cooler', category: 'Mocktails & Shakes', price: 129, desc: 'Passion fruit syrup with sparkling water and fresh mint.' },
  { name: 'Chocolate Peanut Shake', category: 'Mocktails & Shakes', price: 149, desc: 'Rich chocolate milkshake blended with peanut butter.' },
  { name: 'Berry Blast Smoothie', category: 'Mocktails & Shakes', price: 129, desc: 'Mixed berry smoothie with yogurt and honey.' },

  // South Indian Chaat
  { name: 'Pani Puri', category: 'South Indian Chaat', price: 79, desc: 'Crispy hollow puris filled with spiced water, potato, and chutney.' },
  { name: 'Bhel Puri', category: 'South Indian Chaat', price: 89, desc: 'Puffed rice tossed with onions, tomatoes, and chutneys.' },
  { name: 'Sev Puri', category: 'South Indian Chaat', price: 89, desc: 'Crispy puris topped with potato, onion, and tangy chutneys.' },
  { name: 'Dahi Papdi Chaat', category: 'South Indian Chaat', price: 99, desc: 'Crunchy papdi topped with yogurt, tamarind, and mint chutney.' },

  // Waffles & Crepes
  { name: 'Chicken Waffle', category: 'Waffles & Crepes', price: 229, desc: 'Crispy fried chicken on a sweet waffle with maple and hot sauce.' },
  { name: 'Ham & Cheese Crepe', category: 'Waffles & Crepes', price: 179, desc: 'Thin French crepe with ham, gruyere, and béchamel.' },
  { name: 'Prawn Crepe', category: 'Waffles & Crepes', price: 199, desc: 'Savoury crepe stuffed with garlic butter prawns and herbs.' },
];

// ──────────────────────────────────────────────
// Insert Food Items
// ──────────────────────────────────────────────
console.log(`🥗 Inserting ${vegItems.length} veg items...`);
const vegDocs = vegItems.map(item => ({
  name: item.name,
  description: item.desc,
  price: item.price,
  image: pick(vegImages),
  category: item.category,
  isAvailable: true,
  restaurant: pick(allRestaurantIds),
  isVeg: true,
  createdAt: now(),
  updatedAt: now(),
}));
const vegResult = await db.collection('fooditems').insertMany(vegDocs);
console.log(`   ✅ Inserted ${Object.keys(vegResult.insertedIds).length} veg items.\n`);

console.log(`🍗 Inserting ${nonVegItems.length} non-veg items...`);
const nonVegDocs = nonVegItems.map(item => ({
  name: item.name,
  description: item.desc,
  price: item.price,
  image: pick(nonVegImages),
  category: item.category,
  isAvailable: true,
  restaurant: pick(allRestaurantIds),
  isVeg: false,
  createdAt: now(),
  updatedAt: now(),
}));
const nonVegResult = await db.collection('fooditems').insertMany(nonVegDocs);
console.log(`   ✅ Inserted ${Object.keys(nonVegResult.insertedIds).length} non-veg items.\n`);

// ──────────────────────────────────────────────
// Final counts
// ──────────────────────────────────────────────
const finalRestCount = await db.collection('restaurants').countDocuments();
const finalFoodCount = await db.collection('fooditems').countDocuments();
console.log('─────────────────────────────────────────');
console.log(`📊 FINAL DATABASE COUNTS:`);
console.log(`   🏪 Restaurants  : ${finalRestCount}`);
console.log(`   🍽️  Food Items   : ${finalFoodCount}`);
console.log(`   🥗 Veg added    : ${Object.keys(vegResult.insertedIds).length}`);
console.log(`   🍗 Non-Veg added: ${Object.keys(nonVegResult.insertedIds).length}`);
console.log('─────────────────────────────────────────');
console.log('\n🎉 Done! Your FoodSwift database is now packed with data.\n');

await mongoose.disconnect();
