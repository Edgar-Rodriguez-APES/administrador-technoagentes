/**
 * Lambda Handler for Payment Provider Webhooks
 * 
 * This handler processes webhook events from payment providers (Treli)
 * to update tenant subscription status and handle payment events.
 */

const PaymentService = require('../onboarding/payment-service');
const crypto = require('crypto');
const AWS = require('aws-sdk');

// Initialize services
const paymentService = new PaymentService();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Main handler for API Gateway events
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Promise<Object>} - API Gateway response
 */
exports.handler = async (event, context) => {
  try {
    // Extract the webhook payload and signature
    const payload = event.body;
    const signature = event.headers['treli-signature'];
    
    if (!payload || !signature) {
      return formatResponse(400, {
        message: 'Bad Request: Missing webhook payload or signature'
      });
    }
    
    // Check if this event has already been processed (idempotency)
    const eventId = extractEventId(payload);
    if (eventId) {
      const isProcessed = await checkEventProcessed(eventId);
      if (isProcessed) {
        return formatResponse(200, {
          message: 'Event already processed',
          eventId
        });
      }
    }
    
    // Process the webhook
    const result = await paymentService.processWebhook(payload, signature);
    
    // Record the event as processed
    if (eventId) {
      await recordEventProcessed(eventId);
    }
    
    return formatResponse(200, {
      message: 'Webhook processed successfully',
      result
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return 200 even for errors to prevent retries
    // Log the error but don't expose details in the response
    return formatResponse(200, {
      message: 'Webhook received but could not be processed'
    });
  }
};

/**
 * Extract the event ID from the webhook payload
 * @param {string} payload - Webhook payload
 * @returns {string|null} - Event ID or null if not found
 */
function extractEventId(payload) {
  try {
    const data = JSON.parse(payload);
    return data.id;
  } catch (error) {
    console.error('Error extracting event ID:', error);
    return null;
  }
}

/**
 * Check if an event has already been processed
 * @param {string} eventId - ID of the event
 * @returns {Promise<boolean>} - True if already processed
 */
async function checkEventProcessed(eventId) {
  try {
    const params = {
      TableName: process.env.WEBHOOK_EVENTS_TABLE,
      Key: { eventId }
    };
    
    const result = await dynamoDB.get(params).promise();
    return !!result.Item;
  } catch (error) {
    console.error('Error checking event processed:', error);
    return false;
  }
}

/**
 * Record an event as processed
 * @param {string} eventId - ID of the event
 * @returns {Promise<void>}
 */
async function recordEventProcessed(eventId) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const ttl = now + 60 * 60 * 24 * 30; // 30 days TTL
    
    const params = {
      TableName: process.env.WEBHOOK_EVENTS_TABLE,
      Item: {
        eventId,
        processedAt: now,
        ttl
      }
    };
    
    await dynamoDB.put(params).promise();
  } catch (error) {
    console.error('Error recording event processed:', error);
    // Don't throw, as the webhook was already processed
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}