'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si requiere un rol específico y el usuario no lo tiene, redirigir al dashboard
    if (!isLoading && isAuthenticated && user && requiredRole) {
      const userRole = user.role;
      
      // Verificar si el usuario tiene el rol requerido
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;
      
      if (!hasRequiredRole) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no está autenticado o no tiene el rol requerido, no mostrar nada
  if (!isAuthenticated || (requiredRole && user && !Array.isArray(requiredRole) && user.role !== requiredRole)) {
    return null;
  }

  // Si está autenticado y tiene el rol requerido, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
