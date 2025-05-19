/**
 * Logger Utility for Multi-tenant Application
 * 
 * This module provides a standardized logging interface with tenant context
 * and integration with AWS CloudWatch Logs.
 */

class Logger {
  /**
   * Create a new logger instance
   * @param {Object} options - Logger options
   * @param {string} options.context - Context name (e.g., service or function name)
   * @param {string} options.tenantId - ID of the tenant (optional)
   */
  constructor(options = {}) {
    this.context = options.context || 'unknown';
    this.tenantId = options.tenantId || null;
    this.environment = process.env.ENVIRONMENT || 'development';
  }

  /**
   * Set the tenant ID for the logger
   * @param {string} tenantId - ID of the tenant
   */
  setTenantId(tenantId) {
    this.tenantId = tenantId;
  }

  /**
   * Log a debug message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data to include
   */
  debug(message, data = {}) {
    this._log('DEBUG', message, data);
  }

  /**
   * Log an info message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data to include
   */
  info(message, data = {}) {
    this._log('INFO', message, data);
  }

  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data to include
   */
  warn(message, data = {}) {
    this._log('WARN', message, data);
  }

  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {Error|Object} error - Error object or additional data
   * @param {Object} data - Additional data to include
   */
  error(message, error = {}, data = {}) {
    let errorData = {};
    
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else {
      data = error;
    }
    
    this._log('ERROR', message, { ...errorData, ...data });
  }

  /**
   * Log a message with the specified level
   * @param {string} level - Log level
   * @param {string} message - Message to log
   * @param {Object} data - Additional data to include
   * @private
   */
  _log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      context: this.context,
      environment: this.environment,
      message
    };
    
    if (this.tenantId) {
      logData.tenantId = this.tenantId;
    }
    
    if (Object.keys(data).length > 0) {
      logData.data = data;
    }
    
    // In production, we'd use a more sophisticated logging approach
    // For now, we'll just use console.log with JSON formatting
    const logMethod = level === 'ERROR' || level === 'WARN' ? console.error : console.log;
    logMethod(JSON.stringify(logData));
  }
}

module.exports = Logger;