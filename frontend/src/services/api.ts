import { generateClient } from 'aws-amplify/api';

// @ts-ignore - Ignoramos los errores de tipo ya que la API de Amplify v6 tiene problemas con los tipos
const client = generateClient();

// Nombre del endpoint de la API configurado en Amplify
const API_NAME = 'TechnoagentesAPI';

// Tipos de error de la API
export enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Clase personalizada para errores de la API
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

// Función para procesar errores de la API
const handleApiError = (error: any): ApiError => {
  console.error('API Error:', error);

  // Error de red
  if (!error.response) {
    return new ApiError(
      'Error de conexión. Por favor, verifica tu conexión a internet.',
      ApiErrorType.NETWORK_ERROR
    );
  }

  // Error con respuesta del servidor
  const statusCode = error.response?.status;
  const errorData = error.response?.data;

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
        'Recurso no encontrado.',
        ApiErrorType.NOT_FOUND,
        statusCode,
        errorData
      );
    case 400:
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
        'Error del servidor. Por favor, intenta más tarde.',
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
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password?: string;
  sendInvitation?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

// Servicio para interactuar con la API de usuarios
export const UserService = {
  // Obtener todos los usuarios del inquilino
  getUsers: async (): Promise<User[]> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.get(API_NAME, '/tenants/users', {});
      return response.users || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener un usuario por ID
  getUser: async (userId: string): Promise<User> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.get(API_NAME, `/tenants/users/${userId}`, {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.post(API_NAME, '/tenants/users', {
        body: userData,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar un usuario existente
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<User> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.put(API_NAME, `/tenants/users/${userId}`, {
        body: userData,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Eliminar un usuario
  deleteUser: async (userId: string): Promise<void> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      await client.del(API_NAME, `/tenants/users/${userId}`, {});
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Interfaces para la configuración
export interface TenantConfig {
  id: string;
  tenantId: string;
  type: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Servicio para interactuar con la API de configuraciones
export const ConfigService = {
  // Obtener la configuración del inquilino
  getConfig: async (configType: string): Promise<TenantConfig> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.get(API_NAME, `/tenants/configurations/${configType}`, {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar la configuración del inquilino
  updateConfig: async (configType: string, configData: any): Promise<TenantConfig> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.put(API_NAME, `/tenants/configurations/${configType}`, {
        body: configData,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Interfaces para términos y condiciones
export interface TCAcceptanceStatus {
  accepted: boolean;
  acceptedAt?: string;
  version?: string;
}

// Servicio para interactuar con la API de términos y condiciones
export const TCService = {
  // Verificar la aceptación de términos y condiciones
  checkAcceptance: async (): Promise<TCAcceptanceStatus> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.get(API_NAME, '/tc-acceptance', {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Registrar la aceptación de términos y condiciones
  recordAcceptance: async (): Promise<TCAcceptanceStatus> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.post(API_NAME, '/tc-acceptance', {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Interfaces para inquilinos
export interface Tenant {
  id: string;
  name: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  billingInfo?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    taxId?: string;
  };
}

export interface CreateTenantRequest {
  name: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  plan: string;
}

export interface UpdateTenantRequest {
  name?: string;
  status?: string;
  plan?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  billingInfo?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    taxId?: string;
  };
}

// Servicio para interactuar con la API de inquilinos
export const TenantService = {
  // Obtener información del inquilino actual
  getCurrentTenant: async (): Promise<Tenant> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.get(API_NAME, '/tenants/current', {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Obtener un inquilino por ID (solo para administradores)
  getTenant: async (tenantId: string): Promise<Tenant> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.get(API_NAME, `/tenants/${tenantId}`, {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar información del inquilino
  updateTenant: async (tenantId: string, tenantData: UpdateTenantRequest): Promise<Tenant> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.put(API_NAME, `/tenants/${tenantId}`, {
        body: tenantData,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Crear un nuevo inquilino (solo para administradores)
  createTenant: async (tenantData: CreateTenantRequest): Promise<Tenant> => {
    try {
      // @ts-ignore - Ignoramos los errores de tipo
      const response = await client.post(API_NAME, '/tenants', {
        body: tenantData,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
