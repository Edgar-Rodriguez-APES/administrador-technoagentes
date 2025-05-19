# Arquitectura del Sistema

Este documento detalla la arquitectura del sistema Administrador Technoagentes, explicando los componentes principales, sus interacciones y las decisiones de diseño.

## Visión General

Administrador Technoagentes es una plataforma SaaS multi-inquilino implementada en AWS utilizando un enfoque serverless. La arquitectura está diseñada para proporcionar:

- **Aislamiento de inquilinos**: Separación lógica de datos y accesos entre empresas
- **Escalabilidad**: Capacidad para crecer desde unos pocos hasta miles de inquilinos
- **Seguridad**: Protección de datos sensibles y prevención de acceso no autorizado
- **Flexibilidad**: Adaptación a diferentes necesidades de configuración por inquilino
- **Operabilidad**: Facilidad de monitoreo, mantenimiento y resolución de problemas

## Componentes Principales

### Gestión de Identidades y Accesos

#### Amazon Cognito

- **Pool de Usuarios Único**: Almacena todos los usuarios de todas las empresas
- **Atributo `custom:tenantId`**: Identifica la pertenencia de cada usuario a una empresa específica
- **Grupos por Inquilino**: Estructura `<tenantId>_Admins` y `<tenantId>_Users` para roles
- **Pool de Identidades**: Federa identidades y asigna roles IAM temporales

#### Flujo de Autenticación

1. El usuario inicia sesión a través de Cognito
2. Cognito emite un token JWT con claims que incluyen `custom:tenantId` y grupos
3. El token se envía en las solicitudes a la API
4. El autorizador de API Gateway valida el token
5. Las funciones Lambda extraen el `tenantId` y los grupos para autorización

### Almacenamiento de Datos

#### Amazon DynamoDB

- **Modelo de Tabla Única**: Tablas compartidas entre inquilinos
- **Particionamiento Lógico**: Claves de partición con formato `TENANT#<tenantId>`
- **Tablas Principales**:
  - `TenantsTable`: Información de inquilinos
  - `UsersTable`: Perfiles de usuario
  - `ConfigurationsTable`: Configuraciones específicas por inquilino
  - `TCAcceptanceTable`: Registros de aceptación de términos y condiciones
  - `WebhookEventsTable`: Registro de eventos procesados (idempotencia)

#### Amazon S3

- **Bucket Compartido**: Un único bucket para todos los inquilinos
- **Prefijos por Inquilino**: Estructura `/<tenantId>/...` para aislamiento
- **Access Points**: Puntos de acceso específicos por inquilino
- **Cifrado**: Server-Side Encryption con KMS

### Procesamiento

#### AWS Lambda

- **Funciones por Dominio**: Separación de responsabilidades
- **Manejadores de API**: Procesan solicitudes de API Gateway
- **Tareas de Step Functions**: Ejecutan pasos del flujo de onboarding
- **Procesadores de Eventos**: Manejan webhooks y otros eventos asíncronos

#### Amazon API Gateway

- **API RESTful**: Endpoints para gestión de usuarios, configuraciones, etc.
- **Autorizador de Cognito**: Valida tokens JWT
- **Mapeo de Recursos**: Estructura jerárquica de recursos

#### AWS Step Functions

- **Máquina de Estados de Onboarding**: Orquesta el proceso de incorporación de nuevos inquilinos
- **Manejo de Errores**: Reintentos y gestión de fallos
- **Paralelismo**: Ejecución concurrente de tareas independientes

### Configuración y Personalización

#### AWS AppConfig

- **Aplicación Compartida**: Una aplicación para toda la plataforma
- **Perfiles de Configuración**: Configuraciones específicas por tipo
- **Despliegue Controlado**: Estrategias de despliegue para cambios de configuración

### Seguridad

#### AWS KMS

- **Clave Compartida**: Una CMK para cifrado de datos
- **Contexto de Cifrado**: Incluye `tenantId` para aislamiento criptográfico
- **Políticas de Clave**: Restricciones basadas en etiquetas de principal

#### AWS Secrets Manager

- **Secretos de Aplicación**: Almacenamiento de credenciales de API
- **Rotación Automática**: Actualización periódica de secretos

## Patrones de Diseño

### Modelo Multi-inquilino

El sistema implementa un modelo de "pool" con fuerte aislamiento lógico:

- **Recursos Compartidos**: Infraestructura compartida entre inquilinos
- **Aislamiento Lógico**: Separación mediante particionamiento y políticas
- **Eficiencia de Costos**: Mejor utilización de recursos
- **Operación Simplificada**: Gestión centralizada

### Arquitectura Orientada a Eventos

- **Webhooks**: Integración con sistemas externos mediante eventos
- **Step Functions**: Coordinación de flujos de trabajo mediante eventos
- **SQS/SNS** (planificado): Procesamiento asíncrono de tareas

### Patrón de Repositorio

- **Servicios de Datos**: Encapsulan la lógica de acceso a datos
- **Abstracción de Almacenamiento**: Independencia de la implementación subyacente

## Decisiones de Diseño

### Pool de Usuarios Único vs. Múltiples Pools

**Decisión**: Utilizar un único Pool de Usuarios de Cognito con atributo `custom:tenantId`.

**Razones**:
- Simplifica la gestión y operación
- Reduce costos al no tener que mantener múltiples pools
- Permite una experiencia de inicio de sesión unificada
- El aislamiento se logra mediante el atributo inmutable y la lógica de autorización

### Tablas DynamoDB Compartidas vs. Dedicadas

**Decisión**: Utilizar tablas compartidas con particionamiento lógico.

**Razones**:
- Mayor eficiencia en el uso de capacidad de lectura/escritura
- Simplifica la gestión de backups y mantenimiento
- Evita alcanzar límites de servicio de AWS
- El aislamiento se logra mediante claves de partición y políticas IAM

### Bucket S3 Compartido vs. Dedicado

**Decisión**: Utilizar un bucket compartido con prefijos por inquilino.

**Razones**:
- Evita alcanzar límites de buckets por cuenta
- Simplifica la gestión de políticas y configuraciones
- Permite políticas de ciclo de vida unificadas
- El aislamiento se logra mediante prefijos y políticas IAM

### Clave KMS Compartida vs. Dedicada

**Decisión**: Utilizar una clave KMS compartida con contexto de cifrado.

**Razones**:
- Reduce costos de gestión de claves
- Simplifica la rotación y auditoría
- Evita alcanzar límites de claves por región
- El aislamiento se logra mediante contexto de cifrado con `tenantId`

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Amazon Cognito                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Amazon API Gateway                         │
└───────┬───────────────────┬───────────────────┬─────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  User APIs    │   │  Config APIs  │   │ Webhook APIs  │
│  (Lambda)     │   │  (Lambda)     │   │  (Lambda)     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │                   │                   │
┌───────▼───────────────────▼───────────────────▼───────┐
│                                                       │
│                    Service Layer                      │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │CognitoSvc   │  │DynamoDBSvc  │  │PaymentSvc   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │S3Service    │  │OnboardingSvc│  │AppConfigSvc │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                       │
└───────┬───────────────────┬───────────────────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   DynamoDB    │   │      S3       │   │  AppConfig    │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Flujos de Datos Principales

### Onboarding de Nuevo Inquilino

```
Portal Admin ──> API Gateway ──> Lambda ──> Step Functions
                                               │
                                               ├──> CreateTenantRecord ──> DynamoDB
                                               │
                                               ├──> ConfigureCognitoGroups ──> Cognito
                                               │
                                               ├──> CreateSuperUser ──> Cognito
                                               │
                                               ├──> SetupInitialConfiguration ──> DynamoDB
                                               │
                                               └──> SendWelcomeEmail ──> SES
```

### Autenticación y Autorización

```
Cliente ──> Cognito ──> Token JWT ──> API Gateway ──> Autorizador
                                                        │
                                                        ▼
                                                      Lambda ──> Verificación de tenantId
                                                        │
                                                        ▼
                                                     Recursos
```

### Procesamiento de Webhook de Pago

```
Treli ──> API Gateway ──> Lambda ──> Verificación de Firma
                                       │
                                       ▼
                                    Verificación de Idempotencia ──> DynamoDB
                                       │
                                       ▼
                                    Procesamiento de Evento
                                       │
                                       ▼
                                    Actualización de Estado ──> DynamoDB
```

## Consideraciones de Escalabilidad

### Límites de Servicio

- **DynamoDB**: Particionamiento eficiente para evitar hotspots
- **Lambda**: Configuración de concurrencia para funciones críticas
- **API Gateway**: Límites de velocidad por inquilino
- **Step Functions**: Ejecuciones paralelas para onboarding masivo

### Estrategias de Caché

- **DAX** (planificado): Para consultas frecuentes a DynamoDB
- **ElastiCache** (planificado): Para datos de configuración de alta frecuencia
- **CloudFront**: Para activos estáticos y APIs de solo lectura

## Consideraciones de Seguridad

### Defensa en Profundidad

1. **Autenticación**: Cognito con políticas de contraseñas fuertes
2. **Autorización**: Verificación de `tenantId` en todas las operaciones
3. **Aislamiento de Datos**: Particionamiento lógico y políticas IAM
4. **Cifrado**: En tránsito (TLS) y en reposo (KMS)
5. **Auditoría**: CloudTrail para todas las operaciones de API

### Principio de Menor Privilegio

- Roles IAM específicos por función Lambda
- Políticas con condiciones basadas en etiquetas de principal
- Acceso temporal a recursos mediante credenciales de corta duración

## Evolución Futura

### Fase 2 (Planificada)

- **Modelo Híbrido**: Opción de recursos dedicados para inquilinos premium
- **Análisis de Datos**: Integración con servicios de análisis para métricas de uso
- **Automatización Avanzada**: CI/CD completo para despliegues por inquilino
- **Monitoreo Mejorado**: Dashboards específicos por inquilino

### Fase 3 (Considerada)

- **Multi-región**: Replicación para alta disponibilidad global
- **Personalización Avanzada**: Extensibilidad mediante plugins
- **Marketplace**: Integración con AWS Marketplace para facturación