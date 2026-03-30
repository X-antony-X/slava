import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { ChevronLeft, Trash2, CheckCircle, Clock, Package, ExternalLink, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 1. جلب الطلبات من Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch orders");
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. تحديث حالة الطلب (مثلاً من Pending لـ Completed)
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('whatsapp_orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error("Error updating status");
    } else {
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(); // إعادة تحميل البيانات
    }
  };

  // 3. حذف الطلب
  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const { error } = await supabase
      .from('whatsapp_orders')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Error deleting order");
    } else {
      toast.success("Order deleted");
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  // تصفية الطلبات بناءً على البحث
  const filteredOrders = orders.filter(order => 
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-black italic tracking-widest uppercase">
      Loading Archives...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-black uppercase selection:bg-black selection:text-white pb-20">
      <Toaster />
      
      {/* Header */}
      <header className="bg-black text-white px-6 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:scale-110 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl italic tracking-tighter">Orders_Log</h1>
        </div>
        <div className="hidden md:block text-[10px] tracking-[0.3em] text-zinc-500">
          Total_Records: {orders.length}
        </div>
      </header>

      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Search Bar */}
        <div className="relative border-2 border-black">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or content..."
            className="w-full py-4 pl-12 pr-4 outline-none text-xs tracking-widest uppercase italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="border-2 border-black p-6 md:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all bg-white relative group">
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left: Info */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-[8px] border ${order.status === 'completed' ? 'bg-green-500 text-white border-green-500' : 'bg-black text-white border-black'}`}>
                        {order.status || 'PENDING'}
                      </span>
                      <span className="text-[10px] text-zinc-400 italic">
                        {new Date(order.created_at).toLocaleDateString()} // {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl md:text-3xl italic tracking-tighter mb-2 underline decoration-2">{order.customer_name}</h2>
                      <div className="bg-zinc-50 p-4 border border-zinc-100">
                        <p className="text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-600 tracking-wide font-medium normal-case">
                          {order.order_details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Price */}
                  <div className="flex flex-col items-end justify-between gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 mb-1">TOTAL_REVENUE</p>
                      <p className="text-2xl md:text-4xl font-black">{order.total_price} <span className="text-xs">EGP</span></p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      {order.status !== 'completed' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'completed')}
                          className="flex-1 md:flex-none border-2 border-black p-3 hover:bg-black hover:text-white transition-colors"
                          title="Mark as Completed"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                         onClick={() => deleteOrder(order.id)}
                         className="flex-1 md:flex-none border-2 border-red-600 text-red-600 p-3 hover:bg-red-600 hover:text-white transition-colors"
                         title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative ID */}
                <div className="absolute -top-3 -right-3 bg-white border border-black px-2 py-1 text-[8px] text-zinc-400 hidden md:block">
                  #{order.id.slice(0, 8)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200">
              <Package size={48} className="mx-auto mb-4 text-zinc-200" />
              <p className="text-zinc-400 italic text-sm">No orders found in the archives.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-zinc-100 p-4 text-center">
        <p className="text-[8px] tracking-[0.5em] text-zinc-300 italic">SLAVA_OPERATIONS_CONTROL_v2.6</p>
      </footer>
    </div>
  );
};

export default AdminOrders;