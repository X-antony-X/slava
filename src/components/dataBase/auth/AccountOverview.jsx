import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from "../supabaseClient";

const AccountOverview = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMixedProducts = async () => {
      try {
        setLoading(true);
        const lastSearch = localStorage.getItem('lastSearch') || 'hoodie';
        
        // هنعمل 3 طلبات متوازية عشان السرعة ونجمعهم
        const [relatedRes, topRes, bottomRes] = await Promise.all([
          // 1. منتج بناءً على البحث
          supabase.from('products').select('*').or(`name.ilike.%${lastSearch}%,category.ilike.%${lastSearch}%`).limit(1),
          // 2. منتج عشوائي من الـ Tops (مثلاً Hoodie)
          supabase.from('products').select('*').eq('category', 'hoodie').limit(1),
          // 3. منتج عشوائي من الـ Bottoms (مثلاً Pants)
          supabase.from('products').select('*').eq('category', 'pants').limit(1)
        ]);

        // ندمج النتائج ونشيل أي مصفوفات فاضية أو متكررة
        const mixedData = [
          ...(relatedRes.data || []),
          ...(topRes.data || []),
          ...(bottomRes.data || [])
        ];

        // فلترة لو في منتج اتكرر بالصدفة
        const uniqueProducts = Array.from(new Set(mixedData.map(p => p.id)))
          .map(id => mixedData.find(p => p.id === id));

        setProducts(uniqueProducts);
      } catch (err) {
        console.error("Error fetching mixed products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMixedProducts();
  }, []);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h3 className="font-black uppercase italic tracking-widest border-b pb-4 text-sm">
          Recommended For You <span className="text-gray-300 ml-2">/ Selection</span>
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                  <img
                    src={product.image_urls?.[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="text-[10px] font-black uppercase italic truncate tracking-tighter">
                    {product.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                    {product.price} EGP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;