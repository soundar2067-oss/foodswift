const FoodItem = require('../models/FoodItem');
const FoodCategory = require('../models/FoodCategory');
const Restaurant = require('../models/Restaurant');

// Get all food items with filters & main navigation options
exports.getFoods = async (req, res, next) => {
  try {
    const {
      category,
      isVeg,
      search,
      sortBy = 'popular',
      offersOnly,
      page = 1,
      limit = 32,
    } = req.query;

    const query = { isAvailable: true };

    // Veg / Non-Veg filter
    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    // Offers only filter
    if (offersOnly === 'true') {
      query.discountPrice = { $ne: null };
    }

    // Category mapping for Swiggy & Zomato main navigation
    if (category && category !== 'all' && category !== 'All Foods') {
      const catLower = category.toLowerCase().trim();

      if (catLower === 'pure veg' || catLower === 'pure_veg') {
        query.isVeg = true;
      } else if (catLower === 'non-veg' || catLower === 'non_veg') {
        query.isVeg = false;
      } else {
        const catRegexMap = {
          'south indian': 'South Indian|Idli|Dosa|Pongal|Upma|Parotta|Thattuvadai|Meals|Kerala|Chettinad|Andhra|Uttapam|Appam|Puttu|Vada',
          'north indian': 'North Indian|Paneer|Dal|Curry|Curries|Roti|Naan|Kulcha|Chole|Rajma|Thali|Makhani',
          'biryani': 'Biryani|Pulao|Mandi',
          'fast food': 'Fast Food|Burger|Burgers|Pizza|Sandwich|Fries|Taco|Tacos|Wrap|Wraps|Hot Dog|Pasta|Shawarma|Garlic Bread',
          'chinese': 'Chinese|Noodles|Fried Rice|Manchurian|Momo|Momos|Asian|Ramen|Sushi|Spring Roll',
          'bakery & desserts': 'Bakery|Dessert|Desserts|Cake|Cakes|Pastry|Brownie|Ice Cream|Sweet|Sweets|Donut|Muffin|Cupcake|Cheesecake|Jalebi|Laddu|Mysore Pak|Kaju Katli|Halwa|Kulfi',
          'beverages': 'Beverage|Beverages|Coffee|Tea|Chai|Juice|Shake|Milkshake|Lassi|Falooda|Mocktail|Smoothie',
          'healthy food': 'Healthy|Salad|Soup|Vegan|Oats|Poha|Toast|Quinoa|Protein|Tofu',
          'offers & combos': 'Offers & Combos|Combo|Combos|Kids Meal|Meal Box',
          'street food': 'Street Food|Chaat|Pani Puri|Bhel|Sev|Vada Pav|Pav Bhaji|Samosa|Kachori|Tikki|Thattuvadai',
          'starters & grill': 'Starters & Grill|Starter|Starters|Tandoori|Grill|Tikka|Kebab|Chicken 65|Gobi 65|BBQ|Wings',
          'seafood': 'Seafood|Fish|Prawn|Crab|Eral|Meen|Nandu',
        };

        const pattern = catRegexMap[catLower] || category;
        query.$or = [
          { categoryName: { $regex: pattern, $options: 'i' } },
          { name: { $regex: pattern, $options: 'i' } },
        ];
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchCondition = [
        { name: searchRegex },
        { description: searchRegex },
        { categoryName: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchCondition }];
        delete query.$or;
      } else {
        query.$or = searchCondition;
      }
    }

    // Sorting
    let sortOptions = { isBestseller: -1, createdAt: -1 };
    if (sortBy === 'price_low') sortOptions = { price: 1 };
    else if (sortBy === 'price_high') sortOptions = { price: -1 };
    else if (sortBy === 'rating') sortOptions = { rating: -1, isBestseller: -1 };
    else if (sortBy === 'name') sortOptions = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await FoodItem.countDocuments(query);
    const foods = await FoodItem.find(query)
      .populate('restaurant', 'name slug locality rating estimatedDeliveryTime deliveryFee isPureVeg')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
};

// Search foods and restaurants across Salem
exports.searchFoods = async (req, res, next) => {
  try {
    const { q, isVeg } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, foods: [], restaurants: [] });
    }

    const foodQuery = {
      isAvailable: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { categoryName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    };

    if (isVeg === 'true') {
      foodQuery.isVeg = true;
    }

    const foods = await FoodItem.find(foodQuery)
      .populate('restaurant', 'name slug locality rating estimatedDeliveryTime deliveryFee')
      .limit(30);

    const restaurants = await Restaurant.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { cuisines: { $regex: q, $options: 'i' } },
        { locality: { $regex: q, $options: 'i' } },
      ],
    }).limit(15);

    res.status(200).json({
      success: true,
      query: q,
      foods,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// Get single food item
exports.getFoodById = async (req, res, next) => {
  try {
    const food = await FoodItem.findById(req.params.id).populate('restaurant');
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// Get categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await FoodCategory.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Add food item (Restaurant Owner or Admin)
exports.createFood = async (req, res, next) => {
  try {
    const food = await FoodItem.create(req.body);
    res.status(201).json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// Update food item
exports.updateFood = async (req, res, next) => {
  try {
    const food = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle food availability (Sold out toggle)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.status(200).json({
      success: true,
      isAvailable: food.isAvailable,
      message: `Item availability set to ${food.isAvailable ? 'Available' : 'Sold Out'}`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete food item
exports.deleteFood = async (req, res, next) => {
  try {
    await FoodItem.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
