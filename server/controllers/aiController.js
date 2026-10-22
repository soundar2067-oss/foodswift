const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

/**
 * SwiftBot - Salem AI Food Assistant Engine
 * Combines natural language intent detection, Salem restaurant directory knowledge,
 * and live MongoDB food items with 1-click interactive action cards.
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const query = message.toLowerCase().trim();

    let responseText = '';
    let recommendedFoods = [];
    let recommendedRestaurants = [];
    let orderInfo = null;
    let coupons = [];
    let quickReplies = [
      'Top Biryani in Salem',
      'Best Pure Veg spots',
      'Salem Thattuvadai Sets',
      'Show Active Coupons',
    ];

    // Intent 1: Order tracking / "Where is my order"
    if (
      query.includes('where is my order') ||
      query.includes('track') ||
      query.includes('order status') ||
      query.includes('my food')
    ) {
      if (userId) {
        const latestOrder = await Order.findOne({ customer: userId })
          .populate('restaurant', 'name locality')
          .sort({ createdAt: -1 });

        if (latestOrder) {
          orderInfo = latestOrder;
          responseText = `I checked your latest order **${latestOrder.orderNumber}** from **${
            latestOrder.restaurant?.name || 'Salem Kitchen'
          }**. The current status is **${latestOrder.orderStatus.toUpperCase().replace(/_/g, ' ')}**.`;
          quickReplies = ['View Live Order Tracking', 'Need Help with Order', 'Order Something Else'];
        } else {
          responseText =
            "You don't have any active orders right now. Would you like some delicious Salem food recommendations?";
          quickReplies = ['Popular in Fairlands', 'Top Rated Biryani', 'Offers & Deals'];
        }
      } else {
        responseText =
          'To track your order, please sign in to your FoodSwift account, or provide your order ID!';
        quickReplies = ['Sign In', 'Explore Salem Restaurants'];
      }
    }
    // Intent 2: Coupons, discounts, offers
    else if (
      query.includes('coupon') ||
      query.includes('offer') ||
      query.includes('discount') ||
      query.includes('promo') ||
      query.includes('deal')
    ) {
      coupons = await Coupon.find({ isActive: true }).limit(4);
      responseText =
        'Here are the active promo offers available across Salem today! Apply them directly at checkout:';
      quickReplies = ['Under ₹200 Meals', 'Order Biryani with WELCOME50', 'Pure Veg Specials'];
    }
    // Intent 3: Biryani recommendations
    else if (query.includes('biryani') || query.includes('briyani')) {
      recommendedRestaurants = await Restaurant.find({
        isActive: true,
        $or: [{ cuisines: /biryani/i }, { name: /biryani|thalappakatti|barbequeen|topi/i }],
      })
        .sort({ rating: -1 })
        .limit(3);

      recommendedFoods = await FoodItem.find({
        isAvailable: true,
        name: /biryani/i,
      })
        .populate('restaurant', 'name locality rating estimatedDeliveryTime deliveryFee')
        .sort({ rating: -1 })
        .limit(4);

      responseText =
        'Salem is famous for its fragrant Seeraga Samba and dum biryanis! Here are the highest-rated biryanis you can order right now:';
      quickReplies = ['Chicken Biryani', 'Mutton Chukka Biryani', 'Veg Biryani', 'Show Offers'];
    }
    // Intent 4: Salem Street Food / Thattuvadai Sets
    else if (
      query.includes('thattuvadai') ||
      query.includes('street food') ||
      query.includes('snack') ||
      query.includes('chaat')
    ) {
      recommendedFoods = await FoodItem.find({
        isAvailable: true,
        $or: [{ name: /thattuvadai|norukkal|samosa|bajji/i }, { categoryName: /street|snack/i }],
      })
        .populate('restaurant', 'name locality rating estimatedDeliveryTime deliveryFee')
        .limit(4);

      recommendedRestaurants = await Restaurant.find({
        isActive: true,
        name: /thattuvadai|street|snack/i,
      }).limit(2);

      responseText =
        'Nothing beats an authentic **Salem Thattuvadai Set**! Crisp thattuvadais layered with grated beetroot, carrot, onion slaw, and signature Salem spicy chutneys:';
      quickReplies = ['Salem Thattuvadai Set', 'Onion Samosa', 'Evening Tea & Snacks'];
    }
    // Intent 5: Vegetarian / Pure Veg queries
    else if (
      query.includes('veg') ||
      query.includes('vegetarian') ||
      query.includes('dosa') ||
      query.includes('idli') ||
      query.includes('meals') ||
      query.includes('sambar')
    ) {
      recommendedRestaurants = await Restaurant.find({
        isActive: true,
        isPureVeg: true,
      })
        .sort({ rating: -1 })
        .limit(3);

      recommendedFoods = await FoodItem.find({
        isAvailable: true,
        isVeg: true,
        $or: [{ categoryName: /idli|meals|paneer/i }, { name: /dosa|roast|pongal|paneer/i }],
      })
        .populate('restaurant', 'name locality rating estimatedDeliveryTime deliveryFee')
        .sort({ rating: -1 })
        .limit(4);

      responseText =
        'Looking for pure vegetarian goodness? Here are top-rated pure veg spots and crispy ghee roasts in Salem:';
      quickReplies = ['Podi Ghee Roast Dosa', 'South Indian Meals', 'Paneer Butter Masala'];
    }
    // Intent 6: Pizza & Fast Food
    else if (query.includes('pizza') || query.includes('burger') || query.includes('pasta')) {
      recommendedRestaurants = await Restaurant.find({
        isActive: true,
        $or: [{ name: /domino|pizza hut/i }, { cuisines: /pizza|burger/i }],
      }).limit(3);

      recommendedFoods = await FoodItem.find({
        isAvailable: true,
        $or: [{ name: /pizza|burger/i }, { categoryName: /pizza|burger/i }],
      })
        .populate('restaurant', 'name locality rating estimatedDeliveryTime deliveryFee')
        .limit(4);

      responseText =
        'Cravings for cheesy pizzas and juicy burgers? Here are the top fast-food favorites in Salem:';
      quickReplies = ['Margherita Pizza', 'Crispy Chicken Burger', 'Spicy Paneer Pizza'];
    }
    // Intent 7: Locality specific search (Fairlands, Suramangalam, Meyyanur, etc.)
    else if (
      query.includes('fairlands') ||
      query.includes('suramangalam') ||
      query.includes('meyyanur') ||
      query.includes('gugai') ||
      query.includes('alagapuram') ||
      query.includes('hasthampatti')
    ) {
      const matchedLocality = ['Fairlands', 'Suramangalam', 'Meyyanur', 'Gugai', 'Alagapuram', 'Hasthampatti'].find(
        (l) => query.includes(l.toLowerCase())
      ) || 'Fairlands';

      recommendedRestaurants = await Restaurant.find({
        isActive: true,
        locality: new RegExp(matchedLocality, 'i'),
      })
        .sort({ rating: -1 })
        .limit(4);

      responseText = `Here are the top-rated restaurants delivering in and around **${matchedLocality}, Salem**:`;
      quickReplies = [`Fast Delivery in ${matchedLocality}`, 'Pure Veg in Salem', 'Today Specials'];
    }
    // Intent 8: Budget queries ("under 150", "under 200", "cheap", "budget")
    else if (query.includes('under') || query.includes('budget') || query.includes('cheap') || query.includes('pocket')) {
      const maxPrice = query.includes('100') ? 100 : query.includes('150') ? 150 : 200;

      recommendedFoods = await FoodItem.find({
        isAvailable: true,
        price: { $lte: maxPrice },
      })
        .populate('restaurant', 'name locality rating estimatedDeliveryTime deliveryFee')
        .sort({ rating: -1 })
        .limit(4);

      responseText = `Delicious food doesn't have to be expensive! Here are Salem favorites priced **under ₹${maxPrice}**:`;
      quickReplies = ['Meals under ₹150', 'Salem Thattuvadai Set', 'Quick Tiffin'];
    }
    // Intent 9: General food assistance / Natural search
    else {
      // Dynamic database search using customer keywords
      const searchTerms = query.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter((w) => w.length > 2);

      let foundFoods = [];
      if (searchTerms.length > 0) {
        foundFoods = await FoodItem.find({
          isAvailable: true,
          $or: [
            { name: { $regex: searchTerms[0], $options: 'i' } },
            { categoryName: { $regex: searchTerms[0], $options: 'i' } },
          ],
        })
          .populate('restaurant', 'name locality rating estimatedDeliveryTime deliveryFee')
          .limit(4);
      }

      if (foundFoods.length > 0) {
        recommendedFoods = foundFoods;
        responseText = `I found some delicious options for **"${message}"** in Salem restaurants:`;
      } else {
        responseText = `Hello! I'm **SwiftBot**, your AI food assistant for Salem. I can help you discover top-rated dishes, find Salem restaurants in your locality, track active orders, or apply promo discounts! What are you craving today?`;
      }
    }

    res.status(200).json({
      success: true,
      message: responseText,
      recommendedFoods,
      recommendedRestaurants,
      orderInfo,
      coupons,
      quickReplies,
    });
  } catch (error) {
    next(error);
  }
};
