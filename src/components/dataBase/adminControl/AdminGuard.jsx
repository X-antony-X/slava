// AdminGuard.jsx
import { useEffect, useState } from 'react';
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';

const AdminGuard = ({ children }) => {
  const [status, setStatus] = useState('loading'); // loading | authorized | denied
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // 1. نجيب بيانات اليوزر اللي مسجل دخول حالياً
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus('denied');
        navigate('/slava-admin-gate'); // لو مش مسجل دخول أصلاً
        return;
      }

      // 2. نسأل جدول الـ profiles: هل الشخص ده أدمن؟
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profile?.is_admin === true) {
        setStatus('authorized');
      } else {
        setStatus('denied');
        alert("You are not an admin!");
        navigate('/'); // لو مش أدمن اطرده للصفحة الرئيسية
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (status === 'loading') return <div className="bg-black min-h-screen text-white flex items-center justify-center uppercase font-black italic">Verifying Identity...</div>;

  return status === 'authorized' ? children : null;
};

export default AdminGuard;