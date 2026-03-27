import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useParams, useSearchParams } from 'react-router-dom'; // ضفنا useSearchParams
import { supabase } from "../../dataBase/supabaseClient";
import { 
  ChevronDown, ChevronUp, SlidersHorizontal, X, Check, 
  Heart, ShoppingBag, LayoutGrid, Grid2X2, StretchHorizontal, Square, Loader2
} from 'lucide-react';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('filter'); // بيقرأ لو في ?filter=new

  // 1. States لبيانات المنتجات والتحميل
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. States للفلاتر والترتيب
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeSort, setActiveSort] = useState("Featured");
  
  // 3. States لطريقة العرض (Grid)
  const [cols, setCols] = useState(3); 
  const [mobileCols, setMobileCols] = useState(2); 

  // 4. States للقوائم والأنيميشن
  const [openFilters, setOpenFilters] = useState({ price: true, size: true, color: true });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const colorMap = {
    "Black": "#000000", "Blue": "#1e40af", "Grey": "#6b7280",
    "White": "#ffffff", "Red": "#ef4444", "Green": "#15803d", "Beige": "#f5f5dc"
  };

  // --- سحب البيانات من Supabase ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');

        // منطق "New Arrivals" (حاجات نزلت من شهر أو أقل)
        if (categoryName === "new-arrivals" || filterType === "new") {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          query = query.gte('created_at', oneMonthAgo.toISOString());
        } 
        // لو مش "all" ومش "new"، فلتر بناءً على الكاتيجوري
        else if (categoryName && categoryName !== "all" && categoryName !== "shop") {
          query = query.ilike('category', categoryName); 
        }

        const { data, error } = await query;
        if (error) throw error;

        let result = data;

        // تطبيق فلاتر السعر
        if (selectedPrice === "Under 1,000") result = result.filter(p => p.price < 1000);
        else if (selectedPrice === "1,000 - 3,000") result = result.filter(p => p.price >= 1000 && p.price <= 3000);
        else if (selectedPrice === "Over 3,000") result = result.filter(p => p.price > 3000);


        // ... داخل useEffect بعد ما بتجيب الـ data
        let w = data;

        // ترتيب المنتجات: العروض (old_price) تظهر أولاً
        w.sort((a, b) => {
          if (a.old_price && !b.old_price) return -1;
          if (!a.old_price && b.old_price) return 1;
          return 0;
        });
        // ... باقي الفلاتر (Price, Newest) كمل زي ما هي

        // تطبيق فلاتر المقاس واللون
        if (selectedSize) result = result.filter(p => p.sizes?.includes(selectedSize));
        if (selectedColor) result = result.filter(p => p.colors?.includes(selectedColor));

        // تطبيق الترتيب
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

  // --- مكون كارت المنتج المطور ---
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

    return (
      <div className="group cursor-pointer relative flex flex-col h-full bg-white transition-all">
        <div 
          className="relative aspect-[4/5] bg-[#f6f6f6] overflow-hidden mb-4 rounded-sm"
          onMouseEnter={() => images[1] && setCurrentIndex(1)}
          onMouseLeave={() => setCurrentIndex(0)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={images[currentIndex]} 
            alt={item.name} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
          />

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 md:hidden">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-black w-3' : 'bg-black/20'}`} 
                />
              ))}
            </div>
          )}

          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item); }} 
            className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
          >
            <Heart size={18} className={`transition-colors ${isLiked ? "fill-red-500 stroke-red-500" : "stroke-black"}`} />
          </button>

          <div className="absolute bottom-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block z-10">
            <button onClick={(e) => {e.stopPropagation(); addToCart(item)}} className="w-full bg-black text-white py-2.5 font-bold text-[12px] flex items-center justify-center gap-2 rounded-full hover:bg-gray-800 transition-colors">
              <ShoppingBag size={14} /> Add to Cart
            </button>
          </div>
        </div>

        <div className="px-1 md:hidden mb-3">
            <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="w-full bg-black text-white py-2.5 font-bold text-[11px] uppercase rounded-sm flex items-center justify-center gap-2">
              <ShoppingBag size={14} /> Add to Cart
            </button>
        </div>

        <div className="space-y-1 px-1">
          <h3 className="font-bold text-[14px] md:text-[16px] uppercase tracking-tight truncate">{item.name}</h3>
          <p className="text-gray-500 text-[12px] md:text-[14px] capitalize">{item.category}</p>
          <div className="flex items-center justify-between py-1 border-t border-gray-50 mt-2">
            <div className="flex gap-1">
              {item.colors?.map(c => (
                <div key={c} style={{ backgroundColor: colorMap[c] || c }} className="w-3 h-3 rounded-full border border-gray-200" />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-medium uppercase">{item.sizes?.join(', ')}</span>
          </div>
          {/* استبدل السطر 144 بالبلوك ده */}
          <div className="flex items-center gap-2 pt-1">
            {item.old_price ? (
              <>
                <span className="font-black text-[14px] md:text-[16px] text-red-600 italic">
                  {item.price?.toLocaleString()} EGP
                </span>
                <span className="text-[12px] md:text-[13px] text-gray-400 line-through italic decoration-1">
                  {item.old_price?.toLocaleString()} EGP
                </span>
              </>
            ) : (
              <span className="font-black text-[14px] md:text-[16px]">
                {item.price?.toLocaleString()} EGP
              </span>
            )}
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
            <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="flex items-center gap-1 font-bold text-sm hover:opacity-60 uppercase tracking-widest">Sort: <span className="text-gray-400">{activeSort}</span> <ChevronDown size={16} /></button>
            {isSortMenuOpen && (
              <div className="absolute right-0 mt-4 bg-white border border-gray-100 shadow-2xl rounded-bl-3xl w-56 py-4 z-50 overflow-hidden">
                {["Featured", "Newest", "Price: High-Low", "Price: Low-High"].map((opt) => (
                  <button key={opt} onClick={() => { setActiveSort(opt); setIsSortMenuOpen(false); }} className="flex items-center justify-between w-full px-6 py-3 text-sm font-bold hover:bg-gray-50 transition-colors uppercase italic">{opt} {activeSort === opt && <Check size={14} />}</button>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <Loader2 className="animate-spin text-black" size={48} />
              <p className="font-bold uppercase tracking-widest text-gray-400">Loading your drops...</p>
            </div>
          ) : (
            <div className={`grid gap-x-4 gap-y-12 transition-all duration-700 ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
              {products.length > 0 ? (
                products.map((item) => <ProductCard key={item.id} item={item} />)
              ) : (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-black uppercase tracking-[0.2em]">No products found in this section.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="bg-black text-white border border-white/20 rounded-full shadow-2xl px-6 py-3 flex items-center gap-8">
          <button onClick={() => setMobileCols(1)} className={`transition-all ${mobileCols === 1 ? 'text-white scale-125' : 'text-gray-500'}`}>
            <Square size={20} strokeWidth={mobileCols === 1 ? 3 : 2} />
          </button>
          <div className="w-[1px] h-4 bg-gray-700" />
          <button onClick={() => setMobileCols(2)} className={`transition-all ${mobileCols === 2 ? 'text-white scale-125' : 'text-gray-500'}`}>
            <Grid2X2 size={20} strokeWidth={mobileCols === 2 ? 3 : 2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;