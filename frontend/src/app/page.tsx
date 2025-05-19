'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  // Redirigir a la página de inicio de sesión después de cargar la página
  useEffect(() => {
    // Pequeño retraso para permitir que la página se cargue completamente
    const timer = setTimeout(() => {
      // Usar window.location para una redirección directa en lugar de router.push
      window.location.href = '/login/';
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <h1 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Administrador Technoagentes
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Portal web empresarial multi-inquilino para gestionar agentes inteligentes de IA Generativa
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mt-8 space-y-4">
          <p className="text-center text-gray-500">
            Redirigiendo a la página de inicio de sesión...
          </p>
          <div className="w-8 h-8 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
          <a
            href="/login/"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ir a Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  );
}
