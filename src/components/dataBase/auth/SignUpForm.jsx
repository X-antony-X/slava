import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from "../supabaseClient";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isSent, setIsSent] = useState(false); // حالة للتأكد إن الكود اتبعت

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // داخل الـ otpMutation في SignUpForm
  const otpMutation = useMutation({
    mutationFn: async (email) => {
      // خطوة إضافية: بنسأل قاعدة البيانات هل الإيميل ده موجود؟
      const { data: methods } = await supabase.rpc('get_user_exists', { email_param: email }); 
      // ملاحظة: لو مش عايز تعقدها بـ RPC، ممكن نعتمد على استجابة سوبابيز الافتراضية، 
      // بس الطريقة الأفضل هي التأكد من وجود اليوزر الأول.

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // هنا بنسمح بإنشاء مستخدم جديد
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setIsSent(true);
      showToast("Welcome! Check your email to complete registration 📧", "success");
    },
    onError: (error) => {
      showToast(error.message, "error");
    }
  });

  // 🔥 التسجيل بـ Google
  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`
      }
    });
    if (error) showToast(error.message, "error");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    otpMutation.mutate(email);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 flex items-center gap-3 px-6 py-4 shadow-2xl min-w-[320px] ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'} ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="text-[11px] font-black uppercase tracking-widest flex-1">{toast.message}</span>
        <button onClick={() => setToast({ ...toast, show: false })}><X size={16} /></button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter italic">Join SLAVA Family</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Enter your email to receive a secure login link</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* Google Login - دايماً فوق وسريع */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full border border-gray-300 bg-white text-black py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm mb-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Email Input */}
        <div className="space-y-2 relative">
          <label className="text-[11px] font-black uppercase tracking-widest">Email Address *</label>
          <Mail className="absolute left-4 top-[42px] h-4 w-4 text-gray-400" />
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder="name@example.com" 
            className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm font-medium"
            required
            disabled={isSent}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={otpMutation.isPending || isSent}
          className="w-full bg-black text-white py-5 font-black uppercase text-sm tracking-[0.2em] italic hover:bg-zinc-800 transition-all disabled:bg-gray-300 shadow-lg flex items-center justify-center gap-2"
        >
          {otpMutation.isPending ? "Sending..." : isSent ? "Email Sent! Check Inbox" : "Send Login Link"}
          {!isSent && <ArrowRight size={18} />}
        </button>

        {isSent && (
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Didn't get it? Refresh to try again.
          </p>
        )}
      </form>
    </div>
  );
};

export default SignUpForm;