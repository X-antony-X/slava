import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from "../../dataBase/supabaseClient";
import { 
  ChevronDown, ChevronUp, SlidersHorizontal, X, Check, 
  Heart, ShoppingBag, LayoutGrid, Grid2X2, StretchHorizontal, Square, Loader2, PackageX, RefreshCcw
} from 'lucide-react';

const CategoryPage = () => {
  const navigate = useNavigate();

  const [visibleProducts, setVisibleProducts] = useState(10); // عدد المنتجات اللي هتظهر حالياً
  const [hasMore, setHasMore] = useState(true); // هل لسه فيه منتجات تانية؟
  const [isFetchingMore, setIsFetchingMore] = useState(false); // عشان نظهر Loader صغير تحت

  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('filter'); 
  const { cartItems, totalPrice, addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeSort, setActiveSort] = useState("Featured");
  
  const [cols, setCols] = useState(3); 
  const [mobileCols, setMobileCols] = useState(2); 

  const [openFilters, setOpenFilters] = useState({ price: true, size: true, color: true });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const colorMap = {
    "Black": "#000000", "Blue": "#1e40af", "Grey": "#6b7280",
    "White": "#ffffff", "Red": "#ef4444", "Green": "#15803d", "Beige": "#f5f5dc"
  };

  const clearAllFilters = () => {
    setSelectedPrice("");
    setSelectedSize("");
    setSelectedColor("");
  };

// ضيف ده عشان لما الفلاتر تتغير، نرجع نبدأ من أول 10 منتجات تاني
useEffect(() => {
  setVisibleProducts(10);
  setHasMore(true);
}, [categoryName, selectedPrice, selectedSize, selectedColor, activeSort]);

const handleWhatsAppOrder = async (items, total) => {
  const itemsSummary = Array.isArray(items) 
    ? items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')
    : items;

  try {
    // 1. جلب بيانات الجلسة الحالية للمستخدم
    const { data: { session } } = await supabase.auth.getSession();
    let customerName = 'Guest'; // القيمة الافتراضية

    if (session?.user) {
      // 2. جلب الاسم الكامل من جدول الـ profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.full_name) {
        customerName = profile.full_name;
      }
    }

    // 3. الحفظ في Supabase مع إرسال الاسم الحقيقي
    const { error } = await supabase
      .from('whatsapp_orders')
      .insert([
        { 
          customer_name: customerName, // نرسل الاسم هنا بدلاً من تركه للقيمة الافتراضية
          order_details: itemsSummary, 
          total_price: total 
        }
      ]);

    if (error) throw error;

    // 4. التحويل للواتساب مع إضافة اسم العميل للرسالة
    const msg = encodeURIComponent(`طلب جديد من: ${customerName}\n\nالمنتجات:\n${itemsSummary}\n\nالإجمالي: ${total} EGP`);
    window.open(`https://wa.me/201279354981?text=${msg}`, '_blank');

  } catch (err) {
    console.error("Order Error:", err.message);
    alert("حصلت مشكلة في التسجيل، بس تقدر تكمل طلبك على الواتساب عادي.");
    
    const msg = encodeURIComponent(`طلب جديد:\n${itemsSummary}\nالإجمالي: ${total} EGP`);
    window.open(`https://wa.me/201279354981?text=${msg}`, '_blank');
  }
};

useEffect(() => {
  const handleScroll = () => {
    // لو بنحمل أصلاً أو مفيش منتجات زيادة، ميعملش حاجة
    if (isFetchingMore || !hasMore) return;

    // حسابات المسافة: لو المسافة من فوق + طول الشاشة >= طول الصفحة كلها - 500 بكسل
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
      loadMore();
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [isFetchingMore, hasMore, visibleProducts, products.length]);

const loadMore = () => {
  if (visibleProducts < products.length) {
    setIsFetchingMore(true);
    setTimeout(() => {
      setVisibleProducts((prev) => {
        const nextValue = prev + 10;
        if (nextValue >= products.length) {
          setHasMore(false); // لو وصلنا لآخر الداتا المتاحة نقفل الـ scroll
        }
        return nextValue;
      });
      setIsFetchingMore(false);
    }, 800);
  } else {
    setHasMore(false);
  }
};

useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        if (categoryName === "new-arrivals" || filterType === "new") {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          query = query.gte('created_at', oneMonthAgo.toISOString());
        } 
        else if (categoryName && categoryName !== "all" && categoryName !== "shop") {
          const formattedCategory = categoryName.replace(/-/g, ' ').trim();
          
          // بنبحث عن الكلمة سواء كانت مفرد أو جمع أو جزء من النص
          query = query.or(`category.ilike.%${formattedCategory}%,category.ilike.%${formattedCategory.replace(/s$/, '')}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        let result = data;

        if (selectedPrice === "Under 1,000") result = result.filter(p => p.price < 1000);
        else if (selectedPrice === "1,000 - 3,000") result = result.filter(p => p.price >= 1000 && p.price <= 3000);
        else if (selectedPrice === "Over 3,000") result = result.filter(p => p.price > 3000);

        let w = result;

        w.sort((a, b) => {
          if (a.old_price && !b.old_price) return -1;
          if (!a.old_price && b.old_price) return 1;
          return 0;
        });

        if (selectedSize) result = result.filter(p => p.sizes?.includes(selectedSize));
        if (selectedColor) result = result.filter(p => p.colors?.includes(selectedColor));

        if (activeSort === "Price: High-Low") result.sort((a, b) => b.price - a.price);
        else if (activeSort === "Price: Low-High") result.sort((a, b) => a.price - b.price);
        else if (activeSort === "Newest" || filterType === "new") {
          result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setProducts(result);
      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, filterType, selectedPrice, selectedSize, selectedColor, activeSort]);

  const toggleFilter = (section) => setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));

  // 🟢 1. مكون الـ Skeleton Loader
  const ProductSkeleton = () => (
    <div className="flex flex-col h-full animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-sm mb-3 w-full"></div>
      <div className="flex flex-col items-center">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  const ProductCard = ({ item }) => {
    const images = item.image_urls || ["https://via.placeholder.com/400"];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    
    const { addToCart, toggleWishlist, wishlistItems } = useCart();
    const isLiked = wishlistItems?.some(fav => fav.id === item.id);

    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    
    const handleTouchEnd = (e) => {
      if (!touchStart) return;
      const touchEnd = e.changedTouches[0].clientX;
      const distance = touchStart - touchEnd;
      if (distance > 50 && currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
      if (distance < -50 && currentIndex > 0) setCurrentIndex(prev => prev - 1);
      setTouchStart(null);
    };

    // حساب نسبة الخصم
    const discountPercentage = item.old_price ? Math.round(((item.old_price - item.price) / item.old_price) * 100) : 0;

    return (
      <div onClick={() => navigate(`/product/${item.id}`)}  className="group cursor-pointer relative flex flex-col h-full bg-white transition-all">
        <div 
          className="relative aspect-[3/4] overflow-hidden rounded-sm"
          onMouseEnter={() => images.length > 1 && setCurrentIndex(1)}
          onMouseLeave={() => setCurrentIndex(0)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={images[currentIndex]} 
            alt={item.name} 
            /* التعديل هنا: غيرنا object-cover لـ object-contain */
            className="w-full h-full object-contain transition-all duration-700 group-hover:scale-105 p-2" 
          />

          {/* 🟢 شريط الخصم (Sale Badge) */}
          {item.old_price && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md">
              -{discountPercentage}%
            </div>
          )}

          {/* 🟢 زرار المفضلة (Wishlist) */}
          <button 
            onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 ${isLiked ? 'opacity-100' : ''}`}
          >
            <Heart size={18} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-black md:text-gray-500 md:hover:text-black'}`} />
          </button>

{/* داخل الـ Overlay اللي بيظهر في الـ Desktop */}
<div className="absolute bottom-0 w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
  <div className="flex flex-col gap-2"> {/* أضفنا div لتنظيم الزرارين */}
  <button 
    onClick={(e) => {
      e.stopPropagation(); 
      addToCart({
        ...item,
        img: item.image_urls?.[0] || item.img // بنبعت أول صورة في المصفوفة تحت اسم img
      });
    }} 
    className="w-full bg-white text-black py-2 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-gray-100 transition-colors"
  >
    Add to Cart
  </button>
  {/* زرار اطلب الآن عبر الواتساب */}
  <button 
    onClick={(e) => {
      e.stopPropagation();
      // الدالة دي كافية جداً، هي اللي هتخزن وتفتح الواتساب
      handleWhatsAppOrder(item.name, item.price);
    }} 
    className="w-full bg-green-600 text-white py-2 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
  >
    Order via WhatsApp
  </button>
  </div>
</div>
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-1 mt-2 md:hidden">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-0.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-black w-3' : 'bg-gray-200 w-1'}`} 
              />
            ))}
          </div>
        )}

        <div className="pt-3 pb-1 px-1 flex flex-col items-center text-center flex-grow">
          <h3 className="font-bold text-[12px] md:text-[15px] uppercase tracking-tight leading-tight w-full px-1">
            {item.name}
          </h3>
          <p className="text-gray-400 text-[9px] md:text-[11px] uppercase mt-1 tracking-widest">
            {item.category}
          </p>
          <div className="flex items-center gap-2 mt-2">
             <span className={`font-black text-[13px] md:text-[16px] ${item.old_price ? 'text-red-600' : 'text-black'}`}>
               {item.price} <span className="text-[9px]">EGP</span>
             </span>
             {item.old_price && (
               <span className="text-[11px] md:text-[12px] text-gray-400 line-through font-medium">
                 {item.old_price}
               </span>
             )}
          </div>
{/* أزرار الأكشن للموبايل - تصميم الـ Unified Bar */}
<div className="flex w-full mt-4 h-9 md:hidden overflow-hidden rounded-[2px] border border-black">
  {/* الجزء الخاص بالطلب - واخد المساحة الأكبر */}
  <button 
    onClick={(e) => { 
      e.stopPropagation(); 
      // بنبعت اسم المنتج وسعره فقط
      handleWhatsAppOrder(item.name, item.price);
    }} 
    className="flex-[4] bg-black text-white flex items-center justify-center gap-1.5 active:bg-gray-900 transition-colors"
  >
    <span className="text-[9px] font-black uppercase italic tracking-tighter">Order Now</span>
    <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.6)]" />
  </button>

  {/* خط فاصل رفيع جداً */}
  <div className="w-[1px] bg-white/20 h-full" />

  {/* الجزء الخاص بالسلة - أيقونة فقط */}
  <button 
    onClick={(e) => { 
      e.stopPropagation(); 
      addToCart({
        ...item,
        img: item.image_urls?.[0] || item.img 
      }); 
    }} 
    className="flex-1 bg-black text-white flex items-center justify-center active:bg-gray-900 transition-colors"
  >
    <ShoppingBag size={13} strokeWidth={2.5} />
  </button>
</div>
          <div className="w-full flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
            <div className="flex gap-1">
            <div className="flex flex-wrap gap-1">
              {item.colors?.map(c => (
                <div 
                  key={c} 
                  style={{ backgroundColor: colorMap[c] || c }} 
                  className="w-2.5 h-2.5 rounded-full border-[0.5px] border-black/20" 
                />
              ))}
            </div>
            </div>
            {/* 🔴 تم التعديل هنا لعرض جميع المقاسات المتاحة 🔴 */}
            <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">
              {item.sizes?.join(' · ')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const FilterContent = () => (
    <div className="space-y-2 text-[#121212]">
      <div className="border-t border-gray-200 py-6">
        <button onClick={() => toggleFilter('price')} className="flex justify-between w-full font-bold py-2 text-[16px]">
          Price {openFilters.price ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {openFilters.price && (
          <div className="space-y-3 mt-4">
            {['All Prices', 'Under 1,000', '1,000 - 3,000', 'Over 3,000'].map(p => (
              <label key={p} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="price" checked={selectedPrice === (p === 'All Prices' ? "" : p)} onChange={() => setSelectedPrice(p === 'All Prices' ? "" : p)} className="w-5 h-5 accent-black" />
                <span className={`text-[15px] ${selectedPrice === (p === 'All Prices' ? "" : p) ? 'font-bold underline underline-offset-4' : 'text-gray-600'}`}>{p}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 py-6">
        <button onClick={() => toggleFilter('size')} className="flex justify-between w-full font-bold py-2 text-[16px]">
          Size {openFilters.size ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {openFilters.size && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
              <button key={s} onClick={() => setSelectedSize(selectedSize === s ? "" : s)} className={`border py-2.5 text-sm rounded-md transition-all font-medium ${selectedSize === s ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 py-6">
        <button onClick={() => toggleFilter('color')} className="flex justify-between w-full font-bold py-2 text-[16px]">
          Color {openFilters.color ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {openFilters.color && (
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.keys(colorMap).map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(selectedColor === c ? "" : c)}
                className={`group flex flex-col items-center gap-2 transition-all`}
              >
                <div 
                  style={{ backgroundColor: colorMap[c] }} 
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === c ? 'border-black scale-110 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  {selectedColor === c && <Check size={14} className={c === 'White' || c === 'Beige' ? 'text-black' : 'text-white'} />}
                </div>
                <span className={`text-[10px] font-bold uppercase ${selectedColor === c ? 'text-black' : 'text-gray-400'}`}>{c}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans relative text-[#121212]">
      <div className="sticky top-0 bg-white z-40 border-b border-gray-100 px-4 md:px-12 py-6 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
          {(filterType === 'new' || categoryName === 'new-arrivals') ? 'New Arrivals' : categoryName?.replace('-', ' ')} 
          <span className="text-gray-300 font-normal"> / {products.length}</span>
        </h1>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center border border-gray-200 rounded-full px-2 py-1 gap-1">
              {[2, 3, 4].map((num) => (
                <button key={num} onClick={() => setCols(num)} className={`p-1.5 rounded-full transition-colors ${cols === num ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
                  {num === 2 ? <Grid2X2 size={18}/> : num === 3 ? <LayoutGrid size={18}/> : <StretchHorizontal size={18} className="rotate-90"/>}
                </button>
              ))}
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex md:hidden items-center gap-2 font-bold text-sm border px-4 py-2 rounded-full">Filters <SlidersHorizontal size={16} /></button>
          <button onClick={() => setShowDesktopFilters(!showDesktopFilters)} className="hidden md:flex items-center gap-2 font-bold text-sm hover:opacity-60 transition-all uppercase tracking-widest">{showDesktopFilters ? "Hide Filters" : "Show Filters"} <SlidersHorizontal size={16} /></button>
          
          <div className="relative">
            <button 
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
              className="flex items-center gap-1 font-bold hover:opacity-60 uppercase tracking-widest transition-all"
            >
              <span className="text-[10px] md:text-sm">SORT:</span> 
              <span className="text-gray-400 text-[10px] md:text-sm truncate max-w-[80px] md:max-w-none">
                {activeSort}
              </span> 
              <ChevronDown size={14} className="md:w-4 md:h-4" />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 mt-4 bg-white border border-gray-100 shadow-2xl rounded-bl-3xl w-48 md:w-56 py-2 z-50 overflow-hidden">
                {["Featured", "Newest", "Price: High-Low", "Price: Low-High"].map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => { setActiveSort(opt); setIsSortMenuOpen(false); }} 
                    className="flex items-center justify-between w-full px-5 py-3 text-[11px] md:text-sm font-bold hover:bg-gray-50 transition-colors uppercase italic"
                  >
                    {opt} {activeSort === opt && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex px-4 md:px-12 gap-10 mt-8 relative">
        {showDesktopFilters && (
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <FilterContent />
          </aside>
        )}

        <div className={`fixed inset-0 bg-black/60 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute right-0 top-0 h-full w-[85%] bg-white p-6 transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic">Filters</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            <FilterContent />
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-black text-white py-4 rounded-full font-black mt-8 uppercase tracking-widest text-xs shadow-xl">Apply Filters</button>
          </div>
        </div>

<main className="flex-1 pb-20">
  {/* 🟢 استخدام الـ Skeleton أثناء التحميل الأولي فقط */}
  {loading ? (
    <div className={`grid gap-x-4 gap-y-12 transition-all duration-700 ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      {[1, 2, 3, 4, 5, 6].map((n) => <ProductSkeleton key={n} />)}
    </div>
  ) : (
    <div className="flex flex-col gap-12">
      <div className={`grid gap-x-4 gap-y-12 transition-all duration-700 ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {products.length > 0 ? (
          /* التعديل هنا: بنعرض فقط العدد المسموح بيه من المنتجات */
          products.slice(0, visibleProducts).map((item) => (
            <ProductCard key={item.id} item={item} />
          ))
        ) : (
          /* حالة الفراغ (Empty State) */
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <PackageX size={64} strokeWidth={1} className="text-gray-300 mb-6" />
            <p className="text-gray-900 font-black text-xl md:text-2xl uppercase tracking-[0.1em] italic mb-3">No Drops Found</p>
            <p className="text-gray-400 font-medium text-xs md:text-sm uppercase tracking-widest mb-8 text-center max-w-md">
              We couldn't find any items matching your current filters.
            </p>
            <button 
              onClick={clearAllFilters} 
              className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
            >
              <RefreshCcw size={14} /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 🔵 الـ Loader اللي بيظهر لما تنزل لآخر الصفحة ويحمل منتجات جديدة */}
      {isFetchingMore && hasMore && (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-black" size={32} />
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Loading More...</span>
          </div>
        </div>
      )}

      {/* اختياري: رسالة تظهر لما المنتجات تخلص خالص */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-10">
          <p className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase italic">
            — You've reached the end —
          </p>
        </div>
      )}
    </div>
  )}
</main>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="bg-black/90 backdrop-blur-sm text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-5 border border-white/10">
          <button 
            onClick={() => setMobileCols(1)} 
            className={`transition-all duration-300 ${mobileCols === 1 ? 'text-white scale-110' : 'text-gray-500'}`}
          >
            <Square size={16} strokeWidth={mobileCols === 1 ? 2.5 : 2} />
          </button>
          
          <div className="w-[1px] h-3 bg-white/20" />
          
          <button 
            onClick={() => setMobileCols(2)} 
            className={`transition-all duration-300 ${mobileCols === 2 ? 'text-white scale-110' : 'text-gray-500'}`}
          >
            <Grid2X2 size={16} strokeWidth={mobileCols === 2 ? 2.5 : 2} />
          </button>
        </div>
      </div>

{/* زرار إنهاء الطلب العائم للموبايل */}
{cartItems?.length > 0 && (
  <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden">
    <button 
      onClick={() => {
        // نادى الدالة وابعتلها السلة كلها والإجمالي
        handleWhatsAppOrder(cartItems, totalPrice);
      }}
      className="w-full bg-black text-white py-4 rounded-xl shadow-2xl flex items-center justify-between px-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">
          {cartItems.length}
        </div>
        <span className="font-black uppercase tracking-[0.1em] text-[11px]">Confirm Order</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold">{totalPrice} EGP</span>
        <ChevronDown size={14} className="-rotate-90" />
      </div>
    </button>
  </div>
)}

    </div>
  );
};

export default CategoryPage;