// Script para habilitar CORS en API Gateway usando AWS SDK
const AWS = require('aws-sdk');
const apigateway = new AWS.APIGateway({ region: 'us-east-1' });

const API_ID = 'z3egsgkq28'; // ID de tu API Gateway
const ORIGIN = 'https://main.dfvclvboq7vvrcn.amplifyapp.com';

async function enableCORS() {
  try {
    // 1. Obtener todos los recursos de la API
    const resources = await apigateway.getResources({ restApiId: API_ID }).promise();
    console.log(`Encontrados ${resources.items.length} recursos en la API`);

    // 2. Para cada recurso, habilitar CORS
    for (const resource of resources.items) {
      console.log(`Configurando CORS para el recurso: ${resource.path}`);
      
      // Verificar si el recurso tiene métodos
      const resourceMethods = await apigateway.getResource({
        restApiId: API_ID,
        resourceId: resource.id
      }).promise();
      
      if (resourceMethods.resourceMethods) {
        const methods = Object.keys(resourceMethods.resourceMethods);
        
        // Si no existe el método OPTIONS, crearlo
        if (!methods.includes('OPTIONS')) {
          console.log(`Creando método OPTIONS para ${resource.path}`);
          
          try {
            // Crear método OPTIONS
            await apigateway.putMethod({
              restApiId: API_ID,
              resourceId: resource.id,
              httpMethod: 'OPTIONS',
              authorizationType: 'NONE'
            }).promise();
            
            // Configurar integración mock para OPTIONS
            await apigateway.putIntegration({
              restApiId: API_ID,
              resourceId: resource.id,
              httpMethod: 'OPTIONS',
              type: 'MOCK',
              integrationHttpMethod: 'OPTIONS',
              requestTemplates: {
                'application/json': '{"statusCode": 200}'
              }
            }).promise();
            
            // Configurar respuesta de método para OPTIONS
            await apigateway.putMethodResponse({
              restApiId: API_ID,
              resourceId: resource.id,
              httpMethod: 'OPTIONS',
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Methods': true,
                'method.response.header.Access-Control-Allow-Headers': true
              }
            }).promise();
            
            // Configurar respuesta de integración para OPTIONS
            await apigateway.putIntegrationResponse({
              restApiId: API_ID,
              resourceId: resource.id,
              httpMethod: 'OPTIONS',
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': `'${ORIGIN}'`,
                'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
              }
            }).promise();
            
            console.log(`Método OPTIONS creado para ${resource.path}`);
          } catch (err) {
            console.error(`Error al configurar OPTIONS para ${resource.path}:`, err);
          }
        }
        
        // Actualizar los métodos existentes para incluir encabezados CORS
        for (const method of methods) {
          if (method !== 'OPTIONS') {
            console.log(`Actualizando método ${method} para ${resource.path}`);
            
            try {
              // Obtener la respuesta del método actual
              const methodResponse = await apigateway.getMethodResponse({
                restApiId: API_ID,
                resourceId: resource.id,
                httpMethod: method,
                statusCode: '200'
              }).promise();
              
              // Actualizar la respuesta del método para incluir encabezados CORS
              const responseParameters = methodResponse.responseParameters || {};
              responseParameters['method.response.header.Access-Control-Allow-Origin'] = true;
              
              await apigateway.putMethodResponse({
                restApiId: API_ID,
                resourceId: resource.id,
                httpMethod: method,
                statusCode: '200',
                responseParameters
              }).promise();
              
              // Obtener la respuesta de integración actual
              const integrationResponse = await apigateway.getIntegrationResponse({
                restApiId: API_ID,
                resourceId: resource.id,
                httpMethod: method,
                statusCode: '200'
              }).promise();
              
              // Actualizar la respuesta de integración para incluir encabezados CORS
              const integrationResponseParameters = integrationResponse.responseParameters || {};
              integrationResponseParameters['method.response.header.Access-Control-Allow-Origin'] = `'${ORIGIN}'`;
              
              await apigateway.putIntegrationResponse({
                restApiId: API_ID,
                resourceId: resource.id,
                httpMethod: method,
                statusCode: '200',
                responseParameters: integrationResponseParameters
              }).promise();
              
              console.log(`Método ${method} actualizado para ${resource.path}`);
            } catch (err) {
              console.error(`Error al actualizar ${method} para ${resource.path}:`, err);
            }
          }
        }
      }
    }
    
    // 3. Desplegar la API para aplicar los cambios
    console.log('Desplegando la API para aplicar los cambios...');
    await apigateway.createDeployment({
      restApiId: API_ID,
      stageName: 'dev',
      description: 'Despliegue para habilitar CORS'
    }).promise();
    
    console.log('¡CORS habilitado correctamente!');
    console.log(`La API ahora acepta solicitudes desde ${ORIGIN}`);
    
  } catch (error) {
    console.error('Error al habilitar CORS:', error);
  }
}

enableCORS();