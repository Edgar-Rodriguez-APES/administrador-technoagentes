# Administrador Technoagentes

Portal web empresarial multi-inquilino en AWS que sirve como plataforma de acceso para clientes a agentes inteligentes de IA Generativa.

## Estructura del Proyecto

### Backend
- `/src` - Código fuente del backend
  - `/auth` - Gestión de identidades y accesos (IAM)
  - `/data` - Almacenamiento y segregación de datos
  - `/onboarding` - Proceso de onboarding y configuración
  - `/api` - Definiciones de API Gateway
  - `/common` - Utilidades y funciones comunes
- `/infrastructure` - Código de infraestructura como código (IaC)
- `/tests` - Pruebas unitarias e integración

### Frontend
- `/frontend` - Código fuente del frontend (Next.js)
  - `/src` - Código fuente
    - `/app` - Páginas y rutas de la aplicación
    - `/components` - Componentes reutilizables
    - `/contexts` - Contextos de React para estado global
    - `/services` - Servicios para interactuar con la API
    - `/styles` - Estilos y temas
    - `/utils` - Utilidades y funciones auxiliares

### Documentación
- `DEPLOYMENT_SUMMARY.md` - Resumen del despliegue
- `FRONTEND_API_INTEGRATION.md` - Documentación de la integración del frontend con la API
- `FRONTEND_ISSUES.md` - Problemas identificados en el frontend actual
- `FRONTEND_REDESIGN_PLAN.md` - Plan para el rediseño del frontend

## Características Principales

- Gestión de identidades y accesos multi-inquilino con Amazon Cognito
- Almacenamiento y segregación de datos por empresa
- Sistema de onboarding, configuración y facturación
- Interfaz de usuario moderna y responsiva
- API RESTful para interacción con el backend
- Seguridad y escalabilidad basada en servicios AWS

## Estado del Proyecto

El backend está completamente funcional y desplegado en AWS. El frontend actual es un prototipo funcional que se planea rediseñar para mejorar la experiencia de usuario y resolver algunos problemas técnicos identificados.

## Despliegue

La aplicación está desplegada en AWS utilizando los siguientes servicios:
- AWS Amplify para el frontend
- API Gateway para la API RESTful
- Lambda para la lógica de negocio
- DynamoDB para el almacenamiento de datos
- Cognito para la autenticación y autorización

Para más detalles sobre el despliegue, consulta el archivo `DEPLOYMENT_SUMMARY.md`.