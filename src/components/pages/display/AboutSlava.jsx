import React from 'react';

const AboutSlava = () => {
  return (
    <div className="bg-black text-white font-sans overflow-hidden">
      {/* 1. القسم الأسود العلوي */}
      <section className="py-20 px-6 md:py-32 md:px-20 lg:px-40 flex flex-col gap-8">
        <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black uppercase tracking-tighter leading-none">
          THIS IS SLAVA
        </h1>

        <p className="max-w-3xl text-lg md:text-xl leading-relaxed font-medium">
            FROM THE STREETS OF ISMAILIA.

            Where authentic Egyptian identity meets the edge of modern streetwear. Crafted for those who don’t just follow trends, but set them. SLAVA is more than a brand; it’s a tribute to Egyptian craftsmanship and the hustle of our streets. Proudly made in Egypt, worn by 9,000+ trendsetters.
        </p>
      </section>

      {/* 2. الشريط الأصفر المتحرك */}
      <div className="bg-[#CCFF00] py-6 md:py-10 border-y-2 border-black overflow-hidden flex">
        {/* نستخدم الكلاس اللي عرفناه في ملف الـ CSS */}
        <div className="animate-marquee-infinite">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-black text-4xl md:text-7xl font-black uppercase mx-8 whitespace-nowrap">
              Since 20**.
            </span>
          ))}
        </div>
        
        {/* التكرار ضروري عشان الشريط ميفصلش */}
        <div className="animate-marquee-infinite" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-black text-4xl md:text-7xl font-black uppercase mx-8 whitespace-nowrap">
              Since 20**.
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSlava;