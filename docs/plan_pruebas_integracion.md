# Plan de Pruebas de Integración - Administrador Technoagentes

## Objetivo

El objetivo de este plan de pruebas de integración es verificar que todos los componentes del sistema Administrador Technoagentes funcionen correctamente juntos, asegurando que los flujos de trabajo completos operen según lo esperado en un entorno que simule el de producción.

## Alcance

Este plan de pruebas cubre:
- Flujos de trabajo completos de extremo a extremo
- Integración entre todos los componentes del sistema
- Autenticación y autorización
- Integración con servicios externos (Treli)
- Manejo de errores y casos límite

## Entorno de Pruebas

- **Entorno**: Desarrollo/Staging
- **Región AWS**: us-east-1
- **Dominio**: api-test.technoagentes.com
- **Herramientas**: Postman, AWS CLI, Newman (para automatización)

## Casos de Prueba

### 1. Flujo de Onboarding de Inquilinos

#### TC-1.1: Creación de un nuevo inquilino
**Objetivo**: Verificar que un nuevo inquilino puede ser creado correctamente.
**Pasos**:
1. Enviar una solicitud POST a `/onboarding` con los datos del inquilino:
   ```json
   {
     "tenantName": "Empresa Prueba",
     "tenantEmail": "admin@empresaprueba.com",
     "tenantPlan": "BASIC",
     "paymentToken": "tok_visa"
   }
   ```
2. Verificar la respuesta con código 201 y los datos del inquilino creado
3. Verificar en DynamoDB que el inquilino se ha creado correctamente
4. Verificar en Cognito que se han creado los grupos para el inquilino
5. Verificar en Treli que se ha creado el cliente y la suscripción

**Datos de prueba**:
- Nombre del inquilino: "Empresa Prueba"
- Email: "admin@empresaprueba.com"
- Plan: "BASIC"
- Token de pago: "tok_visa" (token de prueba de Treli)

**Resultado esperado**:
- Respuesta HTTP 201
- Inquilino creado en DynamoDB con estado "ACTIVE"
- Grupos creados en Cognito: "{tenantId}-Admins" y "{tenantId}-Users"
- Cliente y suscripción creados en Treli

#### TC-1.2: Intento de creación de inquilino con datos inválidos
**Objetivo**: Verificar que el sistema maneja correctamente los datos inválidos.
**Pasos**:
1. Enviar una solicitud POST a `/onboarding` con datos inválidos:
   ```json
   {
     "tenantName": "",
     "tenantEmail": "email-invalido",
     "tenantPlan": "PLAN_INEXISTENTE",
     "paymentToken": "tok_invalid"
   }
   ```
2. Verificar la respuesta con código 400 y mensaje de error apropiado

**Resultado esperado**:
- Respuesta HTTP 400
- Mensaje de error detallando los problemas con los datos

### 2. Gestión de Usuarios

#### TC-2.1: Creación de un usuario para un inquilino
**Objetivo**: Verificar que se puede crear un usuario para un inquilino existente.
**Pasos**:
1. Autenticarse como administrador del inquilino
2. Enviar una solicitud POST a `/tenants/users` con los datos del usuario:
   ```json
   {
     "tenantId": "{tenantId}",
     "email": "usuario@empresaprueba.com",
     "name": "Usuario Prueba",
     "role": "User"
   }
   ```
3. Verificar la respuesta con código 201 y los datos del usuario creado
4. Verificar en DynamoDB que el usuario se ha creado correctamente
5. Verificar en Cognito que el usuario se ha creado y asignado al grupo correcto

**Datos de prueba**:
- ID del inquilino: Obtenido de TC-1.1
- Email: "usuario@empresaprueba.com"
- Nombre: "Usuario Prueba"
- Rol: "User"

**Resultado esperado**:
- Respuesta HTTP 201
- Usuario creado en DynamoDB
- Usuario creado en Cognito y asignado al grupo "{tenantId}-Users"

#### TC-2.2: Obtención de usuarios de un inquilino
**Objetivo**: Verificar que se pueden obtener los usuarios de un inquilino.
**Pasos**:
1. Autenticarse como administrador del inquilino
2. Enviar una solicitud GET a `/tenants/users?tenantId={tenantId}`
3. Verificar la respuesta con código 200 y la lista de usuarios

**Datos de prueba**:
- ID del inquilino: Obtenido de TC-1.1

**Resultado esperado**:
- Respuesta HTTP 200
- Lista de usuarios que incluye al menos el usuario creado en TC-2.1

#### TC-2.3: Intento de acceso a usuarios de otro inquilino
**Objetivo**: Verificar el aislamiento entre inquilinos.
**Pasos**:
1. Autenticarse como administrador del inquilino A
2. Enviar una solicitud GET a `/tenants/users?tenantId={tenantIdB}` (donde tenantIdB es de otro inquilino)
3. Verificar la respuesta con código 403

**Datos de prueba**:
- ID del inquilino A: Obtenido de TC-1.1
- ID del inquilino B: Crear un segundo inquilino para esta prueba

**Resultado esperado**:
- Respuesta HTTP 403
- Mensaje de error indicando acceso denegado

### 3. Configuraciones de Inquilinos

#### TC-3.1: Creación/actualización de configuración de inquilino
**Objetivo**: Verificar que se puede crear y actualizar una configuración para un inquilino.
**Pasos**:
1. Autenticarse como administrador del inquilino
2. Enviar una solicitud PUT a `/tenants/configurations/ui-settings` con los datos de configuración:
   ```json
   {
     "tenantId": "{tenantId}",
     "configuration": {
       "theme": "dark",
       "logo": "https://example.com/logo.png",
       "primaryColor": "#00FF00"
     }
   }
   ```
3. Verificar la respuesta con código 200 y los datos de configuración actualizados
4. Verificar en DynamoDB que la configuración se ha guardado correctamente

**Datos de prueba**:
- ID del inquilino: Obtenido de TC-1.1
- Configuración: Tema oscuro, logo y color primario

**Resultado esperado**:
- Respuesta HTTP 200
- Configuración guardada en DynamoDB

#### TC-3.2: Obtención de configuración de inquilino
**Objetivo**: Verificar que se puede obtener la configuración de un inquilino.
**Pasos**:
1. Autenticarse como usuario del inquilino
2. Enviar una solicitud GET a `/tenants/configurations/ui-settings?tenantId={tenantId}`
3. Verificar la respuesta con código 200 y los datos de configuración

**Datos de prueba**:
- ID del inquilino: Obtenido de TC-1.1

**Resultado esperado**:
- Respuesta HTTP 200
- Datos de configuración que coinciden con los creados en TC-3.1

### 4. Términos y Condiciones

#### TC-4.1: Registro de aceptación de términos y condiciones
**Objetivo**: Verificar que se puede registrar la aceptación de términos y condiciones.
**Pasos**:
1. Autenticarse como usuario del inquilino
2. Enviar una solicitud POST a `/tc-acceptance` con los datos:
   ```json
   {
     "termsVersion": "v1.0"
   }
   ```
3. Verificar la respuesta con código 201
4. Verificar en DynamoDB que la aceptación se ha registrado correctamente

**Datos de prueba**:
- Usuario: Creado en TC-2.1
- Versión de términos: "v1.0"

**Resultado esperado**:
- Respuesta HTTP 201
- Registro de aceptación en DynamoDB

#### TC-4.2: Verificación de aceptación de términos y condiciones
**Objetivo**: Verificar que se puede consultar si un usuario ha aceptado los términos y condiciones.
**Pasos**:
1. Autenticarse como usuario del inquilino
2. Enviar una solicitud GET a `/tc-acceptance?version=v1.0`
3. Verificar la respuesta con código 200 y el estado de aceptación

**Datos de prueba**:
- Usuario: Creado en TC-2.1
- Versión de términos: "v1.0"

**Resultado esperado**:
- Respuesta HTTP 200
- `hasAccepted: true`

### 5. Integración con Treli (Pagos)

#### TC-5.1: Simulación de webhook de pago exitoso
**Objetivo**: Verificar que el sistema procesa correctamente los webhooks de pago exitoso.
**Pasos**:
1. Generar una firma válida para el payload de webhook
2. Enviar una solicitud POST a `/webhooks/payment` con el payload de pago exitoso y la firma
3. Verificar la respuesta con código 200
4. Verificar en DynamoDB que el estado del inquilino es "ACTIVE"

**Datos de prueba**:
- ID de suscripción: Obtenido de TC-1.1
- Evento: "invoice.paid"

**Resultado esperado**:
- Respuesta HTTP 200
- Estado del inquilino "ACTIVE" en DynamoDB
- Evento registrado en la tabla webhook_events

#### TC-5.2: Simulación de webhook de fallo de pago
**Objetivo**: Verificar que el sistema procesa correctamente los webhooks de fallo de pago.
**Pasos**:
1. Generar una firma válida para el payload de webhook
2. Enviar una solicitud POST a `/webhooks/payment` con el payload de fallo de pago y la firma
3. Verificar la respuesta con código 200
4. Verificar en DynamoDB que el estado del inquilino es "PAYMENT_ISSUE"

**Datos de prueba**:
- ID de suscripción: Obtenido de TC-1.1
- Evento: "invoice.payment_failed"

**Resultado esperado**:
- Respuesta HTTP 200
- Estado del inquilino "PAYMENT_ISSUE" en DynamoDB
- Evento registrado en la tabla webhook_events

#### TC-5.3: Simulación de webhook de cancelación de suscripción
**Objetivo**: Verificar que el sistema procesa correctamente los webhooks de cancelación de suscripción.
**Pasos**:
1. Generar una firma válida para el payload de webhook
2. Enviar una solicitud POST a `/webhooks/payment` con el payload de cancelación y la firma
3. Verificar la respuesta con código 200
4. Verificar en DynamoDB que el estado del inquilino es "SUSPENDED"

**Datos de prueba**:
- ID de suscripción: Obtenido de TC-1.1
- Evento: "subscription.deleted"

**Resultado esperado**:
- Respuesta HTTP 200
- Estado del inquilino "SUSPENDED" en DynamoDB
- Evento registrado en la tabla webhook_events

### 6. Autenticación y Autorización

#### TC-6.1: Acceso a endpoint protegido con token válido
**Objetivo**: Verificar que se puede acceder a un endpoint protegido con un token válido.
**Pasos**:
1. Obtener un token de acceso válido de Cognito
2. Enviar una solicitud GET a `/tenants/users` con el token en el encabezado Authorization
3. Verificar la respuesta con código 200

**Datos de prueba**:
- Usuario: Creado en TC-2.1
- Contraseña: La establecida durante la creación

**Resultado esperado**:
- Respuesta HTTP 200
- Datos de usuarios devueltos correctamente

#### TC-6.2: Intento de acceso a endpoint protegido sin token
**Objetivo**: Verificar que no se puede acceder a un endpoint protegido sin token.
**Pasos**:
1. Enviar una solicitud GET a `/tenants/users` sin token de autorización
2. Verificar la respuesta con código 401

**Resultado esperado**:
- Respuesta HTTP 401
- Mensaje de error indicando que se requiere autenticación

#### TC-6.3: Intento de acceso a endpoint protegido con token expirado
**Objetivo**: Verificar que no se puede acceder a un endpoint protegido con un token expirado.
**Pasos**:
1. Obtener un token de acceso y esperar a que expire (o generar uno expirado)
2. Enviar una solicitud GET a `/tenants/users` con el token expirado
3. Verificar la respuesta con código 401

**Datos de prueba**:
- Token expirado

**Resultado esperado**:
- Respuesta HTTP 401
- Mensaje de error indicando que el token ha expirado

### 7. Pruebas de Flujo Completo

#### TC-7.1: Flujo completo de onboarding y gestión de inquilino
**Objetivo**: Verificar el flujo completo desde la creación de un inquilino hasta la gestión de sus usuarios y configuraciones.
**Pasos**:
1. Crear un nuevo inquilino (como en TC-1.1)
2. Autenticarse como administrador del inquilino
3. Crear un nuevo usuario (como en TC-2.1)
4. Actualizar la configuración del inquilino (como en TC-3.1)
5. Registrar la aceptación de términos y condiciones (como en TC-4.1)
6. Simular un evento de pago (como en TC-5.1)
7. Verificar que todos los datos están correctamente almacenados y relacionados

**Resultado esperado**:
- Todas las operaciones se completan con éxito
- Los datos están correctamente relacionados entre sí
- El inquilino está en estado "ACTIVE"

## Automatización de Pruebas

Para automatizar estas pruebas, se recomienda:

1. **Colección de Postman**: Crear una colección de Postman con todos los casos de prueba.
2. **Variables de entorno**: Configurar variables de entorno en Postman para los diferentes entornos (dev, staging, prod).
3. **Scripts de prueba**: Añadir scripts de prueba en Postman para verificar automáticamente las respuestas.
4. **Newman**: Utilizar Newman para ejecutar las pruebas desde la línea de comandos o en un pipeline CI/CD.

### Ejemplo de script de automatización:

```javascript
// Script de prueba para TC-1.1 en Postman
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Tenant ID is present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.tenantId).to.exist;
    pm.environment.set("tenantId", jsonData.tenantId);
});

pm.test("Tenant status is ACTIVE", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("ACTIVE");
});
```

## Matriz de Trazabilidad

| ID Caso de Prueba | Componentes Involucrados | Requisitos Cubiertos |
|-------------------|--------------------------|----------------------|
| TC-1.1 | Lambda (tenant-onboarding), DynamoDB, Cognito, Treli | RF-1: Onboarding de inquilinos |
| TC-1.2 | Lambda (tenant-onboarding) | RF-1: Validación de datos |
| TC-2.1 | Lambda (create-tenant-user), DynamoDB, Cognito | RF-2: Gestión de usuarios |
| TC-2.2 | Lambda (get-tenant-users), DynamoDB | RF-2: Consulta de usuarios |
| TC-2.3 | Lambda (get-tenant-users), IAM | RF-7: Aislamiento de inquilinos |
| TC-3.1 | Lambda (update-tenant-config), DynamoDB | RF-3: Configuraciones de inquilinos |
| TC-3.2 | Lambda (get-tenant-config), DynamoDB | RF-3: Consulta de configuraciones |
| TC-4.1 | Lambda (record-tc-acceptance), DynamoDB | RF-4: Aceptación de términos |
| TC-4.2 | Lambda (record-tc-acceptance), DynamoDB | RF-4: Verificación de aceptación |
| TC-5.1 | Lambda (webhook-handler), DynamoDB | RF-5: Procesamiento de pagos |
| TC-5.2 | Lambda (webhook-handler), DynamoDB | RF-5: Manejo de fallos de pago |
| TC-5.3 | Lambda (webhook-handler), DynamoDB | RF-5: Cancelación de suscripciones |
| TC-6.1 | API Gateway, Cognito | RF-6: Autenticación |
| TC-6.2 | API Gateway, Cognito | RF-6: Autenticación |
| TC-6.3 | API Gateway, Cognito | RF-6: Autenticación |
| TC-7.1 | Todos | RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7 |

## Criterios de Aceptación

- Todos los casos de prueba deben ejecutarse con éxito
- No debe haber errores críticos o bloqueantes
- El tiempo de respuesta de los endpoints debe ser menor a 1 segundo en el 95% de los casos
- La cobertura de pruebas debe ser al menos del 90% de los flujos de negocio

## Cronograma de Ejecución

| Fase | Duración Estimada | Dependencias |
|------|-------------------|--------------|
| Preparación del entorno | 1 día | Ninguna |
| Ejecución de pruebas básicas (TC-1.x, TC-2.x) | 1 día | Preparación del entorno |
| Ejecución de pruebas de configuración (TC-3.x, TC-4.x) | 1 día | Pruebas básicas |
| Ejecución de pruebas de integración con Treli (TC-5.x) | 1 día | Pruebas básicas |
| Ejecución de pruebas de autenticación (TC-6.x) | 1 día | Pruebas básicas |
| Ejecución de pruebas de flujo completo (TC-7.x) | 1 día | Todas las anteriores |
| Análisis de resultados y correcciones | 2 días | Todas las pruebas |

## Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|-------------|------------|
| Problemas de conectividad con Treli | Alto | Media | Implementar mocks para pruebas aisladas |
| Datos de prueba inconsistentes | Medio | Alta | Implementar limpieza de datos antes y después de cada prueba |
| Cambios en la API de Treli | Alto | Baja | Mantener documentación actualizada y revisar cambios en la API |
| Problemas de permisos en AWS | Alto | Media | Verificar y documentar todos los permisos necesarios |
| Tiempos de respuesta lentos | Medio | Media | Monitorear y optimizar las funciones Lambda |

## Responsables

- **Ejecución de pruebas**: Equipo de QA
- **Revisión de resultados**: Líder técnico y Product Owner
- **Corrección de defectos**: Equipo de desarrollo

## Anexos

### Anexo 1: Ejemplos de Payloads de Webhook

#### Webhook de pago exitoso
```json
{
  "id": "evt_1234567890",
  "type": "invoice.paid",
  "data": {
    "id": "inv_1234567890",
    "customer": "cus_1234567890",
    "subscription": "sub_1234567890",
    "status": "paid",
    "amount": 1000,
    "currency": "usd"
  }
}
```

#### Webhook de fallo de pago
```json
{
  "id": "evt_0987654321",
  "type": "invoice.payment_failed",
  "data": {
    "id": "inv_0987654321",
    "customer": "cus_1234567890",
    "subscription": "sub_1234567890",
    "status": "failed",
    "amount": 1000,
    "currency": "usd"
  }
}
```

#### Webhook de cancelación de suscripción
```json
{
  "id": "evt_5678901234",
  "type": "subscription.deleted",
  "data": {
    "id": "sub_1234567890",
    "customer": "cus_1234567890",
    "status": "canceled"
  }
}
```

### Anexo 2: Generación de Firmas para Webhooks

```javascript
const crypto = require('crypto');

function generateTreliSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(payload).digest('hex');
}

// Ejemplo de uso
const payload = JSON.stringify({
  id: "evt_1234567890",
  type: "invoice.paid",
  data: {
    id: "inv_1234567890",
    customer: "cus_1234567890",
    subscription: "sub_1234567890",
    status: "paid",
    amount: 1000,
    currency: "usd"
  }
});

const secret = "whsec_92a8c1f8d97d4bc3a1d09b14d3f8abc7";
const signature = generateTreliSignature(payload, secret);
console.log(signature);
```