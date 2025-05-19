/**
 * Lambda Handler for Terms and Conditions Acceptance API
 * 
 * This handler processes API Gateway requests for recording and verifying
 * terms and conditions acceptance by users.
 */

const DynamoDBService = require('../data/dynamodb-service');

// Initialize services
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
        return await checkAcceptance(
          authenticatedUser,
          authenticatedTenantId,
          event.queryStringParameters || {}
        );
        
      case 'POST':
        return await recordAcceptance(
          authenticatedUser,
          authenticatedTenantId,
          JSON.parse(event.body || '{}'),
          event.requestContext
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
 * Check if a user has accepted the terms and conditions
 * @param {string} userId - ID of the user
 * @param {string} tenantId - ID of the tenant
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} - API Gateway response
 */
async function checkAcceptance(userId, tenantId, queryParams) {
  try {
    // Get the terms version to check
    const termsVersion = queryParams.version || 'latest';
    
    // If checking for latest version, get the latest version first
    let versionToCheck = termsVersion;
    if (termsVersion === 'latest') {
      versionToCheck = await getLatestTermsVersion();
    }
    
    // Check if the user has accepted this version
    const hasAccepted = await dynamoDBService.hasAcceptedTerms(userId, tenantId, versionToCheck);
    
    return formatResponse(200, {
      userId,
      tenantId,
      termsVersion: versionToCheck,
      hasAccepted
    });
  } catch (error) {
    console.error('Error checking terms acceptance:', error);
    throw error;
  }
}

/**
 * Record a user's acceptance of terms and conditions
 * @param {string} userId - ID of the user
 * @param {string} tenantId - ID of the tenant
 * @param {Object} acceptanceData - Acceptance data
 * @param {Object} requestContext - API Gateway request context
 * @returns {Promise<Object>} - API Gateway response
 */
async function recordAcceptance(userId, tenantId, acceptanceData, requestContext) {
  try {
    // Validate required fields
    if (!acceptanceData.termsVersion) {
      return formatResponse(400, {
        message: 'Bad Request: Missing required field (termsVersion)'
      });
    }
    
    // Get metadata from the request
    const metadata = {
      ipAddress: requestContext.identity?.sourceIp || 'unknown',
      userAgent: requestContext.identity?.userAgent || 'unknown'
    };
    
    // Record the acceptance
    const acceptance = await dynamoDBService.recordTermsAcceptance(
      userId,
      tenantId,
      acceptanceData.termsVersion,
      metadata
    );
    
    return formatResponse(201, {
      message: 'Terms and conditions acceptance recorded successfully',
      acceptance
    });
  } catch (error) {
    console.error('Error recording terms acceptance:', error);
    throw error;
  }
}

/**
 * Get the latest terms and conditions version
 * @returns {Promise<string>} - Latest terms version
 */
async function getLatestTermsVersion() {
  // In a real implementation, this would fetch from a database or configuration
  // For now, we'll return a hardcoded value
  return '1.0';
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