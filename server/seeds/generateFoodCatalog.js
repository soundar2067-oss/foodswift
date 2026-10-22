const fs = require('fs');
const path = require('path');

const masterVegCatalog = [
  // 1. South Indian (Idli, Dosa, Vada, Uttapam, Appam, Puttu, Idiyappam, Pongal, Upma, Poori, Parotta, Meals)
  { name: 'Salem Podi Ghee Roast Dosa', price: 120, category: 'South Indian', isVeg: true, desc: 'Crispy golden dosa roasted in pure Salem ghee and spiced with authentic gun powder', bestseller: true },
  { name: 'Special Masala Dosa', price: 95, category: 'South Indian', isVeg: true, desc: 'Crispy dosa filled with spiced potato masala and served with 3 chutneys and sambar', bestseller: true },
  { name: 'Mini Ghee Podi Idli (14 Pcs)', price: 110, category: 'South Indian', isVeg: true, desc: 'Bite-sized soft idlis tossed in pure Salem ghee and idli podi', bestseller: true },
  { name: 'Salem Thattu Idli with Vada Curry', price: 130, category: 'South Indian', isVeg: true, desc: 'Large flat steamed idli topped with spicy traditional veg vada curry', bestseller: false },
  { name: 'Onion Rava Masala Dosa', price: 125, category: 'South Indian', isVeg: true, desc: 'Crispy semolina crepe studded with chopped onions, green chillies, and potato masala', bestseller: false },
  { name: 'Cheese Burst Dosa', price: 160, category: 'South Indian', isVeg: true, desc: 'Modern fusion dosa layered with molten mozzarella cheese and spiced herbs', bestseller: false },
  { name: 'Plain Paper Roast Dosa', price: 90, category: 'South Indian', isVeg: true, desc: 'Thin, long paper crispy golden dosa served with coconut chutney', bestseller: false },
  { name: 'Mysore Masala Dosa', price: 135, category: 'South Indian', isVeg: true, desc: 'Crispy dosa smeared with red garlic chutney and spiced potato bhaji', bestseller: false },
  { name: 'Paneer Stuffed Dosa', price: 150, category: 'South Indian', isVeg: true, desc: 'Golden dosa filled with grated spiced cottage cheese and herbs', bestseller: false },
  { name: 'Onion Podi Uttapam', price: 110, category: 'South Indian', isVeg: true, desc: 'Thick fermented rice pancake topped with chopped onions and fragrant Salem idli podi', bestseller: true },
  { name: 'Tomato Onion Uttapam', price: 115, category: 'South Indian', isVeg: true, desc: 'Soft pancake studded with juicy tomatoes, onions, coriander, and served with chutneys', bestseller: false },
  { name: 'Medhu Vada (2 Pcs)', price: 60, category: 'South Indian', isVeg: true, desc: 'Crispy fried lentil donuts served with coconut chutney and hot sambar', bestseller: true },
  { name: 'Sambar Vada (2 Pcs)', price: 75, category: 'South Indian', isVeg: true, desc: 'Crisp vadas dipped in steaming hot lentil sambar topped with ghee and onions', bestseller: true },
  { name: 'Curd Vada (Thayir Vadai 2 Pcs)', price: 80, category: 'South Indian', isVeg: true, desc: 'Soaked lentil donuts in sweet spiced creamy beaten curd topped with boondi', bestseller: false },
  { name: 'Poori Masala (3 Pcs)', price: 95, category: 'South Indian', isVeg: true, desc: 'Puffy golden fried wheat bread served with mild potato kurma', bestseller: true },
  { name: 'Chola Poori with Chana Masala', price: 130, category: 'South Indian', isVeg: true, desc: 'Large puffy bhature-style poori served with spicy chickpea gravy and pickle', bestseller: true },
  { name: 'Kuzhi Paniyaram (7 Pcs)', price: 85, category: 'South Indian', isVeg: true, desc: 'Crispy outside soft inside spiced fermented rice dumplings with tomato chutney', bestseller: false },
  { name: 'Appam with Sweet Coconut Milk (2 Pcs)', price: 90, category: 'South Indian', isVeg: true, desc: 'Bowl-shaped soft fermented rice pancake served with cardamom infused coconut milk', bestseller: false },
  { name: 'Salem Rice Idiyappam with Coconut Milk', price: 100, category: 'South Indian', isVeg: true, desc: 'Steamed rice string hoppers served with sweet cardamom coconut milk and veg kurma', bestseller: false },
  { name: 'Kerala Rice Puttu with Kadala Curry', price: 125, category: 'South Indian', isVeg: true, desc: 'Steamed cylindrical rice cake layered with grated coconut, served with spicy black chickpea curry', bestseller: true },
  { name: 'Traditional Salem Ghee Pongal', price: 90, category: 'South Indian', isVeg: true, desc: 'Creamy rice and moong dal mash tempered with cashews, cumin, and black pepper', bestseller: true },
  { name: 'Rava Upma with Coconut Chutney', price: 75, category: 'South Indian', isVeg: true, desc: 'Spiced semolina and vegetable pot with roasted cashews and curry leaves', bestseller: false },
  { name: 'Wheat Rava Upma with Podi', price: 80, category: 'South Indian', isVeg: true, desc: 'Cracked wheat upma cooked with vegetables and ghee', bestseller: false },
  { name: 'Kerala Malabar Parotta (2 Pcs) with Veg Kurma', price: 110, category: 'South Indian', isVeg: true, desc: 'Multi-layered flaky griddled flatbread served with rich vegetable coconut salna', bestseller: true },
  { name: 'Veg Kothu Parotta', price: 130, category: 'South Indian', isVeg: true, desc: 'Shredded flaky parotta tossed on hot griddle with vegetables, spices, and salna', bestseller: true },
  { name: 'Special Salem Banana Leaf Meals', price: 180, category: 'South Indian', isVeg: true, desc: 'Steamed Ponni rice, Sambar, Rasam, Kara Kuzhambu, Kootu, Poriyal, Appalam, Curd & Payasam', bestseller: true },
  { name: 'Executive Mini Veg Meals', price: 130, category: 'South Indian', isVeg: true, desc: 'Rice, Sambar, Rasam, Poriyal, Curd, and Appalam', bestseller: false },
  { name: 'South Indian Tiffin Combo', price: 180, category: 'South Indian', isVeg: true, desc: 'Idli (2), Medhu Vada (1), Mini Masala Dosa, Pongal, and Degree Coffee', bestseller: true },

  // 2. North Indian (Paneer butter masala, palak paneer, dal makhani, chole bhature, rajma chawal, naan, roti, kulcha, paratha, thali)
  { name: 'Paneer Butter Masala', price: 210, category: 'North Indian', isVeg: true, desc: 'Cubes of fresh cottage cheese simmered in a velvety buttery tomato-cashew gravy', bestseller: true },
  { name: 'Palak Paneer', price: 200, category: 'North Indian', isVeg: true, desc: 'Fresh cottage cheese cooked in smooth spiced spinach puree tempered with garlic', bestseller: true },
  { name: 'Kadai Paneer Special', price: 215, category: 'North Indian', isVeg: true, desc: 'Paneer tossed with crunchy bell peppers, onions, and freshly pounded kadai spices', bestseller: false },
  { name: 'Shahi Paneer Korma', price: 220, category: 'North Indian', isVeg: true, desc: 'Royal Mughlai preparation of paneer in a rich fragrant cashew and melon seed cream gravy', bestseller: false },
  { name: 'Dal Makhani with Amul Butter', price: 180, category: 'North Indian', isVeg: true, desc: 'Slow-cooked black lentils in rich creamy butter and aromatic spices', bestseller: true },
  { name: 'Yellow Dal Tadka', price: 140, category: 'North Indian', isVeg: true, desc: 'Yellow toor dal tempered with ghee, cumin seeds, garlic, and dry red chillies', bestseller: false },
  { name: 'Amritsari Chole Bhature (2 Bhature)', price: 160, category: 'North Indian', isVeg: true, desc: 'Spicy chickpea curry served with large puffy bhature, pickled onions, and green chillies', bestseller: true },
  { name: 'Homestyle Rajma Chawal Bowl', price: 140, category: 'North Indian', isVeg: true, desc: 'Tender kidney beans simmered in spiced tomato gravy served with steamed basmati rice', bestseller: true },
  { name: 'Butter Naan (2 Pcs)', price: 90, category: 'North Indian', isVeg: true, desc: 'Clay oven baked soft leavened bread brushed generously with melted butter', bestseller: true },
  { name: 'Garlic Butter Naan (2 Pcs)', price: 110, category: 'North Indian', isVeg: true, desc: 'Tandoori naan topped with minced roasted garlic and fresh coriander', bestseller: true },
  { name: 'Cheese Garlic Naan', price: 130, category: 'North Indian', isVeg: true, desc: 'Stuffed naan with melted mozzarella cheese and golden roasted garlic', bestseller: false },
  { name: 'Tandoori Roti (3 Pcs)', price: 60, category: 'North Indian', isVeg: true, desc: 'Whole wheat flatbread baked in traditional clay tandoor', bestseller: false },
  { name: 'Amritsari Aloo Kulcha', price: 95, category: 'North Indian', isVeg: true, desc: 'Crisp layered tandoori flatbread stuffed with spiced potato mash, served with chole', bestseller: true },
  { name: 'Amritsari Paneer Kulcha', price: 110, category: 'North Indian', isVeg: true, desc: 'Crisp layered tandoori flatbread stuffed with grated spiced cottage cheese and herbs', bestseller: false },
  { name: 'Aloo Paratha with Curd & Pickle (2 Pcs)', price: 120, category: 'North Indian', isVeg: true, desc: 'Whole wheat flatbread stuffed with spiced mashed potatoes, served with fresh curd', bestseller: true },
  { name: 'Paneer Paratha with Butter', price: 135, category: 'North Indian', isVeg: true, desc: 'Grated paneer and green chilli stuffed paratha served with curd and pickle', bestseller: false },
  { name: 'Deluxe North Indian Veg Thali', price: 230, category: 'North Indian', isVeg: true, desc: 'Paneer butter masala, dal makhani, mixed sabzi, 2 butter rotis, jeera rice, and gulab jamun', bestseller: true },

  // 3. Vegetarian Rice & Meals (Veg biryani, mushroom biryani, paneer biryani, pulao, lemon rice, curd rice, tomato rice, sambar rice, veg fried rice)
  { name: 'Salem Special Veg Dum Biryani', price: 170, category: 'Biryani', isVeg: true, desc: 'Fragrant basmati rice layered with fresh vegetables and Salem biryani spices, served with raita', bestseller: true },
  { name: 'Paneer Tikka Biryani', price: 210, category: 'Biryani', isVeg: true, desc: 'Smoky tandoori paneer layered with aged basmati rice and saffron', bestseller: true },
  { name: 'Mushroom Seeraga Samba Biryani', price: 190, category: 'Biryani', isVeg: true, desc: 'Tamil Nadu traditional Seeraga Samba rice cooked with button mushrooms and whole spices', bestseller: true },
  { name: 'Kashmiri Pulao with Dry Fruits', price: 195, category: 'Biryani', isVeg: true, desc: 'Mild aromatic sweet and savory pulao with roasted cashews, raisins, and fruits', bestseller: false },
  { name: 'Jeera Rice with Dal Tadka', price: 160, category: 'Biryani', isVeg: true, desc: 'Aromatic cumin-tempered basmati rice served with yellow dal fry', bestseller: false },
  { name: 'Ghee Rice with Veg Kurma', price: 175, category: 'Biryani', isVeg: true, desc: 'Rich basmati rice cooked in pure ghee, cardamom, and fried onions', bestseller: false },
  { name: 'Soya Chaap Biryani', price: 195, category: 'Biryani', isVeg: true, desc: 'Marinated high-protein soya chunks slow-cooked with aromatic spices and mint', bestseller: false },
  { name: 'Curd Rice with Salem Pomegranate', price: 90, category: 'South Indian', isVeg: true, desc: 'Cool tempered curd rice garnished with juicy pomegranate seeds and pickle', bestseller: true },
  { name: 'Sambar Rice with Salem Potato Fry', price: 110, category: 'South Indian', isVeg: true, desc: 'Hot piping traditional sambar rice served with spicy pan-roasted potato', bestseller: true },
  { name: 'Lemon Peanut Rice', price: 90, category: 'South Indian', isVeg: true, desc: 'Tangy tempered turmeric rice with roasted crunchy peanuts and curry leaves', bestseller: false },
  { name: 'Tomato Rice with Raita', price: 95, category: 'South Indian', isVeg: true, desc: 'Spiced country tomato rice tempered with mustard seeds and mint', bestseller: false },
  { name: 'Veg Fried Rice', price: 150, category: 'Chinese', isVeg: true, desc: 'Wok-tossed basmati rice with finely chopped carrots, beans, and cabbage', bestseller: true },
  { name: 'Schezwan Veg Fried Rice', price: 165, category: 'Chinese', isVeg: true, desc: 'Spicy wok-tossed rice with fiery Schezwan chilli garlic paste and scallions', bestseller: false },

  // 4. Street Food & Chaat (Pani puri, bhel puri, samosa, pav bhaji, dahi puri, aloo tikki, kachori, vada pav, masala puri, chole tikki)
  { name: 'Pani Puri / Golgappa (8 Pcs)', price: 70, category: 'Street Food', isVeg: true, desc: 'Crispy hollow puris filled with spiced potato mash and tangy spicy mint-coriander water', bestseller: true },
  { name: 'Bombay Crunchy Bhel Puri', price: 75, category: 'Street Food', isVeg: true, desc: 'Puffed rice tossed with crispy sev, onions, tomatoes, and tangy tamarind-mint chutneys', bestseller: true },
  { name: 'Punjabi Crispy Samosa (2 Pcs)', price: 50, category: 'Street Food', isVeg: true, desc: 'Golden triangular pastry stuffed with spiced potatoes and green peas, served with chutneys', bestseller: true },
  { name: 'Pav Bhaji with Butter Pav (2 Pav)', price: 130, category: 'Street Food', isVeg: true, desc: 'Mashed spiced vegetable curry cooked in butter on a flat tawa, served with warm buttered pav', bestseller: true },
  { name: 'Dahi Sev Batata Puri (6 Pcs)', price: 85, category: 'Street Food', isVeg: true, desc: 'Crispy puris stuffed with potatoes and sweet beaten curd, topped with nylon sev and spices', bestseller: true },
  { name: 'Crispy Golden Aloo Tikki Chaat', price: 85, category: 'Street Food', isVeg: true, desc: 'Shallow fried spiced potato patties topped with warm chickpeas, sweet curd, and chutneys', bestseller: false },
  { name: 'Khasta Moong Dal Kachori (2 Pcs)', price: 70, category: 'Street Food', isVeg: true, desc: 'Flaky crispy pastry filled with spiced yellow lentils, served with tangy aloo rassa', bestseller: false },
  { name: 'Mumbai Vada Pav (2 Pcs)', price: 70, category: 'Street Food', isVeg: true, desc: 'Spiced potato dumpling inside a soft pav bun with spicy red garlic powder and fried green chilli', bestseller: true },
  { name: 'Salem Hot Masala Puri Chaat', price: 75, category: 'Street Food', isVeg: true, desc: 'Crushed puris drenched in boiling hot spiced dried green peas gravy with fresh onions and coriander', bestseller: true },
  { name: 'Chole Tikki Chaat', price: 95, category: 'Street Food', isVeg: true, desc: 'Crisp potato patties crowned with rich Amritsari chole, drizzled with curd and tamarind glaze', bestseller: false },
  { name: 'Authentic Salem Thattuvadai Set (4 Pcs)', price: 70, category: 'Street Food', isVeg: true, desc: 'Crispy Salem thattuvadai sandwiched with beetroot, carrot, onion slaw, and tangy green and red chutneys', bestseller: true },
  { name: 'Salem Norukkal Mixture Set', price: 80, category: 'Street Food', isVeg: true, desc: 'Crushed thattuvadai tossed with grated veggies and spicy tangy chutneys', bestseller: true },

  // 5. Fast Food (Veg burgers, cheeseburgers, pizza, garlic bread, sandwiches, French fries, wraps, tacos, pasta)
  { name: 'Crispy Veggie Crunch Burger', price: 120, category: 'Fast Food', isVeg: true, desc: 'Crispy vegetable patty with lettuce, tomatoes, and chef secret sauce', bestseller: true },
  { name: 'Double Cheese Burst Burger', price: 150, category: 'Fast Food', isVeg: true, desc: 'Juicy vegetable patty layered with molten cheese slices and house mayonnaise', bestseller: true },
  { name: 'Margherita Classic Pizza (10 Inch)', price: 230, category: 'Fast Food', isVeg: true, desc: 'Classic hand-stretched crust topped with herb tomato sauce and fresh mozzarella', bestseller: true },
  { name: 'Farmhouse Fresh Veggie Pizza', price: 280, category: 'Fast Food', isVeg: true, desc: 'Mushrooms, black olives, sweet corn, bell peppers, and golden cheese', bestseller: false },
  { name: 'Spicy Paneer Tikka Pizza', price: 299, category: 'Fast Food', isVeg: true, desc: 'Loaded with spiced paneer, onions, capsicum, and melted mozzarella', bestseller: true },
  { name: 'Cheesy Garlic Breadsticks (4 Pcs)', price: 130, category: 'Fast Food', isVeg: true, desc: 'Freshly baked bread infused with roasted garlic butter and melted mozzarella cheese', bestseller: true },
  { name: 'Bombay Grilled Cheese Sandwich', price: 110, category: 'Fast Food', isVeg: true, desc: 'Toasted three-layer bread filled with spiced potato masala, veggies, mint chutney, and molten cheese', bestseller: true },
  { name: 'Salted Classic French Fries', price: 95, category: 'Fast Food', isVeg: true, desc: 'Golden crispy potato fries lightly seasoned with sea salt', bestseller: false },
  { name: 'Peri Peri Masala French Fries', price: 110, category: 'Fast Food', isVeg: true, desc: 'Golden crispy potato fries dusted with zesty peri peri spice mix', bestseller: true },
  { name: 'Loaded Cheese French Fries', price: 135, category: 'Fast Food', isVeg: true, desc: 'Hot crispy potato fries generously drizzled with liquid cheese sauce and herbs', bestseller: false },
  { name: 'Crispy Veggie Tacos (2 Pcs)', price: 140, category: 'Fast Food', isVeg: true, desc: 'Crispy taco shells loaded with spicy refried beans, sweet corn, salsa, and cheese', bestseller: false },
  { name: 'Paneer Tikka Kathi Roll', price: 140, category: 'Fast Food', isVeg: true, desc: 'Flaky flatbread rolled with marinated paneer tikka, crunchy onions, and mint dip', bestseller: true },
  { name: 'Creamy White Sauce Alfredo Pasta', price: 210, category: 'Fast Food', isVeg: true, desc: 'Penne pasta tossed in rich parmesan garlic white sauce with broccoli, mushrooms, and herbs', bestseller: true },
  { name: 'Spicy Red Sauce Arrabbiata Pasta', price: 195, category: 'Fast Food', isVeg: true, desc: 'Penne pasta simmered in spicy Italian crushed tomato sauce with chilli flakes and basil', bestseller: false },
  { name: 'Creamy Mac and Cheese', price: 180, category: 'Fast Food', isVeg: true, desc: 'Tender elbow macaroni enveloped in a velvety cheddar cheese sauce baked golden', bestseller: false },

  // 6. Starters & Grilled Food (Veg) (Paneer tikka, gobi 65, chilli paneer, mushroom 65)
  { name: 'Tandoori Paneer Tikka (6 Pcs)', price: 220, category: 'North Indian', isVeg: true, desc: 'Cubes of cottage cheese marinated in tandoori yogurt spices and roasted in clay oven', bestseller: true },
  { name: 'Crispy Gobi 65', price: 140, category: 'South Indian', isVeg: true, desc: 'Crunchy battered cauliflower florets spiced with curry leaves and green chillies', bestseller: true },
  { name: 'Chilli Paneer Dry', price: 190, category: 'Chinese', isVeg: true, desc: 'Wok-tossed cottage cheese cubes with onions, capsicum, garlic, and soya chilli sauce', bestseller: true },
  { name: 'Crispy Mushroom Pepper Fry', price: 170, category: 'South Indian', isVeg: true, desc: 'Fresh button mushrooms tossed with crushed black pepper, shallots, and curry leaves', bestseller: false },

  // 7. Chinese & Asian (Veg noodles, Hakka noodles, Schezwan fried rice, Gobi Manchurian, momos, spring rolls, ramen, sushi)
  { name: 'Veg Hakka Noodles', price: 150, category: 'Chinese', isVeg: true, desc: 'Wok-tossed noodles with crunchy julienned vegetables and light soy sauce', bestseller: true },
  { name: 'Schezwan Veg Noodles', price: 165, category: 'Chinese', isVeg: true, desc: 'Fiery wok-tossed noodles in spicy homemade Schezwan sauce with bell peppers', bestseller: false },
  { name: 'Crispy Gobi Manchurian Dry', price: 160, category: 'Chinese', isVeg: true, desc: 'Fried cauliflower florets tossed in tangy ginger-garlic and dark soy sauce', bestseller: true },
  { name: 'Steamed Vegetable Momos (6 Pcs)', price: 120, category: 'Chinese', isVeg: true, desc: 'Delicate steamed dumplings stuffed with finely minced cabbage, carrots, and spring onions', bestseller: true },
  { name: 'Crispy Golden Veg Spring Rolls (4 Pcs)', price: 130, category: 'Chinese', isVeg: true, desc: 'Deep-fried crispy pastry rolls stuffed with shredded vegetables and sweet chilli sauce', bestseller: false },
  { name: 'Spicy Asian Veg Ramen Bowl', price: 220, category: 'Chinese', isVeg: true, desc: 'Steaming hot aromatic vegetable broth with springy noodles, bok choy, tofu, corn, and nori', bestseller: true },
  { name: 'Avocado & Cucumber Veg Sushi Roll (6 Pcs)', price: 260, category: 'Chinese', isVeg: true, desc: 'Seasoned vinegared sushi rice rolled with ripe avocado, cucumber, and sesame seeds', bestseller: false },
  { name: 'Thai Green Curry with Steamed Rice', price: 230, category: 'Chinese', isVeg: true, desc: 'Aromatic coconut milk green curry infused with lemongrass, galangal, bamboo shoots, and basil', bestseller: false },

  // 8. Bakery & Desserts (Cakes, pastries, brownies, donuts, cookies, muffins, cupcakes, gulab jamun, rasmalai, ice cream, cheesecakes, Indian sweets)
  { name: 'Dutch Chocolate Truffle Cake (500g)', price: 380, category: 'Bakery & Desserts', isVeg: true, desc: 'Layers of moist chocolate sponge filled with velvety smooth chocolate ganache', bestseller: true },
  { name: 'Black Forest Pastry Slice', price: 95, category: 'Bakery & Desserts', isVeg: true, desc: 'Layered chocolate sponge cake with whipped cream, cherries, and chocolate shavings', bestseller: false },
  { name: 'New York Style Cheesecake Slice', price: 175, category: 'Bakery & Desserts', isVeg: true, desc: 'Classic baked dense cream cheese cake on a crunchy graham cracker butter crust', bestseller: true },
  { name: 'Sizzling Walnut Brownie with Ice Cream', price: 160, category: 'Bakery & Desserts', isVeg: true, desc: 'Hot fudge chocolate walnut brownie served on a sizzling platter with vanilla ice cream', bestseller: true },
  { name: 'Glazed Chocolate Donut (2 Pcs)', price: 110, category: 'Bakery & Desserts', isVeg: true, desc: 'Soft fluffy ring donuts coated in rich melted Belgian chocolate glaze', bestseller: true },
  { name: 'Double Chocolate Muffin (2 Pcs)', price: 95, category: 'Bakery & Desserts', isVeg: true, desc: 'Moist chocolate sponge muffins filled with melting dark chocolate chips', bestseller: false },
  { name: 'Vanilla Buttercream Cupcakes (2 Pcs)', price: 90, category: 'Bakery & Desserts', isVeg: true, desc: 'Fluffy vanilla sponge cupcakes crowned with smooth whipped buttercream swirl', bestseller: false },
  { name: 'Gulab Jamun with Ice Cream', price: 110, category: 'Bakery & Desserts', isVeg: true, desc: 'Warm soft milk dumplings served with rich vanilla bean ice cream', bestseller: true },
  { name: 'Royal Malai Rasmalai (2 Pcs)', price: 120, category: 'Bakery & Desserts', isVeg: true, desc: 'Spongy cottage cheese patties in chilled saffron and pistachio milk', bestseller: true },
  { name: 'Traditional Salem Ghee Mysore Pak (250g)', price: 160, category: 'Bakery & Desserts', isVeg: true, desc: 'Melt-in-mouth traditional sweet made from pure Salem cow ghee, gram flour, and sugar', bestseller: true },
  { name: 'Crispy Hot Jalebi with Rabdi (4 Pcs)', price: 110, category: 'Bakery & Desserts', isVeg: true, desc: 'Golden fried spiral pretzels soaked in saffron sugar syrup, served with chilled thick rabdi', bestseller: true },
  { name: 'Kaju Katli (250g)', price: 240, category: 'Bakery & Desserts', isVeg: true, desc: 'Diamond-shaped rich cashew fudge topped with traditional silver vark', bestseller: false },
  { name: 'Motichoor Laddu (4 Pcs)', price: 90, category: 'Bakery & Desserts', isVeg: true, desc: 'Tiny besan pearls fried in pure ghee and bound into aromatic cardamom laddus', bestseller: false },
  { name: 'Salem Mango Kulfi Slice', price: 90, category: 'Bakery & Desserts', isVeg: true, desc: 'Rich and creamy kulfi made from famous Salem Alphonso mangoes', bestseller: true },
  { name: 'Belgian Dark Chocolate Ice Cream Scoop', price: 90, category: 'Bakery & Desserts', isVeg: true, desc: 'Rich bittersweet Belgian chocolate ice cream crafted with real dairy cream', bestseller: false },
  { name: 'Death By Chocolate Sundae', price: 175, category: 'Bakery & Desserts', isVeg: true, desc: 'Layers of chocolate cake, chocolate ice cream, fudge, and choco chips', bestseller: false },
  { name: 'Tirunelveli Ghee Halwa (100g)', price: 95, category: 'Bakery & Desserts', isVeg: true, desc: 'Authentic wheat milk halwa loaded with pure ghee and roasted cashews', bestseller: false },

  // 9. Beverages (Filter coffee, tea, masala chai, cold coffee, milkshakes, fresh juices, falooda, mojito-style mocktails, lassi, smoothies)
  { name: 'Authentic Salem Kumbakonam Degree Coffee', price: 45, category: 'Beverages', isVeg: true, desc: 'Piping hot South Indian filter coffee brewed with chicory and fresh cow milk', bestseller: true },
  { name: 'Salem Masala Ginger Tea', price: 40, category: 'Beverages', isVeg: true, desc: 'Freshly brewed milk tea infused with crushed ginger, cardamom, and cloves', bestseller: false },
  { name: 'Chilled Iced Cold Coffee with Ice Cream', price: 95, category: 'Beverages', isVeg: true, desc: 'Thick brewed coffee blended with chilled milk, sugar, and crowned with vanilla ice cream', bestseller: true },
  { name: 'Madurai Jigarthanda Special', price: 95, category: 'Beverages', isVeg: true, desc: 'Famous cooling drink made with almond gum, nannari syrup, milk, and basundi ice cream', bestseller: true },
  { name: 'Fresh Royal Falooda', price: 140, category: 'Beverages', isVeg: true, desc: 'Layered rose syrup, vermicelli, sabja seeds, milk, dry fruits, and strawberry ice cream', bestseller: false },
  { name: 'Salem Alphonso Mango Milkshake', price: 115, category: 'Beverages', isVeg: true, desc: 'Creamy seasonal shake crafted from world-famous Salem sweet mangoes', bestseller: true },
  { name: 'Fresh Tender Coconut Milkshake', price: 110, category: 'Beverages', isVeg: true, desc: 'Smooth creamy shake made with fresh tender coconut water and tender pulp', bestseller: true },
  { name: 'Fresh Sweet Lime (Mosambi) Juice', price: 70, category: 'Beverages', isVeg: true, desc: 'Freshly squeezed sweet lime juice with mint', bestseller: false },
  { name: 'Fresh Mint Lime Cooler', price: 60, category: 'Beverages', isVeg: true, desc: 'Refreshing iced lemon cooler infused with crushed garden mint', bestseller: false },
  { name: 'Virgin Mint Mojito Mocktail', price: 85, category: 'Beverages', isVeg: true, desc: 'Refreshing sparkling soda muddled with fresh mint leaves, lime juice, and cane sugar', bestseller: true },
  { name: 'Sweet Punjabi Lassi with Malai', price: 80, category: 'Beverages', isVeg: true, desc: 'Thick hand-churned sweet curd lassi served chilled with a thick layer of clotted cream', bestseller: true },
  { name: 'Mixed Berry Banana Smoothie', price: 125, category: 'Beverages', isVeg: true, desc: 'Nutrient-packed antioxidant smoothie made with blueberries, strawberries, ripe bananas, and yogurt', bestseller: false },

  // 10. Healthy Food & Breakfast & Vegan
  { name: 'Indori Poha with Peanuts & Sev', price: 75, category: 'Healthy Food', isVeg: true, desc: 'Steamed flattened rice tempered with mustard, fennel seeds, turmeric, crunchy peanuts, and ratlami sev', bestseller: true },
  { name: 'Golden Bread Toast with Butter & Jam (4 Slices)', price: 65, category: 'Healthy Food', isVeg: true, desc: 'Crisp toasted bread slices served with salted Amul butter and mixed fruit jam', bestseller: false },
  { name: 'Mediterranean Quinoa Salad Bowl', price: 190, category: 'Healthy Food', isVeg: true, desc: 'Protein-rich quinoa tossed with cucumbers, cherry tomatoes, olives, bell peppers, and lemon dressing', bestseller: true },
  { name: 'Warm Cinnamon Honey Oats Bowl', price: 120, category: 'Healthy Food', isVeg: true, desc: 'Rolled oats cooked in milk with sliced bananas, chia seeds, almonds, and natural honey', bestseller: false },
  { name: 'Tofu Butter Masala Curry', price: 195, category: 'Healthy Food', isVeg: true, desc: 'Healthy plant-based high-protein tofu cubes simmered in spiced cashew-tomato curry', bestseller: false },
  { name: 'Vegan Plant-Based Burger with Sweet Potato Fries', price: 185, category: 'Healthy Food', isVeg: true, desc: '100% plant-based patty served on a whole wheat bun with vegan mayo and sweet potato fries', bestseller: false },

  // 11. Offers & Combos
  { name: 'Veg Burger, French Fries & Coke Combo', price: 199, category: 'Offers & Combos', isVeg: true, desc: 'Crispy veggie burger, salted French fries, and a chilled can of soft drink', bestseller: true },
  { name: 'Mini Pizza & Fries Kids Meal', price: 180, category: 'Offers & Combos', isVeg: true, desc: 'Mini 6-inch cheese pizza, kid-sized fries, and fresh apple juice box', bestseller: false },
  { name: 'South Indian Executive Thali & Gulab Jamun Combo', price: 210, category: 'Offers & Combos', isVeg: true, desc: 'Full banana leaf thali with 2 piping hot gulab jamuns and degree filter coffee', bestseller: true },
];

const masterNonVegCatalog = [
  // 1. Non-Vegetarian Biryanis (Chicken biryani, mutton biryani, egg biryani, fish biryani, prawn biryani, mandi)
  { name: 'Salem Thalappakatti Chicken Biryani', price: 240, category: 'Biryani', isVeg: false, desc: 'Authentic Seeraga samba rice cooked with tender farm chicken and regional spices', bestseller: true },
  { name: 'Ambur Dum Chicken Biryani', price: 230, category: 'Biryani', isVeg: false, desc: 'Arcot style chicken biryani with curd pachadi and brinjal ennai kathirikai', bestseller: true },
  { name: 'Hyderabadi Chicken Dum Biryani', price: 250, category: 'Biryani', isVeg: false, desc: 'Long grain basmati rice slow cooked under dum with marinated spiced chicken', bestseller: true },
  { name: 'Kolkata Style Chicken Biryani with Egg & Potato', price: 260, category: 'Biryani', isVeg: false, desc: 'Fragrant saffron basmati rice cooked with tender chicken, boiled egg, and slow-cooked spiced potato', bestseller: true },
  { name: 'Andhra Gongura Chicken Biryani', price: 275, category: 'Biryani', isVeg: false, desc: 'Spicy Andhra-style biryani flavored with tangy gongura sorrel leaves and fiery green chillies', bestseller: true },
  { name: 'Nattu Kozhi Biryani (Country Chicken)', price: 290, category: 'Biryani', isVeg: false, desc: 'Country chicken cooked with small onions, garlic, and seeraga samba rice', bestseller: true },
  { name: 'Boneless Chicken 65 Biryani', price: 260, category: 'Biryani', isVeg: false, desc: 'Aromatic biryani layered with crispy spicy boneless chicken 65', bestseller: true },
  { name: 'Salem Special Mutton Chukka Biryani', price: 340, category: 'Biryani', isVeg: false, desc: 'Tender goat mutton cooked to perfection in aromatic Seeraga samba rice', bestseller: true },
  { name: 'Dindigul Thalappakatti Mutton Biryani', price: 360, category: 'Biryani', isVeg: false, desc: 'Signature tender mutton biryani served with dalcha and onion raita', bestseller: true },
  { name: 'Chettinad Spicy Mutton Biryani', price: 350, category: 'Biryani', isVeg: false, desc: 'Fiery mutton biryani flavored with stone flower, marathi moggu, and kalpasi', bestseller: false },
  { name: 'Salem Vanjaram Fish Biryani', price: 320, category: 'Biryani', isVeg: false, desc: 'Seeraga samba biryani cooked with marinated fresh King Fish (Vanjaram)', bestseller: true },
  { name: 'Spicy Prawn Thokku Biryani', price: 310, category: 'Biryani', isVeg: false, desc: 'Succulent sea prawns tossed in spicy onion-tomato gravy and layered with biryani rice', bestseller: true },
  { name: 'Salem Coastal Crab Biryani (Nandu Biryani)', price: 340, category: 'Biryani', isVeg: false, desc: 'Seeraga samba rice cooked with whole fresh crabs simmered in coastal chettinad spices', bestseller: false },
  { name: 'Egg Dum Biryani (2 Eggs)', price: 170, category: 'Biryani', isVeg: false, desc: 'Flavorful spiced rice with golden fried boiled eggs and salna', bestseller: false },
  { name: 'Chicken Mandi (Quarter)', price: 270, category: 'Biryani', isVeg: false, desc: 'Traditional slow-smoked Arabian spiced rice served with charbroiled chicken and spicy tomato salsa', bestseller: true },
  { name: 'Mutton Mandi Rice Platter', price: 380, category: 'Biryani', isVeg: false, desc: 'Arabian basmati rice layered with melt-in-mouth tender mutton ribs and fried nuts', bestseller: false },

  // 2. Non-Veg Curries & Gravies (Chicken curry, mutton curry, fish fry, prawn masala, non-veg meals)
  { name: 'Butter Chicken Masala', price: 260, category: 'North Indian', isVeg: false, desc: 'Tender tandoori chicken cooked in rich velvety makhani gravy', bestseller: true },
  { name: 'Chettinad Pepper Chicken Gravy', price: 250, category: 'South Indian', isVeg: false, desc: 'Spicy chicken curry infused with black pepper, curry leaves, and fennel', bestseller: true },
  { name: 'Kongu Nattu Kozhi Kuzhambu', price: 280, category: 'South Indian', isVeg: false, desc: 'Authentic Kongu country chicken curry made with shallots and fresh ground masala', bestseller: true },
  { name: 'Andhra Spicy Gongura Chicken Curry', price: 250, category: 'South Indian', isVeg: false, desc: 'Traditional Andhra sour sorrel leaves chicken curry cooked with red chillies and garlic', bestseller: true },
  { name: 'Chicken Tikka Masala', price: 270, category: 'North Indian', isVeg: false, desc: 'Charcoal grilled boneless chicken chunks in rich onion tomato gravy', bestseller: false },
  { name: 'Kongu Mutton Curry', price: 340, category: 'South Indian', isVeg: false, desc: 'Traditional home-style mutton curry with coconut and coriander gravy', bestseller: true },
  { name: 'Mutton Rogan Josh', price: 350, category: 'North Indian', isVeg: false, desc: 'Kashmiri-inspired slow-cooked mutton in fragrant red gravy with ratan jot', bestseller: false },
  { name: 'Salem Mutton Chukka Varuval', price: 330, category: 'South Indian', isVeg: false, desc: 'Tender baby goat pieces pan-fried dry with shallots, garlic, and Salem spices', bestseller: true },
  { name: 'Salem Village Style Meen Kuzhambu', price: 260, category: 'South Indian', isVeg: false, desc: 'Tangy tamarind and shallot fish curry simmered in clay pot', bestseller: true },
  { name: 'Salem Coastal Crab Roast Masala', price: 310, category: 'South Indian', isVeg: false, desc: 'Fresh blue sea crabs tossed in fiery shallot and black pepper roasted masala', bestseller: true },
  { name: 'Spicy Chettinad Prawn Masala', price: 310, category: 'South Indian', isVeg: false, desc: 'Succulent sea prawns simmered in onion-tomato masala with fresh coriander', bestseller: true },
  { name: 'Chicken Salna for Parotta', price: 180, category: 'South Indian', isVeg: false, desc: 'Roadside Salem style aromatic thin chicken gravy loaded with flavour', bestseller: true },
  { name: 'Egg Curry / Egg Salna (2 Eggs)', price: 140, category: 'South Indian', isVeg: false, desc: 'Hard-boiled eggs simmered in spicy South Indian onion tomato gravy', bestseller: false },
  { name: 'Special Salem Non-Veg Banana Leaf Meals', price: 240, category: 'South Indian', isVeg: false, desc: 'Steamed rice served with chicken gravy, mutton gravy, fish gravy, boiled egg, rasam, and curd', bestseller: true },

  // 3. Starters, Fried Chicken & Grilled Food (Chicken 65, chicken tikka, tandoori chicken, seekh kebab, grilled chicken, fish tikka, seafood)
  { name: 'Authentic Salem Chicken 65 (Boneless)', price: 210, category: 'Starters & Grill', isVeg: false, desc: 'Crispy deep-fried chicken cubes with curry leaves and green chillies', bestseller: true },
  { name: 'Chicken Lollipop (5 Pcs)', price: 230, category: 'Starters & Grill', isVeg: false, desc: 'Crispy chicken winglets served with spicy Schezwan dipping sauce', bestseller: true },
  { name: 'Salem Special Tandoori Chicken (Half)', price: 240, category: 'Starters & Grill', isVeg: false, desc: 'Clay-oven roasted chicken marinated in yogurt, Kashmiri chilli, and tandoori spices', bestseller: true },
  { name: 'Tandoori Chicken (Full)', price: 440, category: 'Starters & Grill', isVeg: false, desc: 'Full tender whole chicken roasted in clay oven, served with mint chutney and onions', bestseller: true },
  { name: 'Chicken Tikka (6 Pcs)', price: 240, category: 'Starters & Grill', isVeg: false, desc: 'Boneless chicken cubes skewered and charred to perfection in tandoor', bestseller: true },
  { name: 'Chicken Seekh Kebab (4 Pcs)', price: 250, category: 'Starters & Grill', isVeg: false, desc: 'Minced chicken seasoned with fresh mint, coriander, and skewered on charcoal', bestseller: false },
  { name: 'Arabian Alfaham Grilled Chicken (Half)', price: 260, category: 'Starters & Grill', isVeg: false, desc: 'Slow char-grilled chicken marinated with Arabian spices and served with garlic mayo', bestseller: true },
  { name: 'Alfaham Chicken (Full)', price: 470, category: 'Starters & Grill', isVeg: false, desc: 'Whole char-grilled chicken with Arabian spiced crust and garlic toum', bestseller: false },
  { name: 'Tandoori Fish Tikka (6 Pcs)', price: 280, category: 'Starters & Grill', isVeg: false, desc: 'Succulent fish fillets marinated in ajwain, tandoori masala, and grilled', bestseller: false },
  { name: 'Chettinad Pepper Chicken Dry Fry', price: 240, category: 'Starters & Grill', isVeg: false, desc: 'Boneless chicken roasted on cast iron with freshly ground black pepper and curry leaves', bestseller: true },
  { name: 'Tangdi Kebab (2 Pcs)', price: 240, category: 'Starters & Grill', isVeg: false, desc: 'Chicken drumsticks marinated in spicy tandoori masala and chargrilled', bestseller: false },
  { name: 'Chicken Malai Tikka (6 Pcs)', price: 270, category: 'Starters & Grill', isVeg: false, desc: 'Mild and creamy chicken skewers infused with cardamom, cheese, and cream', bestseller: true },
  { name: 'Hariyali Chicken Tikka (6 Pcs)', price: 260, category: 'Starters & Grill', isVeg: false, desc: 'Chicken skewers coated in fresh mint, coriander, and ginger-garlic marinade', bestseller: false },
  { name: 'Dragon Chicken Indo-Chinese', price: 240, category: 'Starters & Grill', isVeg: false, desc: 'Crispy fried chicken strips tossed in spicy red chilli, cashew, and soy sauce', bestseller: true },
  { name: 'BBQ Grilled Wings (6 Pcs)', price: 220, category: 'Starters & Grill', isVeg: false, desc: 'Juicy chicken wings coated in smoky BBQ sauce with sesame sprinkles', bestseller: false },
  { name: 'Peri Peri Grilled Chicken (Quarter)', price: 190, category: 'Starters & Grill', isVeg: false, desc: 'Charbroiled chicken glazed with spicy African bird eye chilli basting', bestseller: false },
  { name: 'Vanjaram Fish Fry (1 Big Slice)', price: 290, category: 'Seafood', isVeg: false, desc: 'Tava fried fresh King Fish slice marinated in spicy red chilli masala', bestseller: true },
  { name: 'Nethili Meen Varuval (Anchovy Fry)', price: 220, category: 'Seafood', isVeg: false, desc: 'Crispy deep fried small anchovy fish seasoned with lemon and spices', bestseller: false },
  { name: 'Golden Crispy Prawn Fry (8 Pcs)', price: 295, category: 'Seafood', isVeg: false, desc: 'Jumbo sea prawns battered and deep fried golden crisp with tartar sauce', bestseller: true },
  { name: 'Prawn Pepper Fry', price: 310, category: 'Seafood', isVeg: false, desc: 'Fresh prawns tossed with crushed black peppercorns and curry leaves', bestseller: false },
  { name: 'Tawa Pomfret Fish Fry', price: 320, category: 'Seafood', isVeg: false, desc: 'Whole pomfret fish marinated in spicy coastal masala and shallow fried', bestseller: false },
  { name: 'Squid Roast (Kanawa Varuval)', price: 280, category: 'Seafood', isVeg: false, desc: 'Tender squid rings roasted with shallots, curry leaves, and crushed pepper', bestseller: false },

  // 4. Parottas, Fast Food, Shawarma & Burgers (Non-veg)
  { name: 'Salem Bun Parotta (2 Pcs) with Chicken Salna', price: 130, category: 'Fast Food', isVeg: false, desc: 'Madurai style crispy puffy bun parotta served with piping hot salna', bestseller: true },
  { name: 'Salem Special Chicken Kothu Parotta', price: 180, category: 'Fast Food', isVeg: false, desc: 'Flaky parotta shredded on hot griddle with chicken, eggs, and rich salna', bestseller: true },
  { name: 'Mutton Kothu Parotta', price: 240, category: 'Fast Food', isVeg: false, desc: 'Shredded parotta tossed with tender minced mutton and spicy gravy', bestseller: true },
  { name: 'Egg Kothu Parotta', price: 140, category: 'Fast Food', isVeg: false, desc: 'Flaky minced parotta cooked with eggs, onions, green chillies, and gravy', bestseller: false },
  { name: 'Ceylon Chicken Parotta', price: 190, category: 'Fast Food', isVeg: false, desc: 'Thin layered rectangular parotta stuffed with spiced minced chicken and egg', bestseller: true },
  { name: 'Veechu Parotta (2 Pcs) with Salna', price: 100, category: 'Fast Food', isVeg: false, desc: 'Super-thin handkerchief parotta folded like an envelope and griddled', bestseller: false },
  { name: 'Chicken Shawarma Roll (Jumbo)', price: 130, category: 'Fast Food', isVeg: false, desc: 'Spit-roasted chicken slices rolled in pita bread with garlic toum and pickled vegetables', bestseller: true },
  { name: 'Open Plate Shawarma with Kuboos', price: 180, category: 'Fast Food', isVeg: false, desc: 'Generous serving of roasted chicken, fries, garlic sauce, and 2 fresh kuboos', bestseller: true },
  { name: 'Special Chicken Tikka Kathi Roll', price: 150, category: 'Fast Food', isVeg: false, desc: 'Flaky parotta rolled with succulent tandoori chicken tikka, mint chutney, and sliced onions', bestseller: true },
  { name: 'Mutton Keema Kathi Roll', price: 195, category: 'Fast Food', isVeg: false, desc: 'Layered parotta rolled with spiced minced mutton keema, sliced red onions, and lime', bestseller: false },
  { name: 'Crispy Fried Chicken Burger', price: 160, category: 'Fast Food', isVeg: false, desc: 'Crunchy golden chicken fillet with coleslaw, pickles, and spicy mayo', bestseller: true },
  { name: 'Double Chicken Cheeseburger with Fries', price: 199, category: 'Fast Food', isVeg: false, desc: 'Twin grilled chicken patties with double cheddar cheese, caramelized onions, and peri peri mayo', bestseller: true },
  { name: 'BBQ Chicken & Corn Pizza (10 Inch)', price: 320, category: 'Fast Food', isVeg: false, desc: 'Smoked BBQ chicken, sweet corn, red onions, and mozzarella cheese', bestseller: true },
  { name: 'American Classic Chicken Hot Dog', price: 140, category: 'Fast Food', isVeg: false, desc: 'Grilled chicken sausage in a warm toasted bun with yellow mustard, sweet relish, and ketchup', bestseller: false },
  { name: 'Spicy Mexican Chicken Tacos (2 Pcs)', price: 160, category: 'Fast Food', isVeg: false, desc: 'Hard shell tacos filled with shredded spicy chicken, roasted salsa, jalapenos, and sour cream', bestseller: false },
  { name: 'Creamy Chicken Alfredo Pasta', price: 240, category: 'Fast Food', isVeg: false, desc: 'Penne pasta with grilled chicken breast tossed in rich garlic parmesan cream sauce', bestseller: true },
  { name: 'Cheesy Chicken Mac and Cheese', price: 210, category: 'Fast Food', isVeg: false, desc: 'Baked macaroni loaded with shredded smoked chicken and three-cheese blend', bestseller: false },
  { name: 'Kari Dosa (Mutton Keema Dosa)', price: 220, category: 'South Indian', isVeg: false, desc: 'Famous Madurai three-layer thick dosa topped with spiced minced mutton and eggs', bestseller: true },
  { name: 'Chicken Keema Dosa', price: 180, category: 'South Indian', isVeg: false, desc: 'Crispy dosa smeared with spiced chicken keema and egg wash', bestseller: true },
  { name: 'Egg Podi Roast Dosa', price: 130, category: 'South Indian', isVeg: false, desc: 'Crispy roast dosa topped with spiced eggs and authentic Salem idli podi', bestseller: false },

  // 5. Chinese & Asian Non-Veg
  { name: 'Chicken Hakka Noodles', price: 180, category: 'Chinese', isVeg: false, desc: 'Wok-tossed noodles with shredded chicken, eggs, and crunchy vegetables', bestseller: true },
  { name: 'Egg Hakka Noodles', price: 160, category: 'Chinese', isVeg: false, desc: 'Wok-tossed noodles with scrambled eggs, scallions, and light soy sauce', bestseller: false },
  { name: 'Schezwan Chicken Noodles', price: 195, category: 'Chinese', isVeg: false, desc: 'Spicy wok-tossed noodles with chicken, eggs, and fiery Schezwan chilli paste', bestseller: false },
  { name: 'Chicken Fried Rice', price: 180, category: 'Chinese', isVeg: false, desc: 'Classic wok-tossed long grain rice with scrambled egg, tender chicken, and spring onions', bestseller: true },
  { name: 'Egg Fried Rice', price: 160, category: 'Chinese', isVeg: false, desc: 'Aromatic wok-tossed basmati rice with fluffy scrambled eggs and mild seasonings', bestseller: false },
  { name: 'Schezwan Chicken Fried Rice', price: 195, category: 'Chinese', isVeg: false, desc: 'Spicy chicken fried rice tossed in fiery home-made Schezwan paste', bestseller: false },
  { name: 'Chicken Manchurian Gravy', price: 220, category: 'Chinese', isVeg: false, desc: 'Golden chicken dumplings simmered in rich ginger, garlic, and scallion sauce', bestseller: true },
  { name: 'Chilli Chicken Dry', price: 220, category: 'Chinese', isVeg: false, desc: 'Wok-fried chicken chunks tossed with green chillies, capsicum, and dark soy', bestseller: true },
  { name: 'Steamed Chicken Momos (6 Pcs)', price: 140, category: 'Chinese', isVeg: false, desc: 'Juicy minced chicken and herb dumplings served with fiery Tibetan red chilli sauce', bestseller: true },
  { name: 'Fried Chicken Momos (6 Pcs)', price: 155, category: 'Chinese', isVeg: false, desc: 'Crispy deep-fried chicken momos served with Schezwan dip', bestseller: false },
  { name: 'Crispy Chicken Spring Rolls (6 Pcs)', price: 180, category: 'Chinese', isVeg: false, desc: 'Flaky fried rolls stuffed with minced chicken and glass noodles', bestseller: false },
  { name: 'Korean Crispy Glazed Fried Chicken Wings (6 Pcs)', price: 260, category: 'Chinese', isVeg: false, desc: 'Double-fried ultra-crispy chicken wings coated in sweet spicy gochujang garlic glaze', bestseller: true },
  { name: 'Chicken Miso Ramen Noodle Bowl', price: 250, category: 'Chinese', isVeg: false, desc: 'Rich chicken broth, springy ramen noodles, sliced chicken chashu, soft boiled egg, and scallions', bestseller: true },
  { name: 'Teriyaki Chicken Sushi Roll (6 Pcs)', price: 280, category: 'Chinese', isVeg: false, desc: 'Nori wrapped sushi rice with glazed teriyaki chicken, cucumber, and toasted sesame seeds', bestseller: false },

  // 6. Non-Veg Curries & Gravies Continued
  { name: 'Mutton Chops Masala', price: 360, category: 'North Indian', isVeg: false, desc: 'Tender goat ribs simmered in thick onion-tomato gravy with aromatic garam masala', bestseller: true },
  { name: 'Mutton Bone Soup (Nenju Elumbu Soup)', price: 130, category: 'South Indian', isVeg: false, desc: 'Spicy medicinal mutton ribs bone broth with crushed pepper, cumin, and shallots', bestseller: true },
  { name: 'Salem Special Mutton Salna', price: 210, category: 'South Indian', isVeg: false, desc: 'Rich street-style spicy salna with mutton stock for bun parotta', bestseller: true },
  { name: 'Chettinad Fish Curry (Meen Kuzhambu)', price: 270, category: 'South Indian', isVeg: false, desc: 'Fresh fish cooked in tangy raw mango, shallots, and spicy Chettinad curry', bestseller: true },
  { name: 'Prawn Ghee Roast Masala', price: 320, category: 'South Indian', isVeg: false, desc: 'Mangalorean style juicy prawns roasted in pure Salem ghee and fiery red byadgi chillies', bestseller: true },
  { name: 'Salem Nattu Kozhi Roast', price: 290, category: 'South Indian', isVeg: false, desc: 'Country chicken stir-fried with crushed pepper, shallots, and curry leaves', bestseller: true },
  { name: 'Kongu Mutton Brain Fry (Moolai Varuval)', price: 220, category: 'South Indian', isVeg: false, desc: 'Delicate goat brain spiced with black pepper, eggs, and small onions', bestseller: false },
  { name: 'Egg Roll with Crunchy Veggies', price: 90, category: 'Fast Food', isVeg: false, desc: 'Flaky parotta coated with golden egg, filled with sliced onions, chillies, and tangy sauce', bestseller: true },
  { name: 'Chicken Keema Samosa (2 Pcs)', price: 70, category: 'Fast Food', isVeg: false, desc: 'Crispy pastry triangles stuffed with spiced minced chicken and green peas', bestseller: false },
  { name: 'Barbecue Chicken Wings (6 Pcs)', price: 230, category: 'Starters & Grill', isVeg: false, desc: 'Tender chicken wings coated in sweet smoky hickory barbecue sauce', bestseller: false },
  { name: 'Mutton Chukka Dosa', price: 230, category: 'South Indian', isVeg: false, desc: 'Crisp golden dosa topped with tender spicy mutton chukka and egg wash', bestseller: true },
  { name: 'Crispy Chicken Strips with Tartar Dip', price: 190, category: 'Fast Food', isVeg: false, desc: 'Crunchy golden chicken tenders served with lemon garlic tartar sauce', bestseller: false },
  { name: 'Chettinad Prawn Biryani Platter', price: 330, category: 'Biryani', isVeg: false, desc: 'Aromatic Seeraga samba rice cooked with spicy tiger prawns, served with raita', bestseller: true },

  // 6. Breakfast, Combos & Sides
  { name: 'Masala Cheese Omelette with Butter Toast (3 Eggs)', price: 110, category: 'Healthy Food', isVeg: false, desc: 'Fluffy 3-egg omelette with onions, chillies, tomatoes, and melted cheese served with 2 butter toasts', bestseller: true },
  { name: 'Chicken Biryani & Thums Up Combo', price: 279, category: 'Offers & Combos', isVeg: false, desc: 'Salem Thalappakatti chicken biryani served with raita, salna, boiled egg, and a cold Thums Up', bestseller: true },
  { name: 'Crispy Chicken Burger, Fries & Soft Drink Combo', price: 239, category: 'Offers & Combos', isVeg: false, desc: 'Crispy chicken burger, salted french fries, and a chilled beverage can', bestseller: true },
  { name: 'Chicken Shawarma & Peri Peri Fries Combo', price: 219, category: 'Offers & Combos', isVeg: false, desc: 'Large rumali chicken shawarma roll served with spicy peri peri potato fries and garlic dip', bestseller: true },
];

const fileContent = `// Comprehensive catalog of 100+ Veg dishes and 100+ Non-Veg dishes for Salem FoodSwift
// Fully aligned with Swiggy & Zomato top culinary categories

const masterVegCatalog = ${JSON.stringify(masterVegCatalog, null, 2)};

const masterNonVegCatalog = ${JSON.stringify(masterNonVegCatalog, null, 2)};

module.exports = {
  masterVegCatalog,
  masterNonVegCatalog,
};
`;

const targetPath = path.join(__dirname, 'foodCatalog.js');
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully generated foodCatalog.js at:', targetPath);
console.log('Veg catalog items:', masterVegCatalog.length);
console.log('Non-veg catalog items:', masterNonVegCatalog.length);
