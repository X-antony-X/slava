import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '../dataBase/auth/AuthFormContext';
import StoreLocator from '../dataBase/auth/StoreLocator';

const TopHeader = () => {
  const { setActiveForm } = useAuthForm();

  return (
    <nav className="hidden md:flex bg-[#f5f5f5] px-10 py-1 justify-between items-center text-[12px] font-medium text-gray-800 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Link to="/" className="cursor-pointer hover:opacity-70 font-bold">SLAVA</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="/location" 
          onClick={() => setActiveForm('login')} 
          className="hover:text-gray-500"
        >
          Find our Store
        </Link>        
        <span className="text-gray-300">|</span>
        
        {/* نربط اللينكات بصفحة الـ Auth ونحدد الفورم اللي تفتح */}
        <Link 
            to="/account" 
            onClick={() => setActiveForm('login')} 
            className="hover:text-gray-500"
          >
            My Account
          </Link>
          
          <span className="text-gray-300">|</span>
          
          {/* ده هيفتح صفحة الـ Auth على تاب الـ Join Us (لو مش مسجل) */}
          <Link 
            to="/account" 
            onClick={() => setActiveForm('join-us')} 
            className="hover:text-gray-500"
          >
            Sign Up
          </Link>
          
          <span className="text-gray-300">|</span>
          
          <Link 
            to="/account" 
            onClick={() => setActiveForm('login')} 
            className="hover:text-gray-500"
          >
            Sign In
          </Link>
      </div>
    </nav>
  );
};

export default TopHeader;