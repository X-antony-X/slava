import React from 'react';
import { useCart } from './CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <ShoppingBag size={64} className="text-gray-300" />
      <h2 className="text-2xl font-bold">Your cart is empty</h2>
      <Link to="/" className="bg-black text-white px-8 py-3 rounded-full">Shop Now</Link>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-10">
      <h1 className="text-3xl font-bold mb-10">Bag</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-4 border-b pb-6 animate-in fade-in slide-in-from-bottom-4">
              <img src={item.img} className="w-24 h-24 md:w-40 md:h-40 object-cover bg-[#f6f6f6]" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between font-bold">
                  <h3>{item.name}</h3>
                  <p>{item.price.toLocaleString()} EGP</p>
                </div>
                <p className="text-gray-500">{item.subCategory}</p>
                <p className="text-sm">Quantity: {item.quantity}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 pt-4 hover:underline flex items-center gap-1">
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-8 rounded-2xl h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6">Summary</h2>
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>{totalPrice.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between mb-6 pt-4 border-t font-bold text-lg">
            <span>Total</span>
            <span>{totalPrice.toLocaleString()} EGP</span>
          </div>
          <button className="w-full bg-black text-white py-4 rounded-full font-bold hover:opacity-80 transition-opacity">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};
export default CartPage;