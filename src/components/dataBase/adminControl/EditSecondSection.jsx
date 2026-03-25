import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { Upload, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';

const EditSecondSection = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      <header className="max-w-6xl mx-auto mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
          Spotlight <span className="text-cyan-500">Control</span>
        </h1>
        <p className="text-slate-500 text-xs tracking-[0.3em] mt-2 uppercase">Manage Secondary Home Banners</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <BannerEditor id={1} label="Left Banner" />
        <BannerEditor id={2} label="Right Banner" />
      </div>

      {status && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl animate-bounce">
          <CheckCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">{status}</span>
        </div>
      )}
    </div>
  );
};

const BannerEditor = ({ id, label }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('secondary_banners').select('*').eq('id', id).single();
      if (data) {
        setTitle(data.title);
        setDesc(data.description);
        setImgUrl(data.image_url);
      }
    };
    fetchData();
  }, [id]);

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${id}-${Math.random()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      let { error: uploadError } = await supabase.storage.from('hero-content').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('hero-content').getPublicUrl(filePath);
      setImgUrl(publicUrl);

      await supabase.from('secondary_banners').upsert({ id, title, description: desc, image_url: publicUrl });
      alert(`${label} Updated!`);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const saveText = async () => {
    setUploading(true);
    await supabase.from('secondary_banners').upsert({ id, title, description: desc, image_url: imgUrl });
    setUploading(false);
    alert("Text content saved!");
  };

  return (
    <div className="bg-[#111111] border border-slate-800 p-6 group hover:border-cyan-900/50 transition-all duration-500 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold">Slot 0{id}</span>
        <h3 className="text-lg font-bold italic uppercase">{label}</h3>
      </div>

      <div className="relative aspect-[4/5] bg-black mb-6 border border-slate-800 overflow-hidden group">
        {imgUrl ? (
          <img src={imgUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-700">
            <ImageIcon size={48} strokeWidth={1} />
            <p className="text-[10px] mt-2 uppercase tracking-widest text-slate-500">No Image Selected</p>
          </div>
        )}
        
        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
          <Upload className="text-cyan-400 mb-2" size={30} />
          <span className="text-[10px] font-black uppercase tracking-widest">Update Visual</span>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Headline</label>
          <input 
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-slate-800 p-4 text-sm focus:border-cyan-500 outline-none transition-all uppercase italic font-bold"
            placeholder="E.G. GYM ESSENTIALS"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sub-Text</label>
          <textarea 
            value={desc} onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-slate-800 p-4 text-sm focus:border-cyan-500 outline-none transition-all h-24 resize-none"
            placeholder="Enter brief description..."
          />
        </div>

        <button 
          onClick={saveText}
          disabled={uploading}
          className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          {uploading ? <Loader2 className="animate-spin" /> : "Sync Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditSecondSection;