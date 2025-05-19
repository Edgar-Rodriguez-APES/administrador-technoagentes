/**
 * Lambda Handler for Tenant Users API
 * 
 * This handler processes API Gateway requests for tenant user management,
 * including creating, updating, listing, and deleting users.
 */

const CognitoService = require('../auth/cognito-service');
const DynamoDBService = require('../data/dynamodb-service');

// Initialize services
const cognitoService = new CognitoService();
const dynamoDBService = new DynamoDBService();

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
        if (pathParameters.userId) {
          return await getUser(pathParameters.userId, authenticatedUser, authenticatedTenantId);
        } else {
          return await listUsers(event.queryStringParameters || {}, authenticatedUser, authenticatedTenantId);
        }
        
      case 'POST':
        return await createUser(JSON.parse(event.body || '{}'), authenticatedUser, authenticatedTenantId);
        
      case 'PUT':
        if (!pathParameters.userId) {
          return formatResponse(400, {
            message: 'Bad Request: Missing userId in path parameters'
          });
        }
        return await updateUser(pathParameters.userId, JSON.parse(event.body || '{}'), authenticatedUser, authenticatedTenantId);
        
      case 'DELETE':
        if (!pathParameters.userId) {
          return formatResponse(400, {
            message: 'Bad Request: Missing userId in path parameters'
          });
        }
        return await deleteUser(pathParameters.userId, authenticatedUser, authenticatedTenantId);
        
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
 * Get a specific user
 * @param {string} userId - ID of the user to get
 * @param {string} authenticatedUser - Email of the authenticated user
 * @param {string} authenticatedTenantId - Tenant ID of the authenticated user
 * @returns {Promise<Object>} - API Gateway response
 */
async function getUser(userId, authenticatedUser, authenticatedTenantId) {
  try {
    // Get the user from Cognito
    const cognitoUser = await cognitoService.getUser(userId);
    
    // Verify that the user belongs to the same tenant as the authenticated user
    const userTenantId = cognitoUser.UserAttributes.find(attr => attr.Name === 'custom:tenantId')?.Value;
    
    if (userTenantId !== authenticatedTenantId) {
      return formatResponse(403, {
        message: 'Forbidden: User does not belong to your tenant'
      });
    }
    
    // Get the user's groups to determine their role
    const userGroups = await cognitoService.getUserGroups(userId);
    const isAdmin = userGroups.Groups.some(g => g.GroupName === `${authenticatedTenantId}_Admins`);
    
    // Get additional user profile information from DynamoDB
    const userProfile = await dynamoDBService.getUserProfile(userId, authenticatedTenantId);
    
    // Format the user information
    const user = {
      username: cognitoUser.Username,
      email: cognitoUser.UserAttributes.find(attr => attr.Name === 'email')?.Value,
      name: cognitoUser.UserAttributes.find(attr => attr.Name === 'name')?.Value,
      tenantId: userTenantId,
      role: isAdmin ? 'Admin' : 'User',
      status: cognitoUser.UserStatus,
      enabled: cognitoUser.Enabled,
      created: cognitoUser.UserCreateDate,
      profile: userProfile
    };
    
    return formatResponse(200, user);
  } catch (error) {
    console.error('Error getting user:', error);
    
    if (error.code === 'UserNotFoundException') {
      return formatResponse(404, {
        message: 'User not found'
      });
    }
    
    throw error;
  }
}

/**
 * List users for the tenant
 * @param {Object} queryParams - Query parameters
 * @param {string} authenticatedUser - Email of the authenticated user
 * @param {string} authenticatedTenantId - Tenant ID of the authenticated user
 * @returns {Promise<Object>} - API Gateway response
 */
async function listUsers(queryParams, authenticatedUser, authenticatedTenantId) {
  try {
    // Parse pagination parameters
    const limit = parseInt(queryParams.limit) || 50;
    const paginationToken = queryParams.paginationToken || null;
    
    // List users for the tenant
    const result = await cognitoService.listTenantUsers(
      authenticatedTenantId,
      authenticatedUser,
      limit,
      paginationToken
    );
    
    return formatResponse(200, result);
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} authenticatedUser - Email of the authenticated user
 * @param {string} authenticatedTenantId - Tenant ID of the authenticated user
 * @returns {Promise<Object>} - API Gateway response
 */
async function createUser(userData, authenticatedUser, authenticatedTenantId) {
  try {
    // Validate required fields
    if (!userData.email || !userData.name || !userData.role) {
      return formatResponse(400, {
        message: 'Bad Request: Missing required fields (email, name, role)'
      });
    }
    
    // Validate role
    if (!['Admin', 'User'].includes(userData.role)) {
      return formatResponse(400, {
        message: 'Bad Request: Role must be either "Admin" or "User"'
      });
    }
    
    // Create the user in Cognito
    const user = await cognitoService.createTenantUser(
      userData.email,
      authenticatedTenantId,
      userData.name,
      userData.role,
      authenticatedUser
    );
    
    // Create user profile in DynamoDB
    await dynamoDBService.saveUserProfile(
      userData.email, // Using email as userId for simplicity
      authenticatedTenantId,
      {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        preferences: userData.preferences || {},
        createdAt: new Date().toISOString()
      }
    );
    
    return formatResponse(201, {
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 'UsernameExistsException') {
      return formatResponse(409, {
        message: 'User with this email already exists'
      });
    }
    
    throw error;
  }
}

/**
 * Update an existing user
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - User data to update
 * @param {string} authenticatedUser - Email of the authenticated user
 * @param {string} authenticatedTenantId - Tenant ID of the authenticated user
 * @returns {Promise<Object>} - API Gateway response
 */
async function updateUser(userId, userData, authenticatedUser, authenticatedTenantId) {
  try {
    // Get the user to verify tenant
    const cognitoUser = await cognitoService.getUser(userId);
    const userTenantId = cognitoUser.UserAttributes.find(attr => attr.Name === 'custom:tenantId')?.Value;
    
    if (userTenantId !== authenticatedTenantId) {
      return formatResponse(403, {
        message: 'Forbidden: User does not belong to your tenant'
      });
    }
    
    // Update user attributes if provided
    if (userData.name) {
      await cognitoService.updateUserAttributes(
        userId,
        { name: userData.name },
        authenticatedUser
      );
    }
    
    // Update user role if provided
    if (userData.role) {
      if (!['Admin', 'User'].includes(userData.role)) {
        return formatResponse(400, {
          message: 'Bad Request: Role must be either "Admin" or "User"'
        });
      }
      
      // Get current groups
      const userGroups = await cognitoService.getUserGroups(userId);
      const currentGroups = userGroups.Groups.map(g => g.GroupName);
      
      // Determine which groups to add/remove
      const adminGroupName = `${authenticatedTenantId}_Admins`;
      const userGroupName = `${authenticatedTenantId}_Users`;
      
      if (userData.role === 'Admin' && !currentGroups.includes(adminGroupName)) {
        await cognitoService.addUserToGroup(userId, adminGroupName);
        
        if (currentGroups.includes(userGroupName)) {
          await cognitoService.removeUserFromGroup(userId, userGroupName, authenticatedUser);
        }
      } else if (userData.role === 'User' && !currentGroups.includes(userGroupName)) {
        await cognitoService.addUserToGroup(userId, userGroupName);
        
        if (currentGroups.includes(adminGroupName)) {
          await cognitoService.removeUserFromGroup(userId, adminGroupName, authenticatedUser);
        }
      }
    }
    
    // Update user profile in DynamoDB if needed
    if (userData.preferences || userData.name || userData.role) {
      // Get current profile
      const currentProfile = await dynamoDBService.getUserProfile(userId, authenticatedTenantId);
      
      // Update profile
      await dynamoDBService.saveUserProfile(
        userId,
        authenticatedTenantId,
        {
          ...currentProfile,
          name: userData.name || currentProfile.name,
          role: userData.role || currentProfile.role,
          preferences: userData.preferences || currentProfile.preferences,
          updatedAt: new Date().toISOString()
        }
      );
    }
    
    return formatResponse(200, {
      message: 'User updated successfully',
      userId
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.code === 'UserNotFoundException') {
      return formatResponse(404, {
        message: 'User not found'
      });
    }
    
    throw error;
  }
}

/**
 * Delete a user
 * @param {string} userId - ID of the user to delete
 * @param {string} authenticatedUser - Email of the authenticated user
 * @param {string} authenticatedTenantId - Tenant ID of the authenticated user
 * @returns {Promise<Object>} - API Gateway response
 */
async function deleteUser(userId, authenticatedUser, authenticatedTenantId) {
  try {
    // Don't allow deleting yourself
    if (userId === authenticatedUser) {
      return formatResponse(400, {
        message: 'Bad Request: Cannot delete your own account'
      });
    }
    
    // Delete the user
    await cognitoService.deleteUser(userId, authenticatedUser);
    
    return formatResponse(200, {
      message: 'User deleted successfully',
      userId
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.code === 'UserNotFoundException') {
      return formatResponse(404, {
        message: 'User not found'
      });
    }
    
    throw error;
  }
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