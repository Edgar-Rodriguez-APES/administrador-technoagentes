/**
 * Onboarding API Handler
 * 
 * This handler processes requests to start the tenant onboarding process
 * from the public registration form.
 */

/**
 * Handler for the POST /onboarding endpoint
 * @param {Object} event - API Gateway event
 * @returns {Object} - API Gateway response
 */
exports.handler = async (event) => {
  try {
    console.log('Onboarding request received:', event.body);
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Extract required fields
    const { companyName, userEmail, userName, planId, paymentToken, ...additionalFields } = body;
    
    // Validate required fields
    if (!companyName || !userEmail || !planId || !paymentToken) {
      return formatResponse(400, {
        message: 'Missing required fields: companyName, userEmail, planId, and paymentToken are required'
      });
    }
    
    // Validate planId
    const validPlans = ['BASIC', 'STANDARD', 'PREMIUM'];
    if (!validPlans.includes(planId)) {
      return formatResponse(400, {
        message: 'Invalid planId. Must be one of: BASIC, STANDARD, PREMIUM'
      });
    }
    
    // Simulate successful onboarding for now
    const tenantId = `tenant_${Date.now()}`;
    const customerId = `cust_${Date.now()}`;
    const subscriptionId = `sub_${Date.now()}`;
    
    console.log(`Creating tenant: ${companyName} for ${userEmail} with plan ${planId}`);
    
    // Return success response
    return formatResponse(201, {
      message: 'Tenant registration received successfully. Processing...',
      tenantId: tenantId,
      status: 'PENDING',
      paymentInfo: {
        customerId: customerId,
        subscriptionId: subscriptionId
      },
      data: {
        companyName,
        userEmail,
        userName,
        planId
      }
    });
  } catch (error) {
    console.error('Error in onboarding API handler:', error);
    
    // Handle specific error types
    if (error.statusCode === 409) {
      return formatResponse(409, {
        message: error.message,
        code: 'DUPLICATE_TENANT'
      });
    }
    
    // Handle payment-related errors
    if (error.message.includes('Payment failed') || error.message.includes('payment')) {
      return formatResponse(402, {
        message: error.message,
        code: 'PAYMENT_FAILED'
      });
    }
    
    // Return generic error response
    return formatResponse(500, {
      message: `Error creating tenant: ${error.message}`,
      code: 'INTERNAL_ERROR'
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
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}