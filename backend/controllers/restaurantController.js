import Restaurant from '../models/Restaurant.js';
import FoodItem from '../models/FoodItem.js';
import Review from '../models/Review.js';

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: cuisine, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query);
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant details
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
export const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, cuisine, address, image } = req.body;

    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine,
      address,
      image,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant menu (food items)
// @route   GET /api/restaurants/:id/menu
// @access  Public
export const getRestaurantMenu = async (req, res, next) => {
  try {
    const menuItems = await FoodItem.find({ restaurant: req.params.id });
    res.json({ success: true, count: menuItems.length, data: menuItems });
  } catch (error) {
    next(error);
  }
};

// @desc    Add food item to menu
// @route   POST /api/restaurants/:id/menu
// @access  Private/Admin
export const addFoodItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    // Verify ownership
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to add food items to this restaurant');
    }

    const { name, description, price, category, image, isAvailable } = req.body;

    const foodItem = await FoodItem.create({
      name,
      description,
      price,
      category,
      image,
      isAvailable,
      restaurant: req.params.id,
    });

    res.status(201).json({ success: true, data: foodItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item
// @route   PUT /api/restaurants/menu/:foodId
// @access  Private/Admin
export const updateFoodItem = async (req, res, next) => {
  try {
    let foodItem = await FoodItem.findById(req.params.foodId).populate('restaurant');

    if (!foodItem) {
      res.status(404);
      throw new Error('Food item not found');
    }

    // Verify ownership
    if (foodItem.restaurant.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update food items for this restaurant');
    }

    foodItem = await FoodItem.findByIdAndUpdate(req.params.foodId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: foodItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/restaurants/menu/:foodId
// @access  Private/Admin
export const deleteFoodItem = async (req, res, next) => {
  try {
    const foodItem = await FoodItem.findById(req.params.foodId).populate('restaurant');

    if (!foodItem) {
      res.status(404);
      throw new Error('Food item not found');
    }

    // Verify ownership
    if (foodItem.restaurant.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete food items for this restaurant');
    }

    await foodItem.deleteOne();

    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a restaurant review
// @route   POST /api/restaurants/:id/reviews
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({
      restaurant: restaurantId,
      user: req.user._id,
    });

    if (reviewExists) {
      res.status(400);
      throw new Error('You have already reviewed this restaurant');
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      rating: Number(rating),
      comment,
    });

    // Update restaurant average rating
    const reviews = await Review.find({ restaurant: restaurantId });
    const avgRating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    restaurant.rating = Number(avgRating.toFixed(1));
    await restaurant.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant reviews
// @route   GET /api/restaurants/:id/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all food items globally (with optional category or search filters)
// @route   GET /api/restaurants/menu/items
// @access  Public
export const getAllFoodItems = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      // Direct string match or regex
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const items = await FoodItem.find(query).populate('restaurant');
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

