'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth } from 'aws-amplify';

// Definir la interfaz para el usuario
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
}

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  confirmRegistration: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Verificar el estado de autenticación al cargar la página
  useEffect(() => {
    checkAuthState();
  }, []);

  // Función para verificar el estado de autenticación
  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await Auth.currentAuthenticatedUser();
      
      // Obtener atributos del usuario
      const { attributes } = currentUser;
      const userGroups = currentUser.signInUserSession.accessToken.payload['cognito:groups'] || [];
      
      // Determinar el rol del usuario
      let role = 'User';
      if (userGroups.includes('Admin')) {
        role = 'Admin';
      }
      
      // Crear objeto de usuario
      const userData: User = {
        id: attributes.sub,
        email: attributes.email,
        name: attributes.name || attributes.email.split('@')[0],
        role,
        tenantId: attributes['custom:tenantId'],
      };
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
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
      
      // Iniciar sesión con Cognito
      await Auth.signIn(email, password);
      
      // Verificar el estado de autenticación
      await checkAuthState();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Cerrar sesión con Cognito
      await Auth.signOut();
      
      // Actualizar el estado
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Registrar usuario con Cognito
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name,
        },
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para confirmar el registro
  const confirmRegistration = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      
      // Confirmar registro con Cognito
      await Auth.confirmSignUp(email, code);
    } catch (error) {
      console.error('Error al confirmar registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar recuperación de contraseña
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Solicitar recuperación de contraseña con Cognito
      await Auth.forgotPassword(email);
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      // Restablecer contraseña con Cognito
      await Auth.forgotPasswordSubmit(email, code, newPassword);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    confirmRegistration,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
