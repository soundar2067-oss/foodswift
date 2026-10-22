import React, { useState } from 'react';
import { Plus, Minus, Star, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodItemCard({ item, restaurant }) {
  const { cart, addItem, updateQuantity } = useCart();
  const [selectedPortion, setSelectedPortion] = useState('Standard');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Check if item is already in cart
  const cartItem = cart.items.find((i) => (i.foodItem?._id || i.foodItem) === item._id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const fallbackImage = item.isVeg
    ? 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80';

  const handleAddClick = () => {
    // If item has portions or add-ons, open customizer modal
    if ((item.portionSizes && item.portionSizes.length > 1) || (item.addOns && item.addOns.length > 0)) {
      setModalOpen(true);
    } else {
      addItem({
        foodItem: { ...item, restaurant: restaurant || item.restaurant },
        quantity: 1,
      });
    }
  };

  const handleCustomizedAdd = () => {
    addItem({
      foodItem: { ...item, restaurant: restaurant || item.restaurant },
      quantity: 1,
      portionSize: selectedPortion,
      addOns: selectedAddOns,
    });
    setModalOpen(false);
  };

  const toggleAddOn = (addOn) => {
    const exists = selectedAddOns.some((a) => a.name === addOn.name);
    if (exists) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addOn.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
        {/* Left Information */}
        <div className="space-y-1.5 flex-1 pr-2">
          {/* Veg / Non-Veg Indicator & Bestseller */}
          <div className="flex items-center space-x-2">
            <span
              className={`w-4 h-4 rounded-sm border flex items-center justify-center p-0.5 ${
                item.isVeg ? 'border-emerald-600' : 'border-rose-700'
              }`}
              title={item.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-700'
                }`}
              />
            </span>

            {item.isBestseller && (
              <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Sparkles className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>Bestseller</span>
              </span>
            )}
          </div>

          <h4 className="font-bold text-slate-900 text-base leading-tight">
            {item.name}
          </h4>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{item.discountPrice || item.price}
            </span>
            {item.discountPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{item.price}
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-medium">
              ({item.categoryName})
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description || 'Prepared with authentic spices and fresh local ingredients.'}
          </p>
        </div>

        {/* Right Photo & Add Button */}
        <div className="relative flex flex-col items-center flex-shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
            <img
              src={item.imageUrl || fallbackImage}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = fallbackImage;
              }}
            />
          </div>

          {/* Quantity Stepper or Add Button */}
          <div className="absolute -bottom-3">
            {currentQuantity > 0 ? (
              <div className="flex items-center space-x-2 bg-brand-600 text-white px-3 py-1.5 rounded-full shadow-md font-bold text-xs">
                <button
                  onClick={() => updateQuantity(cartItem._id, currentQuantity - 1)}
                  className="hover:scale-125 transition-transform cursor-pointer p-0.5"
                  title="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5">{currentQuantity}</span>
                <button
                  onClick={() => updateQuantity(cartItem._id, currentQuantity + 1)}
                  className="hover:scale-125 transition-transform cursor-pointer p-0.5"
                  title="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="bg-white hover:bg-orange-50 text-brand-600 border border-brand-200 hover:border-brand-500 font-bold text-xs px-5 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center space-x-1"
              >
                <span>ADD</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Portion and Add-ons Customization Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500">Customize your portion size & add-ons</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Portion selector */}
            {item.portionSizes && item.portionSizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Portion Size</span>
                <div className="space-y-1.5">
                  {item.portionSizes.map((portion) => (
                    <label
                      key={portion.name}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedPortion === portion.name
                          ? 'border-brand-500 bg-orange-50/60 font-semibold text-brand-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="portion"
                          checked={selectedPortion === portion.name}
                          onChange={() => setSelectedPortion(portion.name)}
                          className="accent-brand-600"
                        />
                        <span className="text-sm">{portion.name}</span>
                      </div>
                      <span className="text-sm font-bold">₹{portion.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons selector */}
            {item.addOns && item.addOns.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Add-ons (Optional)</span>
                <div className="space-y-1.5">
                  {item.addOns.map((addOn) => {
                    const isChecked = selectedAddOns.some((a) => a.name === addOn.name);
                    return (
                      <label
                        key={addOn.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-brand-500 bg-orange-50/60 font-semibold text-brand-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAddOn(addOn)}
                            className="accent-brand-600 rounded"
                          />
                          <span className="text-sm">{addOn.name}</span>
                        </div>
                        <span className="text-sm font-bold">+₹{addOn.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleCustomizedAdd}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-brand-500/25 transition-all text-sm uppercase tracking-wider cursor-pointer"
            >
              Add Item to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
