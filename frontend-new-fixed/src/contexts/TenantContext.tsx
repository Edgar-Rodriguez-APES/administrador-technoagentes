'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Definir la interfaz para el tenant
interface Tenant {
  id: string;
  name: string;
  status: string;
  settings?: Record<string, any>;
}

// Definir la interfaz para el contexto de tenant
interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
}

// Crear el contexto de tenant
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Proveedor del contexto de tenant
export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Cargar el tenant al cambiar el usuario
  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      loadTenant(user.tenantId);
    } else {
      setCurrentTenant(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Función para cargar el tenant
  const loadTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Aquí se haría una llamada a la API para obtener los datos del tenant
      // Por ahora, simulamos la respuesta
      const mockTenant: Tenant = {
        id: tenantId,
        name: 'Tenant de Ejemplo',
        status: 'ACTIVE',
        settings: {
          theme: 'light',
          language: 'es',
        },
      };
      
      setCurrentTenant(mockTenant);
    } catch (error: any) {
      console.error('Error al cargar el tenant:', error);
      setError(error.message || 'Error al cargar el tenant');
      setCurrentTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    currentTenant,
    isLoading,
    error,
    setCurrentTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

// Hook personalizado para usar el contexto de tenant
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
};
