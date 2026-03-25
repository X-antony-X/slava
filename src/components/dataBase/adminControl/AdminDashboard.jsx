import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { PlusCircle, Package, Users, LogOut, LayoutGrid, Monitor, Layers, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/slava-admin-gate');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile) setAdminName(profile.full_name);
      setLoading(false);
    };
    fetchAdminData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const stats = [
    { name: 'Products', value: '42', icon: Package },
    { name: 'Orders', value: '12', icon: LayoutGrid },
    { name: 'Users', value: '315', icon: Users },
  ];

  // الأقسام الجديدة لتعديل الـ Homepage
  const uiSections = [
    { name: 'Hero Section', path: '/admin/edit-hero', icon: Monitor, desc: 'Slider Videos & Titles' },
    { name: 'Collections', path: '/admin/edit-second-section', icon: Layers, desc: 'Category Cards & Links' },
    { name: 'Brand Story', path: '/admin/edit-third-section', icon: ImageIcon, desc: 'About Image & Paragraph' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-[0.3em] italic text-sm p-6 text-center">
      Verifying Identity...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-black uppercase selection:bg-black selection:text-white">
      
      <header className="bg-black text-white px-4 md:px-12 py-4 md:py-6 flex items-center justify-between border-b border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <h1 className="text-xl md:text-3xl font-black italic tracking-tighter">Slava</h1>
          <span className="h-5 w-[1px] md:w-[2px] bg-zinc-700"></span>
          <p className="text-zinc-500 text-[8px] md:text-[10px] tracking-[0.2em] leading-none">Admin <br className="md:hidden"/> Port</p>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-[10px] md:text-xs border border-zinc-800 px-3 py-2 md:px-5 md:py-2.5">
          <LogOut size={14} />
          <span className="hidden xs:inline">Logout</span>
        </button>
      </header>

      <main className="p-4 md:p-12 max-w-7xl mx-auto space-y-12 md:space-y-20">
        
        {/* Welcome Section */}
        <div className="border-b-2 border-black pb-6 md:pb-10">
          <p className="text-[10px] md:text-sm tracking-[0.3em] text-zinc-400 mb-2">ACCESS_GRANTED</p>
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-black italic tracking-tighter leading-[0.9]">
            Welcome Back, <br className="sm:hidden"/>
            <span className="underline decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">
              {adminName.split(' ')[0] || 'Admin'}
            </span>
          </h2>
        </div>

        {/* 1. Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="border-2 border-black p-5 md:p-8 flex items-center gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="bg-black text-white p-3 md:p-5 shrink-0">
                <stat.icon size={20} className="md:w-7 md:h-7" strokeWidth={3} />
              </div>
              <div>
                <p className="text-[9px] md:text-[11px] tracking-[0.2em] text-zinc-400">{stat.name}</p>
                <p className="text-2xl md:text-4xl font-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Homepage Content Management (القسم الجديد) */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xl md:text-2xl font-black italic">Manage Homepage UI</h3>
            <div className="h-[2px] flex-grow bg-zinc-100"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {uiSections.map((section, index) => (
              <div 
                key={index}
                onClick={() => navigate(section.path)}
                className="cursor-pointer group border-2 border-black p-6 md:p-8 space-y-4 hover:bg-black hover:text-white transition-all duration-300 relative overflow-hidden"
              >
                <section.icon size={32} strokeWidth={1.5} className="text-zinc-300 group-hover:text-white transition-colors" />
                <div>
                  <h4 className="text-lg md:text-xl font-black">{section.name}</h4>
                  <p className="text-[9px] md:text-[11px] text-zinc-500 group-hover:text-zinc-400 tracking-widest uppercase">{section.desc}</p>
                </div>
                <div className="absolute top-4 right-4 text-[8px] opacity-20 group-hover:opacity-100">EDIT_MODE</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Add Product Section */}
        <div onClick={() => navigate('/admin/add-product')} className="cursor-pointer group relative bg-zinc-50 border-2 border-black p-8 md:p-16 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden transition-all hover:bg-black hover:text-white">
          <PlusCircle size={48} className="text-zinc-300 group-hover:text-white transition-all duration-500 group-hover:rotate-90" />
          <div className="space-y-2">
            <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter">Add New Product</h3>
            <p className="text-zinc-500 group-hover:text-zinc-400 text-[9px] md:text-[11px] tracking-widest uppercase">Sync new designs to Robino.</p>
          </div>
        </div>

      </main>

      <footer className="p-8 md:p-12 text-center border-t border-zinc-100">
        <p className="text-[8px] md:text-[10px] tracking-[0.5em] text-zinc-300 italic">SLAVA_ADMIN_SYSTEM // 2026</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;