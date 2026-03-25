import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

const nikeOffers = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop',
    name: 'SLAVA SX"',
    category: "Men's Shoes",
    originalPrice: '¥25,520',
    discountPrice: '¥18,900'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
    name: 'SLAVA SX"',
    category: "Men's Shoes",
    originalPrice: '¥16,500',
    discountPrice: '¥12,400'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
    name: 'SLAVA SX"',
    category: "Women's Shoes",
    originalPrice: '¥19,030',
    discountPrice: '¥14,200'
  }
];

const OffersSection = () => {
  return (
    <section className="bg-white text-black py-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[1.3rem] font-medium tracking-normal">Limited Time Offers</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-medium text-black cursor-pointer hover:text-gray-400 transition-colors underline underline-offset-4">View All</span>
            
            {/* Arrows: Hidden on Mobile (md:flex) */}
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
          slidesPerView={1.2} // بيخلي جزء من الكارت التاني باين في الموبايل عشان العميل يعرف إنه بيسحب
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
            1024: { slidesPerView: 3, spaceBetween: 24 }
          }}
          className="nike-style-swiper !pb-10"
        >
          {nikeOffers.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="group flex flex-col h-full cursor-pointer">
                
                {/* Image: No Zoom on Hover */}
                <div className="aspect-square w-full overflow-hidden bg-[#f6f6f6] mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-grow space-y-0.5">
                  <h3 className="text-[16px] font-medium">{product.name}</h3>
                  
                  {/* Prices */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[16px] font-medium text-red-600">{product.discountPrice}</span>
                    <span className="text-[14px] font-normal text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom Scrollbar Container (Visible on Mobile) */}
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