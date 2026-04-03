import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Loader2, Package, Layers } from 'lucide-react';

const DeleteItem = () => { // غيرت الاسم ليكون أنسب للوظيفة
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, imageUrls) => {
    if (!window.confirm("⚠️ Are you sure? This will remove the product and ALL associated images.")) return;

    setDeletingId(id);
    try {
      // 1. مسح الصور من الـ Storage أولاً
      if (imageUrls && imageUrls.length > 0) {
        const paths = imageUrls.map(url => {
          // بنجيب الجزء اللي بعد اسم الـ bucket بالظبط
          // لو الـ URL: https://.../product-images/products/image.jpg
          // الـ path المحتاجينه: products/image.jpg
          const pathSegments = url.split('product-images/');
          return pathSegments[1]; 
        });

        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(paths);

        if (storageError) {
          console.error("Storage Error:", storageError);
          // ممكن تكمل أو توقف هنا بناءً على رغبتك، الأفضل نكمل مسح الداتا بيز
        }
      }

      // 2. مسح المنتج من الجدول
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 3. تحديث الواجهة
      setProducts(prev => prev.filter(p => p.id !== id));
      
    } catch (err) {
      console.error(err);
      alert("Error during deletion: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-gray-400 italic">Syncing Warehouse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 font-sans text-black">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Inventory</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] mt-3 tracking-[0.4em] border-l-2 border-black pl-3">Control your drops / Robino</p>
        </div>
        <div className="bg-black text-white px-8 py-3 rounded-full font-black text-xs uppercase italic tracking-widest shadow-xl">
          Total: {products.length} Items
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-20">
        {Object.keys(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([category, items]) => (
            <section key={category} className="space-y-8">
              <div className="flex items-center gap-4 border-b-[3px] border-black pb-3">
                <Layers size={22} />
                <h2 className="text-3xl font-black uppercase italic tracking-tight">{category}</h2>
                <div className="ml-auto bg-gray-200 text-black text-[10px] px-3 py-1 rounded-full font-black">
                  {items.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col group hover:shadow-2xl hover:border-black transition-all duration-500 relative"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f3f3] border-b border-gray-50">
                      <img 
                        src={item.image_urls?.[0]} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt={item.name} 
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                         <span className="text-[11px] font-black tracking-tighter">LE {item.price}</span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-black uppercase text-xs tracking-tight mb-4 line-clamp-2 min-h-[2rem]">
                        {item.name}
                      </h3>
                      
                      <button
                        onClick={() => handleDelete(item.id, item.image_urls)}
                        disabled={deletingId === item.id}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                          deletingId === item.id 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-red-50 text-red-500 hover:bg-black hover:text-white'
                        }`}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {deletingId === item.id ? 'Processing...' : 'Delete Drop'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-40 border-4 border-dashed border-gray-100 rounded-[3rem]">
            <Package className="mx-auto text-gray-200 mb-6" size={80} />
            <p className="text-gray-300 font-black uppercase tracking-[0.5em]">Warehouse Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteItem;