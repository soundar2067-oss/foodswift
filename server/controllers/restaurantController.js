const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');

// Get all restaurants with advanced filtering & search
exports.getRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      cuisine,
      locality,
      isPureVeg,
      rating,
      priceRange,
      maxDeliveryTime,
      sortBy,
      page = 1,
      limit = 24,
    } = req.query;

    const query = { isActive: true };

    // Search by name, cuisine, or locality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
      ];
    }

    if (cuisine) {
      query.cuisines = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (locality && locality !== 'All Salem') {
      query.locality = { $regex: locality, $options: 'i' };
    }

    if (isPureVeg === 'true') {
      query.isPureVeg = true;
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (priceRange) {
      query.priceRange = priceRange;
    }

    if (maxDeliveryTime) {
      query.estimatedDeliveryTime = { $lte: Number(maxDeliveryTime) };
    }

    // Sorting
    let sortOptions = { rating: -1, reviewCount: -1 };
    if (sortBy === 'rating') sortOptions = { rating: -1 };
    else if (sortBy === 'deliveryTime') sortOptions = { estimatedDeliveryTime: 1 };
    else if (sortBy === 'costLowToHigh') sortOptions = { minOrderAmount: 1 };
    else if (sortBy === 'costHighToLow') sortOptions = { minOrderAmount: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// Get single restaurant by ID or slug
exports.getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let restaurant;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(id).populate('owner', 'name email phone');
    } else {
      restaurant = await Restaurant.findOne({ slug: id }).populate('owner', 'name email phone');
    }

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant menu grouped by category
exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vegOnly, search } = req.query;

    let restaurantId = id;
    if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      const foundRest = await Restaurant.findOne({ slug: id });
      if (!foundRest) {
        return res.status(404).json({ success: false, message: 'Restaurant not found' });
      }
      restaurantId = foundRest._id;
    }

    const filter = { restaurant: restaurantId, isAvailable: true };
    if (vegOnly === 'true') {
      filter.isVeg = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await FoodItem.find(filter).sort({ categoryName: 1, isBestseller: -1, name: 1 });

    // Group items by categoryName
    const categorized = items.reduce((acc, item) => {
      const cat = item.categoryName || 'Chef Specials';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: items.length,
      data: categorized,
      rawItems: items,
    });
  } catch (error) {
    next(error);
  }
};

// Get nearby restaurants for Salem localities
exports.getNearbyRestaurants = async (req, res, next) => {
  try {
    const { locality } = req.query;
    let query = { isActive: true };
    if (locality && locality !== 'All Salem') {
      query.locality = { $regex: locality, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query).sort({ rating: -1 }).limit(12);

    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// Create restaurant (Admin or Partner)
exports.createRestaurant = async (req, res, next) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const restaurant = await Restaurant.create({
      ...req.body,
      slug,
      owner: req.user ? req.user._id : undefined,
    });

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle restaurant open/closed
exports.toggleStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    res.status(200).json({
      success: true,
      isOpen: restaurant.isOpen,
      message: `Restaurant is now ${restaurant.isOpen ? 'Open' : 'Closed'}`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res, next) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    await FoodItem.deleteMany({ restaurant: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Restaurant and related menu items deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
