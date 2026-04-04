import React, { useState, useEffect } from 'react';
import { supabase } from "../../dataBase/supabaseClient";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

const CategorySection = () => {
  const [dbBanners, setDbBanners] = useState([]); 
  const [spotlightCards, setSpotlightCards] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const { data: banners } = await supabase.from('secondary_banners').select('*').order('id', { ascending: true });
        setDbBanners(banners || []);

        const { data: files, error: storageError } = await supabase.storage.from('spotlight').list('spotlight-images', { limit: 100 });
        if (storageError) throw storageError;

        if (files) {
          const formattedCards = files
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map((file, index) => {
              const { data: { publicUrl } } = supabase.storage.from('spotlight').getPublicUrl(`spotlight-images/${file.name}`);
              return {
                id: index,
                image_url: publicUrl,
                title: "Slava Collection",
                category: "Spotlight"
              };
            });
          setSpotlightCards(formattedCards);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) return (
    <div className="h-96 w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" size={40} />
    </div>
  );

  return (
    <section className="bg-white text-black font-sans">
      
           <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden bg-white">
              {dbBanners.map((slide) => (
               <div key={slide.id} className="group border-r border-gray-100 last:border-0 flex flex-col">
               
                  <div className="relative aspect-[4/5] md:aspect-auto md:h-[70vh] overflow-hidden">
                    <img 
                      src={slide.image_url} 
                      alt={slide.title} 
                      className="w-full h-full object-fill transition-opacity duration-500 group-hover:opacity-90" 
                    />
                 </div>
              
                  <div className="p-8 md:p-12 z-10 flex flex-col items-center text-center text-black">
                    <h3 className="text-3xl md:text-4xl font-black uppercase mb-6 italic tracking-tighter leading-snug">{slide.title}</h3>
               
                   <Link 
                      to="/shop/all" 
                      className="self-center bg-black text-white font-bold px-10 py-4 rounded-full text-xs md:text-sm hover:bg-gray-800 transition uppercase tracking-widest shadow-md"
                    >
                      Shop
                    </Link>
                  </div>
                </div>
              ))}
            </div>

      {/* --- الجزء السفلي: Spotlight --- */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[1.3rem] font-medium tracking-normal">Spotlight</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-medium text-black cursor-pointer hover:text-gray-400 transition-colors underline underline-offset-4">View All</span>
            
            <div className="hidden md:flex items-center gap-2">
              <button className="spot-prev bg-[#f5f5f5] hover:bg-[#e5e5e5] p-3 rounded-full transition-colors">
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <button className="spot-next bg-[#f5f5f5] hover:bg-[#e5e5e5] p-3 rounded-full transition-colors">
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Scrollbar]}
          spaceBetween={16}
          slidesPerView={1.2}
          navigation={{
            prevEl: '.spot-prev',
            nextEl: '.spot-next',
          }}
          scrollbar={{ draggable: true, el: '.spot-scrollbar' }}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 24 }
          }}
          className="spotlight-swiper !pb-12"
        >
          {spotlightCards.map((card) => (
            <SwiperSlide key={card.id}>
              <div className="group flex flex-col h-full cursor-pointer">
                <div className="aspect-square w-full overflow-hidden bg-[#f6f6f6] mb-4">
                  <img 
                    src={card.image_url} 
                    alt="Workwear" 
                    className="w-full h-full object-fill transition-opacity duration-300 group-hover:opacity-80"
                  />
                </div>
                {/* Text Content */}
                   <Link 
                      to="/shop/all" 
                      className="self-center bg-black text-white font-bold px-10 py-4 rounded-full text-xs md:text-sm hover:bg-gray-800 transition uppercase tracking-widest shadow-md"
                    >
                      Shop
                    </Link>
              </div>
            </SwiperSlide>
          ))}
          <div className="spot-scrollbar mt-8 h-1 bg-gray-100 rounded-full md:hidden" /> 
        </Swiper>
      </div>

      <style jsx global>{`
        .spot-scrollbar .swiper-scrollbar-drag {
          background: #000 !important;
          height: 2px !important;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;