import React, { useState, useEffect } from 'react';
import { supabase } from "../../dataBase/supabaseClient";
import { Trash2, Loader2, Upload, HardDrive, AlertTriangle } from 'lucide-react';

const EditThirdSection = () => {
  const [cards, setCards] = useState([]);
  const [uploading, setUploading] = useState(false);

  // جلب البيانات من الجدول (المصدر الوحيد للحقيقة)
  const fetchCards = async () => {
    const { data } = await supabase.from('spotlight_cards').select('*').order('created_at', { ascending: false });
    setCards(data || []);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // دالة الرفع والنشر (Atomic Operation)
  const handleUploadAndPublish = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `spotlight-images/${fileName}`;

      // 1. ارفع الملف أولاً
      const { error: uploadError } = await supabase.storage.from('spotlight').upload(filePath, file);
      if (uploadError) throw uploadError;

      // 2. هات الرابط
      const { data: { publicUrl } } = supabase.storage.from('spotlight').getPublicUrl(filePath);

      // 3. سجله في الجدول فوراً (عشان ميبقاش "تائه")
      const { error: insertError } = await supabase.from('spotlight_cards').insert([
        { image_url: publicUrl, button_text: "SHOP NOW" }
      ]);

      if (insertError) {
        // لو التسجيل فشل، امسح الملف اللي رفعته عشان متنضفش وراك يدوي
        await supabase.storage.from('spotlight').remove([filePath]);
        throw insertError;
      }

      fetchCards();
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // دالة المسح المزدوج (Double-Kill)
  const handleDeleteEverything = async (card) => {
    if (!window.confirm("Delete permanently from everywhere?")) return;

    try {
      // 1. استخراج اسم الملف من الرابط بدقة
      // الرابط بيكون: .../spotlight-images/123456.jpg
      const urlParts = card.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `spotlight-images/${fileName}`;

      // 2. امسح من المخزن (Storage)
      const { error: storageError } = await supabase.storage.from('spotlight').remove([filePath]);
      if (storageError) console.warn("Storage delete issue:", storageError.message);

      // 3. امسح من الجدول (Database)
      const { error: dbError } = await supabase.from('spotlight_cards').delete().eq('id', card.id);
      if (dbError) throw dbError;

      // تحديث الواجهة
      setCards(prev => prev.filter(c => c.id !== card.id));
      alert("Deleted from Database & Storage! 🗑️");
      
    } catch (error) {
      alert("Error during deletion: " + error.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-12">
      <header className="border-b-4 border-black pb-4 flex items-center justify-between">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-2">
          <HardDrive size={32} /> Central Spotlight
        </h2>
        <p className="bg-yellow-400 border-2 border-black px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          Sync Active
        </p>
      </header>

      {/* الرفع المباشر */}
      <div className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_rgba(0,0,0,1)]">
        <input type="file" onChange={handleUploadAndPublish} className="hidden" id="upload-sync" disabled={uploading} />
        <label htmlFor="upload-sync" className="flex flex-col items-center justify-center p-10 border-4 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 cursor-pointer transition-all">
          {uploading ? <Loader2 className="animate-spin" size={40} /> : (
            <>
              <Upload size={40} className="mb-2 text-cyan-500" />
              <span className="font-black uppercase tracking-widest text-sm text-gray-500">Push New Image Live</span>
            </>
          )}
        </label>
      </div>

      {/* عرض الصور ومسحها */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {cards.map(card => (
          <div key={card.id} className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col group transition-transform hover:-translate-y-1">
            <div className="aspect-[3/4] overflow-hidden border-b-4 border-black">
              <img src={card.image_url} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="p-4 space-y-4 bg-white">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                <AlertTriangle size={14} className="text-yellow-500" /> Linked to Storage
              </div>
              <button 
                onClick={() => handleDeleteEverything(card)}
                className="w-full bg-black text-white p-3 font-black uppercase text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete Permanently
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditThirdSection;