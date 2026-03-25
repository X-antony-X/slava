import React from 'react';
import { useAuthForm } from './AuthFormContext';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const AuthPage = () => {
  const { activeForm, setActiveForm } = useAuthForm();

  return (
    <div className="bg-white min-h-screen font-sans text-black selection:bg-black selection:text-white">
      <main className="max-w-[1400px] mx-auto px-4 md:px-10 py-12 md:py-20 flex flex-col items-center">
        
        <h1 className="text-3xl md:text-5xl font-black uppercase mb-12 tracking-tighter italic">
          My Account
        </h1>

        {/* Tab Switcher */}
        <div className="flex w-full max-w-[450px] border-b border-gray-100 mb-10 relative">
          <button
            onClick={() => setActiveForm("login")}
            className={`flex-1 text-center py-4 font-black text-[13px] uppercase tracking-[0.2em] transition-colors relative z-10 
              ${activeForm === 'login' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveForm("join-us")}
            className={`flex-1 text-center py-4 font-black text-[13px] uppercase tracking-[0.2em] transition-colors relative z-10 
              ${activeForm === 'join-us' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
          >
            Join Us
          </button>
          
          {/* Animated Underline */}
          <div className={`absolute bottom-0 h-[3px] bg-black transition-all duration-500 ease-in-out w-1/2 
            ${activeForm === 'login' ? 'left-0' : 'left-1/2'}`} 
          />
        </div>

        {/* Dynamic Form Content */}
        <div className="w-full max-w-[450px] transition-all duration-500 ease-in-out">
          {activeForm === 'login' ? <LoginForm /> : <SignUpForm />}
        </div>
      </main>

      <footer className="border-t border-gray-50 mt-20 py-12 px-4 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
          By continuing, you confirm that you have read and accept the 
          <a href="#" className="text-black underline ml-1">Terms and Conditions</a> and the 
          <a href="#" className="text-black underline ml-1">Privacy Policy</a>.
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;