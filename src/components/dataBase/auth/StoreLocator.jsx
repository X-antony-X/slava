import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search, MapPin, ChevronRight, Filter, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// حل مشكلة أيقونات Leaflet الافتراضية في React
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // الإحداثيات الجديدة والدقيقة بناءً على صورة الخريطة (منطقة عرايشية مصر)
  const slavaLocation = [30.6015, 32.2740]; 
  const googleMapsUrl = "https://g.page/slava-clothing-ismailia?share";

  const stores = [
    {
      id: 1,
      name: "Slava Clothing - Ismailia",
      address: "الأسماعيليه 24 شارع النيل عرايشيه مصر",
      details: "خلف جراج فورد من شارع شبين الكوم و خلف مكتبه مجدى من شارع رضا",
      status: "Open Now",
      hours: "10:00 AM - 11:00 PM",
      coords: slavaLocation
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-black">
      {/* Header */}
      <div className="p-4 md:px-10 border-b flex justify-between items-center bg-white">
        <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Find a Store</h1>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* القائمة الجانبية (Sidebar) */}
        <div className="w-full md:w-[400px] border-r overflow-y-auto flex flex-col bg-white order-2 md:order-1">
          {/* عرض الفرع في القائمة */}
          <div className="flex-1">
            {stores.map((store) => (
              <div key={store.id} className="p-6 border-b hover:bg-gray-50 cursor-pointer group transition-all text-right">
                <div className="flex justify-between items-start flex-row-reverse">
                  <div className="flex-1">
                    <h3 className="font-black text-lg uppercase italic mb-1 group-hover:underline">{store.name}</h3>
                    <p className="text-sm font-bold mb-1">{store.address}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {store.details}
                    </p>
                    <div className="flex items-center gap-2 text-sm flex-row-reverse">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-bold text-green-700 underline italic">{store.status}</span>
                      <span className="text-gray-400 font-sans">• {store.hours}</span>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-300 group-hover:text-black hidden md:block rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الخريطة (Map) */}
        <div className="flex-1 h-[300px] md:h-auto order-1 md:order-2 relative z-0">
          <MapContainer 
            center={slavaLocation} 
            zoom={16} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={slavaLocation}>
              <Popup maxWidth={280}>
                <div className="p-1 text-right">
                  <h4 className="font-black uppercase italic text-sm mb-1">Slava Clothing</h4>
                  <p className="text-xs font-bold mb-1">{stores[0].address}</p>
                  <p className="text-[10px] text-gray-600 mb-3 leading-tight">{stores[0].details}</p>
                  <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-black text-white py-2 px-3 rounded-sm text-[10px] font-black uppercase tracking-widest no-underline"
                  >
                    View on Google Maps <ExternalLink size={10} />
                  </a>
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