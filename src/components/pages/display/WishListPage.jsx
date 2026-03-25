import React from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist, addToCart } = useCart();

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-10">
      <h1 className="text-3xl font-bold mb-10">Favorites ({wishlistItems.length})</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-gray-500 text-center py-20">Items added to your Favorites will be saved here.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map(item => (
            <div key={item.id} className="group animate-in zoom-in-95 duration-300">
              <div className="relative aspect-square overflow-hidden bg-[#f6f6f6] mb-3">
                <img src={item.img} className="w-full h-full object-cover" />
                <button 
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                >
                  <Heart size={18} className="fill-red-500 stroke-red-500" />
                </button>
              </div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{item.price} EGP</p>
              <button 
                onClick={() => addToCart(item)}
                className="w-full border border-black py-2 rounded-full font-medium hover:bg-black hover:text-white transition-colors"
              >
                Add to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default WishlistPage;