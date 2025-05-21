'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

// Componente de tarjeta de estadísticas
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')} text-${color.replace('border-', '')}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Componente de tarjeta de actividad reciente
interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, time, icon }) => (
  <div className="flex items-start space-x-4 py-3">
    <div className="bg-blue-100 p-2 rounded-full text-blue-500">{icon}</div>
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

// Iconos
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TenantsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ConfigIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Página de dashboard
export default function Dashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  // Obtener el saludo según la hora del día
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Buenos días';
    } else if (hour < 18) {
      newGreeting = 'Buenas tardes';
    } else {
      newGreeting = 'Buenas noches';
    }
    
    setGreeting(newGreeting);
  }, []);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div>
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user?.name?.split(' ')[0] || 'Usuario'}
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido al panel de administración de Technoagentes
            </p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Usuarios Activos"
              value="24"
              icon={<UsersIcon />}
              color="border-blue-500"
            />
            <StatCard
              title="Tenants"
              value="3"
              icon={<TenantsIcon />}
              color="border-purple-500"
            />
            <StatCard
              title="Configuraciones"
              value="8"
              icon={<ConfigIcon />}
              color="border-green-500"
            />
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="divide-y divide-gray-200">
              <ActivityItem
                title="Nuevo usuario creado"
                description="Se ha creado el usuario usuario@ejemplo.com"
                time="Hace 2 horas"
                icon={<ActivityIcon />}
              />
              <ActivityItem
                title="Configuración actualizada"
                description="Se ha actualizado la configuración general"
                time="Hace 5 horas"
                icon={<ActivityIcon />}
              />
              <ActivityItem
                title="Términos y condiciones aceptados"
                description="El usuario admin@ejemplo.com ha aceptado los términos y condiciones"
                time="Hace 1 día"
                icon={<ActivityIcon />}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
