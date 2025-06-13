/**
 * Onboarding API Handler
 * 
 * This handler processes requests to start the tenant onboarding process
 * from the public registration form.
 */

const TenantOnboardingService = require('./tenant-onboarding-service');

/**
 * Handler for the POST /onboarding endpoint
 * @param {Object} event - API Gateway event
 * @returns {Object} - API Gateway response
 */
exports.handler = async (event) => {
  try {
    // Instantiate the onboarding service
    const onboardingService = new TenantOnboardingService();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Extract required fields
    const { companyName, userEmail, userName, plan, paymentToken, ...additionalFields } = body;
    
    // Validate required fields
    if (!companyName || !userEmail) {
      return formatResponse(400, {
        message: 'Missing required fields: companyName and userEmail are required'
      });
    }
    
    // Prepare tenant data
    const tenantData = {
      name: companyName,
      email: userEmail, // Used for both tenant email and superuser email
      plan: plan || 'BASIC',
      address: additionalFields.address,
      phone: additionalFields.phone,
      metadata: {
        userName,
        ...additionalFields.metadata
      }
    };
    
    // Start the onboarding process
    const result = await onboardingService.startOnboarding(tenantData, paymentToken);
    
    // Return success response
    return formatResponse(202, {
      message: 'Onboarding process started.',
      tenantId: result.tenantId,
      executionArn: result.executionArn
    });
  } catch (error) {
    console.error('Error in onboarding API handler:', error);
    
    // Return appropriate error response
    return formatResponse(500, {
      message: `Error starting onboarding process: ${error.message}`
    });
  }
};

/**
 * Format API Gateway response
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