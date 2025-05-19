'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { tenant, updateTenantConfig, isLoading: isTenantLoading } = useTenant();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [generalSettings, setGeneralSettings] = useState({
    name: '',
    email: '',
    logo: '',
    theme: 'default',
  });
  const [agentSettings, setAgentSettings] = useState({
    enabledAgents: [] as string[],
    usageLimits: {
      apiCalls: 1000,
      storage: 5,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setGeneralSettings({
        name: tenant.name || '',
        email: user?.email || '',
        logo: tenant.configuration?.uiSettings?.logo || '',
        theme: tenant.configuration?.uiSettings?.theme || 'default',
      });
      setAgentSettings({
        enabledAgents: tenant.configuration?.enabledAgents || [],
        usageLimits: tenant.configuration?.usageLimits || {
          apiCalls: 1000,
          storage: 5,
        },
      });
    }
  }, [tenant, user]);

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // En un escenario real, enviaríamos los datos a la API
      // Aquí simulamos la actualización para la demostración
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccessMessage('Configuración general guardada correctamente');
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al guardar la configuración general');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAgentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // En un escenario real, enviaríamos los datos a la API
      // Aquí simulamos la actualización para la demostración
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccessMessage('Configuración de agentes guardada correctamente');
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al guardar la configuración de agentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentToggle = (agentId: string) => {
    const isEnabled = agentSettings.enabledAgents.includes(agentId);
    
    if (isEnabled) {
      setAgentSettings({
        ...agentSettings,
        enabledAgents: agentSettings.enabledAgents.filter((id) => id !== agentId),
      });
    } else {
      setAgentSettings({
        ...agentSettings,
        enabledAgents: [...agentSettings.enabledAgents, agentId],
      });
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
          </div>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <div className="py-4">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                      activeTab === 'general'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab('agents')}
                    className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                      activeTab === 'agents'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Agentes
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                      activeTab === 'billing'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Facturación
                  </button>
                </nav>
              </div>

              {successMessage && (
                <div className="p-4 mt-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  {errorMessage}
                </div>
              )}

              {activeTab === 'general' && (
                <div className="mt-6">
                  <form onSubmit={handleSaveGeneralSettings}>
                    <div className="shadow sm:rounded-md sm:overflow-hidden">
                      <div className="px-4 py-5 bg-white sm:p-6">
                        <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                              Nombre de la Empresa
                            </label>
                            <input
                              type="text"
                              name="company-name"
                              id="company-name"
                              value={generalSettings.name}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={generalSettings.email}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                              URL del Logo
                            </label>
                            <input
                              type="text"
                              name="logo"
                              id="logo"
                              value={generalSettings.logo}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, logo: e.target.value })}
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                              Tema
                            </label>
                            <select
                              id="theme"
                              name="theme"
                              value={generalSettings.theme}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, theme: e.target.value })}
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="default">Predeterminado</option>
                              <option value="dark">Oscuro</option>
                              <option value="light">Claro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="mt-6">
                  <form onSubmit={handleSaveAgentSettings}>
                    <div className="shadow sm:rounded-md sm:overflow-hidden">
                      <div className="px-4 py-5 bg-white sm:p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">Agentes Disponibles</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Selecciona los agentes que deseas habilitar para tu empresa.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="agent-basic"
                                name="agent-basic"
                                type="checkbox"
                                checked={agentSettings.enabledAgents.includes('basic')}
                                onChange={() => handleAgentToggle('basic')}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="agent-basic" className="font-medium text-gray-700">
                                Asistente Básico
                              </label>
                              <p className="text-gray-500">Agente de IA para tareas generales y consultas básicas.</p>
                            </div>
                          </div>

                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="agent-customer-service"
                                name="agent-customer-service"
                                type="checkbox"
                                checked={agentSettings.enabledAgents.includes('customer-service')}
                                onChange={() => handleAgentToggle('customer-service')}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="agent-customer-service" className="font-medium text-gray-700">
                                Asistente de Servicio al Cliente
                              </label>
                              <p className="text-gray-500">
                                Agente especializado en atención al cliente y resolución de problemas.
                              </p>
                            </div>
                          </div>

                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="agent-sales"
                                name="agent-sales"
                                type="checkbox"
                                checked={agentSettings.enabledAgents.includes('sales')}
                                onChange={() => handleAgentToggle('sales')}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="agent-sales" className="font-medium text-gray-700">
                                Asistente de Ventas
                              </label>
                              <p className="text-gray-500">
                                Agente especializado en ventas y recomendaciones de productos.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">Límites de Uso</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Configura los límites de uso para tu empresa.
                          </p>
                        </div>

                        <div className="grid grid-cols-6 gap-6 mt-4">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="api-calls" className="block text-sm font-medium text-gray-700">
                              Llamadas API (por mes)
                            </label>
                            <input
                              type="number"
                              name="api-calls"
                              id="api-calls"
                              value={agentSettings.usageLimits.apiCalls}
                              onChange={(e) =>
                                setAgentSettings({
                                  ...agentSettings,
                                  usageLimits: {
                                    ...agentSettings.usageLimits,
                                    apiCalls: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="storage" className="block text-sm font-medium text-gray-700">
                              Almacenamiento (GB)
                            </label>
                            <input
                              type="number"
                              name="storage"
                              id="storage"
                              value={agentSettings.usageLimits.storage}
                              onChange={(e) =>
                                setAgentSettings({
                                  ...agentSettings,
                                  usageLimits: {
                                    ...agentSettings.usageLimits,
                                    storage: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="mt-6">
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="px-4 py-5 bg-white sm:p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Información de Facturación</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Detalles de tu plan actual y facturación.
                        </p>
                      </div>

                      <div className="p-4 mb-6 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">Plan Actual</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {tenant?.plan === 'BASIC' && 'Plan Básico'}
                              {tenant?.plan === 'STANDARD' && 'Plan Estándar'}
                              {tenant?.plan === 'PREMIUM' && 'Plan Premium'}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
                          >
                            Cambiar Plan
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-base font-medium text-gray-900">Historial de Facturación</h4>
                        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                >
                                  Fecha
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Descripción
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Monto
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6">
                                  01/05/2023
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  Plan Premium - Mayo 2023
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">$99.99</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap">
                                  <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                    Pagado
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6">
                                  01/04/2023
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  Plan Premium - Abril 2023
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">$99.99</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap">
                                  <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                    Pagado
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
