import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ChevronRight, ExternalLink, Clock, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// حل مشكلة أيقونات Leaflet الافتراضية
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const StoreLocator = () => {
  const slavaLocation = [30.6041, 32.2736]; 
  const googleMapsUrl = "https://maps.app.goo.gl/VjU9AAnJ2R7vY3eb6"; 

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const hour = now.getHours(); 
      setIsOpen(hour >= 10 && hour < 23);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const store = {
    name: "سلافا - Slava Clothing",
    address: "الإسماعيلية، 24 شارع النيل، عرايشية مصر",
    details: "بجوار معرض آل سمير عبدالرحمن وأمام كوتشي جروب",
    hours: "10:00 AM - 11:00 PM"
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] font-sans text-black">
      {/* Header - تأكد أن الـ z-index هنا عالي (مثلاً z-50) في الـ Component الخاص به */}
      <div className="p-4 md:px-10 border-b flex justify-between items-center bg-white shadow-sm z-10">
        <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Store Locator</h1>
        <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest border px-2 py-1">Ismailia Branch</span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* القائمة الجانبية */}
        <div className="w-full md:w-[400px] border-l overflow-y-auto flex flex-col bg-white order-2 md:order-1 shadow-2xl z-20">
          <div className="p-8 text-right">
            <h3 className="font-black text-2xl uppercase italic mb-2 tracking-tighter">
              {store.name}
            </h3>
            <p className="text-sm font-bold mb-1 text-gray-900">{store.address}</p>
            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
              {store.details}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-end gap-3 border-y py-4">
                 <div className="flex flex-col items-end">
                    <span className={`font-black italic text-lg leading-none ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {isOpen ? 'مفتوح الآن' : 'مغلق حالياً'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">{store.hours}</span>
                 </div>
                 <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
            </div>

            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-black text-white py-5 px-6 rounded-none font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all w-full text-xs"
            >
              Get Directions <Navigation size={16} />
            </a>
          </div>
        </div>

        {/* الخريطة */}
        <div className="flex-1 h-[300px] md:h-auto order-1 md:order-2 relative z-0">
          <MapContainer 
            center={slavaLocation} 
            zoom={18} 
            /* التعديل هنا: أضفنا zIndex: 0 لضمان بقاء الخريطة خلف الـ Mega Menu */
            style={{ height: '100%', width: '100%', zIndex: 0 }} 
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© Slava'
            />
            <Marker position={slavaLocation}>
              <Popup>
                <div className="p-1 text-right font-sans">
                  <h4 className="font-black text-sm mb-1 italic">SLAVA CLOTHING</h4>
                  <p className="text-[10px] font-bold text-gray-600">شارع النيل - الإسماعيلية</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;