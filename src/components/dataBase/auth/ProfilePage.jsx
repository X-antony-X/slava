import React, { useEffect, useState } from 'react';
import { supabase } from "../supabaseClient";
import AccountOverview from "./AccountOverview";
import AuthPage from './AuthPage'; 
import AccountSettings from "./AccountSettings"; 

const ProfilePage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // وظيفة للتحقق من الجلسة
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // الحماية: لازم يكون فيه جلسة والإيميل مؤكد
      if (session?.user?.email_confirmed_at) {
        setSession(session);
      } else {
        setSession(null);
      }
      setLoading(false);
    };

    checkUser();

    // مراقبة أي تغيير في حالة تسجيل الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        setSession(session);
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []); // useEffect واحدة صحيحة

  if (loading) {
    return (
      <div className="flex justify-center py-20 uppercase font-black italic tracking-widest text-sm">
        Loading Slava...
      </div>
    );
  }

  // 1. لو مش عامل Login أو مأكدش الإيميل، اعرض صفحة الـ Auth
  if (!session) {
    return <AuthPage />;
  }

  // 2. لو البيانات تمام، اعرض البروفايل
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-1">
          <div className="mb-6">
            <h2 className="text-2xl font-black italic uppercase leading-none text-black">Hello,</h2>
            <h2 className="text-2xl font-black italic uppercase text-gray-400">
              {session.user?.user_metadata?.first_name || session.user?.user_metadata?.full_name || 'Guest'}
            </h2>
          </div>

          <nav className="flex flex-col text-sm font-bold uppercase tracking-widest">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-left p-4 transition-all ${activeTab === 'overview' ? 'bg-gray-100 border-l-4 border-black' : 'hover:bg-gray-50'}`}
            >
              Account Overview
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-left p-4 transition-all ${activeTab === 'settings' ? 'bg-gray-100 border-l-4 border-black' : 'hover:bg-gray-50'}`}
            >
              Account Settings
            </button>
            
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-left p-4 text-red-600 mt-10 underline underline-offset-8 decoration-2"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-h-[500px]">
          {activeTab === 'overview' && <AccountOverview user={session.user} />}
          {activeTab === 'settings' && <AccountSettings user={session.user} />}
        </main>

      </div>
    </div>
  );
};

export default ProfilePage;