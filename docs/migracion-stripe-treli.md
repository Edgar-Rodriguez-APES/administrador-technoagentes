# Guía de Migración: De Stripe a Treli

Esta guía detalla el proceso de migración de la pasarela de pagos Stripe a Treli en el sistema Administrador Technoagentes.

## Índice

1. [Visión General](#visión-general)
2. [Cambios en el Código](#cambios-en-el-código)
3. [Cambios en la Configuración](#cambios-en-la-configuración)
4. [Migración de Datos](#migración-de-datos)
5. [Pruebas](#pruebas)
6. [Despliegue](#despliegue)
7. [Monitoreo Post-Migración](#monitoreo-post-migración)
8. [Rollback](#rollback)

## Visión General

### Razones para la Migración

- Mejores tarifas y condiciones ofrecidas por Treli
- Mejor soporte para el mercado latinoamericano
- Características específicas requeridas por el negocio
- Simplificación del proceso de onboarding de clientes

### Diferencias Principales entre Stripe y Treli

| Característica | Stripe | Treli |
|----------------|--------|-------|
| API Base URL | https://api.stripe.com/v1 | https://api.treli.co/v1 |
| Autenticación | API Key en header | API Key en header |
| Webhooks | Firma en header `stripe-signature` | Firma en header `treli-signature` |
| Eventos | `customer.subscription.updated` | `subscription.updated` |
| Métodos de Pago | `pm_card_visa_token123` | `payment_method_token123` |
| Biblioteca | Paquete npm `stripe` | Llamadas HTTP con `axios` |

## Cambios en el Código

### Archivos Modificados

1. **payment-service.js**:
   - Reemplazado el cliente de Stripe por llamadas HTTP con axios
   - Actualizada la lógica de verificación de firma de webhooks
   - Adaptados los nombres de eventos y estructura de respuestas

2. **webhook-handler.js**:
   - Actualizado para usar el encabezado `treli-signature`
   - Adaptada la lógica de procesamiento de eventos

3. **package.json**:
   - Eliminada dependencia de `stripe`
   - Añadida dependencia de `axios`

### Ejemplo de Cambios en payment-service.js

**Antes (Stripe):**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async createCustomer(customerData) {
  // Create customer in Stripe
  const customer = await stripe.customers.create({
    email: customerData.email,
    name: customerData.name,
    description: `Tenant: ${customerData.name}`,
    metadata: {
      tenantId: customerData.tenantId
    }
  });
  
  // Resto del código...
}
```

**Después (Treli):**
```javascript
const axios = require('axios');

async createCustomer(customerData) {
  // Create customer in Treli
  const customerResponse = await axios({
    method: 'post',
    url: `${this.apiBaseUrl}/customers`,
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      email: customerData.email,
      name: customerData.name,
      description: `Tenant: ${customerData.name}`,
      metadata: {
        tenantId: customerData.tenantId
      }
    }
  });
  
  const customer = customerResponse.data;
  
  // Resto del código...
}
```

### Ejemplo de Cambios en webhook-handler.js

**Antes (Stripe):**
```javascript
const signature = event.headers['stripe-signature'];

// Verify webhook signature
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Después (Treli):**
```javascript
const signature = event.headers['treli-signature'];

// Verify webhook signature
const isValid = this._verifyWebhookSignature(payload, signature);
if (!isValid) {
  throw new Error('Invalid webhook signature');
}

// Parse the event
const event = JSON.parse(payload);
```

## Cambios en la Configuración

### Variables de Entorno

**Antes (Stripe):**
```
STRIPE_SECRET_KEY=sk_test_example
STRIPE_WEBHOOK_SECRET=whsec_example
STRIPE_PRICE_BASIC=price_basic_example
STRIPE_PRICE_STANDARD=price_standard_example
STRIPE_PRICE_PREMIUM=price_premium_example
```

**Después (Treli):**
```
TRELI_API_KEY=pk_test_example
TRELI_WEBHOOK_SECRET=whsec_example
TRELI_PRICE_BASIC=price_basic_example
TRELI_PRICE_STANDARD=price_standard_example
TRELI_PRICE_PREMIUM=price_premium_example
```

### AWS Secrets Manager

**Antes (Stripe):**
```json
{
  "STRIPE_SECRET_KEY": "sk_test_example",
  "STRIPE_WEBHOOK_SECRET": "whsec_example"
}
```

**Después (Treli):**
```json
{
  "TRELI_API_KEY": "pk_test_example",
  "TRELI_WEBHOOK_SECRET": "whsec_example",
  "TRELI_PRICE_BASIC": "price_basic_example",
  "TRELI_PRICE_STANDARD": "price_standard_example",
  "TRELI_PRICE_PREMIUM": "price_premium_example"
}
```

### Serverless.yml

**Antes (Stripe):**
```yaml
custom:
  stripeSecrets:
    secretKey: ${env:STRIPE_SECRET_KEY}
    webhookSecret: ${env:STRIPE_WEBHOOK_SECRET}

provider:
  environment:
    STRIPE_SECRET_KEY: ${self:custom.stripeSecrets.secretKey}
    STRIPE_WEBHOOK_SECRET: ${self:custom.stripeSecrets.webhookSecret}
```

**Después (Treli):**
```yaml
custom:
  treliPrices:
    basic: price_basic_example
    standard: price_standard_example
    premium: price_premium_example

provider:
  environment:
    TRELI_API_KEY: ${env:TRELI_API_KEY}
    TRELI_WEBHOOK_SECRET: ${env:TRELI_WEBHOOK_SECRET}
    TRELI_PRICE_BASIC: ${self:custom.treliPrices.basic}
    TRELI_PRICE_STANDARD: ${self:custom.treliPrices.standard}
    TRELI_PRICE_PREMIUM: ${self:custom.treliPrices.premium}
```

## Migración de Datos

### Preparación

1. Exportar datos de clientes y suscripciones de Stripe:
   ```bash
   stripe customers list --limit 100 > stripe_customers.json
   stripe subscriptions list --limit 100 > stripe_subscriptions.json
   ```

2. Crear script de migración para importar datos a Treli:
   ```javascript
   const fs = require('fs');
   const axios = require('axios');
   
   // Leer datos exportados
   const stripeCustomers = JSON.parse(fs.readFileSync('stripe_customers.json'));
   const stripeSubscriptions = JSON.parse(fs.readFileSync('stripe_subscriptions.json'));
   
   // Función para migrar clientes
   async function migrateCustomers() {
     for (const customer of stripeCustomers.data) {
       try {
         // Crear cliente en Treli
         const treliCustomer = await createTreliCustomer(customer);
         console.log(`Migrated customer ${customer.id} to Treli as ${treliCustomer.id}`);
         
         // Mapear IDs para referencia
         customerMap[customer.id] = treliCustomer.id;
       } catch (error) {
         console.error(`Error migrating customer ${customer.id}:`, error);
       }
     }
   }
   
   // Función para migrar suscripciones
   async function migrateSubscriptions() {
     // Implementación similar para suscripciones
   }
   
   // Ejecutar migración
   async function runMigration() {
     await migrateCustomers();
     await migrateSubscriptions();
   }
   
   runMigration();
   ```

### Ejecución de la Migración

1. Realizar la migración en un entorno de prueba primero
2. Verificar que todos los datos se hayan migrado correctamente
3. Actualizar las referencias en DynamoDB:
   ```javascript
   // Actualizar referencias de customerId y subscriptionId en DynamoDB
   async function updateDynamoDBReferences() {
     // Implementación para actualizar referencias en DynamoDB
   }
   ```

4. Programar la migración en producción durante una ventana de mantenimiento

## Pruebas

### Pruebas Unitarias

1. Actualizar pruebas unitarias para el servicio de pagos:
   ```javascript
   // Antes (Stripe)
   test('should create a customer in Stripe', async () => {
     // Implementación con Stripe
   });
   
   // Después (Treli)
   test('should create a customer in Treli', async () => {
     // Implementación con Treli
   });
   ```

### Pruebas de Integración

1. Probar el flujo completo de onboarding con Treli
2. Probar la creación y actualización de suscripciones
3. Probar el procesamiento de webhooks
4. Probar escenarios de error y recuperación

### Pruebas de Aceptación

1. Verificar que el panel de administración funcione correctamente con Treli
2. Probar el proceso de checkout desde la perspectiva del usuario
3. Verificar que los informes y dashboards muestren datos correctos

## Despliegue

### Plan de Despliegue

1. **Fase 1: Entorno de Desarrollo**
   - Desplegar cambios en el entorno de desarrollo
   - Realizar pruebas exhaustivas
   - Corregir problemas identificados

2. **Fase 2: Entorno de Staging**
   - Desplegar en un entorno similar a producción
   - Realizar pruebas con datos reales migrados
   - Verificar la integración con otros sistemas

3. **Fase 3: Producción**
   - Programar una ventana de mantenimiento
   - Realizar copia de seguridad de todos los datos
   - Desplegar los cambios en producción
   - Migrar datos de producción
   - Verificar el funcionamiento

### Comandos de Despliegue

```bash
# Desplegar en desarrollo
npm run deploy:dev

# Desplegar en producción
npm run deploy:prod
```

## Monitoreo Post-Migración

### Métricas a Monitorear

1. **Tasa de éxito de pagos**:
   - Comparar con las métricas históricas de Stripe
   - Identificar cualquier cambio significativo

2. **Latencia de API**:
   - Monitorear el tiempo de respuesta de las llamadas a Treli
   - Comparar con las métricas de Stripe

3. **Errores**:
   - Monitorear errores relacionados con pagos
   - Configurar alertas para errores críticos

### Configuración de Alertas

```javascript
// Ejemplo de configuración de alarma en CloudWatch
const alarm = new cloudwatch.Alarm(this, 'PaymentErrorsAlarm', {
  metric: new cloudwatch.Metric({
    namespace: 'Technoagentes',
    metricName: 'PaymentErrors',
    dimensions: { Service: 'PaymentService' },
    statistic: 'Sum',
    period: cdk.Duration.minutes(5),
  }),
  threshold: 5,
  evaluationPeriods: 1,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
});
```

## Rollback

### Plan de Rollback

1. **Criterios para Rollback**:
   - Tasa de error de pagos superior al 5%
   - Tiempo de inactividad superior a 30 minutos
   - Problemas críticos que afecten a la experiencia del usuario

2. **Procedimiento de Rollback**:
   - Restaurar la versión anterior del código
   - Revertir las variables de entorno
   - Restaurar la configuración de webhooks en Stripe
   - Verificar el funcionamiento después del rollback

### Comandos de Rollback

```bash
# Rollback a la versión anterior
git checkout v1.0.0
npm run deploy:prod

# Restaurar datos si es necesario
aws dynamodb restore-table-from-backup --target-table-name TenantsTable --backup-arn arn:aws:dynamodb:us-east-1:123456789012:table/TenantsTable/backup/01234567890123
```

## Conclusión

La migración de Stripe a Treli implica cambios significativos en el código y la configuración, pero mantiene la misma estructura general y flujos de trabajo. Con una planificación adecuada, pruebas exhaustivas y un plan de rollback sólido, la migración puede realizarse con un impacto mínimo en los usuarios finales.