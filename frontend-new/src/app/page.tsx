'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">Administrador Technoagentes</h1>
            </div>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100"></div>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary mix-blend-multiply"></div>
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">Administra tus agentes</span>
                  <span className="block text-primary-light">de manera eficiente</span>
                </h2>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">
                  Plataforma de acceso para clientes a agentes inteligentes de IA Generativa.
                  Gestiona usuarios, tenants y configuraciones desde un solo lugar.
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                    <Link
                      href="/login"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-primary-light sm:px-8"
                    >
                      Iniciar sesión
                    </Link>
                    <a
                      href="#features"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-dark hover:bg-primary sm:px-8"
                    >
                      Conocer más
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Características */}
        <div id="features" className="py-16 bg-gray-100 overflow-hidden lg:py-24">
          <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
            <div className="relative">
              <h3 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Una plataforma completa para la gestión de agentes
              </h3>
              <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
                Administra todos los aspectos de tus agentes inteligentes desde un solo lugar.
              </p>
            </div>

            <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="relative">
                <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                  Gestión de usuarios y tenants
                </h4>
                <p className="mt-3 text-lg text-gray-500">
                  Administra usuarios, roles y permisos. Configura múltiples tenants con sus propias configuraciones.
                </p>

                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Gestión de usuarios</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      Crea, edita y elimina usuarios. Asigna roles y permisos específicos.
                    </dd>
                  </div>

                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multi-tenant</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      Arquitectura multi-inquilino con aislamiento de datos y configuraciones por tenant.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="relative mt-10 -mx-4 lg:mt-0">
                <div className="relative h-80 bg-white rounded-lg shadow-lg overflow-hidden sm:h-96">
                  <div className="h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-medium">Imagen de la plataforma</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; 2025 Technoagentes. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
