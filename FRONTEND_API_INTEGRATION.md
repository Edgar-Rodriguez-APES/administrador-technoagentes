# Integración del Frontend con la API Gateway

Este documento describe cómo se ha integrado el frontend de la aplicación Administrador Technoagentes con la API Gateway de AWS.

## Configuración de la API

La integración con la API Gateway se realiza a través de AWS Amplify, que proporciona una forma sencilla de interactuar con los servicios de AWS desde el frontend.

### Configuración de Amplify

El archivo `frontend/src/config/amplify.ts` contiene la configuración de Amplify para conectarse a la API Gateway:

```typescript
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-1',
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    }
  },
  API: {
    REST: {
      TechnoagentesAPI: {
        endpoint: process.env.NEXT_PUBLIC_API_URL,
        region: 'us-east-1',
        customHeaders: async () => {
          try {
            const session = await fetchAuthSession();
            return {
              Authorization: session.tokens?.idToken?.toString() || '',
            };
          } catch (error) {
            console.error('Error getting auth token for API request:', error);
            return {};
          }
        },
      }
    }
  }
};
```

Esta configuración:
1. Conecta el frontend con el User Pool de Cognito para la autenticación
2. Configura la API Gateway con la URL proporcionada en las variables de entorno
3. Adjunta automáticamente el token de autenticación a todas las solicitudes a la API

## Servicios de API

Los servicios para interactuar con la API están definidos en el archivo `frontend/src/services/api.ts`. Estos servicios proporcionan métodos para realizar operaciones CRUD en los diferentes recursos de la aplicación.

### Servicio de Usuarios

```typescript
export const UserService = {
  // Obtener todos los usuarios del inquilino
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await client.get(API_NAME, '/tenants/users', {});
      return response.users || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Crear un nuevo usuario
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
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
      await client.del(API_NAME, `/tenants/users/${userId}`, {});
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
```

### Servicio de Configuración

```typescript
export const ConfigService = {
  // Obtener la configuración del inquilino
  getConfig: async (configType: string): Promise<TenantConfig> => {
    try {
      const response = await client.get(API_NAME, `/tenants/configurations/${configType}`, {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Actualizar la configuración del inquilino
  updateConfig: async (configType: string, configData: any): Promise<TenantConfig> => {
    try {
      const response = await client.put(API_NAME, `/tenants/configurations/${configType}`, {
        body: configData,
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
```

### Servicio de Términos y Condiciones

```typescript
export const TCService = {
  // Verificar la aceptación de términos y condiciones
  checkAcceptance: async (): Promise<TCAcceptanceStatus> => {
    try {
      const response = await client.get(API_NAME, '/tc-acceptance', {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Registrar la aceptación de términos y condiciones
  recordAcceptance: async (): Promise<TCAcceptanceStatus> => {
    try {
      const response = await client.post(API_NAME, '/tc-acceptance', {});
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
```

## Integración en los Componentes

Los componentes de la aplicación utilizan estos servicios para interactuar con la API. Por ejemplo, la página de usuarios (`frontend/src/app/users/page.tsx`) utiliza el servicio de usuarios para obtener, crear y eliminar usuarios:

```typescript
// Obtener usuarios
const fetchUsers = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Obtener usuarios desde la API
    const apiUsers = await UserService.getUsers();
    
    // Mapear los datos de la API al formato que espera nuestro componente
    const formattedUsers: User[] = apiUsers.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status || 'ACTIVE',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt
    }));
    
    setUsers(formattedUsers);
  } catch (err: any) {
    // Manejo de errores
  }
};

// Crear usuario
const handleAddUser = async (e: React.FormEvent) => {
  try {
    // Crear usuario a través de la API
    const userData = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      sendInvitation: true
    };
    
    const createdUser = await UserService.createUser(userData);
    
    // Actualizar la interfaz de usuario
  } catch (err: any) {
    // Manejo de errores
  }
};

// Eliminar usuario
const handleDeleteUser = async (userId: string) => {
  try {
    // Eliminar usuario a través de la API
    await UserService.deleteUser(userId);
    
    // Actualizar la interfaz de usuario
  } catch (err: any) {
    // Manejo de errores
  }
};
```

## Configuración de CORS

Para permitir que el frontend se comunique con la API Gateway, se ha configurado CORS tanto en el frontend como en la API Gateway:

### CORS en el Frontend

El archivo `frontend/next.config.js` contiene la configuración de CORS para el frontend:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET,POST,PUT,DELETE,OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
      ],
    },
  ];
},
```

### CORS en la API Gateway

La API Gateway también tiene configurado CORS para permitir solicitudes desde cualquier origen. Esto se ha configurado mediante métodos OPTIONS en cada endpoint que responden con las cabeceras CORS adecuadas.

## Manejo de Errores

La aplicación incluye un sistema de manejo de errores que captura y procesa los errores de la API de manera consistente. Esto permite mostrar mensajes de error significativos al usuario y realizar acciones de recuperación cuando sea posible.

## Fallback a Datos de Demostración

Para mejorar la experiencia del usuario durante el desarrollo, la aplicación incluye un mecanismo de fallback a datos de demostración cuando la API no está disponible. Esto permite probar la interfaz de usuario incluso cuando la API está en desarrollo o no está accesible.

```typescript
if (err.type === ApiErrorType.NETWORK_ERROR || err.type === ApiErrorType.NOT_FOUND) {
  // Usar datos de demostración
  const mockUsers = [
    // ...
  ];
  
  setUsers(mockUsers);
  setError('Usando datos de demostración: La API no está disponible');
}
```

## Próximos Pasos

1. **Implementar Autenticación Completa**: Integrar completamente el flujo de autenticación con Cognito, incluyendo registro, inicio de sesión y recuperación de contraseña.

2. **Mejorar el Manejo de Errores**: Implementar un sistema más robusto de manejo de errores con reintentos y recuperación automática.

3. **Implementar Paginación**: Añadir soporte para paginación en las solicitudes que devuelven grandes conjuntos de datos.

4. **Implementar Caché**: Añadir caché del lado del cliente para mejorar el rendimiento y reducir las solicitudes a la API.

5. **Añadir Pruebas**: Implementar pruebas automatizadas para los servicios de API y los componentes que los utilizan.
