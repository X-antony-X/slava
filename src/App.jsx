import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from "./components/dataBase/supabaseClient";

// ... الـ imports اللي عندك ...
import CategoryPage from './components/pages/display/CategoryPage';
import Home from './components/pages/home/Home';
import Navbar from './components/header/NavBar';
import TopHeader from './components/header/TopHeader';
import PreFooter from './components/footer/PreFooter';
import Footer from './components/footer/Footer';
import CartPage from './components/pages/display/CartPage';
import AuthPage from './components/dataBase/auth/AuthPage';
import { AuthFormProvider } from './components/dataBase/auth/AuthFormContext';
import StoreLocator from './components/dataBase/auth/StoreLocator';
import UpdatePassword from './components/dataBase/auth/UpdatePassword';
import ProfilePage from "./components/dataBase/auth/ProfilePage";
import AdminLogin from "./components/dataBase/adminControl/AdminLogin";
import AdminDashboard from "./components/dataBase/adminControl/AdminDashboard";
import AdminGuard from "./components/dataBase/adminControl/AdminGuard"; 
import EditSecondSection from "./components/dataBase/adminControl/EditSecondSection";
import EditThirdSection from "./components/dataBase/adminControl/EditThirdSection";
import AddProductForm from "./components/dataBase/adminControl/AddProductForm"; // استيراد الفورم الجديد
import AboutSlava from "./components/pages/display/AboutSlava"; // استيراد صفحة About Slava
import ContactPage from './components/footer/ContactPage';
import Returns from './components/footer/Returns';
import AdminInventory from './components/dataBase/adminControl/AdminInventory'; // استيراد صفحة إدارة المخزون الجديدة

// 1. استيراد صفحة تعديل الـ Hero اللي عملناها
import EditHeroSection from "./components/dataBase/adminControl/EditHeroSection"; 

function AppContent({ session }) {
  const location = useLocation();
  
  // 2. تحديث شرط إخفاء الـ Header/Footer ليشمل أي مسار يبدأ بـ /admin
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/slava-admin-gate' || location.pathname === '/admin-dashboard';

  return (
    <>
      {!isAdminPage && (
        <>
          <TopHeader />
          <Navbar />
        </>
      )}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:categoryName" element={<CategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/location" element={<StoreLocator />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/slava" element={<AboutSlava />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/returns" element={<Returns />} />
        <Route 
          path="/account" 
          element={session ? <ProfilePage user={session.user} /> : <AuthPage />} 
        />
        
        {/* بوابة دخول الأدمن */}
        <Route path="/slava-admin-gate" element={<AdminLogin />} />
        
        {/* 3. مسارات الأدمن المحمية بالـ Guard */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } 
        />

        {/* مسار تعديل الـ Hero Section - محمي تماماً */}
        <Route 
          path="/admin/edit-hero" 
          element={
            <AdminGuard>
              <EditHeroSection />
            </AdminGuard>
          } 
        />

        <Route 
          path="/admin/edit-second-section" 
          element={
            <AdminGuard>
              <EditSecondSection />
            </AdminGuard>
          } 
        />

        <Route 
          path="/admin/edit-third-section" 
          element={
            <AdminGuard>
              <EditThirdSection />
            </AdminGuard>
          } 
        />

        <Route 
          path="/admin/add-product" 
          element={
            <AdminGuard>
              <AddProductForm />
            </AdminGuard>
          } 
        />

        <Route 
          path="/admin/inventory" 
          element={
            <AdminGuard>
              <AdminInventory />
            </AdminGuard>
          } 
        />

        {/* أي مسار مش موجود يرجع للهوم */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!isAdminPage && (
        <>
          <PreFooter />
          <Footer />
        </>
      )}
    </>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase tracking-[0.5em] italic">
      Slava Loading...
    </div>
  );

  return (
    <AuthFormProvider>
      <Router>
        <AppContent session={session} />
      </Router>
    </AuthFormProvider>
  );
}

export default App;