'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { configureAmplify } from '@/config/amplify';

// Configurar fuente
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

// Configurar Amplify
configureAmplify();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Configurar el título y la descripción
  useEffect(() => {
    document.title = process.env.NEXT_PUBLIC_APP_NAME || 'Administrador Technoagentes';
  }, []);

  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-gray-100">
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
