# Script para desplegar la infraestructura utilizando AWS CloudFormation

# Parámetros
param(
    [string]$StackName = "administrador-technoagentes-dev",
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

# Colores para la salida
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

Write-Host "Iniciando despliegue de la infraestructura para Administrador Technoagentes..." -ForegroundColor $Yellow

# Verificar que AWS CLI está instalado
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI no está instalado. Por favor, instálalo primero." -ForegroundColor $Red
    exit 1
}

# Verificar credenciales de AWS
Write-Host "Verificando credenciales de AWS..." -ForegroundColor $Yellow
try {
    aws sts get-caller-identity
}
catch {
    Write-Host "Error: No se pudieron verificar las credenciales de AWS. Por favor, configura tus credenciales." -ForegroundColor $Red
    exit 1
}

# Desplegar la infraestructura con CloudFormation
Write-Host "Desplegando la infraestructura con CloudFormation..." -ForegroundColor $Yellow
aws cloudformation deploy `
    --template-file cloudformation-template.yaml `
    --stack-name $StackName `
    --parameter-overrides Environment=$Environment `
    --capabilities CAPABILITY_IAM `
    --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo desplegar la infraestructura." -ForegroundColor $Red
    exit 1
}

# Obtener información del despliegue
Write-Host "Obteniendo información del despliegue..." -ForegroundColor $Yellow
$Outputs = aws cloudformation describe-stacks --stack-name $StackName --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

$CognitoUserPoolId = ($Outputs | Where-Object { $_.OutputKey -eq "CognitoUserPoolId" }).OutputValue
$CognitoUserPoolClientId = ($Outputs | Where-Object { $_.OutputKey -eq "CognitoUserPoolClientId" }).OutputValue
$ApiGatewayUrl = ($Outputs | Where-Object { $_.OutputKey -eq "ApiGatewayUrl" }).OutputValue
$AmplifyAppId = ($Outputs | Where-Object { $_.OutputKey -eq "AmplifyAppId" }).OutputValue

Write-Host "ID del User Pool de Cognito: $CognitoUserPoolId" -ForegroundColor $Green
Write-Host "ID del Cliente de Cognito: $CognitoUserPoolClientId" -ForegroundColor $Green
Write-Host "URL de la API Gateway: $ApiGatewayUrl" -ForegroundColor $Green
Write-Host "ID de la aplicación de Amplify: $AmplifyAppId" -ForegroundColor $Green

# Actualizar el archivo .env.local del frontend
Write-Host "Actualizando el archivo .env.local del frontend..." -ForegroundColor $Yellow
@"
# API URL
NEXT_PUBLIC_API_URL=$ApiGatewayUrl

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=$CognitoUserPoolClientId
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$CognitoUserPoolId

# App
NEXT_PUBLIC_APP_NAME=Administrador Technoagentes
"@ | Set-Content frontend/.env.local

Write-Host "¡Despliegue completado!" -ForegroundColor $Green
Write-Host "La infraestructura ha sido desplegada correctamente." -ForegroundColor $Green
Write-Host "Para desplegar el frontend, sigue las instrucciones en el archivo DEPLOYMENT.md." -ForegroundColor $Yellow
