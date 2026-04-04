import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // استيراد useQuery
import { supabase } from '../../dataBase/supabaseClient';
import { ChevronRight, ChevronLeft, MessageCircle, X, ShieldCheck, Truck, Loader2 } from 'lucide-react';

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const ProductDetails = () => {
  const { id } = useParams();
  
  // State للحاجات المتغيرة (UI state)
  const [mainImage, setMainImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [openLightbox, setOpenLightbox] = useState(false);

  // --- 1. جلب بيانات المنتج بـ React Query ---
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id, // ميعملش fetch غير لو الـ id موجود
    staleTime: 1000 * 60 * 5, // البيانات تفضل "فريش" لـ 5 دقائق
  });

  // --- 2. مفعول جانبي لضبط الخيارات الافتراضية عند وصول البيانات ---
  useEffect(() => {
    if (product) {
      if (product.image_urls?.length > 0) {
        setMainImage(product.image_urls[0]);
        setCurrentIndex(0);
      }
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  // دالة الواتساب
  const sendWhatsAppInquiry = () => {
    const phoneNumber = "201279354981";
    const message = encodeURIComponent(`أهلاً، حابب أستفسر عن المنتج ده: "${product?.name}"\nاللون: ${selectedColor}\nالمقاس: ${selectedSize}\nالرابط: ${window.location.href}`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // التنقل بين الصور
  const nextImage = () => {
    const nextIdx = (currentIndex + 1) % product.image_urls.length;
    setCurrentIndex(nextIdx);
    setMainImage(product.image_urls[nextIdx]);
  };

  const prevImage = () => {
    const prevIdx = (currentIndex - 1 + product.image_urls.length) % product.image_urls.length;
    setCurrentIndex(prevIdx);
    setMainImage(product.image_urls[prevIdx]);
  };

  // حالة التحميل (ستايل Slava Minimalist)
  if (isLoading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-zinc-200" size={40} />
      <span className="text-[10px] font-black italic uppercase tracking-[0.3em]">Loading Slava Detail</span>
    </div>
  );

  if (isError || !product) return (
    <div className="h-screen bg-white flex items-center justify-center text-[10px] font-black tracking-widest uppercase">
      Product Not Found
    </div>
  );

  const lightboxSlides = product.image_urls?.map(url => ({ src: url }));

  return (
    <div className="min-h-screen bg-white text-black pt-16 md:pt-24 pb-12 font-sans">
      {/* Breadcrumbs */}
      <nav className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-6 px-4 md:px-10 font-medium">
        <span>Home</span> <ChevronRight size={10} /> 
        <span>Collections</span> <ChevronRight size={10} /> 
        <span className="text-black font-bold">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-0 md:px-10">
        
        {/* Photos Section */}
        <div className="w-full lg:w-[60%] flex flex-col md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3 w-20 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {product.image_urls?.map((img, index) => (
              <button 
                key={index}
                onClick={() => { setMainImage(img); setCurrentIndex(index); }}
                className={`aspect-[3/4] w-full overflow-hidden border transition-all duration-300 ${
                  currentIndex === index ? 'border-black' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          {/* Main Photo */}
          <div className="flex-1 relative overflow-hidden bg-zinc-50 group">
            <div className="md:aspect-[3/4] w-full h-full cursor-zoom-in" onClick={() => setOpenLightbox(true)}>
              <img src={mainImage} className="w-full h-full object-cover transition-opacity duration-500" alt={product.name} />
            </div>

            {product.image_urls?.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100 rounded-full shadow-sm">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100 rounded-full shadow-sm">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            
            <div className="absolute bottom-6 right-6 bg-black text-white text-[10px] font-bold px-3 py-1 tracking-widest rounded-sm">
              {currentIndex + 1} / {product.image_urls?.length}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full lg:w-[40%] px-5 md:px-0 flex flex-col gap-8">
          <section className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{product.name}</h1>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-2xl font-medium">LE {product.price?.toLocaleString()}.00</span>
              {product.old_price && (
                <span className="text-zinc-400 line-through text-lg italic opacity-70">LE {product.old_price.toLocaleString()}</span>
              )}
            </div>
            <p className="text-zinc-500 text-sm mt-3 font-medium">
              Availability: {product.quantity > 0 ? (
                <span className="text-green-600 font-bold">{product.quantity} In Stock</span>
              ) : (
                <span className="text-red-600 font-bold">Out of Stock</span>
              )}
            </p>
          </section>

          {/* Size & Color Config */}
          <div className="space-y-10 py-8 border-y border-zinc-100">
            {product.sizes?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase">
                  <label>Size: <span className="text-zinc-400 font-normal">{selectedSize}</span></label>
                  <button className="underline text-zinc-400">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`min-w-[55px] h-[55px] text-[11px] font-bold border transition-all duration-300 rounded-md ${selectedSize === size ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black text-zinc-600'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase">Color: <span className="text-zinc-400 font-normal">{selectedColor}</span></label>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`group relative w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-black scale-110' : 'border-transparent ring-1 ring-zinc-200'}`}
                      style={{ backgroundColor: color.startsWith('#') ? color : color.toLowerCase() }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold bg-black text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap rounded-sm">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={sendWhatsAppInquiry} className="w-full py-5 text-[11px] font-bold tracking-[0.3em] uppercase border border-green-200 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
            <MessageCircle size={16} /> Inquiry on WhatsApp
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-px bg-zinc-200 mt-4 border border-zinc-200 rounded-md overflow-hidden">
            <div className="flex flex-col items-center justify-center p-6 bg-white gap-2">
              <ShieldCheck size={24} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase">Premium Quality</p>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-white gap-2">
              <Truck size={24} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase">Fast Shipping</p>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        index={currentIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
        render={{
          iconClose: () => <X size={24} />,
          iconPrev: () => <ChevronLeft size={30} />,
          iconNext: () => <ChevronRight size={30} />,
        }}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.98)" } }}
      />
    </div>
  );
};

export default ProductDetails;