import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient"
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const ManageHeader = () => {
  const [activeTab, setActiveTab] = useState('tops'); // 'tops' or 'bottoms'
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', path: '' });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

    const deleteCategory = async (id) => {
        // تأكيد المسح عشان ميمسحش بالغلط
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        setLoading(true);
        try {
        const { error } = await supabase
            .from('navbar_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // تحديث القائمة بعد المسح
        await fetchData(); 
        } catch (error) {
        console.error("Error deleting category:", error.message);
        alert("Error deleting category");
        } finally {
        setLoading(false);
        }
    };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from('navbar_categories').select('*').eq('type', activeTab);
    const { data: assetData } = await supabase.from('menu_assets').select('*').eq('menu_type', activeTab);
    setCategories(catData || []);
    setAssets(assetData || []);
    setLoading(false);
  };

    const addCategory = async () => {
        if (!newCat.name) return;

        // تحويل الاسم تلقائياً لـ Path
        // مثال: "T-Shirts" -> "/shop/t-shirts"
        const autoPath = `/shop/${newCat.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // حذف الرموز الغريبة
        .replace(/[\s_-]+/g, '-')  // استبدال المسافات بشرطة
        .replace(/^-+|-+$/g, '')}`; // تنظيف الأطراف

        setLoading(true);
        const { error } = await supabase
        .from('navbar_categories')
        .insert([{ 
            name: newCat.name, 
            path: autoPath, 
            type: activeTab 
        }]);

        if (!error) {
        setNewCat({ name: '', path: '' });
        fetchData();
        }
        setLoading(false);
    };

const handleAssetUpload = async (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    try {
      // 1. شوف لو فيه صورة قديمة موجودة في السلوت ده عشان نمسحها
      const existingAsset = assets.find(a => a.slot_index === slot);
      
      if (existingAsset && existingAsset.image_url) {
        // بنستخرج اسم الملف من الـ URL عشان نمسحه
        const oldFileName = existingAsset.image_url.split('/').pop();
        await supabase.storage.from('header-assets').remove([oldFileName]);
      }

      // 2. ارفع الصورة الجديدة باسم فريد
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeTab}-slot-${slot}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('header-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. هات الرابط الجديد وحدث الداتابيز
      const { data: { publicUrl } } = supabase.storage.from('header-assets').getPublicUrl(fileName);
      
      const { error: upsertError } = await supabase.from('menu_assets').upsert({
        menu_type: activeTab,
        slot_index: slot,
        image_url: publicUrl,
        title: activeTab === 'tops' ? "New Drop" : "Essentials"
      }, { onConflict: 'menu_type, slot_index' });

      if (upsertError) throw upsertError;

      await fetchData(); // تحديث الواجهة
    } catch (error) {
      console.error("Error updating asset:", error.message);
      alert("حدث خطأ أثناء تحديث الصورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans">
      <header className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase italic tracking-tighter">Header <span className="text-cyan-500">Engine</span></h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2">Manage Navigation & Visuals</p>
        </div>
        
        {/* Tabs لتغيير النوع */}
        <div className="flex gap-2 bg-[#111] p-1 rounded-xl border border-slate-800">
          {['tops', 'bottoms'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Category Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={16} className="text-cyan-500" /> Add {activeTab} Category
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Category Name</label>
                <input 
                  placeholder="e.g. Hoodies" 
                  value={newCat.name}
                  onChange={e => setNewCat({...newCat, name: e.target.value})}
                  className="w-full bg-black border border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-cyan-500 transition-all uppercase italic font-bold"
                />
              </div>

              {/* الـ Preview بتاع اللينك اللي هيتعمل */}
              {newCat.name && (
                <div className="px-3 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Generated Path:</p>
                  <p className="text-[10px] font-mono text-cyan-500">
                    /shop/{newCat.name.toLowerCase().trim().replace(/\s+/g, '-')}
                  </p>
                </div>
              )}

              <button 
                onClick={addCategory} 
                disabled={!newCat.name}
                className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-white transition-all"
              >
                Add to Menu
              </button>
            </div>
          </div>
          
          {/* ... باقي كود عرض الـ categories اللي عندك ... */}

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="bg-[#111] border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-red-900/50 transition-all">
                <div>
                  <p className="text-xs font-black uppercase italic">{cat.name}</p>
                  <p className="text-[9px] text-slate-600 font-mono">{cat.path}</p>
                </div>
                <button onClick={() => deleteCategory(cat.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Header Assets (The 2 Images) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(slot => {
            const asset = assets.find(a => a.slot_index === slot);
            return (
              <div key={slot} className="bg-[#111] border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Visual Slot 0{slot}</h3>
                <div className="aspect-[16/9] bg-black rounded-xl overflow-hidden border border-slate-800 relative group">
                  {asset ? (
                    <img src={asset.image_url} className="w-full h-full object-fill opacity-60" alt="" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-800">
                      <ImageIcon size={40} strokeWidth={1} />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => handleAssetUpload(e, slot)} />
                    <div className="text-center">
                      <Upload className="mx-auto text-cyan-500 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Replace Image</span>
                    </div>
                  </label>
                </div>
                <p className="text-[10px] text-center text-slate-600 italic">Recommended: 800x600px PNG/JPG</p>
              </div>
            );
          })}
        </div>

      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
        </div>
      )}
    </div>
  );
};

export default ManageHeader;