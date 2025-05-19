# Integración con Treli

Este documento describe la integración del sistema Administrador Technoagentes con la pasarela de pagos Treli para la gestión de suscripciones y pagos.

## Visión General

Treli es una pasarela de pagos que permite a las empresas gestionar suscripciones, pagos recurrentes y transacciones únicas. La integración con Treli permite a Administrador Technoagentes:

- Crear y gestionar clientes
- Configurar planes de suscripción
- Procesar pagos recurrentes
- Recibir notificaciones de eventos de pago mediante webhooks
- Actualizar el estado de los inquilinos según su estado de pago

## Configuración

### Requisitos Previos

1. Cuenta en [Treli](https://treli.co)
2. Claves de API (producción y pruebas)
3. Configuración de webhooks en el panel de Treli

### Variables de Entorno

Las siguientes variables de entorno deben configurarse:

```
TRELI_API_KEY=pk_test_example
TRELI_WEBHOOK_SECRET=whsec_example
TRELI_PRICE_BASIC=price_basic_example
TRELI_PRICE_STANDARD=price_standard_example
TRELI_PRICE_PREMIUM=price_premium_example
```

### Configuración en AWS Secrets Manager

Las claves de API se almacenan de forma segura en AWS Secrets Manager:

```json
{
  "TRELI_API_KEY": "pk_live_actual_key",
  "TRELI_WEBHOOK_SECRET": "whsec_actual_secret",
  "TRELI_PRICE_BASIC": "price_actual_basic_id",
  "TRELI_PRICE_STANDARD": "price_actual_standard_id",
  "TRELI_PRICE_PREMIUM": "price_actual_premium_id"
}
```

## Implementación

### PaymentService

El servicio `PaymentService` encapsula toda la lógica de interacción con Treli:

```javascript
const paymentService = new PaymentService();

// Crear un cliente
const customer = await paymentService.createCustomer({
  email: 'cliente@empresa.com',
  name: 'Empresa ABC',
  paymentToken: 'payment_method_token123'
});

// Crear una suscripción
const subscription = await paymentService.createSubscription(
  customer.customerId,
  'STANDARD'
);
```

### Métodos Principales

#### createCustomer

Crea un nuevo cliente en Treli y opcionalmente adjunta un método de pago.

```javascript
async createCustomer(customerData) {
  // Crea el cliente en Treli
  // Adjunta el método de pago si se proporciona
  // Retorna el ID del cliente
}
```

#### createSubscription

Crea una nueva suscripción para un cliente existente.

```javascript
async createSubscription(customerId, planId) {
  // Obtiene el ID de precio correspondiente al plan
  // Crea la suscripción en Treli
  // Retorna la información de la suscripción
}
```

#### updateSubscription

Actualiza una suscripción existente, por ejemplo, para cambiar de plan.

```javascript
async updateSubscription(subscriptionId, planId) {
  // Obtiene el ID de precio correspondiente al nuevo plan
  // Actualiza la suscripción en Treli
  // Retorna la información actualizada
}
```

#### cancelSubscription

Cancela una suscripción existente.

```javascript
async cancelSubscription(subscriptionId, atPeriodEnd = true) {
  // Cancela la suscripción en Treli
  // Si atPeriodEnd es true, la cancela al final del período actual
  // Si es false, la cancela inmediatamente
}
```

#### processWebhook

Procesa eventos de webhook recibidos de Treli.

```javascript
async processWebhook(payload, signature) {
  // Verifica la firma del webhook
  // Procesa diferentes tipos de eventos
  // Actualiza el estado del inquilino según corresponda
}
```

## Webhooks

### Configuración de Webhooks

En el panel de Treli, configura el endpoint de webhook:

```
https://api.tudominio.com/webhooks/payment
```

### Eventos Soportados

| Evento | Descripción | Acción |
|--------|-------------|--------|
| `subscription.created` | Se ha creado una nueva suscripción | Actualizar estado del inquilino a ACTIVE |
| `subscription.updated` | Se ha actualizado una suscripción | Actualizar plan y estado del inquilino |
| `subscription.deleted` | Se ha eliminado una suscripción | Actualizar estado del inquilino a SUSPENDED |
| `invoice.paid` | Se ha pagado una factura | Actualizar estado de pago del inquilino |
| `invoice.payment_failed` | Ha fallado el pago de una factura | Marcar inquilino con PAYMENT_ISSUE |

### Verificación de Firma

Para garantizar la autenticidad de los webhooks, se verifica la firma:

```javascript
function verifyWebhookSignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', process.env.TRELI_WEBHOOK_SECRET);
  const expectedSignature = hmac.update(payload).digest('hex');
  return signature === expectedSignature;
}
```

## Planes y Precios

### Estructura de Planes

| Plan | Descripción | Características |
|------|-------------|----------------|
| BASIC | Plan básico | Acceso limitado a agentes, 1000 llamadas API/mes |
| STANDARD | Plan estándar | Acceso a agentes básicos, 5000 llamadas API/mes |
| PREMIUM | Plan premium | Acceso a todos los agentes, llamadas API ilimitadas |

### Mapeo de Planes a Precios

Los IDs de precios de Treli se mapean a los planes internos:

```javascript
const planPriceMap = {
  'BASIC': process.env.TRELI_PRICE_BASIC,
  'STANDARD': process.env.TRELI_PRICE_STANDARD,
  'PREMIUM': process.env.TRELI_PRICE_PREMIUM
};
```

## Flujo de Onboarding

1. El usuario completa el formulario de registro con información de la empresa
2. Se recopila la información de pago mediante el componente de Treli
3. Se inicia el proceso de onboarding con Step Functions
4. Se crea el cliente en Treli y se procesa el pago inicial
5. Se crea la suscripción según el plan seleccionado
6. Se completa el onboarding y se activa el inquilino

## Pruebas

### Modo de Prueba

Para realizar pruebas, utiliza las claves de API de prueba de Treli:

```
TRELI_API_KEY=pk_test_example
```

### Tarjetas de Prueba

| Número de Tarjeta | Descripción |
|-------------------|-------------|
| 4242 4242 4242 4242 | Pago exitoso |
| 4000 0000 0000 0002 | Tarjeta rechazada |
| 4000 0000 0000 9995 | Fondos insuficientes |

### Simulación de Webhooks

Para probar los webhooks localmente, puedes usar herramientas como [Treli CLI](https://docs.treli.co/cli) o servicios como [ngrok](https://ngrok.com).

## Solución de Problemas

### Problemas Comunes

1. **Firma de webhook inválida**
   - Verifica que el secreto de webhook configurado sea correcto
   - Asegúrate de que el payload no se modifique antes de la verificación

2. **Error al crear cliente**
   - Verifica que la API key sea válida
   - Comprueba que los datos del cliente sean correctos

3. **Error al crear suscripción**
   - Verifica que el ID de precio exista en Treli
   - Comprueba que el cliente tenga un método de pago válido

### Logs y Monitoreo

Todos los eventos y errores relacionados con pagos se registran en CloudWatch Logs con el prefijo `[PaymentService]` para facilitar su búsqueda y análisis.

## Migración desde Stripe

Esta implementación reemplaza la integración anterior con Stripe. Las principales diferencias son:

1. **Estructura de API**: Treli utiliza una estructura de API similar pero con algunas diferencias en los nombres de los endpoints y parámetros
2. **Verificación de Webhooks**: El método de verificación de firma es diferente
3. **Nombres de Eventos**: Los nombres de los eventos de webhook tienen un formato diferente
4. **Manejo de Métodos de Pago**: El proceso de adjuntar métodos de pago a clientes es ligeramente diferente

La migración se realizó manteniendo la misma interfaz pública del servicio `PaymentService`, por lo que el resto del sistema no requirió cambios significativos.