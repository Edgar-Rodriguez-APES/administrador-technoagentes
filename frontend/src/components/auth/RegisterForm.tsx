import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TenantService, CreateTenantRequest } from '@/services/api';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [plan, setPlan] = useState('BASIC');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { signUp, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Create the tenant
      const tenantData: CreateTenantRequest = {
        name: tenantName,
        contactEmail: email, // Assuming email can be used as contactEmail for the tenant
        contactName: email.split('@')[0], // Or some other logic to derive a contact name
        plan: plan,
      };
      const newTenant = await TenantService.createTenant(tenantData);
      const tenantId = newTenant.id;

      await signUp(email, password, tenantId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Por favor, inténtalo de nuevo.');
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Registro Exitoso</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hemos enviado un código de verificación a tu correo electrónico. Por favor, verifica tu cuenta para continuar.
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push('/confirm-signup')}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Verificar Cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
        <p className="mt-2 text-sm text-gray-600">
          Regístrate para acceder al panel de administración
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
            Nombre de la Empresa
          </label>
          <input
            id="tenantName"
            name="tenantName"
            type="text"
            required
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Mi Empresa"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="********"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="********"
          />
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
            Plan
          </label>
          <select
            id="plan"
            name="plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="BASIC">Básico</option>
            <option value="STANDARD">Estándar</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>

      <div className="text-sm text-center text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Inicia Sesión
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
