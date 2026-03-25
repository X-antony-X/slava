import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Password updated successfully! ✅", "success");
      setTimeout(() => navigate('/login'), 2000); // بيرجعه لصفحة اللوجن بعد النجاح
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative">
      {/* Toast Notification */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 flex items-center gap-3 px-6 py-4 shadow-2xl min-w-[320px] ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'} ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="text-[11px] font-black uppercase tracking-widest flex-1">{toast.message}</span>
      </div>

      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-[0.3em] italic mb-2">SLAVA</h2>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Update Your Account Password</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6 text-left">
          <div className="flex flex-col space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-900">New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-4 pl-12 pr-12 border border-gray-300 rounded-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                required
                minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] italic hover:bg-zinc-800 transition-all disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Confirm New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;