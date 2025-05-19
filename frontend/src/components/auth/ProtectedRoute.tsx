import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (adminOnly && user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, adminOnly, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full loader border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || (adminOnly && user?.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
