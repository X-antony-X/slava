import React from 'react';
import { Facebook, Instagram, AtSign, Code2, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const myNumber = "201279354981"; // رقمك هنا بصيغة الواتساب الدولية

  return (
    <footer className="relative bg-black text-white pt-20 pb-10 overflow-hidden border-t border-gray-900">
      {/* كلمة SLAVA ضخمة في الخلفية */}
      <div className="absolute -bottom-10 -left-10 opacity-[0.03] select-none pointer-events-none">
        <h2 className="text-[25vw] font-black leading-none uppercase tracking-tighter">
          SLAVA
        </h2>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          
          <div className="space-y-6">
            <h3 className="text-4xl font-black italic tracking-tighter uppercase">
              SLAVA<span className="text-[#CCFF00]">.</span>
            </h3>
            <p className="max-w-xs text-gray-500 font-medium leading-relaxed">
              Authentic Egyptian streetwear crafted for the trendsetters. 
              Proudly born in Ismailia.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">
              Follow the Movement
            </span>
            <div className="flex gap-4">
              <SocialLink href="https://www.facebook.com/slavaclothingstore?mibextid=rS40aB7S9Ucbxw6v" icon={<Facebook size={24} />} label="Facebook" />
              <SocialLink href="https://www.threads.com/@slavaclothing" icon={<AtSign size={24} />} label="Threads" />
              <SocialLink href="https://www.instagram.com/slavaclothing?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" icon={<Instagram size={24} />} label="Instagram" />
            </div>
          </div>
        </div>

        {/* الخط الفاصل السفلي والتوقيع */}
        <div className="mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600">
            <p>© {currentYear} SLAVA EGYPT. ALL RIGHTS RESERVED.</p>
          </div>

          {/* Designed by Antony مع رقم التليفون */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 group cursor-default">
              <Code2 size={14} className="text-gray-500 group-hover:text-[#CCFF00] transition-colors" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">
                Designed by <span className="text-white group-hover:text-[#CCFF00] transition-colors">Antony</span>
              </span>
            </div>

            <a 
              href={`https://wa.me/${myNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800 hover:border-[#CCFF00] hover:bg-[#CCFF00]/5 transition-all group"
            >
              <Phone size={12} className="text-[#CCFF00] group-hover:animate-bounce" />
              <span className="text-[10px] md:text-xs font-black tracking-tighter text-gray-300 group-hover:text-white">
                LET'S TALK: +20 12 79354981
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon, label }) => (
  <a 
    href={href} 
    aria-label={label}
    className="w-12 h-12 flex items-center justify-center border border-gray-800 rounded-full hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-all duration-300 group"
  >
    <div className="group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </a>
);

export default Footer;