/**
 * Payment Service for Multi-tenant Platform
 * 
 * This service handles payment processing and subscription management
 * using a payment provider (Treli in this implementation).
 */

const AWS = require('aws-sdk');
const DynamoDBService = require('../data/dynamodb-service');
const axios = require('axios');

class PaymentService {
  constructor() {
    this.dynamoDBService = new DynamoDBService();
    this.secretsManager = new AWS.SecretsManager();
    this.secretName = process.env.PAYMENT_SECRETS_NAME;
    this.apiBaseUrl = 'https://api.treli.co/v1';
    this.apiKey = process.env.TRELI_API_KEY;
  }

  /**
   * Initialize the payment service with API keys from Secrets Manager
   * @returns {Promise<void>}
   * @private
   */
  async _initialize() {
    if (!this.apiKey) {
      try {
        const secretData = await this.secretsManager.getSecretValue({
          SecretId: this.secretName
        }).promise();
        
        const secrets = JSON.parse(secretData.SecretString);
        this.apiKey = secrets.TRELI_API_KEY;
        process.env.TRELI_API_KEY = this.apiKey;
      } catch (error) {
        console.error('Error fetching payment secrets:', error);
        throw new Error(`Failed to initialize payment service: ${error.message}`);
      }
    }
  }

  /**
   * Create a customer in the payment provider
   * @param {Object} customerData - Customer information
   * @returns {Promise<Object>} - Created customer information
   */
  async createCustomer(customerData) {
    await this._initialize();
    
    try {
      // Create customer in Treli
      const customerResponse = await axios({
        method: 'post',
        url: `${this.apiBaseUrl}/customers`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          email: customerData.email,
          name: customerData.name,
          description: `Tenant: ${customerData.name}`,
          metadata: {
            tenantId: customerData.tenantId
          }
        }
      });
      
      const customer = customerResponse.data;
      
      // If a payment token is provided, attach it to the customer
      if (customerData.paymentToken) {
        try {
          await axios({
            method: 'post',
            url: `${this.apiBaseUrl}/customers/${customer.id}/payment_methods`,
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            data: {
              payment_method: customerData.paymentToken,
              set_as_default: true
            }
          });
        } catch (paymentError) {
          console.error('Error attaching payment method:', paymentError);
          throw new Error('Failed to attach payment method. Please check your payment information.');
        }
      }
      
      return {
        customerId: customer.id
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.message;
        
        if (statusCode === 400) {
          throw new Error(`Invalid customer data: ${errorMessage}`);
        } else if (statusCode === 402) {
          throw new Error('Payment method declined. Please use a different payment method.');
        }
      }
      
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Create a subscription for a customer
   * @param {string} customerId - ID of the customer in the payment provider
   * @param {string} planId - ID of the plan
   * @returns {Promise<Object>} - Created subscription information
   */
  async createSubscription(customerId, planId) {
    await this._initialize();
    
    try {
      // Get the price ID for the plan
      const priceId = await this._getPriceIdForPlan(planId);
      
      // Create subscription
      const subscriptionResponse = await axios({
        method: 'post',
        url: `${this.apiBaseUrl}/subscriptions`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          customer: customerId,
          items: [
            { price: priceId }
          ],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent']
        }
      });
      
      const subscription = subscriptionResponse.data;
      
      // Check if subscription requires additional action
      if (subscription.status === 'incomplete' && 
          subscription.latest_invoice?.payment_intent?.status === 'requires_action') {
        throw new Error('Payment requires additional authentication. Please complete the payment process.');
      }
      
      // Check if payment failed
      if (subscription.status === 'incomplete' && 
          subscription.latest_invoice?.payment_intent?.status === 'requires_payment_method') {
        throw new Error('Payment method was declined. Please use a different payment method.');
      }
      
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.message;
        
        if (statusCode === 402) {
          throw new Error('Payment failed. Please check your payment method and try again.');
        } else if (statusCode === 400) {
          throw new Error(`Invalid subscription data: ${errorMessage}`);
        }
      }
      
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Update a subscription
   * @param {string} subscriptionId - ID of the subscription
   * @param {string} planId - New plan ID
   * @returns {Promise<Object>} - Updated subscription information
   */
  async updateSubscription(subscriptionId, planId) {
    await this._initialize();
    
    try {
      // Get the price ID for the plan
      const priceId = await this._getPriceIdForPlan(planId);
      
      // Get the current subscription
      const subscriptionResponse = await axios({
        method: 'get',
        url: `${this.apiBaseUrl}/subscriptions/${subscriptionId}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const subscription = subscriptionResponse.data;
      
      // Update the subscription
      const updatedSubscriptionResponse = await axios({
        method: 'put',
        url: `${this.apiBaseUrl}/subscriptions/${subscriptionId}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          items: [
            {
              id: subscription.items.data[0].id,
              price: priceId
            }
          ],
          proration_behavior: 'create_prorations'
        }
      });
      
      return updatedSubscriptionResponse.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   * @param {string} subscriptionId - ID of the subscription
   * @param {boolean} atPeriodEnd - Whether to cancel at the end of the billing period
   * @returns {Promise<Object>} - Cancelled subscription information
   */
  async cancelSubscription(subscriptionId, atPeriodEnd = true) {
    await this._initialize();
    
    try {
      const subscriptionResponse = await axios({
        method: 'put',
        url: `${this.apiBaseUrl}/subscriptions/${subscriptionId}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          cancel_at_period_end: atPeriodEnd
        }
      });
      
      return subscriptionResponse.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Process a webhook event from the payment provider
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Webhook signature
   * @returns {Promise<Object>} - Processed event information
   */
  async processWebhook(payload, signature) {
    await this._initialize();
    
    try {
      // Verify webhook signature
      const isValid = this._verifyWebhookSignature(payload, signature);
      
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
      
      // Parse the event
      const event = JSON.parse(payload);
      
      // Handle different event types
      switch (event.type) {
        case 'subscription.created':
        case 'subscription.updated':
          await this._handleSubscriptionChange(event.data.object);
          break;
          
        case 'subscription.deleted':
          await this._handleSubscriptionCancellation(event.data.object);
          break;
          
        case 'invoice.paid':
          await this._handlePaymentSuccess(event.data.object);
          break;
          
        case 'invoice.payment_failed':
          await this._handlePaymentFailure(event.data.object);
          break;
      }
      
      return {
        received: true,
        eventType: event.type,
        eventId: event.id
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }

  /**
   * Verify the webhook signature
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Webhook signature
   * @returns {boolean} - Whether the signature is valid
   * @private
   */
  _verifyWebhookSignature(payload, signature) {
    try {
      // Treli webhook signature verification
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.TRELI_WEBHOOK_SECRET);
      const expectedSignature = hmac.update(payload).digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Get customer information from the payment provider
   * @param {string} customerId - ID of the customer
   * @returns {Promise<Object>} - Customer information
   */
  async getCustomer(customerId) {
    await this._initialize();
    
    try {
      const response = await axios({
        method: 'get',
        url: `${this.apiBaseUrl}/customers/${customerId}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  /**
   * Get subscription information from the payment provider
   * @param {string} subscriptionId - ID of the subscription
   * @returns {Promise<Object>} - Subscription information
   */
  async getSubscription(subscriptionId) {
    await this._initialize();
    
    try {
      const response = await axios({
        method: 'get',
        url: `${this.apiBaseUrl}/subscriptions/${subscriptionId}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  /**
   * Generate a client secret for payment collection
   * @param {string} customerId - ID of the customer
   * @param {number} amount - Amount to charge (in cents)
   * @param {string} currency - Currency code
   * @returns {Promise<Object>} - Payment intent information
   */
  async createPaymentIntent(customerId, amount, currency = 'usd') {
    await this._initialize();
    
    try {
      const response = await axios({
        method: 'post',
        url: `${this.apiBaseUrl}/payment_intents`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          amount,
          currency,
          customer: customerId,
          setup_future_usage: 'off_session'
        }
      });
      
      const paymentIntent = response.data;
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Get the price ID for a plan
   * @param {string} planId - ID of the plan
   * @returns {Promise<string>} - Price ID
   * @private
   */
  async _getPriceIdForPlan(planId) {
    // En una implementación real, esto se obtendría de una base de datos o configuración
    const planPriceMap = {
      'BASIC': process.env.TRELI_PRICE_BASIC,
      'STANDARD': process.env.TRELI_PRICE_STANDARD,
      'PREMIUM': process.env.TRELI_PRICE_PREMIUM
    };
    
    const priceId = planPriceMap[planId];
    if (!priceId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }
    
    return priceId;
  }

  /**
   * Handle subscription change event
   * @param {Object} subscription - Subscription object from webhook
   * @returns {Promise<void>}
   * @private
   */
  async _handleSubscriptionChange(subscription) {
    try {
      // Get the customer to find the tenantId
      const customer = await this.getCustomer(subscription.customer);
      const tenantId = customer.metadata.tenantId;
      
      if (!tenantId) {
        console.error('No tenantId found in customer metadata');
        return;
      }
      
      // Get the tenant from DynamoDB
      const tenant = await this.dynamoDBService.getTenant(tenantId);
      
      if (!tenant) {
        console.error(`Tenant not found for tenantId: ${tenantId}`);
        return;
      }
      
      // Update the tenant's subscription information
      const planMap = {
        [process.env.TRELI_PRICE_BASIC]: 'BASIC',
        [process.env.TRELI_PRICE_STANDARD]: 'STANDARD',
        [process.env.TRELI_PRICE_PREMIUM]: 'PREMIUM'
      };
      
      const priceId = subscription.items.data[0].price.id;
      const plan = planMap[priceId] || tenant.plan;
      
      await this.dynamoDBService.updateTenant(tenantId, {
        paymentInfo: {
          ...tenant.paymentInfo,
          subscriptionId: subscription.id,
          plan,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('Error handling subscription change:', error);
    }
  }

  /**
   * Handle subscription cancellation event
   * @param {Object} subscription - Subscription object from webhook
   * @returns {Promise<void>}
   * @private
   */
  async _handleSubscriptionCancellation(subscription) {
    try {
      // Get the customer to find the tenantId
      const customer = await this.getCustomer(subscription.customer);
      const tenantId = customer.metadata.tenantId;
      
      if (!tenantId) {
        console.error('No tenantId found in customer metadata');
        return;
      }
      
      // Get the tenant from DynamoDB
      const tenant = await this.dynamoDBService.getTenant(tenantId);
      
      if (!tenant) {
        console.error(`Tenant not found for tenantId: ${tenantId}`);
        return;
      }
      
      // Update the tenant's subscription information
      await this.dynamoDBService.updateTenant(tenantId, {
        paymentInfo: {
          ...tenant.paymentInfo,
          status: subscription.status,
          canceledAt: new Date(subscription.canceled_at * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        }
      });
      
      // If the subscription is canceled immediately (not at period end), update tenant status
      if (subscription.status === 'canceled') {
        await this.dynamoDBService.updateTenant(tenantId, {
          status: 'SUSPENDED'
        });
      }
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
    }
  }

  /**
   * Handle payment success event
   * @param {Object} invoice - Invoice object from webhook
   * @returns {Promise<void>}
   * @private
   */
  async _handlePaymentSuccess(invoice) {
    try {
      // Get the customer to find the tenantId
      const customer = await this.getCustomer(invoice.customer);
      const tenantId = customer.metadata.tenantId;
      
      if (!tenantId) {
        console.error('No tenantId found in customer metadata');
        return;
      }
      
      // Get the tenant from DynamoDB
      const tenant = await this.dynamoDBService.getTenant(tenantId);
      
      if (!tenant) {
        console.error(`Tenant not found for tenantId: ${tenantId}`);
        return;
      }
      
      // Update the tenant's payment information
      await this.dynamoDBService.updateTenant(tenantId, {
        paymentInfo: {
          ...tenant.paymentInfo,
          lastPaymentStatus: 'succeeded',
          lastPaymentDate: new Date().toISOString(),
          lastInvoiceId: invoice.id
        },
        status: 'ACTIVE' // Ensure tenant is active after successful payment
      });
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  /**
   * Handle payment failure event
   * @param {Object} invoice - Invoice object from webhook
   * @returns {Promise<void>}
   * @private
   */
  async _handlePaymentFailure(invoice) {
    try {
      // Get the customer to find the tenantId
      const customer = await this.getCustomer(invoice.customer);
      const tenantId = customer.metadata.tenantId;
      
      if (!tenantId) {
        console.error('No tenantId found in customer metadata');
        return;
      }
      
      // Get the tenant from DynamoDB
      const tenant = await this.dynamoDBService.getTenant(tenantId);
      
      if (!tenant) {
        console.error(`Tenant not found for tenantId: ${tenantId}`);
        return;
      }
      
      // Update the tenant's payment information
      await this.dynamoDBService.updateTenant(tenantId, {
        paymentInfo: {
          ...tenant.paymentInfo,
          lastPaymentStatus: 'failed',
          lastPaymentFailureDate: new Date().toISOString(),
          lastInvoiceId: invoice.id
        }
      });
      
      // If this is a recurring payment and it has failed multiple times,
      // we might want to update the tenant status
      if (invoice.attempt_count >= 3) {
        await this.dynamoDBService.updateTenant(tenantId, {
          status: 'PAYMENT_ISSUE'
        });
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }
}

module.exports = PaymentService;