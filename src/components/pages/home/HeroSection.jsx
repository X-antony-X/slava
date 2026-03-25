import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../dataBase/supabaseClient'; // تأكد من مسار الملف عندك

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const IMAGE_DURATION = 5000;

  // 1. جلب البيانات من Supabase
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

  // 2. إدارة الـ Progress للصور
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
  }, [currentIndex, isPlaying, slides]);

  // 3. إدارة الـ Progress للفيديو
  useEffect(() => {
    if (!currentSlide || currentSlide.type !== 'video' || !videoRef.current) return;
    const video = videoRef.current;
    
    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const handleEnded = () => handleNext();

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isPlaying, slides]);

  // شاشة تحميل بسيطة لحد ما الداتا تيجي
  if (loading) return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <Loader2 className="text-white animate-spin" size={40} />
    </div>
  );

  // لو مفيش داتا خالص في الجدول
  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white font-medium uppercase">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {currentSlide.type === 'video' ? (
          <div className="relative h-full w-full flex items-center justify-center">
            <video
              key={`bg-${currentSlide.url}`}
              muted playsInline autoPlay loop
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[100px]"
            >
              <source src={currentSlide.url} type="video/mp4" />
            </video>

            <video
              ref={videoRef}
              key={`main-${currentSlide.url}`}
              muted playsInline autoPlay
              className="relative z-10 h-full w-auto max-w-full object-contain"
            >
              <source src={currentSlide.url} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div className="relative h-full w-full flex items-center justify-center">
            <img
              src={currentSlide.url}
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[100px]"
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
            <button className="bg-white text-black px-6 md:px-8 py-2.5 md:py-3 text-[9px] md:text-[10px] font-bold tracking-[0.2em] hover:bg-zinc-200 transition-all">
              DISCOVER NOW
            </button>
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
              strokeDashoffset={100 - progress}
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