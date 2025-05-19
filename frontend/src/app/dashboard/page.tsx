'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useApi } from '@/hooks/useApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { get, isLoading } = useApi();
  const [stats, setStats] = useState({
    users: 0,
    agents: 0,
    apiCalls: 0,
    storage: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // En un escenario real, obtendríamos estas estadísticas de la API
        // Aquí simulamos datos para la demostración
        setStats({
          users: 5,
          agents: 3,
          apiCalls: 1250,
          storage: 2.5,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
            <div className="py-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900">Bienvenido, {user?.email}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {tenant?.name ? `Empresa: ${tenant.name}` : 'Cargando información del inquilino...'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {tenant?.plan ? `Plan: ${tenant.plan}` : 'Cargando información del plan...'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 w-0 ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Usuarios</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.users}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 w-0 ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Agentes</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.agents}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 w-0 ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Llamadas API</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.apiCalls}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 w-0 ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Almacenamiento (GB)</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.storage}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Actividad Reciente</h2>
                <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    <li>
                      <div className="block px-4 py-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">Nuevo usuario creado</p>
                              <p className="mt-2 text-sm text-gray-500">
                                <span className="font-medium">Juan Pérez</span> fue agregado como usuario.
                              </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-5">
                              <p className="text-sm text-gray-500">Hace 2 horas</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="block px-4 py-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">Configuración actualizada</p>
                              <p className="mt-2 text-sm text-gray-500">
                                Se actualizó la configuración del agente <span className="font-medium">Asistente Virtual</span>.
                              </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-5">
                              <p className="text-sm text-gray-500">Ayer</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="block px-4 py-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">Plan actualizado</p>
                              <p className="mt-2 text-sm text-gray-500">
                                El plan fue actualizado a <span className="font-medium">Premium</span>.
                              </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-5">
                              <p className="text-sm text-gray-500">Hace 3 días</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
