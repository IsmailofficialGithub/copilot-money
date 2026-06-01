import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './Toast';
import { useStore } from '@/store/useStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <Header />
      
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-6 page-fade-in">
          {children}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};
