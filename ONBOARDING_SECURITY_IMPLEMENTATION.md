# Implementación de Seguridad en Onboarding

## Resumen de Cambios Implementados

### ✅ TAREA 1: Prevención de Tenants Duplicados (COMPLETADA)

**Ubicación**: `src/onboarding/tenant-onboarding-service.js`

**Implementación**:
- Nuevo método `checkDuplicateTenant()` que verifica nombres duplicados (case-insensitive)
- Verificación ejecutada ANTES de cualquier procesamiento de pago
- Retorna error HTTP 409 Conflict si se detecta duplicado
- Búsqueda eficiente usando índice de status en DynamoDB

**Flujo de Validación**:
1. Recibir solicitud de onboarding
2. Verificar duplicados por nombre de empresa
3. Si existe duplicado → Error 409 inmediato
4. Si no existe → Continuar con flujo de pago

### ✅ TAREA 2: Integración de Flujo de Facturación (COMPLETADA)

#### A. Endpoint Público de Planes
**Archivo**: `src/api/public-plans-handler.js`
**Endpoint**: `GET /public/plans`
**Características**:
- Sin autenticación requerida
- Retorna planes BASIC, STANDARD, PREMIUM
- Incluye precios, características y descripciones

#### B. Modificación del Endpoint de Onboarding
**Archivo**: `src/onboarding/onboarding-api-handler.js`
**Cambios**:
- Ahora requiere `planId` y `paymentToken`
- Validación de planId contra valores permitidos
- Manejo específico de errores 409 (duplicado) y 402 (pago)

#### C. Flujo Integrado de Pago
**Archivo**: `src/onboarding/tenant-onboarding-service.js`
**Nuevo Flujo**:
1. ✅ Verificar duplicados
2. ✅ Crear cliente en Treli
3. ✅ Crear suscripción en Treli
4. ✅ Verificar éxito del pago
5. ✅ Solo si pago exitoso → Crear tenant en DynamoDB
6. ✅ Crear grupos Cognito
7. ✅ Crear superusuario
8. ✅ Crear perfil de usuario

## Códigos de Error Implementados

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| 400 | Bad Request | Campos requeridos faltantes o planId inválido |
| 402 | Payment Required | Fallo en procesamiento de pago |
| 409 | Conflict | Tenant duplicado detectado |
| 500 | Internal Server Error | Error interno del sistema |

## Endpoints Actualizados

### 1. GET /public/plans
```json
{
  "plans": [
    {
      "id": "BASIC",
      "name": "Plan Básico",
      "price": 29.99,
      "features": ["Hasta 5 usuarios", "10 agentes IA"]
    }
  ]
}
```

### 2. POST /onboarding
**Request Body**:
```json
{
  "companyName": "Empresa Test",
  "userEmail": "admin@empresa.com",
  "userName": "Admin User",
  "planId": "STANDARD",
  "paymentToken": "pm_1234567890",
  "address": "Dirección opcional",
  "phone": "Teléfono opcional"
}
```

**Success Response (201)**:
```json
{
  "message": "Tenant created successfully.",
  "tenantId": "uuid-tenant-id",
  "status": "COMPLETED",
  "paymentInfo": {
    "customerId": "cus_1234567890",
    "subscriptionId": "sub_1234567890"
  }
}
```

**Error Responses**:
```json
// Duplicado (409)
{
  "message": "A tenant with this company name already exists",
  "code": "DUPLICATE_TENANT"
}

// Pago fallido (402)
{
  "message": "Payment failed. Please check your payment method and try again.",
  "code": "PAYMENT_FAILED"
}
```

## Configuración en serverless.yml

Agregado nuevo endpoint público:
```yaml
getPublicPlans:
  handler: src/api/public-plans-handler.handler
  events:
    - http:
        path: public/plans
        method: get
        cors: true
```

## Seguridad Implementada

1. **Prevención de Duplicados**: Verificación obligatoria antes del procesamiento
2. **Validación de Pago**: Solo continúa si el pago es exitoso
3. **Rollback Automático**: Si falla cualquier paso después del pago, el proceso se detiene
4. **Validación de Entrada**: Verificación de campos requeridos y valores válidos
5. **Manejo de Errores**: Códigos de error específicos para diferentes escenarios

## Testing Recomendado

1. **Test de Duplicados**: Intentar crear tenant con mismo nombre
2. **Test de Pago Fallido**: Usar token de pago inválido
3. **Test de Campos Faltantes**: Omitir campos requeridos
4. **Test de Plan Inválido**: Usar planId no válido
5. **Test de Flujo Completo**: Crear tenant exitosamente

## Próximos Pasos

1. Desplegar cambios con `serverless deploy`
2. Verificar endpoint público `/public/plans`
3. Probar flujo completo de onboarding
4. Configurar monitoreo de errores 409 y 402
5. Actualizar frontend para usar nuevos endpoints