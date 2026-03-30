import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { UserPlus, ShieldCheck, Mail, ChevronLeft, Loader2, ShieldOff, Users, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const AddAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingAdmins, setFetchingAdmins] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState(''); // خليناها حالة واحدة للإيميل بس
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    setFetchingAdmins(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_admin', true);

    if (error) {
      toast.error("Error loading admins list");
    } else {
      setAdmins(data);
    }
    setFetchingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetEmail = email.toLowerCase().trim();

      // 1. هنحاول نعدل الحساب مباشرة لو موجود
      // استخدمنا select() عشان ترجعلنا الداتا اللي اتعدلت لو موجودة
      const { data: updatedUsers, error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('email', targetEmail)
        .select();

      if (updateError) throw updateError;

      // 2. لو updatedUsers رجعت بـ Array فيها داتا، يبقى الحساب كان موجود واتعدل
      if (updatedUsers && updatedUsers.length > 0) {
        toast.success("Existing user promoted to Admin!");
      } else {
        // 3. لو مفيش حساب اتعدل (يعني الإيميل مش موجود)، هنضيفه كأدمن جديد
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              email: targetEmail,
              is_admin: true
            }
          ]);

        if (insertError) throw insertError;
        toast.success("New Admin added successfully!");
      }

      // تصفية الخانة بعد الإضافة
      setEmail('');
      fetchAdmins();

    } catch (error) {
      // لو في أي مشكلة (زي إن الـ RLS بتمنع الإضافة)، هتظهر هنا
      toast.error(error.message || "Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const revokeAdmin = async (userId, name) => {
    const displayName = name || 'this user';
    if (!window.confirm(`Revoke admin access from ${displayName}?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to revoke access");
    } else {
      toast.success("Access Revoked");
      fetchAdmins();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-black font-black uppercase selection:bg-black selection:text-white">
      <Toaster />
      
      {/* Top Navigation */}
      <nav className="p-3 md:p-5 border-b-[4px] border-black bg-white sticky top-0 z-30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button 
            onClick={() => navigate(-1)} 
            className="border-2 border-black p-1 hover:bg-black hover:text-white transition-all active:translate-y-1 flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg md:text-2xl leading-none italic tracking-tighter truncate">Authority_Manager</h1>
            <span className="text-[7px] md:text-[8px] tracking-[0.1em] md:tracking-[0.2em] opacity-50 truncate">Core Security Protocol v2.1</span>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2 bg-black text-white px-2 md:px-3 py-1 text-[9px] md:text-[10px] italic flex-shrink-0">
          <Database size={10} />
          <span className="hidden xs:inline">Admins:</span> {admins.length}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 mb-20">
        
        {/* Left: Security Form */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border-[3px] md:border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <UserPlus className="bg-black text-white p-1" size={22} />
              <h2 className="text-base md:text-lg italic tracking-tighter">Grant_New_Access</h2>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4 md:space-y-5" autoComplete="off">
              {/* شيلنا خانة الاسم وسبنا الإيميل بس */}
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] tracking-widest flex items-center gap-2"> <Mail size={10} /> Email Address </label>
                <input 
                  required
                  type="email" 
                  autoComplete="new-password" 
                  name="system_admin_mail_entry" 
                  className="w-full bg-zinc-100 border-2 border-black p-2 md:p-3 outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all italic text-[10px] md:text-xs lowercase"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@EXAMPLE.COM"
                />
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full bg-black text-white py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3 hover:bg-white hover:text-black border-2 border-black transition-all active:translate-y-1 active:shadow-none font-black text-xs md:text-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /> EXECUTE_AUTHORITY</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Current Hierarchy */}
        <div className="lg:col-span-7 space-y-4 w-full">
            <div className="flex items-center justify-between border-b-[3px] md:border-b-[4px] border-black pb-2">
              <div className="flex items-center gap-2 md:gap-3">
                <Users size={20} />
                <h2 className="text-lg md:text-xl italic tracking-tighter">Current_Hierarchy</h2>
              </div>
              <span className="text-[7px] md:text-[9px] opacity-40 text-right">System_Scan: <br className="xs:hidden" /> Operational</span>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[50vh] md:max-h-[60vh] pr-1 custom-scrollbar">
              {fetchingAdmins ? (
                <div className="py-16 md:py-20 flex flex-col items-center justify-center border-2 border-dashed border-black">
                   <Loader2 className="animate-spin mb-4" />
                   <p className="italic tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px]">Scanning_Records...</p>
                </div>
              ) : admins.length > 0 ? (
                admins.map((admin) => (
                  <div key={admin.id} className="bg-white border-2 border-black p-3 md:p-4 flex items-center justify-between group hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all gap-2">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="min-w-[35px] h-[35px] md:min-w-[45px] md:h-[45px] bg-black text-white flex items-center justify-center text-xs md:text-sm border-2 border-black group-hover:bg-white group-hover:text-black transition-colors flex-shrink-0">
                        {admin.full_name?.charAt(0) || admin.email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] md:text-sm italic tracking-tighter truncate font-bold">{admin.full_name || 'UNDEFINED_USER'}</p>
                        <p className="text-[8px] md:text-[10px] text-zinc-500 lowercase truncate tracking-tight">{admin.email}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => revokeAdmin(admin.id, admin.full_name)}
                      className="bg-zinc-100 text-black p-2 md:p-3 hover:bg-red-600 hover:text-white border-2 border-black transition-all flex-shrink-0"
                    >
                      <ShieldOff size={14} md:size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="border-4 border-dashed border-zinc-300 py-20 text-center italic text-zinc-400 text-[10px]">
                  Zero_Administrative_Entities_Found.
                </div>
              )}
            </div>
        </div>
      </main>

      {/* Persistent Footer */}
      <footer className="fixed bottom-0 w-full bg-black text-white py-2 px-4 flex justify-between items-center z-40">
        <p className="text-[6px] md:text-[7px] tracking-[0.2em] md:tracking-[0.4em] italic truncate pr-2">
          SLAVA_SECURITY_LAYER_v2.1 // ISMAILIA
        </p>
        <p className="text-[6px] md:text-[7px] opacity-50 whitespace-nowrap">
          STATUS: <span className="text-green-400">ENCRYPTED</span>
        </p>
      </footer>
    </div>
  );
};

export default AddAdmin;