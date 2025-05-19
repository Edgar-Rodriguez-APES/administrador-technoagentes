# Script para desplegar el proyecto Administrador Technoagentes en AWS

Write-Host "Iniciando despliegue del proyecto Administrador Technoagentes en AWS..." -ForegroundColor Yellow

# Verificar que AWS CLI está instalado
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI no está instalado. Por favor, instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar que Serverless Framework está instalado
if (-not (Get-Command serverless -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Serverless Framework no está instalado. Por favor, instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar credenciales de AWS
Write-Host "Verificando credenciales de AWS..." -ForegroundColor Yellow
try {
    aws sts get-caller-identity
}
catch {
    Write-Host "Error: No se pudieron verificar las credenciales de AWS. Por favor, configura tus credenciales." -ForegroundColor Red
    exit 1
}

# Desplegar el backend con Serverless Framework
Write-Host "Desplegando el backend con Serverless Framework..." -ForegroundColor Yellow
npm run deploy:dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo desplegar el backend." -ForegroundColor Red
    exit 1
}

# Obtener información del despliegue
Write-Host "Obteniendo información del despliegue..." -ForegroundColor Yellow
$API_ID = aws apigateway get-rest-apis --query "items[?name=='administrador-technoagentes-dev'].id" --output text
$API_URL = "https://$API_ID.execute-api.us-east-1.amazonaws.com/dev"
Write-Host "URL de la API: $API_URL" -ForegroundColor Green

$COGNITO_USER_POOL_ID = aws cognito-idp list-user-pools --max-results 10 --query "UserPools[?Name=='administrador-technoagentes-user-pool-dev'].Id" --output text
Write-Host "ID del User Pool de Cognito: $COGNITO_USER_POOL_ID" -ForegroundColor Green

$COGNITO_CLIENT_ID = aws cognito-idp list-user-pool-clients --user-pool-id $COGNITO_USER_POOL_ID --query "UserPoolClients[?ClientName=='administrador-technoagentes-client-dev'].ClientId" --output text
Write-Host "ID del Cliente de Cognito: $COGNITO_CLIENT_ID" -ForegroundColor Green

# Actualizar el archivo de configuración de Amplify
Write-Host "Actualizando el archivo de configuración de Amplify..." -ForegroundColor Yellow
(Get-Content amplify.yml) -replace "NEXT_PUBLIC_API_URL: 'https://API_GATEWAY_URL'", "NEXT_PUBLIC_API_URL: '$API_URL'" | Set-Content amplify.yml
(Get-Content amplify.yml) -replace "NEXT_PUBLIC_COGNITO_CLIENT_ID: 'COGNITO_CLIENT_ID'", "NEXT_PUBLIC_COGNITO_CLIENT_ID: '$COGNITO_CLIENT_ID'" | Set-Content amplify.yml
(Get-Content amplify.yml) -replace "NEXT_PUBLIC_COGNITO_USER_POOL_ID: 'COGNITO_USER_POOL_ID'", "NEXT_PUBLIC_COGNITO_USER_POOL_ID: '$COGNITO_USER_POOL_ID'" | Set-Content amplify.yml

# Actualizar el archivo .env.local del frontend
Write-Host "Actualizando el archivo .env.local del frontend..." -ForegroundColor Yellow
@"
# API URL
NEXT_PUBLIC_API_URL=$API_URL

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

# App
NEXT_PUBLIC_APP_NAME=Administrador Technoagentes
"@ | Set-Content frontend/.env.local

# Desplegar el frontend en AWS Amplify
Write-Host "Desplegando el frontend en AWS Amplify..." -ForegroundColor Yellow
Set-Location frontend
npm ci
npm run build
Set-Location ..

# Crear una aplicación en AWS Amplify
Write-Host "Creando una aplicación en AWS Amplify..." -ForegroundColor Yellow
try {
    $APP_ID = aws amplify create-app --name "administrador-technoagentes" --repository "https://github.com/tu-usuario/administrador-technoagentes" --access-token "tu-token-de-github" --query "app.appId" --output text
    Write-Host "ID de la aplicación en AWS Amplify: $APP_ID" -ForegroundColor Green
    
    # Crear una rama en AWS Amplify
    Write-Host "Creando una rama en AWS Amplify..." -ForegroundColor Yellow
    aws amplify create-branch --app-id $APP_ID --branch-name main
    
    # Iniciar el despliegue
    Write-Host "Iniciando el despliegue en AWS Amplify..." -ForegroundColor Yellow
    aws amplify start-job --app-id $APP_ID --branch-name main --job-type RELEASE
}
catch {
    Write-Host "Error: No se pudo crear la aplicación en AWS Amplify." -ForegroundColor Red
    Write-Host "Puedes crear la aplicación manualmente en la consola de AWS Amplify." -ForegroundColor Yellow
}

Write-Host "¡Despliegue completado!" -ForegroundColor Green
Write-Host "Recuerda actualizar la URL de la API en la configuración del frontend si es necesario." -ForegroundColor Yellow
