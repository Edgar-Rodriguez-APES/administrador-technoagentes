# Guía de Despliegue - Frontend Administrador Technoagentes

Esta guía proporciona instrucciones detalladas para desplegar el frontend de la aplicación Administrador Technoagentes en AWS Amplify.

## Requisitos Previos

1. Cuenta de AWS con permisos para usar AWS Amplify
2. AWS CLI configurado con credenciales válidas
3. Git instalado y configurado
4. Repositorio de código en GitHub, GitLab o Bitbucket

## Preparación para el Despliegue

### 1. Configurar Variables de Entorno

Antes de desplegar, asegúrate de tener las siguientes variables de entorno configuradas:

1. Copia el archivo `.env.local.template` a `.env.local` y completa los valores:

```bash
cp .env.local.template .env.local
```

Edita el archivo `.env.local` con los valores correctos:

```
# API URL
NEXT_PUBLIC_API_URL=https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=67tqo3vsmpg25bt50f1sud1rk0
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_lJikpz0Bu
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# App
NEXT_PUBLIC_APP_NAME=Administrador Technoagentes
```

### 2. Construir la Aplicación Localmente (Opcional)

Para verificar que todo funciona correctamente antes de desplegar:

```bash
npm run build
```

## Despliegue en AWS Amplify

### 1. Despliegue Manual desde la Consola de AWS

1. Inicia sesión en la [Consola de AWS](https://aws.amazon.com/console/)
2. Navega a AWS Amplify
3. Haz clic en "Crear nueva aplicación"
4. Selecciona tu proveedor de repositorio (GitHub, GitLab, Bitbucket)
5. Autoriza a AWS Amplify para acceder a tu repositorio
6. Selecciona el repositorio y la rama que deseas desplegar
7. Configura las opciones de construcción:
   - Asegúrate de que el archivo `amplify.yml` esté configurado correctamente
   - Añade las variables de entorno necesarias en la sección "Variables de entorno"
8. Haz clic en "Guardar y desplegar"

### 2. Despliegue Automatizado con AWS CLI

1. Crea un archivo `amplify.yml` en la raíz del proyecto (puedes usar el template proporcionado)
2. Ejecuta el siguiente comando para desplegar:

```bash
aws amplify create-app \
  --name "AdministradorTechnoagentes" \
  --repository "https://github.com/tu-usuario/tu-repositorio" \
  --access-token "tu-token-de-acceso" \
  --build-spec "$(cat amplify.yml)"
```

3. Configura las variables de entorno:

```bash
aws amplify create-branch \
  --app-id "tu-app-id" \
  --branch-name "main" \
  --environment-variables "NEXT_PUBLIC_API_URL=https://z3egsgkq28.execute-api.us-east-1.amazonaws.com/dev,NEXT_PUBLIC_COGNITO_CLIENT_ID=67tqo3vsmpg25bt50f1sud1rk0,NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_lJikpz0Bu,NEXT_PUBLIC_COGNITO_REGION=us-east-1,NEXT_PUBLIC_APP_NAME=Administrador Technoagentes"
```

4. Inicia el despliegue:

```bash
aws amplify start-job \
  --app-id "tu-app-id" \
  --branch-name "main" \
  --job-type "RELEASE"
```

## Configuración de Dominio Personalizado (Opcional)

1. En la consola de AWS Amplify, selecciona tu aplicación
2. Ve a la pestaña "Dominios"
3. Haz clic en "Añadir dominio"
4. Sigue las instrucciones para configurar tu dominio personalizado

## Solución de Problemas

### Error de Construcción

Si encuentras errores durante la construcción:

1. Verifica los logs de construcción en la consola de AWS Amplify
2. Asegúrate de que todas las dependencias estén correctamente instaladas
3. Verifica que las variables de entorno estén configuradas correctamente

### Problemas de Autenticación

Si hay problemas con la autenticación de Cognito:

1. Verifica que el User Pool ID y el Client ID sean correctos
2. Asegúrate de que el flujo de autenticación USER_PASSWORD_AUTH esté habilitado en el User Pool
3. Verifica que las variables de entorno estén configuradas correctamente

## Recursos Adicionales

- [Documentación de AWS Amplify](https://docs.aws.amazon.com/amplify/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Amazon Cognito](https://docs.aws.amazon.com/cognito/)
