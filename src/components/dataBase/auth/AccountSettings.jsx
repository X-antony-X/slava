import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";

const AccountSettings = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: ""
  });

  // جلب البيانات الحالية من جدول profiles عند تحميل الصفحة
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        const nameParts = data.full_name ? data.full_name.split(' ') : ["", ""];
        setFormData({
          ...formData,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(' ') || "",
          phone: data.phone || "",
          address: data.address || ""
        });
      }
    };

    if (user?.id) fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. تحديث البيانات في جدول profiles (هنا السحر بيحصل)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date()
      })
      .eq('id', user.id); // التأكد إن التعديل لليوزر ده فقط

    if (profileError) {
      alert("Error updating profile: " + profileError.message);
    } else {
      alert("Profile Updated Successfully! ✅");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white">
      <h1 className="text-xl font-black uppercase tracking-[0.3em] italic mb-10 border-b border-black pb-6">
        Account Settings
      </h1>
      
      <form onSubmit={handleUpdate} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Name */}
          <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">First Name</label>
            <input 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition-all font-bold uppercase text-sm" 
            />
          </div>

          {/* Last Name */}
          <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">Last Name</label>
            <input 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition-all font-bold uppercase text-sm" 
            />
          </div>
        </div>

        {/* Phone Number - الإضافة الجديدة */}
        <div className="group space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">Phone Number</label>
          <input 
            type="tel"
            placeholder="01XXXXXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition-all font-bold text-sm" 
          />
        </div>

        {/* Address - الإضافة الجديدة */}
        <div className="group space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-focus-within:text-black transition-colors">Shipping Address</label>
          <input 
            placeholder="STREET, CITY, GOVERNORATE"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition-all font-bold uppercase text-sm placeholder:text-zinc-200" 
          />
        </div>

        {/* Email - Read Only */}
        <div className="space-y-2 opacity-50">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address (Primary)</label>
          <input 
            value={formData.email}
            className="w-full border-b border-zinc-100 py-3 outline-none font-bold text-sm cursor-not-allowed" 
            disabled 
          />
        </div>

        <button 
          disabled={loading}
          className="bg-black text-white w-full py-5 font-black uppercase italic tracking-[0.2em] text-sm hover:bg-zinc-800 transition-all disabled:bg-zinc-300 shadow-xl"
        >
          {loading ? "Syncing..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;