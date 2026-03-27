import React, { useState, useEffect } from 'react';
import { supabase } from "../../dataBase/supabaseClient";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

const OffersSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    // هنجيب المنتجات اللي الـ old_price بتاعها مش فاضي (يعني عليها عرض)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .not('old_price', 'is', null) 
      .order('created_at', { ascending: false });

    if (!error) {
      setOffers(data);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-gray-300" size={40} />
    </div>
  );

  // لو مفيش عروض حالياً، القسم كله مش هيظهر عشان ميبقاش شكله وحش
  if (offers.length === 0) return null;

  return (
    <section className="bg-white text-black py-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[1.3rem] font-medium tracking-normal uppercase font-black italic">
            slava <span className="text-red-600 italic">Drops / Exclusive Offers</span>
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-medium text-black cursor-pointer hover:text-gray-400 transition-colors underline underline-offset-4 uppercase">View All</span>
            
            <div className="hidden md:flex items-center gap-2">
              <button className="nike-prev bg-[#f5f5f5] hover:bg-[#e5e5e5] p-3 rounded-full transition-colors">
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <button className="nike-next bg-[#f5f5f5] hover:bg-[#e5e5e5] p-3 rounded-full transition-colors">
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Section */}
        <Swiper
          modules={[Navigation, Scrollbar]}
          spaceBetween={16}
          slidesPerView={1.2}
          navigation={{
            prevEl: '.nike-prev',
            nextEl: '.nike-next',
          }}
          scrollbar={{ 
            draggable: true,
            el: '.custom-scrollbar'
          }}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 24 } // وسعنا العرض شوية عشان اللابتوب
          }}
          className="nike-style-swiper !pb-10"
        >
          {offers.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="group flex flex-col h-full cursor-pointer">
                
                {/* Image Container */}
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#f6f6f6] mb-4 rounded-xl relative">
                  <img 
                    src={product.image_urls[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Badge للخصم */}
                  <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-black px-2 py-1 uppercase italic tracking-tighter">
                    Save {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-grow space-y-0.5 px-1">
                  <h3 className="text-[15px] font-black uppercase italic tracking-tight">{product.name}</h3>
                  <p className="text-[12px] text-gray-400 uppercase font-bold">{product.category}</p>
                  
                  {/* Prices */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[16px] font-black text-red-600 italic">{product.price} EGP</span>
                    <span className="text-[13px] font-medium text-gray-300 line-through italic">{product.old_price} EGP</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          
          <div className="custom-scrollbar mt-8 h-1 bg-gray-100 rounded-full md:hidden" />
        </Swiper>
      </div>

      <style jsx global>{`
        .custom-scrollbar .swiper-scrollbar-drag {
          background: #000 !important;
          height: 2px !important;
        }
      `}</style>
    </section>
  );
};

export default OffersSection;