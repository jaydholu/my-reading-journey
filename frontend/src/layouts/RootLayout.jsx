import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ToastProvider } from '../components/common/Toast';

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ToastProvider />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;