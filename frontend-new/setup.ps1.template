# Script para configurar el proyecto frontend de Administrador Technoagentes

# Crear directorios necesarios
Write-Host "Creando directorios..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "src\contexts" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components\auth" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components\layout" | Out-Null
New-Item -ItemType Directory -Force -Path "src\services" | Out-Null
New-Item -ItemType Directory -Force -Path "src\config" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\login" | Out-Null

# Copiar archivos de plantilla
Write-Host "Copiando archivos de plantilla..." -ForegroundColor Green
Copy-Item -Path ".env.local.template" -Destination ".env.local" -Force
Copy-Item -Path "amplify.yml.template" -Destination "amplify.yml" -Force
Copy-Item -Path "tailwind.config.js.template" -Destination "tailwind.config.js" -Force
Copy-Item -Path "DEPLOYMENT.md.template" -Destination "DEPLOYMENT.md" -Force

Copy-Item -Path "src\contexts\AuthContext.tsx.template" -Destination "src\contexts\AuthContext.tsx" -Force
Copy-Item -Path "src\contexts\TenantContext.tsx.template" -Destination "src\contexts\TenantContext.tsx" -Force
Copy-Item -Path "src\components\auth\ProtectedRoute.tsx.template" -Destination "src\components\auth\ProtectedRoute.tsx" -Force
Copy-Item -Path "src\components\layout\MainLayout.tsx.template" -Destination "src\components\layout\MainLayout.tsx" -Force
Copy-Item -Path "src\services\api.ts.template" -Destination "src\services\api.ts" -Force
Copy-Item -Path "src\config\amplify.ts.template" -Destination "src\config\amplify.ts" -Force
Copy-Item -Path "src\app\dashboard\page.tsx.template" -Destination "src\app\dashboard\page.tsx" -Force
Copy-Item -Path "src\app\login\page.tsx.template" -Destination "src\app\login\page.tsx" -Force
Copy-Item -Path "src\app\page.tsx.template" -Destination "src\app\page.tsx" -Force

# Instalar dependencias adicionales
Write-Host "Instalando dependencias adicionales..." -ForegroundColor Green
npm install aws-amplify@6.0.15

# Mensaje final
Write-Host "Configuración completada con éxito!" -ForegroundColor Green
Write-Host "Para iniciar el servidor de desarrollo, ejecuta: npm run dev" -ForegroundColor Yellow
