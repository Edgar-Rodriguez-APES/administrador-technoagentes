/**
 * Error Handler Utility for Multi-tenant Application
 * 
 * This module provides standardized error handling and formatting
 * for API responses and internal error processing.
 */

const Logger = require('./logger');

// Initialize logger
const logger = new Logger({ context: 'ErrorHandler' });

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  /**
   * Create a new application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @param {Object} details - Additional error details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format an error for API response
 * @param {Error} error - Error object
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(error) {
  // Set tenant ID in logger if available in error details
  if (error.details && error.details.tenantId) {
    logger.setTenantId(error.details.tenantId);
  }
  
  // Log the error
  logger.error('API error', error);
  
  // Determine if this is a known application error or an unexpected error
  const isAppError = error instanceof AppError;
  
  // For unexpected errors, don't expose details to the client
  if (!isAppError) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      })
    };
  }
  
  // For known application errors, return the formatted response
  return {
    statusCode: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      error: {
        code: error.code,
        message: error.message,
        ...(process.env.ENVIRONMENT !== 'production' && error.details && { details: error.details })
      }
    })
  };
}

/**
 * Create common application errors
 */
const errors = {
  /**
   * Bad request error (400)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Bad request error
   */
  badRequest: (message, details = {}) => 
    new AppError(message || 'Bad Request', 400, 'BAD_REQUEST', details),
  
  /**
   * Unauthorized error (401)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Unauthorized error
   */
  unauthorized: (message, details = {}) => 
    new AppError(message || 'Unauthorized', 401, 'UNAUTHORIZED', details),
  
  /**
   * Forbidden error (403)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Forbidden error
   */
  forbidden: (message, details = {}) => 
    new AppError(message || 'Forbidden', 403, 'FORBIDDEN', details),
  
  /**
   * Not found error (404)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Not found error
   */
  notFound: (message, details = {}) => 
    new AppError(message || 'Not Found', 404, 'NOT_FOUND', details),
  
  /**
   * Conflict error (409)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Conflict error
   */
  conflict: (message, details = {}) => 
    new AppError(message || 'Conflict', 409, 'CONFLICT', details),
  
  /**
   * Internal server error (500)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Internal server error
   */
  internal: (message, details = {}) => 
    new AppError(message || 'Internal Server Error', 500, 'INTERNAL_ERROR', details),
  
  /**
   * Service unavailable error (503)
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {AppError} - Service unavailable error
   */
  serviceUnavailable: (message, details = {}) => 
    new AppError(message || 'Service Unavailable', 503, 'SERVICE_UNAVAILABLE', details)
};

/**
 * Wrap a Lambda handler with error handling
 * @param {Function} handler - Lambda handler function
 * @returns {Function} - Wrapped handler function
 */
function withErrorHandling(handler) {
  return async (event, context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
}

module.exports = {
  AppError,
  formatErrorResponse,
  errors,
  withErrorHandling
};