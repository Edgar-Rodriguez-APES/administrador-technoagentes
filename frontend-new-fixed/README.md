# Administrador Technoagentes - Frontend

Este proyecto contiene el frontend para la aplicación Administrador Technoagentes, una plataforma para la gestión de agentes de IA Generativa.

## Estructura del proyecto

El proyecto está estructurado de la siguiente manera:

- `public/`: Archivos estáticos
- `src/`: Código fuente de la aplicación
  - `app/`: Páginas de la aplicación (Next.js App Router)
  - `components/`: Componentes reutilizables
  - `contexts/`: Contextos de React (autenticación, tenant, etc.)
  - `services/`: Servicios para interactuar con la API
  - `config/`: Configuración de la aplicación

## Requisitos previos

- Node.js 18.x o superior
- npm 9.x o superior

## Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` con las siguientes variables:

```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Ejecución

### Modo de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Modo de producción

```bash
npm run build
npm start
```

## Servidor estático alternativo

Si tienes problemas para ejecutar el servidor de desarrollo de Next.js, puedes utilizar el servidor estático incluido:

```bash
python server.py
```

Este servidor servirá los archivos estáticos de la carpeta `public/` en [http://localhost:3000](http://localhost:3000).

## Autenticación

La aplicación utiliza Amazon Cognito para la autenticación. El flujo de autenticación es el siguiente:

1. El usuario ingresa sus credenciales en la página de inicio de sesión
2. La aplicación envía las credenciales a Cognito
3. Si las credenciales son válidas, Cognito devuelve un token JWT
4. La aplicación almacena el token en el almacenamiento local
5. La aplicación utiliza el token para autenticar las solicitudes a la API

## Despliegue

Para desplegar la aplicación, sigue las instrucciones en el archivo `DEPLOYMENT.md`.

## Solución de problemas

### Error 404 al acceder a la aplicación

Si recibes un error 404 al acceder a la aplicación, asegúrate de que el servidor esté en ejecución y que estés accediendo a la URL correcta.

Si estás utilizando el servidor de desarrollo de Next.js, asegúrate de que esté en ejecución con `npm run dev`.

Si estás utilizando el servidor estático, asegúrate de que esté en ejecución con `python server.py`.

### Error de conexión a la API

Si recibes errores de conexión a la API, asegúrate de que la API esté en ejecución y que la URL configurada en `.env.local` sea correcta.

### Error de autenticación

Si recibes errores de autenticación, asegúrate de que las credenciales de Cognito configuradas en `.env.local` sean correctas.

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
