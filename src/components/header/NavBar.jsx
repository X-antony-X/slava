import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../pages/display/CartContext';
import { Search, Heart, ShoppingBag, Menu, X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'; // ضفنا Loader
import { Link, useNavigate } from 'react-router-dom'; // ضفنا useNavigate
import { supabase } from "../dataBase/supabaseClient"

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(4);
        if (data) setSuggestedProducts(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };
    fetchSuggestions();
  }, []);

  const navigate = useNavigate();
  
  const { cartItems, wishlistItems } = useCart();
  const timeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus on input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  useEffect(() => {
      const fetchResults = async () => {
        // هيبدأ يبحث لو فيه حرف واحد على الأقل
        if (searchTerm.trim().length > 0) {
          setIsLoading(true);
          try {
            const { data, error } = await supabase
              .from('products')
              .select('*')
              .ilike('name', `%${searchTerm}%`)
              .limit(5);

            if (data) setSearchResults(data);
          } catch (error) {
            console.error("Search error:", error);
          } finally {
            setIsLoading(false);
          }
        } else {
          setSearchResults([]);
        }
      };

    // تقليل الوقت لـ 100ms عشان يلحق يكتب بس يكون الاستجابة فورية
    const delayDebounceFn = setTimeout(fetchResults, 100);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 100);
  };

  const menuItems = {
      tops: [
        { name: 'All Tops', path: '/shop/tops' },
        { name: 'Hoodies', path: '/shop/hoodie' }, // شيلنا الـ s عشان تطابق الـ Inventory
        { name: 'Jackets', path: '/shop/jacket' },
        { name: 'T-Shirts', path: '/shop/t-shirt' },
        { name: 'Shirts', path: '/shop/shirt' },
        { name: 'Pullovers', path: '/shop/pullover' }
      ],
      bottoms: [
        { name: 'All Bottoms', path: '/shop/bottoms' },
        { name: 'Pants', path: '/shop/pants' },
        { name: 'Shorts', path: '/shop/shorts' },
        { name: 'Sweatpants', path: '/shop/sweatpants' }
      ]
    };

  const popularSearches = ['Oversized', 'Black Hoodie', 'Cargo Pants', 'New Drop', 'Summer Collection'];

  return (
    <>
{/* Search Overlay */}
      <div className={`fixed inset-0 bg-white z-[200] transition-all duration-300 ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-4">
          <div className="flex items-center justify-between gap-10">
            <img src="/thumbnail.svg" alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
            
            <div className="flex-1 max-w-[800px] relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search" 
                className="w-full bg-[#f5f5f5] py-3 pl-12 pr-4 rounded-full outline-none text-lg"
              />
            </div>

            <button onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }} className="text-black font-medium">
              Cancel
            </button>
          </div>

          {/* نتائج البحث المباشرة */}
          <div className="mt-8 max-w-[800px] mx-auto overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {isLoading && searchTerm.length > 0 && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
              </div>
            )}

            {!isLoading && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {searchResults.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchTerm('');
                    }}
                    className="flex items-center justify-between p-4 hover:bg-[#f5f5f5] rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden">
                          <img 
                            src={product.image_urls?.[0]} // لو هي مصفوفة، هات أول صورة
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            // لو الصورة لسه مش بتظهر، ضيف ده كـ fallback:
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase italic tracking-wider text-black">{product.name}</h4>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{product.category || 'Collection'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm italic">{product.price} EGP</span>
                      <ChevronRight className="h-4 w-4 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchTerm.length > 0 && !isLoading ? (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">No results found for "{searchTerm}"</p>
              </div>
            ) : (
                              /* Popular Searches تظهر لما السيرش يكون فاضي */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Featured Products</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {suggestedProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/product/${product.id}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchTerm('');
                          }}
                          className="group"
                        >
                          <div className="aspect-[3/4] bg-[#f5f5f5] rounded-2xl overflow-hidden mb-4 relative">
                            <img 
                              src={product.image_urls?.[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400'; }}
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h4 className="font-black text-[11px] uppercase italic tracking-wider line-clamp-1">{product.name}</h4>
                          <p className="text-gray-400 text-[10px] font-bold mt-1">{product.price} EGP</p>
                        </Link>
                      ))}
                    </div>

                    {/* لو لسه عايز تسيب الكلمات المشهورة تحت المنتجات بشكل بسيط */}
                    <div className="mt-12 pt-8 border-t border-gray-50">
                      <h3 className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] mb-4">Quick Links</h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.slice(0,3).map((term) => (
                          <button 
                            key={term}
                            onClick={() => setSearchTerm(term)}
                            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
            )}
          </div>
        </div>
      </div>

      {/* Background Overlay */}
      {(activeMenu || isMenuOpen) && !isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 z-[40]" onClick={() => { setIsMenuOpen(false); setMobileSubMenu(null); setActiveMenu(null); }} />
      )}

      {/* Main Header */}
      <header className="relative z-[50] bg-white border-b border-gray-100 font-sans">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-10 h-[70px]">
          
          <Link to="/">
            <img src="/thumbnail.svg" alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-black text-[13px] uppercase tracking-widest absolute left-1/2 -translate-x-1/2 h-full">
            {/* All Items */}
            <Link to="/shop/all" className="h-full flex items-center border-b-2 border-transparent hover:border-black transition-all px-1">All</Link>
            
            {/* New Arrivals */}
            <Link to="/shop/new-arrivals" className="h-full flex items-center border-b-2 border-transparent hover:border-black transition-all px-1 relative group">
              New
              <span className="absolute top-5 -right-1 w-1 h-1 bg-red-500 rounded-full"></span>
            </Link>

            <div onMouseEnter={() => handleMouseEnter('tops')} onMouseLeave={handleMouseLeave} className={`h-full flex items-center cursor-pointer border-b-2 transition-all ${activeMenu === 'tops' ? 'border-black' : 'border-transparent'}`}>Tops</div>
            <div onMouseEnter={() => handleMouseEnter('bottoms')} onMouseLeave={handleMouseLeave} className={`h-full flex items-center cursor-pointer border-b-2 transition-all ${activeMenu === 'bottoms' ? 'border-black' : 'border-transparent'}`}>Bottoms</div>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <div onClick={() => setIsSearchOpen(true)} className="hidden md:flex items-center bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full py-2 px-4 cursor-pointer w-[180px] transition-colors">
              <Search className="h-4 w-4 mr-2" />
              <span className="text-gray-400 text-sm">Search</span>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 md:hidden hover:bg-gray-100 rounded-full">
                <Search className="h-6 w-6" />
              </button>

              <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full relative">
                <Heart className="h-6 w-6" />
                {wishlistItems?.length > 0 && <span className="absolute top-1 right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{wishlistItems.length}</span>}
              </Link>
              
              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag className="h-6 w-6" />
                {cartItems?.length > 0 && <span className="absolute top-1 right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartItems.length}</span>}
              </Link>

              <button onClick={() => setIsMenuOpen(true)} className="p-2 lg:hidden hover:bg-gray-100 rounded-full">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Desktop */}
        <div 
          onMouseEnter={() => handleMouseEnter(activeMenu)} 
          onMouseLeave={handleMouseLeave} 
          className={`absolute top-full left-0 w-full bg-white transition-all duration-300 overflow-hidden shadow-2xl hidden lg:block ${activeMenu ? 'max-h-[500px] border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
        >
          <div className="max-w-[1440px] mx-auto px-10 py-12 grid grid-cols-4 gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="font-black text-sm uppercase tracking-[0.2em] text-black border-b pb-3 mb-2">{activeMenu === 'tops' ? 'Tops' : 'Bottoms'}</h4>
              {activeMenu && menuItems[activeMenu].map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setActiveMenu(null)} className="text-gray-500 hover:text-black hover:translate-x-1 transition-all font-bold uppercase text-xs tracking-widest">{item.name}</Link>
              ))}
            </div>
            
            <div className="col-span-3 grid grid-cols-2 gap-6 h-[280px]">
               <div className="bg-gray-100 rounded-3xl p-8 flex flex-col justify-end group cursor-pointer overflow-hidden relative border border-transparent hover:border-black transition-all">
                  <h3 className="text-3xl font-black italic uppercase relative z-10 leading-none">Slava<br/>Essentials</h3>
                  <div className="absolute right-0 bottom-0 w-40 h-40 bg-gray-200 rounded-tl-full group-hover:scale-110 transition-transform duration-700" />
               </div>
               <div className="bg-black text-white rounded-3xl p-8 flex flex-col justify-end group cursor-pointer overflow-hidden relative">
                  <h3 className="text-3xl font-black italic uppercase relative z-10">New Drop</h3>
                  <Link to="/shop/new-arrivals" onClick={() => setActiveMenu(null)} className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mt-6 relative z-10 hover:scale-105 transition-transform">Shop Now</Link>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR --- */}
      <div className={`fixed inset-y-0 right-0 w-[85%] max-w-[350px] bg-white z-[100] transform transition-transform duration-300 ease-in-out lg:hidden shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full font-sans">
          <div className="flex justify-end p-5">
            <button onClick={() => { setIsMenuOpen(false); setMobileSubMenu(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-8 w-8 text-black" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {/* Main Mobile Menu */}
            <div className={`absolute inset-0 px-10 py-4 transition-all duration-400 flex flex-col gap-8 ${mobileSubMenu ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
              <Link to="/shop/all" className="text-4xl font-black uppercase italic tracking-tighter" onClick={() => setIsMenuOpen(false)}>
                All Items
              </Link>
              
              <Link to="/shop/new-arrivals" className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4" onClick={() => setIsMenuOpen(false)}>
                New Drops
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded italic tracking-normal not-italic font-black">HOT</span>
              </Link>

              <div className="h-[1px] bg-gray-100 w-full my-2" />

              <button onClick={() => setMobileSubMenu('tops')} className="text-3xl font-black uppercase italic tracking-tighter flex justify-between items-center group">
                Tops <ChevronRight className="h-8 w-8 text-gray-300" />
              </button>
              
              <button onClick={() => setMobileSubMenu('bottoms')} className="text-3xl font-black uppercase italic tracking-tighter flex justify-between items-center group">
                Bottoms <ChevronRight className="h-8 w-8 text-gray-300" />
              </button>
            </div>

            {/* Sub Mobile Menu */}
            <div className={`absolute inset-0 px-10 py-4 transition-all duration-400 bg-white flex flex-col gap-8 ${mobileSubMenu ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
              <button onClick={() => setMobileSubMenu(null)} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">
                <ChevronLeft className="h-4 w-4" /> Back to menu
              </button>
              
              <h2 className="text-5xl font-black uppercase italic tracking-tighter border-l-4 border-black pl-4 mb-4">{mobileSubMenu}</h2>
              
              <div className="flex flex-col gap-6">
                {mobileSubMenu && menuItems[mobileSubMenu].map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className="text-xl text-gray-500 font-bold uppercase tracking-widest hover:text-black transition-colors"
                    onClick={() => { setIsMenuOpen(false); setMobileSubMenu(null); }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="p-10 border-t border-gray-100 space-y-6">
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed text-center">
              Elevate your style with the latest Robino Drops.
            </p>
            <div className="flex flex-col gap-3">
               <button className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Join Robino</button>
               <button className="w-full border-2 border-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;