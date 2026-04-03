import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../dataBase/supabaseClient';
import { ShoppingBag, Heart, ShieldCheck, Truck, ChevronRight, ChevronLeft, Minus, Plus, MessageCircle, X } from 'lucide-react';

// استيراد الـ Lightbox ومقاطع الـ CSS الخاصة به
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // State للتحكم في فتح وغلق الـ Lightbox
  const [openLightbox, setOpenLightbox] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setProduct(data);
        if (data.image_urls?.length > 0) {
          setMainImage(data.image_urls[0]);
          setCurrentIndex(0);
        }
        // اختيار أول مقاس ولون تلقائياً لو متاحين
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // دالة لإرسال استفسار عبر الواتساب
  const sendWhatsAppInquiry = () => {
    const phoneNumber = "201279354981"; // رقم الواتساب بتاعك بالصيغة الدولية وبدون أصفار
    const message = encodeURIComponent(`أهلاً، حابب أستفسر عن المنتج ده: "${product.name}"\nاللون: ${selectedColor}\nالمقاس: ${selectedSize}\nشكراً.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // منطق التنقل بين الصور
  const nextImage = () => {
    if (!product?.image_urls) return;
    const nextIdx = (currentIndex + 1) % product.image_urls.length;
    setCurrentIndex(nextIdx);
    setMainImage(product.image_urls[nextIdx]);
  };

  const prevImage = () => {
    if (!product?.image_urls) return;
    const prevIdx = (currentIndex - 1 + product.image_urls.length) % product.image_urls.length;
    setCurrentIndex(prevIdx);
    setMainImage(product.image_urls[prevIdx]);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white font-light tracking-widest text-xs">LOADING...</div>;
  if (!product) return <div className="h-screen bg-black flex items-center justify-center text-white text-xs tracking-widest">PRODUCT NOT FOUND</div>;

  // تجهيز الصور لصيغة الـ Lightbox
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
        
        {/* الجزء الأيسر: الصور مع الأسهم للموبايل */}
        <div className="w-full lg:w-[60%] flex flex-col md:flex-row gap-4">
          
        {/* Thumbnails - Desktop Only */}
        <div className="hidden md:flex flex-col gap-3 w-20 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {product.image_urls?.map((img, index) => (
            <button 
              key={index}
              onClick={() => {
                setMainImage(img);
                setCurrentIndex(index);
              }}
              className={`aspect-[3/4] w-full flex-shrink-0 overflow-hidden border transition-all duration-300 ${
                currentIndex === index ? 'border-black' : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>

          {/* Main Image Display with Arrows */}
          <div className="flex-1 relative overflow-hidden bg-zinc-50 group">
            {/* الصورة الرئيسية: تم إضافة cursor-zoom-in ودالة الفتح عند النقر */}
            <div 
              className="md:aspect-[3/4] w-full h-full cursor-zoom-in"
              onClick={() => setOpenLightbox(true)}
            >
              <img src={mainImage} className="w-full h-full object-cover transition-opacity duration-500" alt={product.name} />
            </div>

            {/* Navigation Arrows - Visible on Mobile and on Hover in Desktop */}
            {product.image_urls?.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm border border-zinc-100 flex items-center justify-center hover:bg-white transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100 rounded-full shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm border border-zinc-100 flex items-center justify-center hover:bg-white transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100 rounded-full shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            
            {/* Image Counter Badge (e.g., 1/4) */}
            <div className="absolute bottom-6 right-6 bg-black text-white text-[10px] font-bold px-3 py-1 tracking-widest rounded-sm">
              {currentIndex + 1} / {product.image_urls?.length}
            </div>
          </div>
        </div>

        {/* الجزء الأيمن: المعلومات */}
        <div className="w-full lg:w-[40%] px-5 md:px-0 flex flex-col gap-8">
          <section className="space-y-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-center gap-4 mt-6">
                <span className="text-2xl font-medium tracking-tight">LE {product.price?.toLocaleString()}.00</span>
                {product.old_price && (
                  <span className="text-zinc-400 line-through text-lg italic opacity-70 font-light">LE {product.old_price.toLocaleString()}</span>
                )}
              </div>
              
              {/* 🟢 إضافة الكمية المتاحة (In Stock) */}
              <p className="text-zinc-500 text-sm mt-3 font-medium">
                Availability: {product.quantity > 0 ? (
                  <span className="text-green-600 font-bold">{product.quantity} In Stock</span>
                ) : (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                )}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">
              🔥 Limited Edition | High Demand
            </div>
          </section>

          {/* Configuration Area */}
          <div className="space-y-10 py-8 border-y border-zinc-100">
            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold tracking-[0.2em] uppercase">Size: <span className="font-normal text-zinc-500">{selectedSize}</span></label>
                  <button className="text-[10px] underline uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[55px] h-[55px] text-[11px] font-bold border transition-all duration-300 rounded-md ${selectedSize === size ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black text-zinc-600'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="space-y-4">
                <label className="text-[11px] font-bold tracking-[0.2em] uppercase">Color: <span className="font-normal text-zinc-500">{selectedColor}</span></label>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-black scale-110' : 'border-transparent ring-1 ring-zinc-200'}`}
                      style={{ backgroundColor: color.startsWith('#') ? color : color.toLowerCase() }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold bg-black text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none rounded-sm">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Final Actions */}
          <div className="space-y-4">
          
            {/* 🟢 إضافة زرار الاستفسار عبر الواتساب */}
            <button 
              onClick={sendWhatsAppInquiry}
              className="w-full py-5 text-[11px] font-bold tracking-[0.3em] uppercase border border-green-200 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <MessageCircle size={16} /> Inquiry on WhatsApp
            </button>
          </div>

          {/* Brand Philosophy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 mt-4 border border-zinc-200 rounded-md overflow-hidden">
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white gap-2">
              <ShieldCheck size={24} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-tighter">Premium Craftsmanship</p>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest">Ismailia - Egypt</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white gap-2">
              <Truck size={24} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-tighter">Flat Rate Shipping</p>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest">All over Egypt</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 تنفيذ الـ Lightbox (الصورة ملء الشاشة) */}
      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        index={currentIndex}
        slides={lightboxSlides}
        // إضافة بلاجن الزوم عشان يقدر المستخدم يكبر الصورة
        plugins={[Zoom]}
        // تخصيص الأيقونات لتماشي تصميم Slava
        render={{
          iconClose: () => <X size={24} />,
          iconPrev: () => <ChevronLeft size={30} />,
          iconNext: () => <ChevronRight size={30} />,
        }}
        styles={{
            container: { backgroundColor: "rgba(0,0,0,0.95)" }, // خلفية سوداء جداً
            root: { "--yarl__color_backdrop": "rgba(0, 0, 0, 0.95)" },
        }}
      />
    </div>
  );
};

export default ProductDetails;