import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../dataBase/supabaseClient';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const mainImage = product.image_urls?.[0] || '/placeholder.jpg'; 
  const hasDiscount = product.old_price && product.old_price > product.price;

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex-none w-[180px] md:w-[300px] group flex flex-col bg-white border-r border-gray-200 relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors snap-start"
    >
      {hasDiscount && (
        <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 z-10">
          Sale
        </div>
      )}

      <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-[#F5F5F5] flex items-center justify-center p-2">
        <img 
          src={mainImage} 
          alt={product.name} 
          className="w-full h-full object-cover mix-blend-darken group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-1 z-20">
        <h3 className="font-black text-[11px] md:text-sm uppercase tracking-tighter text-[#121212] mb-1 truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-auto">
          <span className={`font-black text-[11px] md:text-sm ${hasDiscount ? 'text-red-600' : 'text-[#121212]'}`}>
            {product.price} EGP
          </span>
          {hasDiscount && (
            <span className="text-[10px] md:text-xs font-bold text-gray-400 line-through">
              {product.old_price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const CategorySection = ({ title, products, targetPath }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 300; 
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 md:py-16 bg-white border-b border-gray-100 last:border-0">
      <div className="container mx-auto px-4 md:px-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-[#121212]">
              {title}
            </h2>
            <div className="hidden md:block h-[2px] w-24 bg-[#121212]"></div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(targetPath)}
              className="group flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#121212] hover:opacity-70 transition-all border-b-2 border-[#121212] pb-1"
            >
              Discover All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="hidden md:flex gap-2 ml-4">
              <button onClick={() => scroll('left')} className="p-2 border border-gray-200 hover:bg-[#121212] hover:text-white transition-all"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll('right')} className="p-2 border border-gray-200 hover:bg-[#121212] hover:text-white transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory border-t border-l border-gray-200 custom-scrollbar pb-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #121212; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #121212 #f1f1f1; }
      `}</style>
    </section>
  );
};

const ShopCollection = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['allAvailableProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-gray-200" size={40} />
      <span className="font-black italic uppercase tracking-widest text-[10px]">Loading Collection</span>
    </div>
  );

  const filterByCat = (keyword) => {
    return products.filter(p => {
      const cat = p.category?.toLowerCase().trim() || "";
      return cat === keyword.toLowerCase() || cat === `${keyword.toLowerCase()}s`;
    });
  };

  return (
    <div className="bg-white min-h-screen font-sans text-[#121212]">
      <div className="pb-20">
        <CategorySection 
            title="T-Shirts" 
            products={filterByCat('t-shirt')} 
            targetPath="/shop/shirts" 
        />
        <CategorySection 
            title="Hoodies" 
            products={filterByCat('hoodie')} 
            targetPath="/shop/hoodies" 
        />
        <CategorySection 
            title="Sweatpants" 
            products={filterByCat('sweatpants')} 
            targetPath="/shop/sweatpants" 
        />
        <CategorySection 
            title="Shorts" 
            products={filterByCat('short')} 
            targetPath="/shop/shorts" 
        />
      </div>
    </div>
  );
};

export default ShopCollection;