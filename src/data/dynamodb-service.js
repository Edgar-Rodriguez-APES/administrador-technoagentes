/**
 * DynamoDB Service for Multi-tenant Data Management
 * 
 * This service provides functions for managing tenant data in DynamoDB
 * with proper tenant isolation.
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class DynamoDBService {
  constructor() {
    this.dynamodb = new AWS.DynamoDB.DocumentClient();
    this.tenantsTable = process.env.TENANTS_TABLE;
    this.usersTable = process.env.USERS_TABLE;
    this.configurationsTable = process.env.CONFIGURATIONS_TABLE;
    this.tcAcceptanceTable = process.env.TC_ACCEPTANCE_TABLE;
  }

  /**
   * Create a new tenant record
   * @param {Object} tenantData - Tenant information
   * @returns {Promise<Object>} - Created tenant information
   */
  async createTenant(tenantData) {
    const tenantId = tenantData.tenantId || uuidv4();
    const timestamp = new Date().toISOString();
    
    const item = {
      tenantId,
      name: tenantData.name,
      status: tenantData.status || 'ACTIVE',
      plan: tenantData.plan || 'BASIC',
      email: tenantData.email,
      phone: tenantData.phone,
      address: tenantData.address,
      createdAt: timestamp,
      updatedAt: timestamp,
      paymentInfo: tenantData.paymentInfo || {},
      metadata: tenantData.metadata || {}
    };
    
    const params = {
      TableName: this.tenantsTable,
      Item: item,
      ConditionExpression: 'attribute_not_exists(tenantId)'
    };
    
    try {
      await this.dynamodb.put(params).promise();
      return item;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error(`Failed to create tenant: ${error.message}`);
    }
  }

  /**
   * Get a tenant by ID
   * @param {string} tenantId - ID of the tenant
   * @returns {Promise<Object>} - Tenant information
   */
  async getTenant(tenantId) {
    const params = {
      TableName: this.tenantsTable,
      Key: { tenantId }
    };
    
    try {
      const result = await this.dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting tenant:', error);
      throw new Error(`Failed to get tenant: ${error.message}`);
    }
  }

  /**
   * Update a tenant
   * @param {string} tenantId - ID of the tenant
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated tenant information
   */
  async updateTenant(tenantId, updateData) {
    // Don't allow updating tenantId
    if (updateData.tenantId) {
      delete updateData.tenantId;
    }
    
    // Build update expression
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    Object.entries(updateData).forEach(([key, value]) => {
      updateExpression += `, ${key} = :${key}`;
      expressionAttributeValues[`:${key}`] = value;
    });
    
    const params = {
      TableName: this.tenantsTable,
      Key: { tenantId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    try {
      const result = await this.dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new Error(`Failed to update tenant: ${error.message}`);
    }
  }

  /**
   * List tenants with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - List of tenants
   */
  async listTenants(options = {}) {
    const params = {
      TableName: this.tenantsTable
    };
    
    // Apply filters if provided
    if (options.status) {
      params.IndexName = 'StatusIndex';
      params.KeyConditionExpression = 'status = :status';
      params.ExpressionAttributeValues = {
        ':status': options.status
      };
      
      if (options.createdAfter) {
        params.KeyConditionExpression += ' AND createdAt > :createdAfter';
        params.ExpressionAttributeValues[':createdAfter'] = options.createdAfter;
      }
    }
    
    // Apply pagination
    if (options.limit) {
      params.Limit = options.limit;
    }
    
    if (options.lastEvaluatedKey) {
      params.ExclusiveStartKey = options.lastEvaluatedKey;
    }
    
    try {
      const result = await this.dynamodb.query(params).promise();
      return {
        tenants: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      console.error('Error listing tenants:', error);
      throw new Error(`Failed to list tenants: ${error.message}`);
    }
  }

  /**
   * Create or update user profile
   * @param {string} userId - ID of the user
   * @param {string} tenantId - ID of the tenant
   * @param {Object} userData - User profile data
   * @returns {Promise<Object>} - Created/updated user profile
   */
  async saveUserProfile(userId, tenantId, userData) {
    const timestamp = new Date().toISOString();
    
    const item = {
      PK: `TENANT#${tenantId}`,
      SK: `USER#${userId}#PROFILE`,
      userId,
      tenantId,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'User',
      preferences: userData.preferences || {},
      lastLogin: userData.lastLogin,
      createdAt: userData.createdAt || timestamp,
      updatedAt: timestamp,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `TENANT#${tenantId}`
    };
    
    const params = {
      TableName: this.usersTable,
      Item: item
    };
    
    try {
      await this.dynamodb.put(params).promise();
      return item;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error(`Failed to save user profile: ${error.message}`);
    }
  }

  /**
   * Get user profile
   * @param {string} userId - ID of the user
   * @param {string} tenantId - ID of the tenant
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfile(userId, tenantId) {
    const params = {
      TableName: this.usersTable,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `USER#${userId}#PROFILE`
      }
    };
    
    try {
      const result = await this.dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * List user profiles for a tenant
   * @param {string} tenantId - ID of the tenant
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of user profiles
   */
  async listUserProfiles(tenantId, options = {}) {
    const params = {
      TableName: this.usersTable,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': 'USER#'
      }
    };
    
    // Apply pagination
    if (options.limit) {
      params.Limit = options.limit;
    }
    
    if (options.lastEvaluatedKey) {
      params.ExclusiveStartKey = options.lastEvaluatedKey;
    }
    
    try {
      const result = await this.dynamodb.query(params).promise();
      return {
        users: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      console.error('Error listing user profiles:', error);
      throw new Error(`Failed to list user profiles: ${error.message}`);
    }
  }

  /**
   * Save tenant configuration
   * @param {string} tenantId - ID of the tenant
   * @param {string} configType - Type of configuration
   * @param {Object} configData - Configuration data
   * @returns {Promise<Object>} - Saved configuration
   */
  async saveTenantConfiguration(tenantId, configType, configData) {
    const timestamp = new Date().toISOString();
    
    const item = {
      PK: `TENANT#${tenantId}`,
      SK: `CONFIG#${configType}`,
      tenantId,
      configType,
      data: configData,
      createdAt: configData.createdAt || timestamp,
      updatedAt: timestamp
    };
    
    const params = {
      TableName: this.configurationsTable,
      Item: item
    };
    
    try {
      await this.dynamodb.put(params).promise();
      return item;
    } catch (error) {
      console.error('Error saving tenant configuration:', error);
      throw new Error(`Failed to save tenant configuration: ${error.message}`);
    }
  }

  /**
   * Get tenant configuration
   * @param {string} tenantId - ID of the tenant
   * @param {string} configType - Type of configuration
   * @returns {Promise<Object>} - Configuration data
   */
  async getTenantConfiguration(tenantId, configType) {
    const params = {
      TableName: this.configurationsTable,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `CONFIG#${configType}`
      }
    };
    
    try {
      const result = await this.dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting tenant configuration:', error);
      throw new Error(`Failed to get tenant configuration: ${error.message}`);
    }
  }

  /**
   * List all configurations for a tenant
   * @param {string} tenantId - ID of the tenant
   * @returns {Promise<Array>} - List of configurations
   */
  async listTenantConfigurations(tenantId) {
    const params = {
      TableName: this.configurationsTable,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `TENANT#${tenantId}`,
        ':sk': 'CONFIG#'
      }
    };
    
    try {
      const result = await this.dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error listing tenant configurations:', error);
      throw new Error(`Failed to list tenant configurations: ${error.message}`);
    }
  }

  /**
   * Record terms and conditions acceptance
   * @param {string} userId - ID of the user
   * @param {string} tenantId - ID of the tenant
   * @param {string} termsVersion - Version of the terms
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - Acceptance record
   */
  async recordTermsAcceptance(userId, tenantId, termsVersion, metadata = {}) {
    const timestamp = new Date().toISOString();
    
    const item = {
      PK: `USER#${userId}#TENANT#${tenantId}`,
      SK: `TC_ACCEPTANCE#${termsVersion}`,
      userId,
      tenantId,
      termsVersion,
      acceptanceTimestamp: timestamp,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      GSI1PK: `TENANT#${tenantId}`,
      GSI1SK: `TC_ACCEPTANCE#${termsVersion}#${timestamp}`
    };
    
    const params = {
      TableName: this.tcAcceptanceTable,
      Item: item
    };
    
    try {
      await this.dynamodb.put(params).promise();
      return item;
    } catch (error) {
      console.error('Error recording terms acceptance:', error);
      throw new Error(`Failed to record terms acceptance: ${error.message}`);
    }
  }

  /**
   * Check if user has accepted terms
   * @param {string} userId - ID of the user
   * @param {string} tenantId - ID of the tenant
   * @param {string} termsVersion - Version of the terms
   * @returns {Promise<boolean>} - True if terms have been accepted
   */
  async hasAcceptedTerms(userId, tenantId, termsVersion) {
    const params = {
      TableName: this.tcAcceptanceTable,
      Key: {
        PK: `USER#${userId}#TENANT#${tenantId}`,
        SK: `TC_ACCEPTANCE#${termsVersion}`
      }
    };
    
    try {
      const result = await this.dynamodb.get(params).promise();
      return !!result.Item;
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      throw new Error(`Failed to check terms acceptance: ${error.message}`);
    }
  }

  /**
   * List all terms acceptances for a tenant
   * @param {string} tenantId - ID of the tenant
   * @param {string} termsVersion - Optional version filter
   * @returns {Promise<Array>} - List of acceptances
   */
  async listTermsAcceptances(tenantId, termsVersion = null) {
    const params = {
      TableName: this.tcAcceptanceTable,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk'
    };
    
    if (termsVersion) {
      params.KeyConditionExpression += ' AND begins_with(GSI1SK, :sk)';
      params.ExpressionAttributeValues = {
        ':pk': `TENANT#${tenantId}`,
        ':sk': `TC_ACCEPTANCE#${termsVersion}`
      };
    } else {
      params.KeyConditionExpression += ' AND begins_with(GSI1SK, :sk)';
      params.ExpressionAttributeValues = {
        ':pk': `TENANT#${tenantId}`,
        ':sk': 'TC_ACCEPTANCE#'
      };
    }
    
    try {
      const result = await this.dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error listing terms acceptances:', error);
      throw new Error(`Failed to list terms acceptances: ${error.message}`);
    }
  }
}

module.exports = DynamoDBService;