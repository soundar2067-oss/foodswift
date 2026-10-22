import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import FoodItem from '../models/FoodItem.js';

export const generateSeedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeder.');
      return;
    }

    console.log('Seeding extensive dataset (20 restaurants, 30 categories, 2,400+ food items)...');

    // 1. Create Default Users (Customer, Admin, Driver)
    const adminUser = await User.create({
      name: 'John Owner',
      email: 'admin@foodswift.com',
      password: 'admin123',
      role: 'admin',
      address: '123 Restaurant Row, Food Hub',
      phone: '9876543210',
    });

    const driverUser = await User.create({
      name: 'David Driver',
      email: 'driver@foodswift.com',
      password: 'driver123',
      role: 'delivery',
      address: '456 Driver Lane, Quick Way',
      phone: '9876543211',
    });

    const customerUser = await User.create({
      name: 'Claire Customer',
      email: 'customer@foodswift.com',
      password: 'customer123',
      role: 'customer',
      address: '789 Customer Blvd, Green Park',
      phone: '9876543212',
    });

    // 2. Define Cuisines and Restaurant Names
    const cuisines = [
      'Italian',
      'American',
      'Chinese',
      'Indian',
      'Mexican',
      'Japanese',
      'Thai',
      'Healthy/Salads',
      'Bakery/Desserts',
      'Mediterranean',
    ];

    const restaurantTemplates = [
      { name: 'Pizza Planet', cuisine: 'Italian', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60' },
      { name: 'Burger Bite', cuisine: 'American', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60' },
      { name: 'Wok & Roll', cuisine: 'Chinese', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=60' },
      { name: 'Royal Taj', cuisine: 'Indian', img: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=60' },
      { name: 'Taco Fiesta', cuisine: 'Mexican', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60' },
      { name: 'Sakura Sushi', cuisine: 'Japanese', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=60' },
      { name: 'Bangkok Spice', cuisine: 'Thai', img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=60' },
      { name: 'The Green Bowl', cuisine: 'Healthy/Salads', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60' },
      { name: 'Sweet Treats Bakery', cuisine: 'Bakery/Desserts', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60' },
      { name: 'Olive Grove', cuisine: 'Mediterranean', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60' },
      { name: 'Pasta Palace', cuisine: 'Italian', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60' },
      { name: 'Slider Station', cuisine: 'American', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60' },
      { name: 'Golden Dragon', cuisine: 'Chinese', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60' },
      { name: 'Spice Route', cuisine: 'Indian', img: 'https://images.unsplash.com/photo-1613446826102-4861f9914b74?w=600&auto=format&fit=crop&q=60' },
      { name: 'Cantina Mexicana', cuisine: 'Mexican', img: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=600&auto=format&fit=crop&q=60' },
      { name: 'Tokyo Diner', cuisine: 'Japanese', img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=60' },
      { name: 'Thai Lotus', cuisine: 'Thai', img: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&auto=format&fit=crop&q=60' },
      { name: 'Guilt-Free Cafe', cuisine: 'Healthy/Salads', img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=60' },
      { name: 'Cupcake Corner', cuisine: 'Bakery/Desserts', img: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&auto=format&fit=crop&q=60' },
      { name: 'Athens Grill', cuisine: 'Mediterranean', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60' },
    ];

    const createdRestaurants = [];
    for (let i = 0; i < restaurantTemplates.length; i++) {
      const template = restaurantTemplates[i];
      const rest = await Restaurant.create({
        name: template.name,
        description: `Experience the finest authentic ${template.cuisine} food crafted by expert chefs in a premium atmosphere.`,
        cuisine: template.cuisine,
        address: `${10 + i * 5} Food Street, Gastronomy Sector`,
        image: template.img,
        rating: 4.0 + (i % 10) * 0.1,
        owner: adminUser._id,
      });
      createdRestaurants.push(rest);
    }

    // 3. Define 30 Categories
    const categories = [
      'Pizza',
      'Burgers',
      'Pasta',
      'Sushi',
      'Tandoori Starters',
      'Indian Curries',
      'Noodles & Rice',
      'Spring Rolls & Momos',
      'Salads',
      'Desserts',
      'Beverages',
      'Breakfast Specialties',
      'Appetizers',
      'Soups',
      'Mexican Tacos',
      'Quesadillas',
      'Japanese Ramen',
      'Thai Curries',
      'Sandwiches & Wraps',
      'South Indian Chaat',
      'Breads & Naans',
      'Chicken Dishes',
      'Seafood Specialties',
      'Vegan Bowls',
      'Kids Meals',
      'Pastries & Donuts',
      'Coffee & Tea',
      'Mocktails & Shakes',
      'Waffles & Crepes',
      'Kebabs & Grills',
    ];

    // Dish descriptor generators to programmatically create unique combinations
    const dishPrefixes = [
      'Classic',
      'Gourmet',
      'Spicy',
      'Deluxe',
      'Signature',
      'Double',
      'Royal',
      'Jumbo',
      'Cheesy',
      'Tandoori',
      'Crispy',
      'Special',
      'House',
      'Smoked',
      'Golden',
      'Healthy',
    ];

    const categoryBaseDishes = {
      Pizza: ['Margherita Pizza', 'Pepperoni Pizza', 'Veggie Pizza', 'BBQ Chicken Pizza', 'Mushroom Truffle Pizza', 'Hawaiian Pizza'],
      Burgers: ['Beef Burger', 'Crispy Chicken Burger', 'Veggie Patty Burger', 'Bacon Cheese Burger', 'Mushroom Swiss Burger'],
      Pasta: ['Penne Alfredo', 'Spaghetti Bolognese', 'Lasagna Bolognese', 'Mac & Cheese', 'Pesto Fusilli'],
      Sushi: ['California Roll', 'Salmon Nigiri', 'Tuna Maki', 'Dragon Roll', 'Tempura Roll'],
      'Tandoori Starters': ['Paneer Tikka', 'Chicken Tikka', 'Tandoori Gobi', 'Soya Chaap', 'Seekh Kebab'],
      'Indian Curries': ['Butter Chicken', 'Paneer Butter Masala', 'Dal Makhani', 'Chana Masala', 'Chicken Korma'],
      'Noodles & Rice': ['Egg Fried Rice', 'Hakka Noodles', 'Schezwan Fried Rice', 'Singapori Noodles', 'Biryani Rice'],
      'Spring Rolls & Momos': ['Veg Spring Rolls', 'Steamed Veg Momos', 'Pan Fried Chicken Momos', 'Cheese Momos', 'Crispy Wontons'],
      Salads: ['Caesar Salad', 'Greek Salad', 'Quinoa Avocado Salad', 'Fruit Medley Salad', 'Garden Green Salad'],
      Desserts: ['Chocolate Lava Cake', 'Tiramisu Cup', 'Apple Pie', 'Sizzling Brownie', 'Gulab Jamun Plate'],
      Beverages: ['Classic Coca Cola', 'Fresh Lime Soda', 'Iced Lemon Tea', 'Mineral Water', 'Ginger Ale'],
      'Breakfast Specialties': ['English Breakfast Plate', 'Pancakes with Syrup', 'Masala Omelette', 'Avocado Toast', 'Belgian Waffle'],
      Appetizers: ['Mozzarella Sticks', 'Garlic Bread with Cheese', 'Chicken Wings', 'Loaded Nachos', 'Onion Rings'],
      Soups: ['Tomato Basil Soup', 'Hot & Sour Soup', 'Sweet Corn Chicken Soup', 'Minestrone Soup', 'Cream of Mushroom'],
      'Mexican Tacos': ['Soft Shell Beef Taco', 'Crispy Chicken Taco', 'Spicy Fish Taco', 'Bean & Corn Taco', 'Pork Carnitas Taco'],
      Quesadillas: ['Cheese Quesadilla', 'Chicken Fajita Quesadilla', 'Veggie Delight Quesadilla', 'BBQ Pork Quesadilla'],
      'Japanese Ramen': ['Shoyu Ramen', 'Miso Veggie Ramen', 'Spicy Tonkotsu Ramen', 'Chicken Katsu Ramen'],
      'Thai Curries': ['Green Curry Rice', 'Red Curry Chicken', 'Massaman Beef Curry', 'Pineapple Fried Rice'],
      'Sandwiches & Wraps': ['Club Sandwich', 'Chicken Caesar Wrap', 'Paneer Tikka Wrap', 'Falafel Shawarma Wrap'],
      'South Indian Chaat': ['Masala Dosa', 'Idli Sambar', 'Samosa Chaat', 'Papdi Chaat', 'Pani Puri Bucket'],
      'Breads & Naans': ['Butter Naan', 'Garlic Naan', 'Tandoori Roti', 'Lachha Paratha', 'Stuffed Kulcha'],
      'Chicken Dishes': ['Chicken Parmigiana', 'Grilled Chicken Breast', 'Chicken Lollipop', 'Lemon Herb Chicken'],
      'Seafood Specialties': ['Grilled Salmon', 'Fish & Chips', 'Garlic Butter Prawns', 'Calamari Rings', 'Lobster Thermidor'],
      'Vegan Bowls': ['Buddha Veg Bowl', 'Teriyaki Tofu Bowl', 'Açai Berry Bowl', 'Mexican Bean Bowl'],
      'Kids Meals': ['Mini Chicken Nuggets', 'Kids Cheese Pizza', 'Fish Fingers', 'Smileys & Fries'],
      'Pastries & Donuts': ['Glazed Donut', 'Chocolate Croissant', 'Blueberry Muffin', 'Red Velvet Pastry', 'Eclair'],
      'Coffee & Tea': ['Hot Cappuccino', 'Iced Caramel Macchiato', 'Matcha Latte', 'Masala Chai', 'Green Jasmine Tea'],
      'Mocktails & Shakes': ['Virgin Mojito', 'Strawberry Milkshake', 'Mango Lassi', 'Pina Colada Mocktail', 'Oreo Shake'],
      'Waffles & Crepes': ['Nutella Crepe', 'Honey Butter Waffle', 'Banana Caramel Crepe', 'Mixed Berry Waffle'],
      'Kebabs & Grills': ['Lamb Seekh Kebab', 'Reshmi Chicken Kebab', 'Grilled Paneer Tikka', 'Tandoori Pomfret'],
    };

    const imagesByCategory = {
      Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
      Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
      Pasta: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=60',
      Sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=60',
      'Tandoori Starters': 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=60',
      'Indian Curries': 'https://images.unsplash.com/photo-1613446826102-4861f9914b74?w=600&auto=format&fit=crop&q=60',
      'Noodles & Rice': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=60',
      'Spring Rolls & Momos': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
      Salads: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60',
      Desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60',
      Beverages: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
      'Breakfast Specialties': 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&auto=format&fit=crop&q=60',
      Appetizers: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600&auto=format&fit=crop&q=60',
      Soups: 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?w=600&auto=format&fit=crop&q=60',
      'Mexican Tacos': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60',
      Quesadillas: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=600&auto=format&fit=crop&q=60',
      'Japanese Ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
      'Thai Curries': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=60',
      'Sandwiches & Wraps': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=60',
      'South Indian Chaat': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60',
      'Breads & Naans': 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&auto=format&fit=crop&q=60',
      'Chicken Dishes': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=60',
      'Seafood Specialties': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=60',
      'Vegan Bowls': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
      'Kids Meals': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60',
      'Pastries & Donuts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60',
      'Coffee & Tea': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=60',
      'Mocktails & Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
      'Waffles & Crepes': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60',
      'Kebabs & Grills': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=60',
    };

    // 4. Generate 2,400 food items (20 restaurants * 30 categories * 4 items = 2,400)
    const foodItemsData = [];
    
    for (let r = 0; r < createdRestaurants.length; r++) {
      const restaurant = createdRestaurants[r];
      
      for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        const bases = categoryBaseDishes[category] || ['Special Dish'];
        
        for (let i = 0; i < 4; i++) {
          const prefix = dishPrefixes[(r + c + i) % dishPrefixes.length];
          const base = bases[i % bases.length];
          const foodName = `${prefix} ${base}`;
          
          // Generates price in USD ranging from $2.99 to $28.99
          const price = parseFloat((3.99 + ((r * 7 + c * 3 + i * 5) % 25)).toFixed(2));
          const isAvailable = (r + c + i) % 15 !== 0; // 93% availability
          
          foodItemsData.push({
            name: foodName,
            description: `A delicious selection of ${foodName} prepared with fresh ingredients, signature spices, and standard authentic style.`,
            price: price,
            category: category,
            image: imagesByCategory[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
            restaurant: restaurant._id,
            isAvailable: isAvailable,
          });
        }
      }
    }

    console.log(`Prepared ${foodItemsData.length} items. Inserting...`);
    await FoodItem.create(foodItemsData);

    console.log('\x1b[32m[Database Seeding Complete]: Loaded default users, 20 restaurants, 30 categories, and 2,400 food items.\x1b[0m');
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
  }
};
