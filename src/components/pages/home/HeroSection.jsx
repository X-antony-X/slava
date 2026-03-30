import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../dataBase/supabaseClient'; // تأكد من مسار الملف عندك
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // 1. ضفنا Ref لفيديو الخلفية عشان نتحكم فيه هو كمان
  const mainVideoRef = useRef(null);
  const bgVideoRef = useRef(null);

  const IMAGE_DURATION = 5000;

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setSlides(data);
        }
      } catch (error) {
        console.error("Error loading hero slides:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  // إدارة الـ Progress للصور
  useEffect(() => {
    if (!isPlaying || !currentSlide || currentSlide.type !== 'image') return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = (elapsed / IMAGE_DURATION) * 100;
      if (percent >= 100) {
        handleNext();
      } else {
        setProgress(percent);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, currentSlide]);

  // إدارة الـ Progress وتشغيل الفيديو
  useEffect(() => {
    if (!currentSlide || currentSlide.type !== 'video') return;
    
    const mainVid = mainVideoRef.current;
    const bgVid = bgVideoRef.current;
    
    if (!mainVid) return;

    const updateProgress = () => {
      if (mainVid.duration) {
        setProgress((mainVid.currentTime / mainVid.duration) * 100);
      }
    };
    
    const handleEnded = () => handleNext();

    // 2. دالة عشان تـ Handle تشغيل الفيديو بشكل آمن مع المتصفحات
    const playVideos = async () => {
      try {
        if (isPlaying) {
          if (bgVid) await bgVid.play();
          await mainVid.play();
        } else {
          if (bgVid) bgVid.pause();
          mainVid.pause();
        }
      } catch (err) {
        console.warn("Autoplay was blocked or video isn't ready:", err);
      }
    };

    playVideos();

    mainVid.addEventListener('timeupdate', updateProgress);
    mainVid.addEventListener('ended', handleEnded);
    
    return () => {
      mainVid.removeEventListener('timeupdate', updateProgress);
      mainVid.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isPlaying, currentSlide]);

  if (loading) return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <Loader2 className="text-white animate-spin" size={40} />
    </div>
  );

  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white font-medium uppercase">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-black"> {/* ضفنا لون أسود هنا عشان النقلة تكون سلسة */}
        {currentSlide.type === 'video' ? (
          <div className="relative h-full w-full flex items-center justify-center">
            <video
              ref={bgVideoRef} // ربطنا الفيديو ده بالـ Ref
              key={`bg-${currentSlide.url}`}
              muted playsInline loop autoPlay
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[100px] transition-opacity duration-300"
            >
              <source src={currentSlide.url} type="video/mp4" />
            </video>

            <video
              ref={mainVideoRef} // عدلنا الاسم هنا لـ mainVideoRef
              key={`main-${currentSlide.url}`}
              muted playsInline autoPlay
              className="absolute inset-0 z-10 w-full h-full object-cover transition-opacity duration-300"
            >
              <source src={currentSlide.url} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div className="relative h-full w-full flex items-center justify-center">
            <img
              src={currentSlide.url}
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[100px] animate-pulse"
              alt=""
            />
            <img
              src={currentSlide.url}
              className="relative z-10 h-full w-auto max-w-full object-contain"
              alt={currentSlide.title}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
      </div>

      {/* Text Content */}
      <div className="relative z-30 flex flex-col items-center justify-end h-full text-center px-4 pb-32 md:pb-28 pointer-events-none">
        <div className="space-y-2">
          <p className="text-[9px] md:text-[10px] tracking-[0.4em] text-zinc-400">{currentSlide.desc}</p>
          <h1 className="text-2xl md:text-5xl font-bold tracking-widest italic">{currentSlide.title}</h1>
          <div className="pt-6 pointer-events-auto">
            <Link to="/shop/all" className="bg-white text-black px-6 md:px-8 py-2.5 md:py-3 text-[9px] md:text-[10px] font-bold tracking-[0.2em] hover:bg-zinc-200 transition-all">
              DISCOVER NOW
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex items-center gap-2 md:gap-3">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-800/90 rounded-full hover:bg-zinc-700 transition-all"
        >
          <svg className="absolute w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
            <circle 
              cx="50%" cy="50%" r="45%" 
              stroke="white" strokeWidth="2" fill="none"
              strokeDasharray="100"
              strokeDashoffset={100 - (progress || 0)}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              pathLength="100"
            />
          </svg>
          {isPlaying ? <Pause size={14} className="md:w-[18px]" fill="white" /> : <Play size={14} className="md:w-[18px]" fill="white" />}
        </button>

        <div className="flex gap-1.5 md:gap-2">
          <button onClick={handlePrev} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-800/90 rounded-full hover:bg-zinc-700 transition-all">
            <ChevronLeft size={18} className="md:w-[20px]" />
          </button>
          <button onClick={handleNext} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-800/90 rounded-full hover:bg-zinc-700 transition-all">
            <ChevronRight size={18} className="md:w-[20px]" />
          </button>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-12 left-6 md:left-10 flex gap-2 z-40">
        {slides.map((_, i) => (
          <div 
            key={i}
            className={`h-[1px] md:h-[2px] rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-6 md:w-10 bg-white' : 'w-2 md:w-4 bg-white/20'
            }`}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroSection;