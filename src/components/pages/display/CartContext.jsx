import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../dataBase/supabaseClient'; // تأكد إن المسار ده صح

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // السلة (LocalStorage) زي ما هي
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('slava_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);

  // جلب المستخدم والمفضلة من Supabase
  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);

      if (currentUser) {
        // لو مسجل دخول، جيب مفضلته من الداتابيز
        const { data, error } = await supabase
          .from('wishlist')
          .select('products(*)')
          .eq('user_id', currentUser.id);

        if (data && !error) {
          // استخراج المنتجات من الأوبجكت اللي راجع
          setWishlistItems(data.map(item => item.products));
        }
      } else {
        // لو مش مسجل، اقرأ من الـ LocalStorage
        const savedWishlist = localStorage.getItem('slava_wishlist');
        if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
      }
    };

    fetchWishlist();

    // مراقبة تسجيل الدخول والخروج لتحديث البيانات
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN') fetchWishlist();
      if (event === 'SIGNED_OUT') setWishlistItems([]);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // حفظ السلة محلياً
  useEffect(() => {
    localStorage.setItem('slava_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // حفظ المفضلة محلياً (للزوار فقط)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('slava_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

  const toggleWishlist = async (product) => {
    const exists = wishlistItems.find(item => item.id === product.id);

    // 1. تحديث الشاشة فوراً عشان تبان سريعة للعميل (Optimistic UI)
    if (exists) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
    } else {
      setWishlistItems(prev => [...prev, product]);
    }

    // 2. تحديث قاعدة البيانات لو المستخدم مسجل دخول
    if (user) {
      if (exists) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
      } else {
        await supabase
          .from('wishlist')
          .insert([{ user_id: user.id, product_id: product.id }]);
      }
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, wishlistItems, addToCart, removeFromCart, toggleWishlist, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);