# Guía de Despliegue: Administrador Technoagentes

Esta guía proporciona instrucciones detalladas para desplegar el proyecto Administrador Technoagentes en un ambiente de prueba en AWS.

## Requisitos Previos

1. Cuenta de AWS con permisos adecuados
2. AWS CLI instalado y configurado
3. Node.js 18.x o superior
4. Git

## Despliegue del Backend

### 1. Desplegar con Serverless Framework

```bash
# Instalar dependencias
npm install

# Desplegar en el ambiente de desarrollo
npm run deploy:dev
```

Si encuentras errores relacionados con "too many open files", puedes intentar lo siguiente:

```bash
# En sistemas Unix/Linux/macOS
ulimit -n 4096

# O desplegar con opciones específicas
npx serverless deploy --stage dev --conceal
```

### 2. Despliegue Manual en AWS Console

Si el despliegue con Serverless Framework falla, puedes desplegar manualmente los recursos:

1. **Cognito User Pool**:
   - Accede a la consola de AWS > Amazon Cognito > User Pools
   - Crea un nuevo User Pool con las siguientes configuraciones:
     - Nombre: `administrador-technoagentes-user-pool-dev`
     - Atributos: Email como username
     - Atributos personalizados: `custom:tenantId` (String, inmutable)
     - Políticas de contraseña según los requisitos

2. **DynamoDB Tables**:
   - Accede a la consola de AWS > DynamoDB > Tables
   - Crea las siguientes tablas:
     - `administrador-technoagentes-tenants-dev`
     - `administrador-technoagentes-users-dev`
     - `administrador-technoagentes-configurations-dev`
     - `administrador-technoagentes-tc-acceptance-dev`
     - `administrador-technoagentes-webhook-events-dev`
   - Configura las claves primarias y secundarias según el archivo `serverless.yml`

3. **S3 Bucket**:
   - Accede a la consola de AWS > S3
   - Crea un bucket: `administrador-technoagentes-tenant-data-dev-XXXX`
   - Configura el cifrado con KMS

4. **API Gateway**:
   - Accede a la consola de AWS > API Gateway
   - Crea una nueva API REST: `administrador-technoagentes-dev`
   - Configura los endpoints según el archivo `serverless.yml`
   - Configura el autorizador de Cognito

5. **Lambda Functions**:
   - Accede a la consola de AWS > Lambda
   - Crea las funciones Lambda necesarias
   - Configura las variables de entorno según el archivo `serverless.yml`

## Despliegue del Frontend

### 1. Configurar Variables de Entorno

Crea o actualiza el archivo `frontend/.env.local` con la siguiente información:

```
# API URL
NEXT_PUBLIC_API_URL=https://XXXX.execute-api.us-east-1.amazonaws.com/dev

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXX
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXX

# App
NEXT_PUBLIC_APP_NAME=Administrador Technoagentes
```

Reemplaza los valores XXXX con los IDs reales obtenidos del despliegue del backend.

### 2. Desplegar con AWS Amplify Hosting

1. Accede a la consola de AWS > AWS Amplify
2. Selecciona "Host web app"
3. Conecta tu repositorio de GitHub o sube el código directamente
4. Configura las opciones de construcción:
   - Nombre de la aplicación: `administrador-technoagentes`
   - Rama: `main` o la que prefieras
   - Comando de construcción: `cd frontend && npm ci && npm run build`
   - Directorio de salida: `frontend/.next`
5. Configura las variables de entorno según el archivo `.env.local`
6. Inicia el despliegue

### 3. Despliegue Manual

Si prefieres un despliegue manual:

```bash
# Instalar dependencias
cd frontend
npm ci

# Construir la aplicación
npm run build

# Iniciar la aplicación localmente
npm start
```

Luego, puedes desplegar los archivos generados en `.next` a un servicio de hosting como AWS S3 + CloudFront.

## Verificación del Despliegue

1. **Backend**:
   - Verifica que los endpoints de la API estén funcionando correctamente
   - Prueba la autenticación con Cognito
   - Verifica que las tablas de DynamoDB estén creadas correctamente

2. **Frontend**:
   - Accede a la URL proporcionada por AWS Amplify
   - Verifica que puedas iniciar sesión y registrarte
   - Prueba las funcionalidades principales

## Solución de Problemas

### Error: "Too many open files"

Este error puede ocurrir en sistemas con límites bajos de archivos abiertos:

```bash
# Aumentar el límite de archivos abiertos (Unix/Linux/macOS)
ulimit -n 4096

# En Windows, considera usar WSL o ajustar la configuración del sistema
```

### Error: "Stack failed to deploy"

Verifica los logs de CloudFormation para identificar el recurso específico que falló:

1. Accede a la consola de AWS > CloudFormation
2. Selecciona el stack `administrador-technoagentes-dev`
3. Revisa la pestaña "Events" para identificar el error

### Error: "Cognito authentication failed"

Verifica que los IDs de Cognito en el frontend coincidan con los del backend:

1. Comprueba el archivo `.env.local`
2. Verifica que el User Pool y el Client ID sean correctos
3. Asegúrate de que el autorizador de API Gateway esté configurado correctamente

## Recursos Adicionales

- [Documentación de Serverless Framework](https://www.serverless.com/framework/docs/)
- [Documentación de AWS Amplify](https://docs.amplify.aws/)
- [Documentación de Next.js](https://nextjs.org/docs)

## Contacto

Si encuentras problemas durante el despliegue, contacta al equipo de desarrollo.
