# API Reference

Este documento proporciona una referencia detallada de las APIs disponibles en el sistema Administrador Technoagentes.

## Autenticación

Todas las APIs (excepto webhooks) requieren autenticación mediante token JWT de Amazon Cognito. El token debe incluirse en el encabezado `Authorization` de la solicitud HTTP.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token JWT debe contener los siguientes claims:
- `sub`: ID único del usuario
- `email`: Correo electrónico del usuario
- `custom:tenantId`: ID del inquilino al que pertenece el usuario
- `cognito:groups`: Grupos a los que pertenece el usuario (para determinar roles)

## Formato de Respuesta

Todas las respuestas de la API siguen un formato estándar:

### Respuesta Exitosa

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": {
    // Datos específicos de la respuesta
  }
}
```

### Respuesta de Error

```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": {
    "error": {
      "code": "BAD_REQUEST",
      "message": "Mensaje de error específico"
    }
  }
}
```

## API de Gestión de Usuarios

### Listar Usuarios

Obtiene la lista de usuarios pertenecientes al inquilino del usuario autenticado.

**Endpoint:** `GET /tenants/users`

**Parámetros de consulta:**
- `limit` (opcional): Número máximo de usuarios a devolver (por defecto: 50)
- `paginationToken` (opcional): Token para paginación

**Respuesta:**
```json
{
  "users": [
    {
      "username": "usuario@empresa.com",
      "email": "usuario@empresa.com",
      "name": "Usuario Ejemplo",
      "tenantId": "tenant-123",
      "role": "Admin",
      "status": "CONFIRMED",
      "enabled": true,
      "created": "2023-08-15T10:30:00Z"
    },
    {
      "username": "otro@empresa.com",
      "email": "otro@empresa.com",
      "name": "Otro Usuario",
      "tenantId": "tenant-123",
      "role": "User",
      "status": "CONFIRMED",
      "enabled": true,
      "created": "2023-08-16T14:20:00Z"
    }
  ],
  "paginationToken": "abc123..."
}
```

**Códigos de estado:**
- `200 OK`: La solicitud se completó correctamente
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para listar usuarios
- `500 Internal Server Error`: Error interno del servidor

### Obtener Usuario

Obtiene información detallada de un usuario específico.

**Endpoint:** `GET /tenants/users/{userId}`

**Parámetros de ruta:**
- `userId`: ID (email) del usuario a obtener

**Respuesta:**
```json
{
  "username": "usuario@empresa.com",
  "email": "usuario@empresa.com",
  "name": "Usuario Ejemplo",
  "tenantId": "tenant-123",
  "role": "Admin",
  "status": "CONFIRMED",
  "enabled": true,
  "created": "2023-08-15T10:30:00Z",
  "profile": {
    "email": "usuario@empresa.com",
    "name": "Usuario Ejemplo",
    "role": "Admin",
    "preferences": {
      "theme": "dark",
      "language": "es"
    },
    "lastLogin": "2023-08-20T08:45:00Z",
    "createdAt": "2023-08-15T10:30:00Z",
    "updatedAt": "2023-08-20T08:45:00Z"
  }
}
```

**Códigos de estado:**
- `200 OK`: La solicitud se completó correctamente
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para ver este usuario o el usuario pertenece a otro inquilino
- `404 Not Found`: El usuario especificado no existe
- `500 Internal Server Error`: Error interno del servidor

### Crear Usuario

Crea un nuevo usuario en el inquilino del usuario autenticado.

**Endpoint:** `POST /tenants/users`

**Cuerpo de la solicitud:**
```json
{
  "email": "nuevo@empresa.com",
  "name": "Nuevo Usuario",
  "role": "User",
  "preferences": {
    "theme": "light",
    "language": "es"
  }
}
```

**Respuesta:**
```json
{
  "message": "User created successfully",
  "user": {
    "username": "nuevo@empresa.com",
    "userStatus": "FORCE_CHANGE_PASSWORD",
    "created": "2023-08-21T15:30:00Z",
    "tenantId": "tenant-123",
    "role": "User",
    "temporaryPassword": "Abc123!@#"
  }
}
```

**Códigos de estado:**
- `201 Created`: El usuario se creó correctamente
- `400 Bad Request`: Datos de solicitud inválidos
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para crear usuarios
- `409 Conflict`: Ya existe un usuario con ese email
- `500 Internal Server Error`: Error interno del servidor

### Actualizar Usuario

Actualiza la información de un usuario existente.

**Endpoint:** `PUT /tenants/users/{userId}`

**Parámetros de ruta:**
- `userId`: ID (email) del usuario a actualizar

**Cuerpo de la solicitud:**
```json
{
  "name": "Nombre Actualizado",
  "role": "Admin",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Respuesta:**
```json
{
  "message": "User updated successfully",
  "userId": "usuario@empresa.com"
}
```

**Códigos de estado:**
- `200 OK`: El usuario se actualizó correctamente
- `400 Bad Request`: Datos de solicitud inválidos
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para actualizar este usuario o el usuario pertenece a otro inquilino
- `404 Not Found`: El usuario especificado no existe
- `500 Internal Server Error`: Error interno del servidor

### Eliminar Usuario

Elimina un usuario existente.

**Endpoint:** `DELETE /tenants/users/{userId}`

**Parámetros de ruta:**
- `userId`: ID (email) del usuario a eliminar

**Respuesta:**
```json
{
  "message": "User deleted successfully",
  "userId": "usuario@empresa.com"
}
```

**Códigos de estado:**
- `200 OK`: El usuario se eliminó correctamente
- `400 Bad Request`: No se puede eliminar el propio usuario
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para eliminar este usuario o el usuario pertenece a otro inquilino
- `404 Not Found`: El usuario especificado no existe
- `500 Internal Server Error`: Error interno del servidor

## API de Configuración

### Listar Configuraciones

Obtiene todas las configuraciones del inquilino del usuario autenticado.

**Endpoint:** `GET /tenants/configurations`

**Respuesta:**
```json
{
  "tenantId": "tenant-123",
  "configurations": [
    {
      "PK": "TENANT#tenant-123",
      "SK": "CONFIG#agents",
      "tenantId": "tenant-123",
      "configType": "agents",
      "data": {
        "basic": {
          "enabled": true,
          "maxCalls": 1000
        },
        "advanced": {
          "enabled": false,
          "maxCalls": 0
        }
      },
      "createdAt": "2023-08-15T10:30:00Z",
      "updatedAt": "2023-08-15T10:30:00Z"
    },
    {
      "PK": "TENANT#tenant-123",
      "SK": "CONFIG#limits",
      "tenantId": "tenant-123",
      "configType": "limits",
      "data": {
        "apiCalls": 1000,
        "storage": 5
      },
      "createdAt": "2023-08-15T10:30:00Z",
      "updatedAt": "2023-08-15T10:30:00Z"
    },
    {
      "PK": "TENANT#tenant-123",
      "SK": "CONFIG#ui",
      "tenantId": "tenant-123",
      "configType": "ui",
      "data": {
        "theme": "default",
        "logo": null,
        "customization": false,
        "whiteLabeling": false
      },
      "createdAt": "2023-08-15T10:30:00Z",
      "updatedAt": "2023-08-15T10:30:00Z"
    }
  ]
}
```

**Códigos de estado:**
- `200 OK`: La solicitud se completó correctamente
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para ver configuraciones
- `500 Internal Server Error`: Error interno del servidor

### Obtener Configuración

Obtiene una configuración específica del inquilino del usuario autenticado.

**Endpoint:** `GET /tenants/configurations/{configType}`

**Parámetros de ruta:**
- `configType`: Tipo de configuración (agents, limits, ui)

**Respuesta:**
```json
{
  "tenantId": "tenant-123",
  "configType": "agents",
  "data": {
    "basic": {
      "enabled": true,
      "maxCalls": 1000
    },
    "advanced": {
      "enabled": false,
      "maxCalls": 0
    }
  },
  "createdAt": "2023-08-15T10:30:00Z",
  "updatedAt": "2023-08-15T10:30:00Z"
}
```

**Códigos de estado:**
- `200 OK`: La solicitud se completó correctamente
- `400 Bad Request`: Tipo de configuración inválido
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para ver configuraciones
- `500 Internal Server Error`: Error interno del servidor

### Actualizar Configuración

Actualiza una configuración específica del inquilino del usuario autenticado.

**Endpoint:** `PUT /tenants/configurations/{configType}`

**Parámetros de ruta:**
- `configType`: Tipo de configuración (agents, limits, ui)

**Cuerpo de la solicitud (para configType=agents):**
```json
{
  "basic": {
    "enabled": true,
    "maxCalls": 2000
  },
  "advanced": {
    "enabled": true,
    "maxCalls": 500
  }
}
```

**Cuerpo de la solicitud (para configType=limits):**
```json
{
  "apiCalls": 2000,
  "storage": 10
}
```

**Cuerpo de la solicitud (para configType=ui):**
```json
{
  "theme": "dark",
  "logo": "https://example.com/logo.png",
  "customization": true,
  "whiteLabeling": false
}
```

**Respuesta:**
```json
{
  "message": "Configuration updated successfully",
  "config": {
    "tenantId": "tenant-123",
    "configType": "agents",
    "data": {
      "basic": {
        "enabled": true,
        "maxCalls": 2000
      },
      "advanced": {
        "enabled": true,
        "maxCalls": 500
      }
    },
    "updatedAt": "2023-08-21T15:45:00Z"
  }
}
```

**Códigos de estado:**
- `200 OK`: La configuración se actualizó correctamente
- `400 Bad Request`: Tipo de configuración inválido o datos de solicitud inválidos
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para actualizar configuraciones
- `500 Internal Server Error`: Error interno del servidor

## API de Términos y Condiciones

### Verificar Aceptación

Verifica si el usuario autenticado ha aceptado una versión específica de los términos y condiciones.

**Endpoint:** `GET /tc-acceptance`

**Parámetros de consulta:**
- `version` (opcional): Versión de los términos (por defecto: "latest")

**Respuesta:**
```json
{
  "userId": "usuario@empresa.com",
  "tenantId": "tenant-123",
  "termsVersion": "1.0",
  "hasAccepted": true
}
```

**Códigos de estado:**
- `200 OK`: La solicitud se completó correctamente
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `500 Internal Server Error`: Error interno del servidor

### Registrar Aceptación

Registra la aceptación de los términos y condiciones por parte del usuario autenticado.

**Endpoint:** `POST /tc-acceptance`

**Cuerpo de la solicitud:**
```json
{
  "termsVersion": "1.0"
}
```

**Respuesta:**
```json
{
  "message": "Terms and conditions acceptance recorded successfully",
  "acceptance": {
    "userId": "usuario@empresa.com",
    "tenantId": "tenant-123",
    "termsVersion": "1.0",
    "acceptanceTimestamp": "2023-08-21T16:20:00Z"
  }
}
```

**Códigos de estado:**
- `201 Created`: La aceptación se registró correctamente
- `400 Bad Request`: Datos de solicitud inválidos
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `500 Internal Server Error`: Error interno del servidor

## API de Webhooks

### Webhook de Pago

Procesa eventos de webhook de Treli.

**Endpoint:** `POST /webhooks/payment`

**Encabezados:**
- `treli-signature`: Firma del webhook proporcionada por Treli

**Cuerpo de la solicitud:**
El cuerpo de la solicitud es el evento de Treli en formato JSON.

**Respuesta:**
```json
{
  "message": "Webhook processed successfully",
  "result": {
    "received": true,
    "eventType": "subscription.updated",
    "eventId": "evt_123456789"
  }
}
```

**Códigos de estado:**
- `200 OK`: El webhook se procesó correctamente o se ignoró (para evitar reintentos)
- `400 Bad Request`: Datos de solicitud inválidos o firma inválida
- `500 Internal Server Error`: Error interno del servidor

## API de Onboarding

### Iniciar Onboarding

Inicia el proceso de onboarding para un nuevo inquilino.

**Endpoint:** `POST /onboarding`

**Cuerpo de la solicitud:**
```json
{
  "name": "Empresa ABC",
  "email": "admin@empresa.com",
  "plan": "STANDARD",
  "address": "Calle Principal 123",
  "phone": "+1234567890",
  "paymentToken": "payment_method_token123",
  "metadata": {
    "industry": "Technology",
    "employees": 50
  }
}
```

**Respuesta:**
```json
{
  "tenantId": "tenant-123",
  "executionArn": "arn:aws:states:us-east-1:123456789012:execution:TenantOnboardingStateMachine:execution123",
  "startDate": "2023-08-21T16:30:00Z",
  "status": "STARTED"
}
```

**Códigos de estado:**
- `202 Accepted`: El proceso de onboarding se inició correctamente
- `400 Bad Request`: Datos de solicitud inválidos
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para iniciar onboarding
- `500 Internal Server Error`: Error interno del servidor

### Verificar Estado de Onboarding

Verifica el estado de un proceso de onboarding en curso.

**Endpoint:** `GET /onboarding/{executionArn}`

**Parámetros de ruta:**
- `executionArn`: ARN de la ejecución de Step Functions

**Respuesta:**
```json
{
  "executionArn": "arn:aws:states:us-east-1:123456789012:execution:TenantOnboardingStateMachine:execution123",
  "status": "SUCCEEDED",
  "startDate": "2023-08-21T16:30:00Z",
  "stopDate": "2023-08-21T16:35:00Z",
  "output": {
    "tenantId": "tenant-123",
    "tenantResult": {
      "tenantId": "tenant-123",
      "name": "Empresa ABC",
      "status": "ACTIVE"
    },
    "superUserResult": {
      "username": "admin@empresa.com",
      "userStatus": "FORCE_CHANGE_PASSWORD",
      "temporaryPassword": "Abc123!@#"
    },
    "emailResult": {
      "messageId": "0102018abc123def-123456-abcd-1234-abcdefghijkl-000000",
      "sent": true
    }
  }
}
```

**Códigos de estado:**
- `200 OK`: La solicitud se completó correctamente
- `401 Unauthorized`: Token de autenticación inválido o expirado
- `403 Forbidden`: El usuario no tiene permisos para verificar este onboarding
- `404 Not Found`: La ejecución especificada no existe
- `500 Internal Server Error`: Error interno del servidor

## Códigos de Error Comunes

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 400 | BAD_REQUEST | La solicitud contiene datos inválidos o falta información requerida |
| 401 | UNAUTHORIZED | Token de autenticación inválido, expirado o faltante |
| 403 | FORBIDDEN | El usuario no tiene permisos para realizar la acción solicitada |
| 404 | NOT_FOUND | El recurso solicitado no existe |
| 409 | CONFLICT | La solicitud no se puede completar debido a un conflicto con el estado actual del recurso |
| 500 | INTERNAL_ERROR | Error interno del servidor |
| 503 | SERVICE_UNAVAILABLE | El servicio no está disponible temporalmente |

## Límites y Paginación

- La mayoría de las APIs que devuelven listas de recursos admiten paginación mediante los parámetros `limit` y `paginationToken`
- El valor máximo para `limit` es 100
- El `paginationToken` devuelto en una respuesta debe utilizarse en la siguiente solicitud para obtener la siguiente página de resultados
- Cuando no hay más resultados disponibles, la respuesta no incluirá un `paginationToken`