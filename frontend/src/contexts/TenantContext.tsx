import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { TenantService, ConfigService, Tenant as ApiTenant, TenantConfig } from '@/services/api';

// Definir el tipo para el inquilino
interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  billingInfo?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    taxId?: string;
  };
  configuration?: {
    enabledAgents: string[];
    usageLimits: {
      apiCalls: number;
      storage: number;
    };
    uiSettings: {
      theme: string;
      logo: string | null;
    };
  };
}

// Definir el tipo para el contexto del inquilino
interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  fetchTenant: () => Promise<void>;
  updateTenantConfig: (configType: string, config: any) => Promise<void>;
}

// Crear el contexto del inquilino
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Proveedor del contexto del inquilino
export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Cargar los datos del inquilino cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTenant();
    }
  }, [isAuthenticated, user]);

  // Función para obtener los datos del inquilino
  const fetchTenant = async () => {
    if (!user?.tenantId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Obtener los datos del inquilino desde la API
      const tenantData = await TenantService.getCurrentTenant();

      // Obtener la configuración del inquilino
      const configData = await ConfigService.getConfig('general');

      setTenant({
        ...tenantData,
        tenantId: tenantData.id, // Mantener compatibilidad con el código existente
        configuration: configData.settings,
      });
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar la configuración del inquilino
  const updateTenantConfig = async (configType: string, config: any) => {
    if (!user?.tenantId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Actualizar la configuración del inquilino en la API
      await ConfigService.updateConfig(configType, {
        settings: config,
      });

      // Actualizar el estado local
      if (tenant) {
        setTenant({
          ...tenant,
          configuration: {
            ...tenant.configuration,
            [configType]: config,
          },
        });
      }
    } catch (error) {
      console.error(`Error updating tenant ${configType} configuration:`, error);
      setError(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    tenant,
    isLoading,
    error,
    fetchTenant,
    updateTenantConfig,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

// Hook personalizado para usar el contexto del inquilino
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
