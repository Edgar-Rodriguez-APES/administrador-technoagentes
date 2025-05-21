# Administrador Technoagentes - Frontend

Frontend para la aplicación Administrador Technoagentes, una plataforma de acceso para clientes a agentes inteligentes de IA Generativa.

## Características

- Autenticación con Amazon Cognito
- Gestión de usuarios y tenants
- Configuración de agentes
- Interfaz moderna con Tailwind CSS
- Arquitectura multi-inquilino

## Tecnologías

- [Next.js](https://nextjs.org/) - Framework de React para aplicaciones web
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitario
- [AWS Amplify](https://aws.amazon.com/amplify/) - Plataforma de desarrollo y despliegue
- [Amazon Cognito](https://aws.amazon.com/cognito/) - Servicio de autenticación y autorización

## Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Cuenta de AWS con acceso a Cognito y API Gateway

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/administrador-technoagentes.git
cd administrador-technoagentes/frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

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

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Construcción

Para construir la aplicación para producción:

```bash
npm run build
```

Para iniciar la aplicación en modo producción:

```bash
npm start
```

## Estructura del Proyecto

```
frontend/
├── public/               # Archivos estáticos
├── src/                  # Código fuente
│   ├── app/              # Páginas y rutas de Next.js
│   │   ├── dashboard/    # Página de dashboard
│   │   ├── login/        # Página de inicio de sesión
│   │   └── page.tsx      # Página principal
│   ├── components/       # Componentes reutilizables
│   │   ├── auth/         # Componentes de autenticación
│   │   └── layout/       # Componentes de layout
│   ├── config/           # Configuración de la aplicación
│   ├── contexts/         # Contextos de React
│   └── services/         # Servicios para API y autenticación
├── .env.local            # Variables de entorno locales
├── amplify.yml           # Configuración de AWS Amplify
├── next.config.js        # Configuración de Next.js
├── package.json          # Dependencias y scripts
└── tailwind.config.js    # Configuración de Tailwind CSS
```

## Despliegue

Para instrucciones detalladas sobre cómo desplegar la aplicación, consulta el archivo [DEPLOYMENT.md](DEPLOYMENT.md).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
