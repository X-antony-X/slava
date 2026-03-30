import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { Trash2, ShoppingBag, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "../../dataBase/supabaseClient"; 
import toast, { Toaster } from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchUserProfile = async () => {
      // استخدام getSession لتجنب مشاكل الـ Lock في المتصفح
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, address, phone')
          .eq('id', session.user.id)
          .single();
        
        if (data) setUserData(data);
        if (error) console.error("Error fetching profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  // 2. دالة الحفظ في قاعدة البيانات والتحويل للواتساب
  const handleCheckout = async () => {
    setLoading(true);
    const phoneNumber = "201279354981";
    
    try {
      // التأكد من حالة تسجيل الدخول
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        toast.error('Please login to complete your order', {
          duration: 4000,
          position: 'top-center',
          style: {
            borderRadius: '2px',
            background: '#121212',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          },
        });
        return;
      }

      // تجهيز قائمة المنتجات (للحفظ في الداتابيز ولرسالة الواتساب)
      const itemsList = cartItems.map((item, index) => {
        const size = item.selectedSize ? ` [Size: ${item.selectedSize}]` : "";
        return `${index + 1}. ${item.name}${size} - (x${item.quantity})`;
      }).join('\n');

      // تحديد اسم العميل (الأولوية للاسم في البروفايل ثم الإيميل)
      const finalCustomerName = userData?.full_name || session.user.email || 'Registered User';

      // --- الخطوة الجديدة: الحفظ في Supabase ---
      const { error: dbError } = await supabase
        .from('whatsapp_orders')
        .insert([
          { 
            customer_name: finalCustomerName, 
            order_details: itemsList, 
            total_price: totalPrice,
            status: 'pending' 
          }
        ]);

      if (dbError) {
        console.error("Database Save Error:", dbError);
        // لا نوقف العملية هنا لضمان إتمام البيعة عبر واتساب حتى لو فشل التسجيل الرقمي
      }

      // تجهيز معلومات الشحن للرسالة
      const customerInfo = userData ? (
        `\n👤 بيانات الشحن:\n- الاسم: ${userData.full_name}\n- العنوان: ${userData.address}\n- التليفون: ${userData.phone}`
      ) : `\n⚠️ تنبيه: العميل مسجل حساب لكن لم يكمل بيانات البروفايل.`;

      const message = encodeURIComponent(
        `أهلاً Slava، طلب جديد 🛒\n\n` +
        `📦 المنتجات:\n${itemsList}\n\n` +
        `💰 الإجمالي: ${totalPrice.toLocaleString()} EGP\n` +
        `--------------------------` +
        `${customerInfo}`
      );

      // فتح الواتساب
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      toast.success('Order Processed Successfully!');

    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error("An error occurred, but you can still order via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // حالة السلة الفارغة
  if (cartItems.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <ShoppingBag size={64} className="text-gray-200" />
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Your bag is empty</h2>
      <Link to="/" className="bg-black text-white px-10 py-4 rounded-sm font-bold uppercase text-xs tracking-[0.2em]">Back to Shop</Link>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-10 text-[#121212]">
      <Toaster /> 

      <div className="flex items-center gap-4 mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Bag</h1>
        <span className="text-gray-300 text-2xl">/ {cartItems.length} Items</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2 space-y-8">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-32 md:w-40 md:h-52 bg-gray-100 overflow-hidden rounded-sm flex-shrink-0 relative">
                <img 
                  src={item.img || item.image || item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover block"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x600?text=No+Image"; }}
                />
              </div>
              
              <div className="flex flex-col justify-between flex-1 py-1">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base md:text-xl uppercase tracking-tight">{item.name}</h3>
                    <p className="font-black text-sm md:text-lg">{item.price.toLocaleString()} <span className="text-[10px]">EGP</span></p>
                  </div>
                  <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.2em]">{item.subCategory || 'Collection'}</p>
                  {item.selectedSize && (
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-sm uppercase">Size: {item.selectedSize}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Qty: {item.quantity}</p>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="w-fit text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-4"
                >
                  <Trash2 size={14} /> Remove Item
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ملخص الطلب */}
        <div className="h-fit sticky top-24">
          <div className="bg-[#fcfcfc] border border-gray-100 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-black uppercase italic tracking-tight mb-8">Summary</h2>
            
            <div className="space-y-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-tighter">Subtotal</span>
                <span className="font-black">{totalPrice.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase tracking-tighter">Shipping</span>
                <span className="text-[10px] font-black text-green-600 uppercase">Calculated in chat</span>
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xl uppercase italic">Total</span>
                  <span className="font-black text-2xl">{totalPrice.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-sm font-black mt-10 uppercase tracking-[0.2em] text-[11px] hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>Confirm via WhatsApp <MessageCircle size={18} fill="white" className="text-black" /></>
              )}
            </button>
            
            {userData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-sm border-l-2 border-black">
                <p className="text-[10px] font-black uppercase mb-1 text-gray-400 italic">Shipping To:</p>
                <p className="text-[11px] font-bold truncate tracking-tight">{userData.full_name} • {userData.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;