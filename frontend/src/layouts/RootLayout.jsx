import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ToastProvider } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';

const RootLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Hide the app's Navbar and Footer on the landing page —
  // Landing renders its own minimal nav and footer.
  const isLanding = location.pathname === '/' && !user;

  return (
    <div className="min-h-screen flex flex-col">
      <ToastProvider />
      {!isLanding && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isLanding && <Footer />}
    </div>
  );
};

export default RootLayout;
