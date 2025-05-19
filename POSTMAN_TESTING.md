# Guía de Prueba de API con Postman

Este documento proporciona instrucciones detalladas para probar todos los endpoints de la API del Administrador Technoagentes utilizando Postman.

## Habilitar el flujo USER_PASSWORD_AUTH

Antes de comenzar las pruebas, es necesario habilitar el flujo USER_PASSWORD_AUTH en el cliente de Cognito. Para ello, ejecuta el siguiente comando:

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_lJikpz0Bu \
  --client-id 67tqo3vsmpg25bt50f1sud1rk0 \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH
```

O si estás usando PowerShell:

```powershell
aws cognito-idp update-user-pool-client `
  --user-pool-id us-east-1_lJikpz0Bu `
  --client-id 67tqo3vsmpg25bt50f1sud1rk0 `
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH
```

También puedes usar la consola de AWS para habilitar este flujo:

1. Ve a la consola de AWS Cognito: https://console.aws.amazon.com/cognito/
2. Selecciona el User Pool "us-east-1_lJikpz0Bu"
3. Ve a la pestaña "App integration" (Integración de aplicaciones)
4. En la sección "App clients and analytics" (Clientes de aplicaciones y análisis), selecciona el cliente "67tqo3vsmpg25bt50f1sud1rk0"
5. En la sección "Auth flows configuration" (Configuración de flujos de autenticación), marca la casilla "USER_PASSWORD_AUTH"
6. Haz clic en "Save changes" (Guardar cambios)

Este cambio habilitará el flujo USER_PASSWORD_AUTH en el cliente de Cognito, lo que permitirá la autenticación directa con nombre de usuario y contraseña.

## URL Base de la API
```
https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev
```

## Autenticación con Cognito

Para realizar pruebas autenticadas, necesitarás obtener un token JWT de Cognito. Aquí te explico cómo hacerlo:

1. **Iniciar Sesión con Cognito**:

```javascript
// Configuración en Postman (POST request)
URL: https://cognito-idp.us-east-1.amazonaws.com/
Content-Type: application/x-amz-json-1.1
X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth

// Body (raw, JSON)
{
  "AuthFlow": "USER_PASSWORD_AUTH",
  "ClientId": "67tqo3vsmpg25bt50f1sud1rk0",
  "AuthParameters": {
    "USERNAME": "admin@example.com",
    "PASSWORD": "Temp123!"
  }
}
```

2. **Extraer el Token**:
   - De la respuesta, copia el valor de `AuthenticationResult.IdToken`
   - Este es el token JWT que debes usar en el header `Authorization` como `Bearer TOKEN`

## Endpoints de Usuarios

### 1. GET /tenants/users

**Descripción**: Obtiene la lista de usuarios del inquilino actual.

**Configuración en Postman**:
- Método: `GET`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tenants/users`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`

**Respuesta Esperada**:
```json
{
  "users": [
    {
      "id": "user-001",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  ]
}
```

### 2. POST /tenants/users

**Descripción**: Crea un nuevo usuario en el inquilino actual.

**Configuración en Postman**:
- Método: `POST`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tenants/users`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`
- Body (raw, JSON):
```json
{
  "email": "nuevo@example.com",
  "firstName": "Nuevo",
  "lastName": "Usuario",
  "role": "USER"
}
```

**Respuesta Esperada**:
```json
{
  "id": "user-002",
  "email": "nuevo@example.com",
  "firstName": "Nuevo",
  "lastName": "Usuario",
  "role": "USER",
  "status": "ACTIVE",
  "createdAt": "2025-05-16T18:00:00Z"
}
```

### 3. PUT /tenants/users/{userId}

**Descripción**: Actualiza un usuario existente.

**Configuración en Postman**:
- Método: `PUT`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tenants/users/user-001`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`
- Body (raw, JSON):
```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "Usuario",
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

**Respuesta Esperada**:
```json
{
  "id": "user-001",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "Usuario",
  "role": "ADMIN",
  "status": "ACTIVE",
  "updatedAt": "2025-05-16T18:05:00Z"
}
```

### 4. DELETE /tenants/users/{userId}

**Descripción**: Elimina un usuario existente.

**Configuración en Postman**:
- Método: `DELETE`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tenants/users/user-002`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`

**Respuesta Esperada**:
```json
{
  "id": "user-002",
  "deleted": true,
  "deletedAt": "2025-05-16T18:10:00Z"
}
```

## Endpoints de Configuración

### 5. GET /tenants/configurations/{configType}

**Descripción**: Obtiene la configuración del inquilino según el tipo especificado.

**Configuración en Postman**:
- Método: `GET`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tenants/configurations/GENERAL`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`

**Respuesta Esperada**:
```json
{
  "configType": "GENERAL",
  "settings": {
    "enabledAgents": ["basic"],
    "usageLimits": {
      "apiCalls": 1000,
      "storage": 5
    },
    "uiSettings": {
      "theme": "default",
      "logo": null
    }
  }
}
```

### 6. PUT /tenants/configurations/{configType}

**Descripción**: Actualiza la configuración del inquilino.

**Configuración en Postman**:
- Método: `PUT`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tenants/configurations/GENERAL`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`
- Body (raw, JSON):
```json
{
  "settings": {
    "enabledAgents": ["basic", "advanced"],
    "usageLimits": {
      "apiCalls": 2000,
      "storage": 10
    },
    "uiSettings": {
      "theme": "dark",
      "logo": "https://example.com/logo.png"
    }
  }
}
```

**Respuesta Esperada**:
```json
{
  "configType": "GENERAL",
  "settings": {
    "enabledAgents": ["basic", "advanced"],
    "usageLimits": {
      "apiCalls": 2000,
      "storage": 10
    },
    "uiSettings": {
      "theme": "dark",
      "logo": "https://example.com/logo.png"
    }
  },
  "updatedAt": "2025-05-16T18:15:00Z"
}
```

## Endpoints de Términos y Condiciones

### 7. GET /tc-acceptance

**Descripción**: Verifica si el usuario actual ha aceptado los términos y condiciones.

**Configuración en Postman**:
- Método: `GET`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tc-acceptance`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`

**Respuesta Esperada**:
```json
{
  "accepted": true,
  "version": "v1.0",
  "acceptedAt": "2025-05-16T16:30:00Z"
}
```

### 8. POST /tc-acceptance

**Descripción**: Registra la aceptación de términos y condiciones por parte del usuario.

**Configuración en Postman**:
- Método: `POST`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/tc-acceptance`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_COGNITO_TOKEN`
- Body (raw, JSON):
```json
{
  "version": "v1.0"
}
```

**Respuesta Esperada**:
```json
{
  "accepted": true,
  "version": "v1.0",
  "acceptedAt": "2025-05-16T18:20:00Z"
}
```

## Endpoints de Webhooks

### 9. POST /webhooks/payment

**Descripción**: Procesa webhooks de pago de sistemas externos.

**Configuración en Postman**:
- Método: `POST`
- URL: `https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev/webhooks/payment`
- Headers:
  - `Content-Type`: `application/json`
  - `X-Webhook-Signature`: `sha256=abc123` (opcional, para simular firma)
- Body (raw, JSON):
```json
{
  "event": "payment.success",
  "data": {
    "paymentId": "pay_123456",
    "amount": 100,
    "currency": "USD",
    "status": "completed"
  }
}
```

**Respuesta Esperada**:
```json
{
  "received": true,
  "eventId": "evt_123456",
  "eventType": "payment.success",
  "processedAt": "2025-05-16T18:30:00Z"
}
```

## Pruebas de CORS

Para probar que CORS está configurado correctamente:

**Configuración en Postman**:
- Método: `OPTIONS`
- URL: Cualquiera de los endpoints mencionados
- Headers:
  - `Origin`: `https://main.d1q7n0qe6uk3dq.amplifyapp.com`
  - `Access-Control-Request-Method`: `GET` (o el método que corresponda)
  - `Access-Control-Request-Headers`: `Content-Type,Authorization`

**Respuesta Esperada**:
- Status: 200 OK
- Headers:
  - `Access-Control-Allow-Origin`: `*`
  - `Access-Control-Allow-Methods`: `GET,POST,PUT,DELETE,OPTIONS`
  - `Access-Control-Allow-Headers`: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
