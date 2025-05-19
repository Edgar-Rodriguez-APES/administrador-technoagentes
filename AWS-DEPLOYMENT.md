# Despliegue en AWS: Administrador Technoagentes

Este documento proporciona instrucciones detalladas para desplegar el proyecto Administrador Technoagentes en un ambiente de prueba en AWS.

## Opciones de Despliegue

Hay varias opciones para desplegar el proyecto:

1. **Despliegue Automatizado con CloudFormation**: Utiliza AWS CloudFormation para desplegar toda la infraestructura de una vez.
2. **Despliegue Manual con Serverless Framework**: Utiliza Serverless Framework para desplegar el backend y AWS Amplify para el frontend.
3. **Despliegue Manual en la Consola de AWS**: Crea los recursos manualmente en la consola de AWS.

## 1. Despliegue Automatizado con CloudFormation

Este es el método recomendado para desplegar el proyecto completo.

### Requisitos Previos

- AWS CLI instalado y configurado
- PowerShell (Windows) o Bash (Linux/macOS)

### Pasos para el Despliegue

1. **Ejecutar el script de despliegue**:

   En Windows (PowerShell):
   ```powershell
   .\deploy-cloudformation.ps1
   ```

   En Linux/macOS (Bash):
   ```bash
   ./deploy-cloudformation.sh
   ```

2. **Verificar el despliegue**:
   - El script mostrará los IDs y URLs de los recursos desplegados
   - Estos valores se guardarán automáticamente en el archivo `frontend/.env.local`

3. **Desplegar el frontend**:
   - El script habrá creado una aplicación en AWS Amplify
   - Puedes conectar tu repositorio de GitHub o subir el código directamente
   - Configura las variables de entorno según el archivo `.env.local`

## 2. Despliegue Manual con Serverless Framework

### Requisitos Previos

- Node.js 18.x o superior
- Serverless Framework instalado globalmente (`npm install -g serverless`)
- AWS CLI instalado y configurado

### Pasos para el Despliegue

1. **Desplegar el backend**:
   ```bash
   # Instalar dependencias
   npm install

   # Desplegar en el ambiente de desarrollo
   npm run deploy:dev
   ```

2. **Obtener información del despliegue**:
   ```bash
   # Obtener el ID de la API Gateway
   aws apigateway get-rest-apis --query "items[?name=='administrador-technoagentes-dev'].id" --output text

   # Obtener el ID del User Pool de Cognito
   aws cognito-idp list-user-pools --max-results 10 --query "UserPools[?Name=='administrador-technoagentes-user-pool-dev'].Id" --output text

   # Obtener el ID del Cliente de Cognito
   aws cognito-idp list-user-pool-clients --user-pool-id <USER_POOL_ID> --query "UserPoolClients[?ClientName=='administrador-technoagentes-client-dev'].ClientId" --output text
   ```

3. **Configurar el frontend**:
   - Actualiza el archivo `frontend/.env.local` con los valores obtenidos
   - Instala las dependencias: `cd frontend && npm ci`
   - Construye la aplicación: `npm run build`

4. **Desplegar el frontend en AWS Amplify**:
   - Accede a la consola de AWS > AWS Amplify
   - Selecciona "Host web app"
   - Conecta tu repositorio o sube el código directamente
   - Configura las opciones de construcción según el archivo `amplify.yml`
   - Configura las variables de entorno según el archivo `.env.local`

## 3. Despliegue Manual en la Consola de AWS

Si prefieres un enfoque más visual, puedes desplegar los recursos manualmente en la consola de AWS.

### Pasos para el Despliegue

1. **Crear los recursos de Cognito**:
   - Accede a la consola de AWS > Amazon Cognito > User Pools
   - Crea un nuevo User Pool con las configuraciones especificadas en `cloudformation-template.yaml`
   - Crea un cliente para el User Pool

2. **Crear las tablas de DynamoDB**:
   - Accede a la consola de AWS > DynamoDB > Tables
   - Crea las tablas especificadas en `cloudformation-template.yaml`

3. **Crear el bucket de S3**:
   - Accede a la consola de AWS > S3
   - Crea un bucket con las configuraciones especificadas en `cloudformation-template.yaml`

4. **Crear la API Gateway**:
   - Accede a la consola de AWS > API Gateway
   - Crea una nueva API REST
   - Configura los endpoints según el archivo `serverless.yml`

5. **Crear las funciones Lambda**:
   - Accede a la consola de AWS > Lambda
   - Crea las funciones Lambda necesarias
   - Configura las variables de entorno

6. **Desplegar el frontend en AWS Amplify**:
   - Accede a la consola de AWS > AWS Amplify
   - Sigue los pasos mencionados anteriormente

## Verificación del Despliegue

1. **Verificar el backend**:
   - Prueba los endpoints de la API utilizando Postman o curl
   - Verifica que puedas crear un usuario en Cognito
   - Verifica que puedas autenticarte y obtener un token JWT

2. **Verificar el frontend**:
   - Accede a la URL proporcionada por AWS Amplify
   - Verifica que puedas iniciar sesión y registrarte
   - Prueba las funcionalidades principales

## Solución de Problemas

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

## Limpieza de Recursos

Cuando ya no necesites el ambiente de prueba, puedes eliminar los recursos para evitar cargos innecesarios:

```bash
# Eliminar el stack de CloudFormation
aws cloudformation delete-stack --stack-name administrador-technoagentes-dev

# O eliminar los recursos manualmente en la consola de AWS
```

## Recursos Adicionales

- [Documentación de AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
- [Documentación de Serverless Framework](https://www.serverless.com/framework/docs/)
- [Documentación de AWS Amplify](https://docs.amplify.aws/)
- [Documentación de Next.js](https://nextjs.org/docs)
