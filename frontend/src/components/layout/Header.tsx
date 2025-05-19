import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

const Header: React.FC = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { tenant } = useTenant();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                {process.env.NEXT_PUBLIC_APP_NAME || 'Administrador Technoagentes'}
              </Link>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-indigo-500"
                >
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/tenants"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
                  >
                    Inquilinos
                  </Link>
                )}
                <Link
                  href="/users"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
                >
                  Usuarios
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
                >
                  Configuración
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={toggleProfileMenu}
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 text-white bg-indigo-600 rounded-full">
                        {user?.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{user?.email}</span>
                    </div>
                  </button>
                </div>
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-2 text-xs text-gray-500">
                      {tenant?.name || 'Mi Empresa'}
                      <div className="mt-1 text-xs font-medium text-indigo-600">
                        {tenant?.plan === 'BASIC' && 'Plan Básico'}
                        {tenant?.plan === 'STANDARD' && 'Plan Estándar'}
                        {tenant?.plan === 'PREMIUM' && 'Plan Premium'}
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Configuración
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center -mr-2 sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg
                className="block w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden">
          {isAuthenticated ? (
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard"
                className="block py-2 pl-3 pr-4 text-base font-medium text-indigo-700 border-l-4 border-indigo-500 bg-indigo-50"
              >
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/tenants"
                  className="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Inquilinos
                </Link>
              )}
              <Link
                href="/users"
                className="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Usuarios
              </Link>
              <Link
                href="/settings"
                className="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Configuración
              </Link>
            </div>
          ) : (
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/login"
                className="block py-2 pl-3 pr-4 text-base font-medium text-indigo-700 border-l-4 border-indigo-500 bg-indigo-50"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Registrarse
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 text-white bg-indigo-600 rounded-full">
                    {user?.email.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.email}</div>
                  <div className="text-sm font-medium text-gray-500">{tenant?.name || 'Mi Empresa'}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Configuración
                </Link>
                <button
                  onClick={signOut}
                  className="block w-full px-4 py-2 text-base font-medium text-left text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
