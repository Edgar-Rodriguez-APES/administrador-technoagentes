/**
 * Configuration Module for Multi-tenant Application
 * 
 * This module provides centralized configuration management for the application,
 * including environment-specific settings and API endpoints.
 */

// Base API URL for different environments
const API_BASE_URLS = {
  local: 'http://localhost:3000',
  dev: 'https://r3i3nw4u16.execute-api.us-east-1.amazonaws.com/dev',
  staging: 'https://api-staging.technoagentes.com',
  prod: 'https://api.technoagentes.com'
};

// Get the current environment
const environment = process.env.ENVIRONMENT || 'dev';

// Configuration object
const config = {
  // API configuration
  api: {
    baseUrl: API_BASE_URLS[environment] || API_BASE_URLS.dev,
    endpoints: {
      tenantUsers: '/tenants/users',
      tenantConfig: '/tenants/configurations',
      tcAcceptance: '/tc-acceptance',
      webhooks: '/webhooks/payment',
      onboarding: '/onboarding'
    },
    defaultHeaders: {
      'Content-Type': 'application/json'
    }
  },
  
  // Authentication configuration
  auth: {
    userPoolId: process.env.USER_POOL_ID,
    clientId: process.env.CLIENT_ID,
    region: process.env.AWS_REGION || 'us-east-1',
    tokenExpiry: 60 * 60 * 1000 // 1 hour in milliseconds
  },
  
  // Database configuration
  db: {
    tenantsTable: process.env.TENANTS_TABLE,
    usersTable: process.env.USERS_TABLE,
    configurationsTable: process.env.CONFIGURATIONS_TABLE,
    tcAcceptanceTable: process.env.TC_ACCEPTANCE_TABLE,
    webhookEventsTable: process.env.WEBHOOK_EVENTS_TABLE
  },
  
  // Storage configuration
  storage: {
    tenantBucketName: process.env.TENANT_BUCKET_NAME,
    useKms: process.env.USE_KMS === 'true'
  },
  
  // Payment provider configuration
  payment: {
    provider: 'treli',
    secretsName: process.env.PAYMENT_SECRETS_NAME,
    prices: {
      basic: process.env.TRELI_PRICE_BASIC,
      standard: process.env.TRELI_PRICE_STANDARD,
      premium: process.env.TRELI_PRICE_PREMIUM
    }
  },
  
  // Feature flags and AppConfig
  features: {
    appConfigApplication: process.env.APPCONFIG_APPLICATION,
    appConfigEnvironment: process.env.APPCONFIG_ENVIRONMENT,
    defaultFeatures: {
      enableMultiFactorAuth: false,
      enableAdvancedReporting: false,
      enableCustomBranding: false
    }
  },
  
  // Logging configuration
  logging: {
    level: environment === 'prod' ? 'info' : 'debug',
    includeTimestamp: true
  }
};

module.exports = config;