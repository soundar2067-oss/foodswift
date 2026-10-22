const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// Get reviews for a restaurant
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const filter = { isApproved: true };
    if (restaurantId) filter.restaurant = restaurantId;

    const reviews = await Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Add review for completed order
exports.createReview = async (req, res, next) => {
  try {
    const { restaurantId, orderId, rating, comment, images } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if order exists and belongs to user
    let isVerified = false;
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, customer: req.user._id, orderStatus: 'delivered' });
      if (order) isVerified = true;
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      order: orderId || undefined,
      rating: Number(rating),
      comment: comment || '',
      images: images || [],
      isVerifiedPurchase: isVerified,
    });

    // Recalculate restaurant average rating
    const stats = await Review.aggregate([
      { $match: { restaurant: review.restaurant } },
      {
        $group: {
          _id: '$restaurant',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].totalReviews,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
