import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated ? (
        <div>
          <Sidebar />
          <div className="flex flex-col md:pl-64">
            <Header />
            <main className="flex-1">
              <div className="py-6">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div>
          <Header />
          <main>
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
