/**
 * Tenant Onboarding Service
 * 
 * This service orchestrates the tenant onboarding process, including:
 * - Creating tenant records
 * - Setting up Cognito groups
 * - Creating the initial superuser
 * - Configuring initial settings
 * - Integrating with payment providers
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const CognitoService = require('../auth/cognito-service');
const DynamoDBService = require('../data/dynamodb-service');
const PaymentService = require('./payment-service');

class TenantOnboardingService {
  constructor() {
    this.cognitoService = new CognitoService();
    this.dynamoDBService = new DynamoDBService();
    this.paymentService = new PaymentService();
    this.stepFunctions = new AWS.StepFunctions();
    this.ses = new AWS.SES();
    
    this.onboardingStateMachineArn = process.env.ONBOARDING_STATE_MACHINE_ARN;
  }

  /**
   * Start the tenant onboarding process
   * @param {Object} tenantData - Tenant information
   * @param {string} paymentToken - Payment token from the payment provider
   * @returns {Promise<Object>} - Onboarding process information
   */
  async startOnboarding(tenantData, paymentToken) {
    try {
      // Generate a unique tenant ID
      const tenantId = uuidv4();
      
      // Start the Step Functions state machine for onboarding
      const params = {
        stateMachineArn: this.onboardingStateMachineArn,
        name: `tenant-onboarding-${tenantId}-${Date.now()}`,
        input: JSON.stringify({
          tenantId,
          tenantName: tenantData.name,
          tenantEmail: tenantData.email,
          tenantPlan: tenantData.plan || 'BASIC',
          paymentToken,
          address: tenantData.address,
          phone: tenantData.phone,
          metadata: tenantData.metadata || {}
        })
      };
      
      const result = await this.stepFunctions.startExecution(params).promise();
      
      return {
        tenantId,
        executionArn: result.executionArn,
        startDate: result.startDate,
        status: 'STARTED'
      };
    } catch (error) {
      console.error('Error starting tenant onboarding:', error);
      throw new Error(`Failed to start tenant onboarding: ${error.message}`);
    }
  }

  /**
   * Create tenant record in DynamoDB
   * @param {Object} event - Event from Step Functions
   * @returns {Promise<Object>} - Created tenant information
   */
  async createTenantRecord(event) {
    try {
      // Extract tenant information from the event
      const { tenantId, tenantName, tenantEmail, tenantPlan, paymentToken, address, phone, metadata } = event;
      
      // Process payment and create customer in payment provider
      const paymentInfo = await this.paymentService.createCustomer({
        email: tenantEmail,
        name: tenantName,
        paymentToken
      });
      
      // Create tenant record in DynamoDB
      const tenant = await this.dynamoDBService.createTenant({
        tenantId,
        name: tenantName,
        email: tenantEmail,
        plan: tenantPlan,
        status: 'ACTIVE',
        address,
        phone,
        paymentInfo: {
          customerId: paymentInfo.customerId,
          subscriptionId: paymentInfo.subscriptionId,
          plan: tenantPlan
        },
        metadata
      });
      
      return tenant;
    } catch (error) {
      console.error('Error creating tenant record:', error);
      throw new Error(`Failed to create tenant record: ${error.message}`);
    }
  }

  /**
   * Configure Cognito groups for the tenant
   * @param {Object} event - Event from Step Functions
   * @returns {Promise<Object>} - Created groups information
   */
  async configureCognitoGroups(event) {
    try {
      // Extract tenant ID from the event
      const { tenantId, action } = event;
      
      if (action === 'createGroups') {
        // Create tenant groups in Cognito
        return await this.cognitoService.createTenantGroups(tenantId);
      }
      
      throw new Error('Invalid action specified');
    } catch (error) {
      console.error('Error configuring Cognito groups:', error);
      throw new Error(`Failed to configure Cognito groups: ${error.message}`);
    }
  }

  /**
   * Create the initial superuser for the tenant
   * @param {Object} event - Event from Step Functions
   * @returns {Promise<Object>} - Created superuser information
   */
  async createSuperUser(event) {
    try {
      // Extract information from the event
      const { tenantId, email, isFirstUser } = event;
      
      if (!isFirstUser) {
        throw new Error('This function is only for creating the first superuser');
      }
      
      // Get tenant information to get the name
      const tenant = await this.dynamoDBService.getTenant(tenantId);
      
      // Create superuser in Cognito
      const superUser = await this.cognitoService.createTenantSuperUser(
        email,
        tenantId,
        tenant.name
      );
      
      // Create user profile in DynamoDB
      await this.dynamoDBService.saveUserProfile(
        email, // Using email as userId for simplicity
        tenantId,
        {
          email,
          name: tenant.name,
          role: 'Admin',
          createdAt: new Date().toISOString()
        }
      );
      
      return superUser;
    } catch (error) {
      console.error('Error creating superuser:', error);
      throw new Error(`Failed to create superuser: ${error.message}`);
    }
  }

  /**
   * Set up initial configuration for the tenant
   * @param {Object} event - Event from Step Functions
   * @returns {Promise<Object>} - Configuration information
   */
  async setupInitialConfiguration(event) {
    try {
      // Extract information from the event
      const { tenantId, configuration } = event;
      
      // Save configuration in DynamoDB
      const agentsConfig = await this.dynamoDBService.saveTenantConfiguration(
        tenantId,
        'agents',
        configuration.enabledAgents
      );
      
      const limitsConfig = await this.dynamoDBService.saveTenantConfiguration(
        tenantId,
        'limits',
        configuration.usageLimits
      );
      
      const uiConfig = await this.dynamoDBService.saveTenantConfiguration(
        tenantId,
        'ui',
        configuration.uiSettings
      );
      
      return {
        tenantId,
        configurations: {
          agents: agentsConfig,
          limits: limitsConfig,
          ui: uiConfig
        }
      };
    } catch (error) {
      console.error('Error setting up initial configuration:', error);
      throw new Error(`Failed to set up initial configuration: ${error.message}`);
    }
  }

  /**
   * Send welcome email to the tenant
   * @param {Object} event - Event from Step Functions
   * @returns {Promise<Object>} - Email sending result
   */
  async sendWelcomeEmail(event) {
    try {
      // Extract information from the event
      const { template, to, data } = event;
      
      if (template !== 'WELCOME_EMAIL') {
        throw new Error('Invalid email template specified');
      }
      
      // Prepare email content
      const emailParams = {
        Source: 'no-reply@technoagentes.com',
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Subject: {
            Data: `¡Bienvenido a ${data.tenantName} en Technoagentes!`
          },
          Body: {
            Html: {
              Data: `
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background-color: #0073bb; color: white; padding: 10px; text-align: center; }
                      .content { padding: 20px; }
                      .button { background-color: #0073bb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                      .footer { font-size: 12px; color: #666; margin-top: 30px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>¡Bienvenido a Technoagentes!</h1>
                      </div>
                      <div class="content">
                        <p>Estimado administrador de ${data.tenantName},</p>
                        <p>¡Su cuenta ha sido creada exitosamente! Ahora puede acceder a nuestra plataforma de agentes inteligentes de IA Generativa.</p>
                        <p>Para comenzar, haga clic en el siguiente enlace:</p>
                        <p style="text-align: center;">
                          <a href="${data.loginUrl}" class="button">Iniciar sesión</a>
                        </p>
                        <p>Si tiene alguna pregunta, no dude en contactarnos en ${data.supportEmail}.</p>
                        <p>¡Gracias por elegir Technoagentes!</p>
                        <div class="footer">
                          <p>Este es un mensaje automático, por favor no responda a este correo.</p>
                        </div>
                      </div>
                    </div>
                  </body>
                </html>
              `
            }
          }
        }
      };
      
      // Send email
      const result = await this.ses.sendEmail(emailParams).promise();
      
      return {
        messageId: result.MessageId,
        sent: true,
        to
      };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Check the status of an onboarding process
   * @param {string} executionArn - ARN of the Step Functions execution
   * @returns {Promise<Object>} - Onboarding status
   */
  async checkOnboardingStatus(executionArn) {
    try {
      const params = {
        executionArn
      };
      
      const result = await this.stepFunctions.describeExecution(params).promise();
      
      return {
        executionArn: result.executionArn,
        status: result.status,
        startDate: result.startDate,
        stopDate: result.stopDate,
        output: result.output ? JSON.parse(result.output) : null
      };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      throw new Error(`Failed to check onboarding status: ${error.message}`);
    }
  }
}

module.exports = TenantOnboardingService;