import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns = () => {
  return (
    <div className=" bg-white text-black font-sans px-6 py-10 md:px-20 lg:px-40">
      {/* 1. العنوان وحقل البحث */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">GET HELP</h1>
      </div>

      {/* 2. محتوى السؤال الإرشادى */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 tracking-tight">What is SLAVA's returns policy?</h2>

        <div className="space-y-6 text-lg leading-relaxed text-gray-800">
          <h3 className="text-xl font-bold">SLAVA App and SLAVA.com orders</h3>
          
          <p>
            When you shop SLAVA online, either in the SLAVA App or on SLAVA.com, you can return or 
            exchange items that are <span className="font-bold">unworn and unwashed and still have 
            their product tags attached</span> within 30 days of an online order delivery 
            (<span className="underline cursor-pointer">some exceptions apply</span>). 
            That includes custom <span className="underline font-bold cursor-pointer">SLAVA By You</span> sneakers.
          </p>

          {/* أزرار الأكشن */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/shop/all" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all">
              Shop SLAVA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;