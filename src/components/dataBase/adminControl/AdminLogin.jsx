import { useState } from 'react';
import { supabase } from "../supabaseClient";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. التأكد يدوياً إن الإيميل ده موجود في جدول البروفايلات وله صلاحية أدمن
      // ملاحظة: بما إن جدولك مفيهوش عمود إيميل حالياً، هنستخدم الـ full_name 
      // بس الأضمن مستقبلاً تضيف عمود الإيميل للجدول.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('full_name', 'antony ishak') 
        .single();

      if (profileError || !profile?.is_admin) {
        setMessage({ type: 'error', text: 'NOT AUTHORIZED: ADMIN PROFILE NOT FOUND' });
        setLoading(false);
        return; // بنوقف هنا ومش بنبعت OTP أصلاً لو مش أدمن
      }

      // 2. إرسال رابط الدخول (Magic Link)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { 
          // غيرناها لـ true عشان نتخطى مشكلة الـ Signups Not Allowed مؤقتاً
          shouldCreateUser: true, 
          emailRedirectTo: window.location.origin + '/admin-dashboard' 
        }
      });

      if (error) {
        setMessage({ type: 'error', text: `SYSTEM ERROR: ${error.message.toUpperCase()}` });
      } else {
        setMessage({ type: 'success', text: 'ACCESS LINK SENT: CHECK YOUR EMAIL' });
      }

    } catch (err) {
      setMessage({ type: 'error', text: 'CRITICAL CONNECTION FAILURE' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase italic p-4">
      <div className="w-full max-w-sm p-10 border border-zinc-900 bg-[#0a0a0a] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-white opacity-20"></div>
        <h2 className="text-3xl tracking-tighter mb-8 border-l-4 border-white pl-4">Admin Port</h2>
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.3em] text-zinc-500">Security Clearance</label>
            <input 
              type="email" 
              placeholder="ADMIN_EMAIL" 
              className="w-full bg-transparent border-b border-zinc-800 py-3 outline-none focus:border-white transition-all placeholder:text-zinc-800"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-white text-black py-5 hover:bg-zinc-200 disabled:bg-zinc-800 transition-all font-black tracking-widest text-xs"
          >
            {loading ? "VERIFYING..." : "REQUEST ACCESS"}
          </button>
          {message.text && (
            <div className={`mt-6 p-4 text-[10px] tracking-widest text-center border ${message.type === 'error' ? 'border-red-900 text-red-500 bg-red-950/20' : 'border-zinc-800 text-green-500 bg-zinc-900'}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;