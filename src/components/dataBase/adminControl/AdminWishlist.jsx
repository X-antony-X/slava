import React, { useState, useEffect } from 'react';
import { supabase } from '../../dataBase/supabaseClient'; 
import { Loader2, Heart, Inbox, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminWishlist = () => {
  const [wishlistData, setWishlistData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        // 1. هنجيب الداتا من الويش ليست (من غير الـ auth.users)
        const { data: wishData, error: wishError } = await supabase
          .from('wishlist')
          .select(`
            id,
            user_id,
            product_id,
            created_at,
            products ( name, price, category )
          `)
          .order('created_at', { ascending: false });

        if (wishError) throw wishError;

        // 2. هنجيب أسماء المستخدمين من جدول profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name');

        if (profilesError) throw profilesError;

        // 3. نربط الـ ID بالاسم عشان نعرضه في الجدول
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile.full_name;
          return acc;
        }, {});

        // 4. ندمج البيانات مع بعض
        const rawData = wishData || [];
        const enrichedData = rawData.map(item => ({
          ...item,
          customer_name: profilesMap[item.user_id] || 'Unknown Customer'
        }));

        setWishlistData(enrichedData);

        // --- عملية تجميع الإحصائيات (أكتر منتجات مطلوبة) ---
        const counts = rawData.reduce((acc, item) => {
          if (!item.products) return acc; 
          
          const pId = item.product_id;
          if (!acc[pId]) {
            acc[pId] = {
              name: item.products.name,
              category: item.products.category,
              price: item.products.price,
              count: 0
            };
          }
          acc[pId].count++;
          return acc;
        }, {});

        const sortedTopProducts = Object.values(counts).sort((a, b) => b.count - a.count);
        setTopProducts(sortedTopProducts);

      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black font-black uppercase tracking-widest">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-sm">Analyzing Wishlists...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-12 font-black uppercase selection:bg-black selection:text-white">
      
      <div className="max-w-7xl mx-auto mb-12">
        <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 mb-8 text-zinc-500 hover:text-black transition-colors text-xs tracking-widest">
          <ArrowLeft size={16} /> BACK TO DASHBOARD
        </button>
        <div className="flex items-center gap-4 border-b-4 border-black pb-6">
          <Heart size={40} className="fill-black" />
          <h1 className="text-4xl md:text-6xl italic tracking-tighter">Wishlist Insights</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">

        {/* --- الإحصائيات --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} />
            <h2 className="text-2xl italic tracking-tight">Top Saved Products</h2>
          </div>
          
          {topProducts.length === 0 ? (
            <p className="text-zinc-400 text-xs">No data to analyze yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topProducts.slice(0, 3).map((product, index) => (
                <div key={index} className="border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <span className="text-4xl opacity-20 italic block mb-2">#{index + 1}</span>
                    <h3 className="text-xl italic leading-none mb-2">{product.name}</h3>
                    <span className="bg-zinc-100 text-zinc-600 px-2 py-1 text-[10px] tracking-widest">{product.category}</span>
                  </div>
                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 tracking-widest">PRICE</p>
                      <p className="text-lg">{product.price} EGP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 tracking-widest">SAVES</p>
                      <p className="text-3xl flex items-center gap-2 text-red-600">
                        <Heart size={20} className="fill-red-600" /> {product.count}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- الجدول --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl italic tracking-tight">Recent Activity</h2>
            <span className="text-xs text-zinc-500 tracking-widest">TOTAL ITEMS: {wishlistData.length}</span>
          </div>

          {wishlistData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200">
              <Inbox size={48} strokeWidth={1} className="text-zinc-300 mb-4" />
              <p className="text-zinc-400 text-xs tracking-widest">No items added to wishlists yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="py-4 px-4 text-[11px] tracking-widest">Date</th>
                    <th className="py-4 px-4 text-[11px] tracking-widest">Customer Name</th>
                    <th className="py-4 px-4 text-[11px] tracking-widest">Product Name</th>
                    <th className="py-4 px-4 text-[11px] tracking-widest">Category</th>
                    <th className="py-4 px-4 text-[11px] tracking-widest text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-100 bg-white">
                  {wishlistData.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 px-4 text-zinc-500 text-[10px] tracking-wider">
                        {new Date(row.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold">
                        {row.customer_name}
                      </td>
                      <td className="py-4 px-4 text-xs italic">
                        {row.products?.name || 'Deleted Product'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 text-[9px] tracking-widest">
                          {row.products?.category || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-right">
                        {row.products?.price ? `${row.products.price} EGP` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default AdminWishlist;