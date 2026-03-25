import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PreFooter = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const footerData = [
    {
      title: "Tops",
      links: [
        { name: "All Tops", path: "/shop/tops" },
        { name: "Hoodies", path: "/shop/hoodie" },
        { name: "Jackets", path: "/shop/jacket" },
        { name: "T-Shirts", path: "/shop/t-shirt" },
        { name: "Pullovers", path: "/shop/pullover" }
      ]
    },
    {
      title: "Bottoms",
      links: [
        { name: "All Bottoms", path: "/shop/bottoms" },
        { name: "Pants", path: "/shop/pants" },
        { name: "Shorts", path: "/shop/shorts" },
        { name: "Sweatpants", path: "/shop/sweatpants" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Order Status", path: "#" },
        { name: "Returns", path: "/returns" },
        { name: "Contact Us", path: "/contact" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Slava", path: "/slava" },
        // { name: "News", path: "#" },
        // { name: "Careers", path: "#" },
        // { name: "Sustainability", path: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-white text-black py-16 px-6 md:px-12 font-sans border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto">
        
        {/* --- 1. اللوجو واللينكات العلوية --- */}
        <div className="flex flex-col items-center text-center gap-8 mb-16">
          <div className="flex items-center justify-center">
            <img 
              src="/thumbnail.svg" 
              alt="Slava Logo" 
              className="h-12 md:h-16 w-auto object-contain"
            />
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm font-bold uppercase tracking-wider text-gray-900">
            <Link to="/location" className="hover:opacity-60 transition-opacity">Find a Store</Link>
            <Link to="/returns" className="hover:opacity-60 transition-opacity">Help</Link>
            <Link to="/account" className="hover:opacity-60 transition-opacity">Join Us</Link>
            <Link to="/account" className="hover:opacity-60 transition-opacity">Sign In</Link>
          </div>
        </div>

        {/* --- 2. القوائم السفلية (Responsive Grid) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8 border-t md:border-none border-gray-100">
          {footerData.map((section, idx) => (
            <div key={idx} className="border-b md:border-none border-gray-100 flex flex-col items-center md:items-start">
              
              <button 
                onClick={() => toggleSection(section.title)}
                className="w-full flex justify-between md:block items-center py-5 md:py-0 transition-colors md:cursor-default"
              >
                <h3 className="text-base md:text-lg font-bold text-black md:mb-8 uppercase tracking-tight">
                  {section.title}
                </h3>
                <span className="md:hidden">
                  {openSection === section.title ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>

              <ul className={`
                overflow-hidden transition-all duration-300 md:max-h-none w-full text-center md:text-center sm:text-left xs:text-left
                ${openSection === section.title ? 'max-h-96 pb-8' : 'max-h-0 md:max-h-fit'}
              `}>
                {section.links.map((link, i) => (
                  <li key={i} className="mb-4 last:mb-0">
                    <a href={link.path} className="text-gray-500 hover:text-black text-[14px] font-medium transition-colors">
                      {/* التعديل هنا: استخدام link.name بدل link */}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default PreFooter;