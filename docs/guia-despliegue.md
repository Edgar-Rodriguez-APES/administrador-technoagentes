# Guía de Despliegue: Administrador Technoagentes en AWS

Esta guía proporciona instrucciones detalladas para desplegar el sistema Administrador Technoagentes en AWS, desde la configuración inicial hasta la puesta en producción.

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Configuración de Servicios AWS](#configuración-de-servicios-aws)
4. [Configuración de Treli](#configuración-de-treli)
5. [Despliegue con Serverless Framework](#despliegue-con-serverless-framework)
6. [Despliegue con Terraform](#despliegue-con-terraform)
7. [Verificación Post-Despliegue](#verificación-post-despliegue)
8. [Configuración de Dominio Personalizado](#configuración-de-dominio-personalizado)
9. [Configuración de Monitoreo](#configuración-de-monitoreo)
10. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

## Requisitos Previos

### Cuentas y Accesos

1. **Cuenta de AWS**:
   - Acceso a la consola de AWS con permisos de administrador
   - Usuario IAM con permisos para crear y gestionar recursos
   - Claves de acceso (Access Key ID y Secret Access Key) configuradas

2. **Cuenta de Treli**:
   - Registro en [Treli](https://treli.co)
   - Acceso al panel de administración
   - Claves de API (producción y pruebas)

3. **Herramientas de Desarrollo**:
   - Node.js 14.x o superior
   - npm 6.x o superior
   - Git
   - AWS CLI v2
   - Serverless Framework 3.x o Terraform 1.0.0+

### Instalación de Herramientas

```bash
# Instalar Node.js y npm (ejemplo para Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar AWS CLI
aws configure

# Instalar Serverless Framework
npm install -g serverless

# Instalar Terraform (opcional)
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform
```

## Configuración del Entorno

### Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/administrador-technoagentes.git
cd administrador-technoagentes
```

### Instalar Dependencias

```bash
npm install
```

### Configurar Variables de Entorno

1. Crear archivo `.env` para desarrollo local:

```bash
cp .env.example .env
```

2. Editar el archivo `.env` con los valores adecuados:

```
# Variables de entorno para desarrollo local
ENVIRONMENT=dev
USER_POOL_ID=local_user_pool_id
TENANTS_TABLE=administrador-technoagentes-tenants-dev
USERS_TABLE=administrador-technoagentes-users-dev
CONFIGURATIONS_TABLE=administrador-technoagentes-configurations-dev
TC_ACCEPTANCE_TABLE=administrador-technoagentes-tc-acceptance-dev
WEBHOOK_EVENTS_TABLE=administrador-technoagentes-webhook-events-dev
TENANT_BUCKET_NAME=administrador-technoagentes-tenant-data-dev
ONBOARDING_STATE_MACHINE_ARN=arn:aws:states:us-east-1:123456789012:stateMachine:administrador-technoagentes-tenant-onboarding-dev
APPCONFIG_APPLICATION=administrador-technoagentes-app-dev
APPCONFIG_ENVIRONMENT=dev
USE_KMS=true

# Credenciales de desarrollo
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Secretos para proveedores de pago (solo para desarrollo)
TRELI_API_KEY=pk_test_example
TRELI_WEBHOOK_SECRET=whsec_example
TRELI_PRICE_BASIC=price_basic_example
TRELI_PRICE_STANDARD=price_standard_example
TRELI_PRICE_PREMIUM=price_premium_example
```

## Configuración de Servicios AWS

### Configuración de Permisos IAM

1. Crear una política IAM para el despliegue:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "lambda:*",
        "apigateway:*",
        "iam:*",
        "cognito-idp:*",
        "dynamodb:*",
        "kms:*",
        "states:*",
        "logs:*",
        "secretsmanager:*",
        "ses:*",
        "appconfig:*"
      ],
      "Resource": "*"
    }
  ]
}
```

2. Adjuntar esta política al usuario IAM que realizará el despliegue.

### Configuración de Amazon SES

1. Verificar el dominio de correo electrónico en SES:
   - Ir a la consola de AWS > SES > Verified identities
   - Hacer clic en "Create identity"
   - Seleccionar "Domain" e ingresar el dominio
   - Seguir las instrucciones para verificar el dominio mediante registros DNS

2. Si la cuenta está en sandbox, solicitar el aumento de límites:
   - Ir a Service Quotas > Amazon SES
   - Solicitar un aumento para "Sending Quota"

## Configuración de Treli

### Crear Cuenta y Obtener Credenciales

1. Registrarse en [Treli](https://treli.co)
2. Ir a Configuración > API Keys
3. Crear una nueva clave API para pruebas
4. Crear una nueva clave API para producción (cuando esté listo)
5. Guardar ambas claves de forma segura

### Configurar Productos y Precios

1. Ir a Productos > Crear nuevo producto
2. Crear tres productos correspondientes a los planes:
   - Plan Básico
   - Plan Estándar
   - Plan Premium

3. Para cada producto, crear un precio recurrente:
   - Seleccionar facturación mensual o anual
   - Establecer el precio adecuado
   - Guardar los IDs de precio generados

### Configurar Webhook

1. Ir a Desarrolladores > Webhooks
2. Crear un nuevo endpoint de webhook:
   - URL: `https://api.tudominio.com/webhooks/payment` (usar la URL correcta después del despliegue)
   - Eventos a escuchar:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
3. Guardar el secreto de webhook generado

## Despliegue con Serverless Framework

### Configurar serverless.yml

1. Editar el archivo `serverless.yml` para actualizar las variables de Treli:

```yaml
custom:
  treliPrices:
    basic: price_basic_id_from_treli
    standard: price_standard_id_from_treli
    premium: price_premium_id_from_treli
```

2. Actualizar la configuración de Secrets Manager:

```yaml
resources:
  Resources:
    PaymentSecrets:
      Type: AWS::SecretsManager::Secret
      Properties:
        Name: ${self:service}-payment-secrets-${self:provider.stage}
        Description: API keys for payment providers
        SecretString: '{"TRELI_API_KEY":"pk_test_example","TRELI_WEBHOOK_SECRET":"whsec_example","TRELI_PRICE_BASIC":"price_basic_example","TRELI_PRICE_STANDARD":"price_standard_example","TRELI_PRICE_PREMIUM":"price_premium_example"}'
```

### Desplegar en Entorno de Desarrollo

```bash
npm run deploy:dev
```

Este comando ejecutará `serverless deploy --stage dev`, que:
1. Empaquetará el código y los recursos
2. Creará una pila de CloudFormation
3. Desplegará todos los recursos definidos en `serverless.yml`
4. Mostrará las URLs de los endpoints de API Gateway

### Desplegar en Entorno de Producción

```bash
npm run deploy:prod
```

## Despliegue con Terraform

### Configurar Variables de Terraform

1. Crear archivo de variables para desarrollo:

```bash
cd infrastructure
cp example.tfvars dev.tfvars
```

2. Editar `dev.tfvars` con los valores adecuados:

```hcl
aws_region     = "us-east-1"
environment    = "dev"
service_name   = "administrador-technoagentes"

# Treli configuration
treli_api_key          = "pk_test_example"
treli_webhook_secret   = "whsec_example"
treli_price_basic      = "price_basic_example"
treli_price_standard   = "price_standard_example"
treli_price_premium    = "price_premium_example"
```

### Inicializar Terraform

```bash
cd infrastructure
terraform init
```

### Planificar el Despliegue

```bash
terraform plan -var-file=dev.tfvars
```

Este comando mostrará todos los recursos que se crearán, modificarán o eliminarán.

### Aplicar el Despliegue

```bash
terraform apply -var-file=dev.tfvars
```

Confirmar con "yes" cuando se solicite.

## Verificación Post-Despliegue

### Verificar Recursos Creados

1. **Cognito**:
   - Verificar que el User Pool se haya creado correctamente
   - Comprobar que el App Client esté configurado

2. **DynamoDB**:
   - Verificar que todas las tablas se hayan creado
   - Comprobar que los índices secundarios estén configurados

3. **Lambda**:
   - Verificar que todas las funciones se hayan desplegado
   - Comprobar que tengan los permisos correctos

4. **API Gateway**:
   - Verificar que los endpoints estén disponibles
   - Probar un endpoint simple como health check

5. **Step Functions**:
   - Verificar que la máquina de estados se haya creado
   - Comprobar la definición de la máquina

### Actualizar Webhook en Treli

Una vez desplegado, actualizar la URL del webhook en Treli con la URL real de API Gateway:

```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/webhooks/payment
```

### Probar el Flujo de Onboarding

1. Realizar una solicitud POST al endpoint de onboarding:

```bash
curl -X POST \
  https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/onboarding \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Empresa de Prueba",
    "email": "admin@empresaprueba.com",
    "plan": "BASIC",
    "address": "Calle de Prueba 123",
    "phone": "+1234567890",
    "paymentToken": "payment_method_token_from_treli",
    "metadata": {
      "industry": "Technology",
      "employees": 5
    }
  }'
```

2. Verificar que el proceso de onboarding se complete correctamente:
   - Comprobar la ejecución en Step Functions
   - Verificar que se cree el registro en DynamoDB
   - Comprobar que se cree el usuario en Cognito
   - Verificar que se envíe el correo electrónico de bienvenida

## Configuración de Dominio Personalizado

### Crear Certificado SSL en ACM

1. Ir a AWS Certificate Manager
2. Solicitar un nuevo certificado para `*.tudominio.com` y `tudominio.com`
3. Validar el certificado mediante registros DNS

### Configurar Dominio Personalizado en API Gateway

1. Ir a API Gateway > APIs > tu-api > Custom Domain Names
2. Crear un nuevo nombre de dominio personalizado:
   - Dominio: `api.tudominio.com`
   - Certificado: Seleccionar el certificado creado
   - Endpoint Type: Regional
3. Crear una nueva asignación de API:
   - API: Seleccionar tu API
   - Stage: dev o prod
   - Path: / (raíz)

### Configurar DNS

Crear un registro CNAME en tu proveedor de DNS:
- Nombre: `api`
- Valor: El nombre de dominio de API Gateway (algo como `d-xxxxxxxxxx.execute-api.us-east-1.amazonaws.com`)

## Configuración de Monitoreo

### CloudWatch Dashboards

1. Crear un dashboard para monitorear:
   - Invocaciones de Lambda
   - Errores de Lambda
   - Latencia de API Gateway
   - Consumo de capacidad de DynamoDB
   - Ejecuciones de Step Functions

### CloudWatch Alarms

Configurar alarmas para:
1. Errores de Lambda por encima de un umbral
2. Latencia de API Gateway por encima de un umbral
3. Errores de API Gateway
4. Throttling de DynamoDB

### Logs

Configurar grupos de logs con retención adecuada:
```bash
aws logs put-retention-policy --log-group-name /aws/lambda/administrador-technoagentes-dev-getTenantUsers --retention-in-days 30
```

## Solución de Problemas Comunes

### Error en la Creación de Recursos

**Problema**: CloudFormation falla al crear recursos debido a permisos insuficientes.

**Solución**:
1. Verificar que el usuario IAM tenga todos los permisos necesarios
2. Revisar los logs de CloudFormation para identificar el recurso específico
3. Añadir los permisos faltantes a la política IAM

### Error en la Integración con Treli

**Problema**: Las llamadas a la API de Treli fallan.

**Solución**:
1. Verificar que las claves API estén correctamente configuradas en Secrets Manager
2. Comprobar que los IDs de precio sean válidos
3. Revisar los logs de Lambda para identificar errores específicos
4. Verificar la conectividad de red desde Lambda a la API de Treli

### Error en el Procesamiento de Webhooks

**Problema**: Los webhooks de Treli no se procesan correctamente.

**Solución**:
1. Verificar que la URL del webhook en Treli sea correcta
2. Comprobar que el secreto de webhook esté correctamente configurado
3. Revisar los logs de la función Lambda de webhook
4. Verificar que los eventos necesarios estén habilitados en Treli

### Error en el Envío de Correos

**Problema**: Los correos electrónicos no se envían.

**Solución**:
1. Verificar que SES esté correctamente configurado
2. Comprobar que el dominio esté verificado
3. Si la cuenta está en sandbox, verificar que los destinatarios estén verificados
4. Revisar los logs de Lambda para identificar errores específicos