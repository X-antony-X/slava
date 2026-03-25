import React from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  const whatsappNumber = "201012345678"; 
  const message = "Hello SLAVA, I have an inquiry about...";

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-center px-8 md:px-20 py-20">
      <div className="max-w-4xl space-y-16">
        
        {/* العنوان الرئيسي */}
        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none">
          CONTACT
        </h1>

        <div className="space-y-12">
          {/* عنوان المدينة */}
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#CCFF00]">
            ISMAILIA
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* تفاصيل العنوان بالإنجليزية */}
            <div className="space-y-2 text-lg md:text-xl font-medium text-gray-300 uppercase tracking-widest border-l-2 border-gray-800 pl-6">
              <p className="text-white font-bold">SLAVA HQ</p>
              <p>24 El Nile St.</p>
              <p>Araishiya Misr</p>
              <p>Ismailia, Egypt</p>
            </div>

            {/* تفاصيل العنوان بالعربي - متظبط عشان ميبوظش الـ Layout */}
            <div className="space-y-2 text-right md:text-left">
               <p className="text-gray-500 text-sm font-bold uppercase mb-2 tracking-widest">Store Location:</p>
               <div dir="rtl" className="text-xl md:text-2xl font-bold leading-relaxed text-gray-200">
                  <p>الإسماعيلية، ٢٤ شارع النيل، عرايشية مصر</p>
                  <p className="text-lg text-gray-400 font-medium mt-2">
                    (خلف جراج فورد من شارع شبين الكوم، وخلف مكتبة مجدي من شارع رضا)
                  </p>
               </div>
            </div>
          </div>

          {/* معلومات التواصل */}
          <div className="space-y-8 pt-8 border-t border-gray-900">
            {/* زر الواتساب */}
            <div className="group w-fit">
              <p className="text-gray-500 text-sm font-bold uppercase mb-2 tracking-widest">WhatsApp Us (Click to Chat):</p>
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-2xl md:text-4xl font-black transition-all duration-300 group-hover:text-[#CCFF00] group-hover:translate-x-2"
              >
                <span className="border-b-4 border-transparent group-hover:border-[#CCFF00] pb-1">
                  +20 10 1234 5678
                </span>
                <MessageCircle className="text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </a>
            </div>

            {/* البريد الإلكتروني */}
            <div className="group w-fit">
              <p className="text-gray-500 text-sm font-bold uppercase mb-2 tracking-widest">Email:</p>
              <a 
                href="mailto:info@slava.com" 
                className="text-xl md:text-2xl font-bold underline underline-offset-8 decoration-gray-700 hover:decoration-[#CCFF00] transition-colors"
              >
                info@slava.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 opacity-5 pointer-events-none">
        <h2 className="text-[20vw] font-black uppercase leading-none select-none">SLAVA</h2>
      </div>
    </div>
  );
};

export default ContactPage;