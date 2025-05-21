import { get, post, put, del } from 'aws-amplify/api';

// Nombre de la API configurada en Amplify
const API_NAME = 'TechnoagentesAPI';

// Tipos de errores de API
export enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Clase de error personalizada para la API
export class ApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
  details?: any;

  constructor(message: string, type: ApiErrorType, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Función para manejar errores de la API
const handleApiError = (error: any): ApiError => {
  console.error('API Error:', error);

  // Extraer información del error
  const statusCode = error.response?.status;
  const errorData = error.response?.data;

  // Determinar el tipo de error según el código de estado
  switch (statusCode) {
    case 401:
      return new ApiError(
        'No autorizado. Por favor, inicia sesión nuevamente.',
        ApiErrorType.UNAUTHORIZED,
        statusCode,
        errorData
      );
    case 403:
      return new ApiError(
        'No tienes permisos para realizar esta acción.',
        ApiErrorType.FORBIDDEN,
        statusCode,
        errorData
      );
    case 404:
      return new ApiError(
        'El recurso solicitado no existe.',
        ApiErrorType.NOT_FOUND,
        statusCode,
        errorData
      );
    case 409:
      return new ApiError(
        'Conflicto con el estado actual del recurso.',
        ApiErrorType.CONFLICT,
        statusCode,
        errorData
      );
    case 422:
      return new ApiError(
        'Error de validación. Por favor, verifica los datos ingresados.',
        ApiErrorType.VALIDATION_ERROR,
        statusCode,
        errorData
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new ApiError(
        'Error en el servidor. Por favor, intenta más tarde.',
        ApiErrorType.SERVER_ERROR,
        statusCode,
        errorData
      );
    default:
      return new ApiError(
        'Error desconocido. Por favor, intenta más tarde.',
        ApiErrorType.UNKNOWN_ERROR,
        statusCode,
        errorData
      );
  }
};

// Interfaces para los datos de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  preferences?: Record<string, any>;
  sendInvitation?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  status?: string;
  preferences?: Record<string, any>;
}

// Interfaces para configuraciones
export interface TenantConfig {
  configType: string;
  settings: Record<string, any>;
  updatedAt: string;
}

// Servicio de usuarios
export const UserService = {
  // Obtener todos los usuarios del inquilino
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await get({
        apiName: API_NAME,
        path: '/tenants/users',
      }).response;
      
      const data = await response.body.json();
      return data.users || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      const response = await post({
        apiName: API_NAME,
        path: '/tenants/users',
        options: {
          body: userData,
        },
      }).response;
      
      const data = await response.body.json();
      return data.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar un usuario existente
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<User> => {
    try {
      const response = await put({
        apiName: API_NAME,
        path: `/tenants/users/${userId}`,
        options: {
          body: userData,
        },
      }).response;
      
      const data = await response.body.json();
      return data.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Eliminar un usuario
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await del({
        apiName: API_NAME,
        path: `/tenants/users/${userId}`,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Servicio de configuraciones
export const ConfigService = {
  // Obtener configuración del inquilino
  getConfig: async (configType: string): Promise<TenantConfig> => {
    try {
      const response = await get({
        apiName: API_NAME,
        path: `/tenants/configurations/${configType}`,
      }).response;
      
      const data = await response.body.json();
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar configuración del inquilino
  updateConfig: async (configType: string, settings: Record<string, any>): Promise<TenantConfig> => {
    try {
      const response = await put({
        apiName: API_NAME,
        path: `/tenants/configurations/${configType}`,
        options: {
          body: { settings },
        },
      }).response;
      
      const data = await response.body.json();
      return data.config;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Servicio de términos y condiciones
export const TCService = {
  // Verificar aceptación de términos y condiciones
  checkAcceptance: async (version?: string): Promise<{ hasAccepted: boolean; termsVersion: string }> => {
    try {
      const queryParams = version ? `?version=${version}` : '';
      const response = await get({
        apiName: API_NAME,
        path: `/tc-acceptance${queryParams}`,
      }).response;
      
      const data = await response.body.json();
      return {
        hasAccepted: data.hasAccepted,
        termsVersion: data.termsVersion,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Registrar aceptación de términos y condiciones
  acceptTerms: async (termsVersion: string): Promise<void> => {
    try {
      await post({
        apiName: API_NAME,
        path: '/tc-acceptance',
        options: {
          body: { termsVersion },
        },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
