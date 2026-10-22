/**
 * Accurate high-resolution food image resolver for Salem FoodSwift.
 * Maps dish names and categories to real, specific food photography.
 */

// Specific dish keywords mapped to authentic images
const DISH_IMAGE_RULES = [
  // 1. Dosa & South Indian Breakfast
  {
    pattern: /masala dosa|mysore masala|spicy dosa/i,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /podi dosa|ghee roast|paper roast|plain dosa|rava dosa|set dosa|onion dosa|kal dosa|uttapam|oothappam/i,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /cheese dosa|paneer dosa/i,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },

  // 2. Idli, Vada, Paniyaram, Appam, Puttu, Idiyappam
  {
    pattern: /podi idli|ghee idli|mini idli|fried idli|idiyappam|puttu/i,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /thattu idli|kanchipuram idli|steamed idli|idli/i,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /medhu vada|sambar vada|curd vada|vada/i,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /poori|puri masala|chola poori|chole bhature|bhature/i,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /paniyaram|kuzhi/i,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /pongal|kichadi|upma|khichdi|appam|poha/i,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  },

  // 3. Street Food & Chaat
  {
    pattern: /thattuvadai|norukkal|murukku sandwich/i,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /pani puri|golgappa|puchka|dahi puri|bhel puri|bhel|sev puri|papdi chaat|chaat|masala puri/i,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /pav bhaji|vada pav/i,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /samosa|pakoda|cutlet|baji|bajji|kachori|aloo tikki|chole tikki/i,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },

  // 4. Meals & Rice Bowls
  {
    pattern: /banana leaf|meals|thali|executive meals/i,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /sambar rice|sambar sadam|bisibelebath/i,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /curd rice|lemon rice|tomato rice|rasam rice|vathal kuzhambu/i,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /jeera rice|ghee rice|pulao|kashmiri pulao/i,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },

  // 5. Biryani
  {
    pattern: /thalappakatti|seeraga samba|mutton biryani|chukka biryani/i,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /chicken biryani|dum biryani|ambur|hyderabadi biryani|nattu kozhi biryani|chicken 65 biryani/i,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /egg biryani/i,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /fish biryani|prawn biryani|seafood biryani/i,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /veg biryani|paneer biryani|mushroom biryani|soya biryani/i,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /mandi|chicken mandi|mutton mandi|kabsa/i,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
  },

  // 6. Parotta & Indian Breads
  {
    pattern: /kothu parotta|egg kothu|chicken kothu/i,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /bun parotta|ceylon parotta|malabar parotta|parotta|salna/i,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /naan|butter naan|garlic naan|roti|tandoori roti|kulcha|phulka|chapati/i,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  },

  // 7. Paneer Dishes
  {
    pattern: /paneer butter masala|paneer makhani|shahi paneer|paneer lababdar/i,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /kadai paneer|paneer tikka masala/i,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /palak paneer|spinach paneer/i,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },

  // 8. Chicken Curries & Gravies
  {
    pattern: /butter chicken|murgh makhani/i,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /chettinad chicken|nattu kozhi|chicken curry|chicken gravy|pepper chicken|kadai chicken/i,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
  },

  // 9. Mutton & Lamb
  {
    pattern: /mutton chukka|mutton sukka|mutton chops|mutton curry|mutton gravy|rogan josh/i,
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80',
  },

  // 10. Seafood & Fish
  {
    pattern: /fish fry|vanjaram|tawa fish|nethili fry|fish finger/i,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /fish curry|meen kuzhambu|fish gravy/i,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /prawn|eral|shrimp|crab|nandu/i,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
  },

  // 11. Tandoori, Starters & BBQ
  {
    pattern: /tandoori chicken|tangdi kebab/i,
    image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /chicken 65|chicken lollipop|crispy chicken|chicken wings/i,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /grill chicken|al faham|bbq|barbecue|charcoal/i,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /kebab|tikka|malai tikka|seekh kebab|reshmi/i,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /gobi 65|paneer 65|mushroom 65|baby corn|veg starter/i,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },

  // 12. Shawarma & Wraps
  {
    pattern: /shawarma|shawarma roll|plate shawarma/i,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /roll|wrap|kathi roll|frankie/i,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
  },

  // 13. Pizza, Burgers, Pasta & Sandwiches
  {
    pattern: /pasta|alfredo|arrabbiata|mac and cheese|macaroni/i,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /garlic bread|breadsticks/i,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /taco|tacos|quesadilla/i,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /hot dog|hotdog|frankfurter/i,
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /pizza|margherita|pepperoni|cheese burst/i,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /burger|whopper|patty/i,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /sandwich|club sandwich|grilled sandwich/i,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /fries|french fries|potato wedges/i,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
  },

  // 14. Indo-Chinese, Asian & International
  {
    pattern: /ramen|ramen bowl/i,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /sushi|sushi roll/i,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /spring roll|spring rolls/i,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /fried rice|schezwan rice|egg fried rice/i,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /noodles|hakka noodles|schezwan noodles|chow mein/i,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /momo|momos|dumpling/i,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /chilli chicken|manchurian|chilli paneer/i,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
  },

  // 15. Soups, Salads & Healthy
  {
    pattern: /soup|hot and sour|sweet corn soup|clear soup/i,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /salad|green salad|quinoa|oats|tofu/i,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /omelette|omelet|toast/i,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
  },

  // 16. Beverages & Bakery & Desserts
  {
    pattern: /coffee|filter coffee|cappuccino|latte/i,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /tea|chai|masala tea|green tea/i,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /jigarthanda|falooda/i,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /juice|fresh juice|shake|milkshake|lassi|mojito|lemonade|smoothie/i,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /donut|doughnut/i,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /muffin|cupcake|cupcakes/i,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /cheesecake/i,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /jalebi|rabdi|mysore pak|kaju katli|laddu|ladoo/i,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /jamun|halwa|payasam|kheer|gulab jamun|rasgulla|rasmalai/i,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /ice cream|sundae|kulfi/i,
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
  },
  {
    pattern: /cake|pastry|brownie/i,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  },
];

// Fallback category map
const CATEGORY_FALLBACK_IMAGES = {
  'Idli and Dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
  'Pongal and Upma': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  'South Indian Meals': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  'Biryani and Pulao (Veg)': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  'Paneer Dishes': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
  'Mushroom Dishes': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  'Vegetable Curries': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  'Salem Thattuvadai Set': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
  'Vegetarian Starters': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  'Parotta and Chapati (Veg)': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'Veg Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
  'Noodles': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  'Mutton Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
  'Chicken Curries & Gravies': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
  'Mutton & Seafood Curries': 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80',
  'Seafood & Fish Biryani': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
  'Tandoori, BBQ & Grill': 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
  'Starters & Fried Chicken': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
  'Parotta & Non-Veg Fast Food': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  'Desserts & Beverages': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
};

/**
 * Returns the exact authentic photo URL for any given dish name & category
 */
function getAccurateDishImage(dishName, categoryName = '', isVeg = true) {
  if (dishName) {
    for (const rule of DISH_IMAGE_RULES) {
      if (rule.pattern.test(dishName)) {
        return rule.image;
      }
    }
  }

  if (categoryName && CATEGORY_FALLBACK_IMAGES[categoryName]) {
    return CATEGORY_FALLBACK_IMAGES[categoryName];
  }

  // Final fallback based on isVeg
  return isVeg
    ? 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80';
}

module.exports = {
  getAccurateDishImage,
  DISH_IMAGE_RULES,
  CATEGORY_FALLBACK_IMAGES,
};
