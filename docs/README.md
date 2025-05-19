# Administrador Technoagentes - Documentación

Documentación completa del sistema para un portal web empresarial multi-inquilino en AWS que sirve como plataforma de acceso para clientes a agentes inteligentes de IA Generativa. Incluye tanto el backend como el frontend.

## Índice

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Componentes Principales](#componentes-principales)
5. [Flujos de Trabajo](#flujos-de-trabajo)
6. [Guías de Implementación](#guías-de-implementación)
7. [API Reference](#api-reference)
8. [Frontend](#frontend)
9. [Seguridad](#seguridad)
10. [Operaciones](#operaciones)
11. [Preguntas Frecuentes](#preguntas-frecuentes)

## Introducción

Administrador Technoagentes es una plataforma SaaS (Software as a Service) multi-inquilino que permite a empresas acceder y gestionar agentes inteligentes de IA Generativa. La plataforma está construida sobre servicios de AWS, aprovechando las capacidades de escalabilidad, seguridad y alta disponibilidad de la nube.

### Objetivos del Proyecto

- Proporcionar una plataforma segura y escalable para la gestión de agentes de IA
- Implementar un modelo multi-inquilino con aislamiento de datos entre empresas
- Facilitar el onboarding de nuevos clientes con un proceso automatizado
- Ofrecer capacidades de configuración y personalización por empresa
- Integrar con sistemas de pago para la facturación automática

### Características Principales

- Gestión de identidades y accesos multi-inquilino
- Almacenamiento y segregación de datos por empresa
- Sistema de onboarding, configuración y facturación
- Panel de administración para superusuarios de cada empresa
- Integración con proveedores de pago (Treli)
- Frontend moderno con Next.js, React y AWS Amplify
- Interfaz de usuario intuitiva y responsiva

## Arquitectura

La arquitectura del sistema está basada en servicios gestionados de AWS, siguiendo un enfoque serverless y orientado a eventos.

### Diagrama de Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Cliente Web    │     │  Cliente Móvil  │     │  Treli Webhooks │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Frontend (Next.js)                         │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      API Gateway + Dominio                      │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Cognito Authorizer                         │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Lambda Functions                           │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      AWS Services                               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│
│  │DynamoDB     │  │S3           │  │Secrets      │  │KMS       ││
│  │Tables       │  │Bucket       │  │Manager      │  │          ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘│
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │CloudWatch   │  │Cognito      │  │Step         │             │
│  │Monitoring   │  │User Pool    │  │Functions    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes de AWS Utilizados

- **Amazon Cognito**: Gestión de identidades y accesos de usuarios
- **Amazon API Gateway**: Exposición de APIs RESTful
- **AWS Lambda**: Procesamiento de lógica de negocio
- **Amazon DynamoDB**: Almacenamiento de datos estructurados
- **Amazon S3**: Almacenamiento de archivos
- **AWS Step Functions**: Orquestación de flujos de trabajo
- **AWS AppConfig**: Gestión de configuraciones
- **Amazon SES**: Envío de correos electrónicos
- **AWS KMS**: Gestión de claves de cifrado
- **AWS Secrets Manager**: Almacenamiento seguro de secretos
- **AWS Amplify**: Integración del frontend con servicios de AWS

### Modelo Multi-inquilino

El sistema implementa un modelo de multi-tenancy de tipo "pool" con fuerte aislamiento lógico:

- **Cognito**: Un único pool de usuarios con atributo personalizado `custom:tenantId` y grupos específicos por inquilino
- **DynamoDB**: Tablas compartidas con particionamiento lógico usando `tenantId` en las claves
- **S3**: Bucket compartido con prefijos por inquilino
- **IAM**: Políticas basadas en etiquetas de principal y condiciones específicas por servicio

## Estructura del Proyecto

```
administrador-technoagentes/
├── src/                      # Código fuente del backend
│   ├── auth/                 # Gestión de identidades y accesos
│   ├── data/                 # Acceso y gestión de datos
│   ├── onboarding/           # Proceso de onboarding
│   ├── api/                  # Manejadores de API Gateway
│   └── common/               # Utilidades comunes
├── frontend/                 # Código fuente del frontend
│   ├── public/               # Archivos estáticos
│   ├── src/                  # Código fuente de React/Next.js
│   │   ├── app/              # Páginas y rutas de Next.js
│   │   ├── components/       # Componentes reutilizables
│   │   ├── contexts/         # Contextos de React
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── services/         # Servicios para API
│   │   └── config/           # Configuración
│   ├── package.json          # Dependencias del frontend
│   └── next.config.js        # Configuración de Next.js
├── infrastructure/           # Infraestructura como código
│   ├── cognito.tf            # Configuración de Cognito
│   ├── dynamodb.tf           # Configuración de DynamoDB
│   ├── s3.tf                 # Configuración de S3
│   ├── kms.tf                # Configuración de KMS
│   ├── api_gateway.tf        # Configuración de API Gateway
│   ├── lambda.tf             # Configuración de Lambda
│   ├── step_functions.tf     # Configuración de Step Functions
│   ├── appconfig.tf          # Configuración de AppConfig
│   └── variables.tf          # Variables de Terraform
├── tests/                    # Pruebas
├── docs/                     # Documentación
├── package.json              # Dependencias y scripts del backend
└── serverless.yml            # Configuración de Serverless Framework
```

## Componentes Principales

### Gestión de Identidades y Accesos

#### CognitoService

El servicio `CognitoService` proporciona funciones para gestionar usuarios y grupos en Amazon Cognito, con aislamiento por inquilino.

**Características principales:**
- Creación de usuarios con `tenantId` inmutable
- Gestión de grupos específicos por inquilino
- Verificación de pertenencia a inquilino en todas las operaciones
- Asignación de roles (Admin/User) dentro de cada inquilino

**Ejemplo de uso:**

```javascript
const cognitoService = new CognitoService();

// Crear un superusuario para un nuevo inquilino
const superUser = await cognitoService.createTenantSuperUser(
  'admin@empresa.com',
  'tenant-123',
  'Empresa ABC'
);

// Listar usuarios de un inquilino
const users = await cognitoService.listTenantUsers(
  'tenant-123',
  'admin@empresa.com'
);
```

### Almacenamiento y Segregación de Datos

#### DynamoDBService

El servicio `DynamoDBService` proporciona funciones para gestionar datos en Amazon DynamoDB con aislamiento por inquilino.

**Características principales:**
- Operaciones CRUD con aislamiento por `tenantId`
- Esquema de tabla única con particionamiento lógico
- Gestión de configuraciones específicas por inquilino
- Registro de aceptación de términos y condiciones

**Ejemplo de uso:**

```javascript
const dynamoDBService = new DynamoDBService();

// Crear un inquilino
const tenant = await dynamoDBService.createTenant({
  tenantId: 'tenant-123',
  name: 'Empresa ABC',
  email: 'contacto@empresa.com',
  plan: 'STANDARD'
});

// Guardar configuración de un inquilino
await dynamoDBService.saveTenantConfiguration(
  'tenant-123',
  'agents',
  { basic: { enabled: true, maxCalls: 1000 } }
);
```

#### S3Service

El servicio `S3Service` proporciona funciones para gestionar archivos en Amazon S3 con aislamiento por prefijos de inquilino.

**Características principales:**
- Operaciones de archivo con aislamiento por prefijo de inquilino
- Verificación adicional de metadatos para mayor seguridad
- Generación de URLs prefirmadas para carga/descarga directa
- Cifrado de datos con KMS

**Ejemplo de uso:**

```javascript
const s3Service = new S3Service();

// Subir un archivo para un inquilino
await s3Service.uploadFile(
  'tenant-123',
  'configuraciones/config.json',
  jsonContent,
  { contentType: 'application/json' }
);

// Generar URL para descarga directa
const url = await s3Service.getSignedDownloadUrl(
  'tenant-123',
  'informes/reporte.pdf',
  3600 // Expiración en segundos
);
```

### Onboarding y Configuración

#### TenantOnboardingService

El servicio `TenantOnboardingService` orquesta el proceso de onboarding de nuevos inquilinos, utilizando AWS Step Functions.

**Características principales:**
- Generación de ID único para cada inquilino
- Creación de registros en DynamoDB
- Configuración de grupos en Cognito
- Creación del superusuario inicial
- Configuración inicial de servicios
- Integración con proveedores de pago
- Envío de correo de bienvenida

**Ejemplo de uso:**

```javascript
const onboardingService = new TenantOnboardingService();

// Iniciar el proceso de onboarding
const result = await onboardingService.startOnboarding(
  {
    name: 'Empresa ABC',
    email: 'admin@empresa.com',
    plan: 'STANDARD',
    address: 'Calle Principal 123',
    phone: '+1234567890'
  },
  'pm_card_visa_token123' // Token de pago de Stripe
);

// Verificar el estado del onboarding
const status = await onboardingService.checkOnboardingStatus(
  result.executionArn
);
```

#### PaymentService

El servicio `PaymentService` gestiona la integración con proveedores de pago (Treli) para suscripciones y facturación.

**Características principales:**
- Creación de clientes y suscripciones en Treli
- Procesamiento de webhooks para eventos de pago
- Actualización del estado de suscripción en DynamoDB
- Manejo seguro de secretos con AWS Secrets Manager

**Ejemplo de uso:**

```javascript
const paymentService = new PaymentService();

// Crear un cliente en Treli
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

### APIs y Manejadores

#### tenant-users-handler

Manejador de Lambda para la API de gestión de usuarios de inquilinos.

**Endpoints:**
- `GET /tenants/users` - Listar usuarios de un inquilino
- `GET /tenants/users/{userId}` - Obtener un usuario específico
- `POST /tenants/users` - Crear un nuevo usuario
- `PUT /tenants/users/{userId}` - Actualizar un usuario existente
- `DELETE /tenants/users/{userId}` - Eliminar un usuario

#### tenant-config-handler

Manejador de Lambda para la API de configuración de inquilinos.

**Endpoints:**
- `GET /tenants/configurations` - Listar todas las configuraciones
- `GET /tenants/configurations/{configType}` - Obtener una configuración específica
- `PUT /tenants/configurations/{configType}` - Actualizar una configuración

#### tc-acceptance-handler

Manejador de Lambda para la API de aceptación de términos y condiciones.

**Endpoints:**
- `GET /tc-acceptance` - Verificar aceptación de términos
- `POST /tc-acceptance` - Registrar aceptación de términos

#### webhook-handler

Manejador de Lambda para procesar webhooks de proveedores de pago.

**Endpoints:**
- `POST /webhooks/payment` - Procesar eventos de Stripe

## Frontend

El frontend del Administrador Technoagentes es una aplicación web moderna desarrollada con Next.js, React y TypeScript, que proporciona una interfaz de usuario intuitiva para interactuar con la API del backend.

### Tecnologías Utilizadas

- **Next.js**: Framework de React para aplicaciones web con renderizado del lado del servidor
- **React**: Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript**: Superset de JavaScript que añade tipado estático
- **Tailwind CSS**: Framework de CSS utilitario para diseño rápido y responsivo
- **AWS Amplify**: Biblioteca para integrar servicios de AWS como Cognito y API Gateway
- **React Query**: Biblioteca para gestión de estado y peticiones a la API

### Componentes Principales

#### AuthContext

Contexto de React que gestiona el estado de autenticación y proporciona funciones para iniciar sesión, registrarse, cerrar sesión y recuperar contraseñas.

**Características principales:**
- Integración con Cognito para autenticación
- Almacenamiento del usuario actual y su estado de autenticación
- Funciones para todas las operaciones de autenticación
- Protección de rutas para usuarios no autenticados

**Ejemplo de uso:**

```javascript
import { useAuth } from '@/contexts/AuthContext';

function LoginButton() {
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('usuario@empresa.com', 'contraseña');
      // Redirigir al dashboard
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
    </button>
  );
}
```

#### TenantContext

Contexto de React que gestiona el estado del inquilino actual y proporciona funciones para obtener y actualizar la configuración del inquilino.

**Características principales:**
- Obtención de datos del inquilino desde la API
- Almacenamiento de la configuración del inquilino
- Funciones para actualizar la configuración

#### API Services

Servicios para interactuar con la API del backend, implementados con AWS Amplify.

**Servicios principales:**
- `UserService`: Gestión de usuarios
- `TenantService`: Gestión de inquilinos
- `ConfigService`: Gestión de configuraciones
- `TCService`: Gestión de aceptación de términos y condiciones

### Flujos de Usuario

#### Inicio de Sesión
1. El usuario accede a la página de inicio de sesión
2. Ingresa su correo electrónico y contraseña
3. El sistema valida las credenciales con Cognito
4. Si son válidas, se redirige al dashboard
5. Si no son válidas, se muestra un mensaje de error

#### Registro
1. El usuario accede a la página de registro
2. Ingresa los datos de su empresa y sus datos personales
3. El sistema crea un nuevo inquilino y un superusuario
4. Se envía un correo de confirmación
5. El usuario confirma su cuenta con el código recibido

#### Gestión de Usuarios
1. El superusuario accede a la sección de usuarios
2. Puede ver, crear, editar y eliminar usuarios de su inquilino
3. Al crear un usuario, se envía un correo con credenciales temporales

#### Configuración del Inquilino
1. El superusuario accede a la sección de configuración
2. Puede ver y editar la configuración de su inquilino
3. Los cambios se guardan en tiempo real

## Flujos de Trabajo

### Proceso de Onboarding

El proceso de onboarding de un nuevo inquilino se implementa como una máquina de estados en AWS Step Functions:

1. **CreateTenantRecord**: Crea el registro del inquilino en DynamoDB y procesa el pago inicial
2. **ConfigureCognitoGroups**: Crea los grupos específicos del inquilino en Cognito
3. **CreateSuperUser**: Crea el superusuario inicial para el inquilino
4. **SetupInitialConfiguration**: Configura los ajustes iniciales según el plan
5. **SendWelcomeEmail**: Envía un correo de bienvenida al administrador

### Gestión de Usuarios por Superusuario

1. El superusuario inicia sesión en el portal con sus credenciales
2. El token JWT contiene el `custom:tenantId` y los grupos del usuario
3. El superusuario puede crear, editar y eliminar usuarios de su propio inquilino
4. Todas las operaciones verifican que el usuario pertenezca al mismo inquilino

### Procesamiento de Webhooks de Pago

1. Stripe envía un evento webhook a la API
2. El manejador verifica la firma del webhook para autenticidad
3. Se comprueba si el evento ya ha sido procesado (idempotencia)
4. Se actualiza el estado de la suscripción del inquilino en DynamoDB
5. Se activan acciones adicionales según el tipo de evento (ej. suspensión por impago)

## Guías de Implementación

### Requisitos Previos

- Cuenta de AWS con permisos adecuados
- Node.js 14.x o superior
- AWS CLI configurado
- Terraform 1.0.0 o superior (opcional, si se usa Terraform)
- Serverless Framework 3.x o superior

### Configuración del Entorno de Desarrollo

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/administrador-technoagentes.git
   cd administrador-technoagentes
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con los valores adecuados
   ```

### Despliegue con Serverless Framework

1. Desplegar en entorno de desarrollo:
   ```bash
   npm run deploy:dev
   ```

2. Desplegar en entorno de producción:
   ```bash
   npm run deploy:prod
   ```

### Despliegue con Terraform

1. Inicializar Terraform:
   ```bash
   cd infrastructure
   terraform init
   ```

2. Planificar el despliegue:
   ```bash
   terraform plan -var-file=dev.tfvars
   ```

3. Aplicar el despliegue:
   ```bash
   terraform apply -var-file=dev.tfvars
   ```

## API Reference

### Autenticación

Todas las APIs (excepto webhooks) requieren autenticación mediante token JWT de Cognito en el encabezado `Authorization`.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API de Usuarios

#### Listar Usuarios

```
GET /tenants/users
```

**Parámetros de consulta:**
- `limit` (opcional): Número máximo de usuarios a devolver
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
    }
  ],
  "paginationToken": "abc123..."
}
```

#### Crear Usuario

```
POST /tenants/users
```

**Cuerpo de la solicitud:**
```json
{
  "email": "nuevo@empresa.com",
  "name": "Nuevo Usuario",
  "role": "User"
}
```

**Respuesta:**
```json
{
  "message": "User created successfully",
  "user": {
    "username": "nuevo@empresa.com",
    "userStatus": "FORCE_CHANGE_PASSWORD",
    "created": "2023-08-15T10:30:00Z",
    "tenantId": "tenant-123",
    "role": "User",
    "temporaryPassword": "Abc123!@#"
  }
}
```

### API de Configuración

#### Obtener Configuración

```
GET /tenants/configurations/{configType}
```

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

#### Actualizar Configuración

```
PUT /tenants/configurations/{configType}
```

**Parámetros de ruta:**
- `configType`: Tipo de configuración (agents, limits, ui)

**Cuerpo de la solicitud:**
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
    "updatedAt": "2023-08-15T11:45:00Z"
  }
}
```

### API de Términos y Condiciones

#### Verificar Aceptación

```
GET /tc-acceptance?version=1.0
```

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

#### Registrar Aceptación

```
POST /tc-acceptance
```

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
    "acceptanceTimestamp": "2023-08-15T14:20:00Z"
  }
}
```

## Seguridad

### Modelo de Aislamiento Multi-inquilino

El sistema implementa un modelo de aislamiento multi-inquilino basado en:

1. **Aislamiento de Identidad**: Atributo `custom:tenantId` inmutable en Cognito
2. **Aislamiento de Datos**: Particionamiento lógico en DynamoDB y prefijos en S3
3. **Aislamiento de Acceso**: Políticas IAM con condiciones basadas en etiquetas de principal
4. **Aislamiento Criptográfico**: Contexto de cifrado con `tenantId` en KMS

### Cifrado de Datos

- **En Tránsito**: HTTPS/TLS para todas las comunicaciones
- **En Reposo**:
  - S3: Server-Side Encryption con KMS
  - DynamoDB: Cifrado con KMS
  - Secrets Manager: Cifrado por defecto

### Gestión de Secretos

Los secretos sensibles (claves de API, credenciales) se almacenan en AWS Secrets Manager y se acceden en tiempo de ejecución.

### Validación y Sanitización

Todas las entradas de usuario se validan y sanitizan antes de procesarse para prevenir inyecciones y otros ataques.

## Operaciones

### Monitoreo

- **CloudWatch Logs**: Todos los servicios envían logs a CloudWatch
- **CloudWatch Metrics**: Métricas personalizadas para operaciones clave
- **CloudWatch Alarms**: Alertas configuradas para eventos críticos

### Respaldo y Recuperación

- **DynamoDB**: Point-in-time recovery habilitado
- **S3**: Versionado habilitado
- **Cognito**: Respaldo manual a través de exportación

### Escalabilidad

- **Lambda**: Escalado automático según demanda
- **DynamoDB**: Modo bajo demanda para escalar automáticamente
- **API Gateway**: Límites de velocidad configurables

## Preguntas Frecuentes

### ¿Cómo se garantiza el aislamiento entre inquilinos?

El aislamiento se garantiza mediante múltiples capas:
1. Validación en código de la pertenencia a inquilino en todas las operaciones
2. Políticas IAM que restringen el acceso basado en el `tenantId`
3. Particionamiento lógico de datos con `tenantId` en las claves
4. Contexto de cifrado que incluye el `tenantId`

### ¿Cómo se manejan las actualizaciones de configuración?

Las configuraciones se almacenan en DynamoDB y se reflejan en AppConfig para acceso rápido. Los cambios se propagan automáticamente sin necesidad de redespliegues.

### ¿Qué sucede si un inquilino no paga?

El sistema procesa los webhooks de Stripe y actualiza el estado del inquilino a "PAYMENT_ISSUE" o "SUSPENDED" según corresponda. Esto limita automáticamente el acceso a los servicios.

### ¿Cómo se escala el sistema para muchos inquilinos?

El sistema está diseñado para escalar horizontalmente:
1. Servicios serverless que escalan automáticamente
2. Particionamiento eficiente de datos
3. Uso de caché donde sea apropiado
4. Procesamiento asíncrono para tareas pesadas