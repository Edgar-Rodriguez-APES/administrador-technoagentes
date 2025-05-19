import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchUserAttributes, resetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

// Definir el tipo para el usuario autenticado
interface AuthUser {
  username: string;
  email: string;
  tenantId: string;
  role: string;
  attributes?: Record<string, any>;
}

// Definir el tipo para el contexto de autenticación
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, tenantId: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Verificar el estado de autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthState();
  }, []);

  // Función para verificar el estado de autenticación
  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();

      setUser({
        username: currentUser.username,
        email: userAttributes.email || '',
        tenantId: userAttributes['custom:tenantId'] || '',
        role: userAttributes['custom:role'] || 'user',
        attributes: userAttributes,
      });
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para iniciar sesión
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signIn({ username: email, password });
      const userAttributes = await fetchUserAttributes();

      setUser({
        username: email,
        email: userAttributes.email || '',
        tenantId: userAttributes['custom:tenantId'] || '',
        role: userAttributes['custom:role'] || 'user',
        attributes: userAttributes,
      });
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrarse
  const handleSignUp = async (email: string, password: string, tenantId: string) => {
    try {
      setIsLoading(true);
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            'custom:tenantId': tenantId,
          },
        },
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para confirmar el registro
  const handleConfirmSignUp = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      await confirmSignUp({ username: email, confirmationCode: code });
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para recuperar la contraseña
  const handleForgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await resetPassword({ username: email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para restablecer la contraseña
  const handleResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await resetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
    } catch (error) {
      console.error('Error resetting password:', error);
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
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
