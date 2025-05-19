/**
 * Lambda Handler for Tenant Configuration API
 * 
 * This handler processes API Gateway requests for tenant configuration management,
 * including getting and updating tenant-specific settings.
 */

const DynamoDBService = require('../data/dynamodb-service');
const AWS = require('aws-sdk');

// Initialize services
const dynamoDBService = new DynamoDBService();
const appConfig = new AWS.AppConfig();

/**
 * Main handler for API Gateway events
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Promise<Object>} - API Gateway response
 */
exports.handler = async (event, context) => {
  try {
    // Extract the HTTP method and path parameters
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    
    // Extract the authenticated user from the Cognito authorizer context
    const authorizer = event.requestContext.authorizer || {};
    const claims = authorizer.claims || {};
    
    // Get the authenticated user's email and tenantId from the JWT claims
    const authenticatedUser = claims['email'];
    const authenticatedTenantId = claims['custom:tenantId'];
    
    if (!authenticatedUser || !authenticatedTenantId) {
      return formatResponse(401, {
        message: 'Unauthorized: Missing user information in token'
      });
    }
    
    // Process the request based on the HTTP method
    switch (httpMethod) {
      case 'GET':
        if (pathParameters.configType) {
          return await getConfiguration(authenticatedTenantId, pathParameters.configType);
        } else {
          return await listConfigurations(authenticatedTenantId);
        }
        
      case 'PUT':
        if (!pathParameters.configType) {
          return formatResponse(400, {
            message: 'Bad Request: Missing configType in path parameters'
          });
        }
        return await updateConfiguration(
          authenticatedTenantId,
          pathParameters.configType,
          JSON.parse(event.body || '{}')
        );
        
      default:
        return formatResponse(405, {
          message: `Method Not Allowed: ${httpMethod}`
        });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return formatResponse(500, {
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

/**
 * Get a specific configuration
 * @param {string} tenantId - ID of the tenant
 * @param {string} configType - Type of configuration to get
 * @returns {Promise<Object>} - API Gateway response
 */
async function getConfiguration(tenantId, configType) {
  try {
    // Validate config type
    if (!isValidConfigType(configType)) {
      return formatResponse(400, {
        message: `Bad Request: Invalid configuration type: ${configType}`
      });
    }
    
    // Get the configuration from DynamoDB
    const config = await dynamoDBService.getTenantConfiguration(tenantId, configType);
    
    if (!config) {
      // If configuration doesn't exist in DynamoDB, get default from AppConfig
      const defaultConfig = await getDefaultConfiguration(configType);
      
      return formatResponse(200, {
        tenantId,
        configType,
        data: defaultConfig,
        isDefault: true
      });
    }
    
    return formatResponse(200, config);
  } catch (error) {
    console.error('Error getting configuration:', error);
    throw error;
  }
}

/**
 * List all configurations for a tenant
 * @param {string} tenantId - ID of the tenant
 * @returns {Promise<Object>} - API Gateway response
 */
async function listConfigurations(tenantId) {
  try {
    // Get all configurations from DynamoDB
    const configs = await dynamoDBService.listTenantConfigurations(tenantId);
    
    // Get default configurations for any missing types
    const configTypes = ['agents', 'limits', 'ui'];
    const existingTypes = configs.map(config => config.configType);
    
    // Add default configurations for missing types
    const defaultPromises = configTypes
      .filter(type => !existingTypes.includes(type))
      .map(async type => {
        const defaultConfig = await getDefaultConfiguration(type);
        return {
          PK: `TENANT#${tenantId}`,
          SK: `CONFIG#${type}`,
          tenantId,
          configType: type,
          data: defaultConfig,
          isDefault: true
        };
      });
    
    const defaultConfigs = await Promise.all(defaultPromises);
    
    return formatResponse(200, {
      tenantId,
      configurations: [...configs, ...defaultConfigs]
    });
  } catch (error) {
    console.error('Error listing configurations:', error);
    throw error;
  }
}

/**
 * Update a configuration
 * @param {string} tenantId - ID of the tenant
 * @param {string} configType - Type of configuration to update
 * @param {Object} configData - Configuration data
 * @returns {Promise<Object>} - API Gateway response
 */
async function updateConfiguration(tenantId, configType, configData) {
  try {
    // Validate config type
    if (!isValidConfigType(configType)) {
      return formatResponse(400, {
        message: `Bad Request: Invalid configuration type: ${configType}`
      });
    }
    
    // Validate configuration data based on type
    const validationError = validateConfigData(configType, configData);
    if (validationError) {
      return formatResponse(400, {
        message: `Bad Request: ${validationError}`
      });
    }
    
    // Save the configuration to DynamoDB
    const config = await dynamoDBService.saveTenantConfiguration(tenantId, configType, configData);
    
    // If this is an agent configuration, update AppConfig as well
    if (configType === 'agents') {
      await updateAppConfig(tenantId, configType, configData);
    }
    
    return formatResponse(200, {
      message: 'Configuration updated successfully',
      config
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}

/**
 * Get default configuration from AppConfig
 * @param {string} configType - Type of configuration
 * @returns {Promise<Object>} - Default configuration
 */
async function getDefaultConfiguration(configType) {
  try {
    // Get default configuration from AppConfig
    const params = {
      Application: process.env.APPCONFIG_APPLICATION,
      Environment: process.env.APPCONFIG_ENVIRONMENT,
      Configuration: `tenant-${configType}`,
      ClientId: `lambda-${context.functionName}`
    };
    
    const result = await appConfig.getConfiguration(params).promise();
    
    // Parse the configuration content
    const configContent = JSON.parse(result.Content.toString());
    
    return configContent;
  } catch (error) {
    console.error('Error getting default configuration:', error);
    
    // Return hardcoded defaults if AppConfig fails
    switch (configType) {
      case 'agents':
        return {
          basic: { enabled: true, maxCalls: 1000 },
          advanced: { enabled: false, maxCalls: 0 },
          expert: { enabled: false, maxCalls: 0 }
        };
      case 'limits':
        return {
          apiCalls: 1000,
          storage: 5 // GB
        };
      case 'ui':
        return {
          theme: 'default',
          logo: null,
          customization: false,
          whiteLabeling: false
        };
      default:
        return {};
    }
  }
}

/**
 * Update configuration in AppConfig
 * @param {string} tenantId - ID of the tenant
 * @param {string} configType - Type of configuration
 * @param {Object} configData - Configuration data
 * @returns {Promise<void>}
 */
async function updateAppConfig(tenantId, configType, configData) {
  try {
    // For now, we're just logging this - in a real implementation,
    // we would update a tenant-specific configuration in AppConfig
    console.log(`Would update AppConfig for tenant ${tenantId}, config type ${configType}`);
    
    // This would be implemented if we're using tenant-specific AppConfig profiles
    // const params = {
    //   Application: process.env.APPCONFIG_APPLICATION,
    //   Environment: process.env.APPCONFIG_ENVIRONMENT,
    //   Configuration: `tenant-${configType}`,
    //   ClientId: `lambda-${context.functionName}`,
    //   ContentType: 'application/json',
    //   Content: Buffer.from(JSON.stringify(configData))
    // };
    // 
    // await appConfig.createHostedConfigurationVersion(params).promise();
  } catch (error) {
    console.error('Error updating AppConfig:', error);
    // We don't want to fail the whole request if AppConfig update fails
    // Just log the error and continue
  }
}

/**
 * Validate if the configuration type is valid
 * @param {string} configType - Type of configuration
 * @returns {boolean} - True if valid
 */
function isValidConfigType(configType) {
  const validTypes = ['agents', 'limits', 'ui'];
  return validTypes.includes(configType);
}

/**
 * Validate configuration data based on type
 * @param {string} configType - Type of configuration
 * @param {Object} configData - Configuration data
 * @returns {string|null} - Error message or null if valid
 */
function validateConfigData(configType, configData) {
  switch (configType) {
    case 'agents':
      // Validate agent configuration
      if (!configData || typeof configData !== 'object') {
        return 'Agent configuration must be an object';
      }
      
      // Check if at least one agent is enabled
      const hasEnabledAgent = Object.values(configData).some(agent => 
        agent && typeof agent === 'object' && agent.enabled === true
      );
      
      if (!hasEnabledAgent) {
        return 'At least one agent must be enabled';
      }
      
      break;
      
    case 'limits':
      // Validate limits configuration
      if (!configData || typeof configData !== 'object') {
        return 'Limits configuration must be an object';
      }
      
      if (typeof configData.apiCalls !== 'number' || configData.apiCalls < 0) {
        return 'apiCalls must be a non-negative number';
      }
      
      if (typeof configData.storage !== 'number' || configData.storage < 0) {
        return 'storage must be a non-negative number';
      }
      
      break;
      
    case 'ui':
      // Validate UI configuration
      if (!configData || typeof configData !== 'object') {
        return 'UI configuration must be an object';
      }
      
      if (configData.theme && typeof configData.theme !== 'string') {
        return 'theme must be a string';
      }
      
      if (configData.customization !== undefined && typeof configData.customization !== 'boolean') {
        return 'customization must be a boolean';
      }
      
      if (configData.whiteLabeling !== undefined && typeof configData.whiteLabeling !== 'boolean') {
        return 'whiteLabeling must be a boolean';
      }
      
      break;
  }
  
  return null; // No validation errors
}

/**
 * Format the API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} - Formatted API Gateway response
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}