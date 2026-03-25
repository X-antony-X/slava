import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from "../supabaseClient";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isSent, setIsSent] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const loginMutation = useMutation({
      mutationFn: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false, 
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });

        if (error) {
          // بنحول الرسالة كلها لحروف صغيرة ونشوف لو فيها الكلمات دي
          const errMsg = error.message.toLowerCase();
          
          if (errMsg.includes("signup") && errMsg.includes("not allowed")) {
            throw new Error("This account doesn't exist. Please sign up first! 🖤");
          }
          
          // لو مطلعش هو ده السبب، ارمي الخطأ الأصلي
          throw error;
        }
      },
      onSuccess: () => {
        setIsSent(true);
        showToast("Login link sent! Check your email 📧", "success");
      },
      onError: (error) => {
        showToast(error.message, "error");
      }
    });

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` }
    });
    if (error) showToast(error.message, "error");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white relative">
      {/* Toast Notification */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 flex items-center gap-3 px-6 py-4 shadow-2xl min-w-[320px] ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'} ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="text-[11px] font-black uppercase tracking-widest flex-1">{toast.message}</span>
        <button onClick={() => setToast({ ...toast, show: false })}><X size={16} /></button>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(email); }}>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 bg-white text-black py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Login with Google
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR EMAIL LINK</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[11px] font-black uppercase tracking-widest">Email Address *</label>
          <Mail className="absolute left-4 top-[42px] h-4 w-4 text-gray-400" />
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email" 
            placeholder="name@example.com" 
            className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
            required
            disabled={isSent}
          />
        </div>

        <button 
          type="submit" 
          disabled={loginMutation.isPending || isSent}
          className="w-full bg-black text-white py-4 font-black uppercase text-sm tracking-[0.2em] italic hover:bg-zinc-800 transition-all disabled:bg-gray-300 shadow-lg mt-4 flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? "Sending..." : isSent ? "Check Your Email" : "Send Login Link"}
          {!isSent && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;