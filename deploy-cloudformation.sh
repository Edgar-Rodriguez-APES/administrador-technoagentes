#!/bin/bash

# Script para desplegar la infraestructura utilizando AWS CloudFormation

# Parámetros
STACK_NAME="administrador-technoagentes-dev"
ENVIRONMENT="dev"
REGION="us-east-1"

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando despliegue de la infraestructura para Administrador Technoagentes...${NC}"

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null
then
    echo -e "${RED}Error: AWS CLI no está instalado. Por favor, instálalo primero.${NC}"
    exit 1
fi

# Verificar credenciales de AWS
echo -e "${YELLOW}Verificando credenciales de AWS...${NC}"
aws sts get-caller-identity
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudieron verificar las credenciales de AWS. Por favor, configura tus credenciales.${NC}"
    exit 1
fi

# Desplegar la infraestructura con CloudFormation
echo -e "${YELLOW}Desplegando la infraestructura con CloudFormation...${NC}"
aws cloudformation deploy \
    --template-file cloudformation-template.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM \
    --region $REGION

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo desplegar la infraestructura.${NC}"
    exit 1
fi

# Obtener información del despliegue
echo -e "${YELLOW}Obteniendo información del despliegue...${NC}"
COGNITO_USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolId'].OutputValue" --output text)
COGNITO_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolClientId'].OutputValue" --output text)
API_GATEWAY_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text)
AMPLIFY_APP_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AmplifyAppId'].OutputValue" --output text)

echo -e "${GREEN}ID del User Pool de Cognito: $COGNITO_USER_POOL_ID${NC}"
echo -e "${GREEN}ID del Cliente de Cognito: $COGNITO_CLIENT_ID${NC}"
echo -e "${GREEN}URL de la API Gateway: $API_GATEWAY_URL${NC}"
echo -e "${GREEN}ID de la aplicación de Amplify: $AMPLIFY_APP_ID${NC}"

# Actualizar el archivo .env.local del frontend
echo -e "${YELLOW}Actualizando el archivo .env.local del frontend...${NC}"
cat > frontend/.env.local << EOF
# API URL
NEXT_PUBLIC_API_URL=$API_GATEWAY_URL

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID

# App
NEXT_PUBLIC_APP_NAME=Administrador Technoagentes
EOF

echo -e "${GREEN}¡Despliegue completado!${NC}"
echo -e "${GREEN}La infraestructura ha sido desplegada correctamente.${NC}"
echo -e "${YELLOW}Para desplegar el frontend, sigue las instrucciones en el archivo DEPLOYMENT.md.${NC}"
