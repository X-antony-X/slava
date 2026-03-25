import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { ArrowLeft, Upload, Trash2, Loader2, Film, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditHeroSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("video");

  // 1. Fetch Current Slides
  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setSlides(data);
  };

  useEffect(() => { fetchSlides(); }, []);

  // 2. Handle Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Please add a title and select a file.");

    setUploading(true);
    try {
      // A. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero-content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-content')
        .getPublicUrl(filePath);

      // B. Save to Database
      const { error: dbError } = await supabase
        .from('hero_slides')
        .insert([{ 
          title, 
          desc, 
          url: publicUrl, 
          type: fileType 
        }]);

      if (dbError) throw dbError;

      // Reset Form
      setTitle("");
      setDesc("");
      setFile(null);
      fetchSlides();
      alert("New slide added successfully!");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete Slide
  const deleteSlide = async (id, url) => {
    if (!window.confirm("Delete this slide?")) return;
    
    setLoading(true);
    try {
      const fileName = url.split('/').pop();
      await supabase.storage.from('hero-content').remove([`hero-content/${fileName}`]);
      await supabase.from('hero_slides').delete().eq('id', id);
      fetchSlides();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 font-black uppercase selection:bg-black selection:text-white">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-12 border-b-2 border-black pb-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
          <ArrowLeft size={20} />
          <span className="text-xs tracking-widest">Back to Port</span>
        </button>
        <h1 className="text-2xl md:text-4xl italic tracking-tighter underline">Edit Hero Slider</h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Add New Slide Form */}
        <section className="space-y-8">
          <div className="bg-zinc-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg mb-6 border-b border-black/10 pb-2 flex items-center gap-2">
              <Upload size={18} /> New Entry
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-4 text-[10px] tracking-widest">
              <div className="space-y-2">
                <label>Slide Type</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFileType("video")} className={`flex-1 py-2 border-2 ${fileType === 'video' ? 'bg-black text-white' : 'border-black'}`}>Video</button>
                  <button type="button" onClick={() => setFileType("image")} className={`flex-1 py-2 border-2 ${fileType === 'image' ? 'bg-black text-white' : 'border-black'}`}>Image</button>
                </div>
              </div>

              <div className="space-y-2">
                <label>Main Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="E.G. URBAN ESSENTIALS" className="w-full p-3 border-2 border-black focus:outline-none focus:bg-zinc-100 uppercase" />
              </div>

              <div className="space-y-2">
                <label>Subtitle / Description</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} type="text" placeholder="E.G. SPRING 2026" className="w-full p-3 border-2 border-black focus:outline-none focus:bg-zinc-100 uppercase" />
              </div>

              <div className="space-y-2">
                <label>File Source</label>
                <input onChange={(e) => setFile(e.target.files[0])} type="file" accept={fileType === 'video' ? 'video/*' : 'image/*'} className="w-full p-2 border-2 border-black border-dashed cursor-pointer" />
              </div>

              <button disabled={uploading} type="submit" className="w-full bg-black text-white p-4 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3">
                {uploading ? <Loader2 className="animate-spin" /> : "PUBLISH_SLIDE"}
              </button>
            </form>
          </div>
        </section>

        {/* Right: Current Slides List */}
        <section className="space-y-6">
          <h2 className="text-lg italic underline tracking-tighter">Live Content ({slides.length})</h2>
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {slides.map((slide) => (
              <div key={slide.id} className="group border-2 border-black p-4 flex gap-4 items-center relative hover:bg-zinc-50 transition-colors">
                <div className="w-20 h-20 bg-black flex-shrink-0 flex items-center justify-center text-white overflow-hidden">
                  {slide.type === 'video' ? <Film size={24} /> : <img src={slide.url} className="object-cover w-full h-full" />}
                </div>
                <div className="flex-grow overflow-hidden">
                  <h3 className="text-xs truncate">{slide.title}</h3>
                  <p className="text-[8px] text-zinc-400 truncate">{slide.desc}</p>
                </div>
                <button onClick={() => deleteSlide(slide.id, slide.url)} className="text-zinc-300 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {slides.length === 0 && <p className="text-[10px] text-zinc-400 italic">No slides found in database.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditHeroSection;