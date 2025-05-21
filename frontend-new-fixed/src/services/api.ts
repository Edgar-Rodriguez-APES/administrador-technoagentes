import { Auth } from 'aws-amplify';

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Tipos de errores de la API
export enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// Interfaz para errores de la API
export interface ApiError {
  type: ApiErrorType;
  message: string;
  details?: any;
}

// Función para obtener el token de autenticación
const getAuthToken = async (): Promise<string> => {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch (error) {
    console.error('Error al obtener el token de autenticación:', error);
    throw {
      type: ApiErrorType.UNAUTHORIZED,
      message: 'No autorizado. Por favor, inicia sesión nuevamente.',
    };
  }
};

// Función para realizar peticiones a la API
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  requiresAuth: boolean = true
): Promise<T> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autenticación si es necesario
    if (requiresAuth) {
      const token = await getAuthToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Configurar la petición
    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    // Realizar la petición
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Manejar errores HTTP
    if (!response.ok) {
      let errorType: ApiErrorType;
      let errorMessage: string;

      switch (response.status) {
        case 401:
          errorType = ApiErrorType.UNAUTHORIZED;
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 404:
          errorType = ApiErrorType.NOT_FOUND;
          errorMessage = 'Recurso no encontrado.';
          break;
        case 409:
          errorType = ApiErrorType.CONFLICT;
          errorMessage = 'Conflicto con el recurso existente.';
          break;
        case 422:
          errorType = ApiErrorType.VALIDATION_ERROR;
          errorMessage = 'Error de validación.';
          break;
        case 500:
          errorType = ApiErrorType.SERVER_ERROR;
          errorMessage = 'Error del servidor.';
          break;
        default:
          errorType = ApiErrorType.SERVER_ERROR;
          errorMessage = 'Error desconocido.';
      }

      // Intentar obtener detalles del error del cuerpo de la respuesta
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        // Si no se puede parsear el cuerpo, ignorar
      }

      throw {
        type: errorType,
        message: errorMessage,
        details: errorDetails,
      };
    }

    // Parsear la respuesta como JSON
    const result = await response.json();
    return result as T;
  } catch (error: any) {
    // Si el error ya está formateado, propagarlo
    if (error.type) {
      throw error;
    }

    // Si es un error de red, formatearlo
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw {
        type: ApiErrorType.NETWORK_ERROR,
        message: 'Error de red. Por favor, verifica tu conexión a internet.',
      };
    }

    // Para otros errores, formatearlos como error del servidor
    throw {
      type: ApiErrorType.SERVER_ERROR,
      message: error.message || 'Error desconocido.',
      details: error,
    };
  }
};

// Interfaces para los modelos de datos
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  status: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  sendInvitation?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  status?: string;
}

export interface CreateTenantRequest {
  name: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantRequest {
  name?: string;
  status?: string;
  settings?: Record<string, any>;
}

// Servicios para usuarios
export const UserService = {
  // Obtener todos los usuarios
  getUsers: async (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },

  // Obtener un usuario por ID
  getUser: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/users/${userId}`);
  },

  // Crear un nuevo usuario
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return apiRequest<User>('/users', 'POST', userData);
  },

  // Actualizar un usuario existente
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<User> => {
    return apiRequest<User>(`/users/${userId}`, 'PUT', userData);
  },

  // Eliminar un usuario
  deleteUser: async (userId: string): Promise<void> => {
    return apiRequest<void>(`/users/${userId}`, 'DELETE');
  },
};

// Servicios para tenants
export const TenantService = {
  // Obtener todos los tenants
  getTenants: async (): Promise<Tenant[]> => {
    return apiRequest<Tenant[]>('/tenants');
  },

  // Obtener un tenant por ID
  getTenant: async (tenantId: string): Promise<Tenant> => {
    return apiRequest<Tenant>(`/tenants/${tenantId}`);
  },

  // Crear un nuevo tenant
  createTenant: async (tenantData: CreateTenantRequest): Promise<Tenant> => {
    return apiRequest<Tenant>('/tenants', 'POST', tenantData);
  },

  // Actualizar un tenant existente
  updateTenant: async (tenantId: string, tenantData: UpdateTenantRequest): Promise<Tenant> => {
    return apiRequest<Tenant>(`/tenants/${tenantId}`, 'PUT', tenantData);
  },

  // Eliminar un tenant
  deleteTenant: async (tenantId: string): Promise<void> => {
    return apiRequest<void>(`/tenants/${tenantId}`, 'DELETE');
  },
};
