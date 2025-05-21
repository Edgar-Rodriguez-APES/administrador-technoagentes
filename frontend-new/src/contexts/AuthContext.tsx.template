'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchUserAttributes, resetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

// Definir el tipo para el usuario autenticado
interface AuthUser {
  username: string;
  email: string;
  tenantId: string;
  role: string;
  name: string;
  attributes?: Record<string, any>;
}

// Definir el tipo para el contexto de autenticación
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  confirmRegistration: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetUserPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    checkAuthState();
  }, []);

  // Función para verificar el estado de autenticación
  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener el usuario actual
      const currentUser = await getCurrentUser();
      
      // Obtener los atributos del usuario
      const userAttributes = await fetchUserAttributes();
      
      // Crear el objeto de usuario autenticado
      const authUser: AuthUser = {
        username: currentUser.username,
        email: userAttributes.email || '',
        tenantId: userAttributes['custom:tenantId'] || '',
        role: userAttributes['custom:role'] || 'User',
        name: userAttributes.name || '',
        attributes: userAttributes,
      };
      
      setUser(authUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al verificar el estado de autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Iniciar sesión con Cognito
      await signIn({ username: email, password });
      
      // Verificar el estado de autenticación
      await checkAuthState();
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cerrar sesión con Cognito
      await signOut();
      
      // Actualizar el estado
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirigir a la página de inicio
      router.push('/');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      setError(error.message || 'Error al cerrar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Registrar el usuario con Cognito
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
      
      // Redirigir a la página de confirmación
      router.push(`/confirm?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      setError(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para confirmar el registro
  const confirmRegistration = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Confirmar el registro con Cognito
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      
      // Redirigir a la página de inicio de sesión
      router.push('/login');
    } catch (error: any) {
      console.error('Error al confirmar registro:', error);
      setError(error.message || 'Error al confirmar registro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar restablecimiento de contraseña
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Solicitar restablecimiento de contraseña con Cognito
      await resetPassword({ username: email });
      
      // Redirigir a la página de restablecimiento de contraseña
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      setError(error.message || 'Error al solicitar restablecimiento de contraseña');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para restablecer la contraseña
  const resetUserPassword = async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Restablecer la contraseña con Cognito
      await resetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      
      // Redirigir a la página de inicio de sesión
      router.push('/login');
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      setError(error.message || 'Error al restablecer contraseña');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    confirmRegistration,
    forgotPassword,
    resetUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
