'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Definir el tipo para el tenant
interface Tenant {
  id: string;
  name: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

// Definir el tipo para la configuración del tenant
interface TenantConfig {
  configType: string;
  settings: Record<string, any>;
  updatedAt: string;
}

// Definir el tipo para el contexto del tenant
interface TenantContextType {
  tenant: Tenant | null;
  config: Record<string, TenantConfig>;
  isLoading: boolean;
  error: string | null;
  fetchTenantConfig: (configType: string) => Promise<TenantConfig | null>;
  updateTenantConfig: (configType: string, settings: Record<string, any>) => Promise<void>;
}

// Crear el contexto del tenant
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Proveedor del contexto del tenant
export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [config, setConfig] = useState<Record<string, TenantConfig>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar la información del tenant cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTenantInfo();
    } else {
      setTenant(null);
      setConfig({});
    }
  }, [isAuthenticated, user]);

  // Función para obtener la información del tenant
  const fetchTenantInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Aquí se implementaría la llamada a la API para obtener la información del tenant
      // Por ahora, usamos datos de ejemplo basados en el usuario autenticado
      if (user && user.tenantId) {
        const tenantData: Tenant = {
          id: user.tenantId,
          name: `Tenant ${user.tenantId}`,
          status: 'ACTIVE',
          plan: 'STANDARD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setTenant(tenantData);
        
        // Cargar la configuración general del tenant
        await fetchTenantConfig('GENERAL');
      }
    } catch (error: any) {
      console.error('Error al obtener información del tenant:', error);
      setError(error.message || 'Error al obtener información del tenant');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener la configuración del tenant
  const fetchTenantConfig = async (configType: string): Promise<TenantConfig | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Aquí se implementaría la llamada a la API para obtener la configuración del tenant
      // Por ahora, usamos datos de ejemplo
      const configData: TenantConfig = {
        configType,
        settings: {
          theme: 'light',
          language: 'es',
          enabledFeatures: ['users', 'reports', 'settings'],
        },
        updatedAt: new Date().toISOString(),
      };
      
      // Actualizar el estado
      setConfig(prevConfig => ({
        ...prevConfig,
        [configType]: configData,
      }));
      
      return configData;
    } catch (error: any) {
      console.error(`Error al obtener configuración ${configType}:`, error);
      setError(error.message || `Error al obtener configuración ${configType}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar la configuración del tenant
  const updateTenantConfig = async (configType: string, settings: Record<string, any>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Aquí se implementaría la llamada a la API para actualizar la configuración del tenant
      // Por ahora, simulamos una actualización exitosa
      const updatedConfig: TenantConfig = {
        configType,
        settings,
        updatedAt: new Date().toISOString(),
      };
      
      // Actualizar el estado
      setConfig(prevConfig => ({
        ...prevConfig,
        [configType]: updatedConfig,
      }));
    } catch (error: any) {
      console.error(`Error al actualizar configuración ${configType}:`, error);
      setError(error.message || `Error al actualizar configuración ${configType}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    tenant,
    config,
    isLoading,
    error,
    fetchTenantConfig,
    updateTenantConfig,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

// Hook personalizado para usar el contexto del tenant
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
}
