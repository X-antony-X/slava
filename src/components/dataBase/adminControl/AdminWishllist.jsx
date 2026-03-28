import React, { useState, useEffect } from 'react';
import { supabase } from '../../dataBase/supabaseClient'; // اتأكد من المسار
import { Loader2, Heart, Inbox } from 'lucide-react';

const AdminWishlist = () => {
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        // بنجيب بيانات المفضلة مع تفاصيل المنتج والايميل
        const { data, error } = await supabase
          .from('wishlist')
          .select(`
            id,
            created_at,
            products ( name, price, category ),
            users:user_id ( email ) 
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWishlistData(data || []);
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
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium uppercase tracking-widest">Loading Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-black fill-black" />
          <h2 className="text-xl font-black uppercase tracking-tight text-black">
            Customer Wishlists
          </h2>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          Total Items: {wishlistData.length}
        </span>
      </div>

      {wishlistData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-sm">
          <Inbox size={48} strokeWidth={1} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium text-sm">No items added to wishlists yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-gray-500">Date</th>
                <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-gray-500">Customer Email</th>
                <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-gray-500">Product Name</th>
                <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-gray-500">Category</th>
                <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-gray-500 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wishlistData.map((row) => (
                <tr key={row.id} className="text-sm text-gray-900">
                  <td className="py-5 px-2 text-gray-400 text-xs">
                    {new Date(row.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-5 px-2 font-medium">
                    {row.users?.email || 'Unknown User'}
                  </td>
                  <td className="py-5 px-2 font-bold uppercase text-[12px] tracking-tight">
                    {row.products?.name || 'Deleted Product'}
                  </td>
                  <td className="py-5 px-2">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-sm text-[10px] uppercase font-bold tracking-widest">
                      {row.products?.category || 'N/A'}
                    </span>
                  </td>
                  <td className="py-5 px-2 font-black text-right">
                    {row.products?.price ? `${row.products.price} EGP` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminWishlist;