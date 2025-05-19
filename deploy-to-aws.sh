#!/bin/bash

# Script para desplegar el proyecto Administrador Technoagentes en AWS

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando despliegue del proyecto Administrador Technoagentes en AWS...${NC}"

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null
then
    echo -e "${RED}Error: AWS CLI no está instalado. Por favor, instálalo primero.${NC}"
    exit 1
fi

# Verificar que Serverless Framework está instalado
if ! command -v serverless &> /dev/null
then
    echo -e "${RED}Error: Serverless Framework no está instalado. Por favor, instálalo primero.${NC}"
    exit 1
fi

# Verificar credenciales de AWS
echo -e "${YELLOW}Verificando credenciales de AWS...${NC}"
aws sts get-caller-identity
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudieron verificar las credenciales de AWS. Por favor, configura tus credenciales.${NC}"
    exit 1
fi

# Desplegar el backend con Serverless Framework
echo -e "${YELLOW}Desplegando el backend con Serverless Framework...${NC}"
npm run deploy:dev
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo desplegar el backend.${NC}"
    exit 1
fi

# Obtener información del despliegue
echo -e "${YELLOW}Obteniendo información del despliegue...${NC}"
API_URL=$(aws apigateway get-rest-apis --query "items[?name=='administrador-technoagentes-dev'].id" --output text)
API_URL="https://${API_URL}.execute-api.us-east-1.amazonaws.com/dev"
echo -e "${GREEN}URL de la API: ${API_URL}${NC}"

COGNITO_USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 10 --query "UserPools[?Name=='administrador-technoagentes-user-pool-dev'].Id" --output text)
echo -e "${GREEN}ID del User Pool de Cognito: ${COGNITO_USER_POOL_ID}${NC}"

COGNITO_CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id ${COGNITO_USER_POOL_ID} --query "UserPoolClients[?ClientName=='administrador-technoagentes-client-dev'].ClientId" --output text)
echo -e "${GREEN}ID del Cliente de Cognito: ${COGNITO_CLIENT_ID}${NC}"

# Actualizar el archivo de configuración de Amplify
echo -e "${YELLOW}Actualizando el archivo de configuración de Amplify...${NC}"
sed -i "s|NEXT_PUBLIC_API_URL: 'https://API_GATEWAY_URL'|NEXT_PUBLIC_API_URL: '${API_URL}'|g" amplify.yml
sed -i "s|NEXT_PUBLIC_COGNITO_CLIENT_ID: 'COGNITO_CLIENT_ID'|NEXT_PUBLIC_COGNITO_CLIENT_ID: '${COGNITO_CLIENT_ID}'|g" amplify.yml
sed -i "s|NEXT_PUBLIC_COGNITO_USER_POOL_ID: 'COGNITO_USER_POOL_ID'|NEXT_PUBLIC_COGNITO_USER_POOL_ID: '${COGNITO_USER_POOL_ID}'|g" amplify.yml

# Actualizar el archivo .env.local del frontend
echo -e "${YELLOW}Actualizando el archivo .env.local del frontend...${NC}"
cat > frontend/.env.local << EOF
# API URL
NEXT_PUBLIC_API_URL=${API_URL}

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
NEXT_PUBLIC_COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}

# App
NEXT_PUBLIC_APP_NAME=Administrador Technoagentes
EOF

# Desplegar el frontend en AWS Amplify
echo -e "${YELLOW}Desplegando el frontend en AWS Amplify...${NC}"
cd frontend
npm ci
npm run build
cd ..

# Crear una aplicación en AWS Amplify
echo -e "${YELLOW}Creando una aplicación en AWS Amplify...${NC}"
APP_ID=$(aws amplify create-app --name "administrador-technoagentes" --repository "https://github.com/tu-usuario/administrador-technoagentes" --access-token "tu-token-de-github" --query "app.appId" --output text)
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo crear la aplicación en AWS Amplify.${NC}"
    echo -e "${YELLOW}Puedes crear la aplicación manualmente en la consola de AWS Amplify.${NC}"
else
    echo -e "${GREEN}ID de la aplicación en AWS Amplify: ${APP_ID}${NC}"
    
    # Crear una rama en AWS Amplify
    echo -e "${YELLOW}Creando una rama en AWS Amplify...${NC}"
    aws amplify create-branch --app-id ${APP_ID} --branch-name main
    
    # Iniciar el despliegue
    echo -e "${YELLOW}Iniciando el despliegue en AWS Amplify...${NC}"
    aws amplify start-job --app-id ${APP_ID} --branch-name main --job-type RELEASE
fi

echo -e "${GREEN}¡Despliegue completado!${NC}"
echo -e "${YELLOW}Recuerda actualizar la URL de la API en la configuración del frontend si es necesario.${NC}"
