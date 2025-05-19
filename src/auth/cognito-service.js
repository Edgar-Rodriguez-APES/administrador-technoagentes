/**
 * Cognito Service for Multi-tenant User Management
 * 
 * This service provides functions for managing users in a multi-tenant environment
 * using Amazon Cognito. It handles operations like creating users, managing groups,
 * and enforcing tenant isolation.
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class CognitoService {
  constructor() {
    this.cognito = new AWS.CognitoIdentityServiceProvider();
    this.userPoolId = process.env.USER_POOL_ID;
  }

  /**
   * Create a new tenant superuser
   * @param {string} email - Email of the superuser
   * @param {string} tenantId - ID of the tenant
   * @param {string} name - Name of the superuser
   * @returns {Promise<Object>} - Created user information
   */
  async createTenantSuperUser(email, tenantId, name) {
    // Generate a temporary password
    const temporaryPassword = this._generateTemporaryPassword();
    
    // Create the user in Cognito
    const params = {
      UserPoolId: this.userPoolId,
      Username: email,
      TemporaryPassword: temporaryPassword,
      MessageAction: 'SUPPRESS', // We'll send our own welcome email
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        },
        {
          Name: 'name',
          Value: name
        },
        {
          Name: 'custom:tenantId',
          Value: tenantId
        }
      ]
    };

    try {
      const result = await this.cognito.adminCreateUser(params).promise();
      
      // Add the user to the tenant admin group
      await this.addUserToGroup(email, `${tenantId}_Admins`);
      
      return {
        username: result.User.Username,
        userStatus: result.User.UserStatus,
        created: result.User.UserCreateDate,
        tenantId,
        temporaryPassword
      };
    } catch (error) {
      console.error('Error creating tenant superuser:', error);
      throw new Error(`Failed to create tenant superuser: ${error.message}`);
    }
  }

  /**
   * Create a new tenant user
   * @param {string} email - Email of the user
   * @param {string} tenantId - ID of the tenant
   * @param {string} name - Name of the user
   * @param {string} role - Role of the user (Admin or User)
   * @param {string} createdBy - Username of the admin creating this user
   * @returns {Promise<Object>} - Created user information
   */
  async createTenantUser(email, tenantId, name, role, createdBy) {
    // Verify that the admin creating this user belongs to the same tenant
    await this._verifyAdminTenantAccess(createdBy, tenantId);
    
    // Generate a temporary password
    const temporaryPassword = this._generateTemporaryPassword();
    
    // Create the user in Cognito
    const params = {
      UserPoolId: this.userPoolId,
      Username: email,
      TemporaryPassword: temporaryPassword,
      MessageAction: 'SUPPRESS', // We'll send our own welcome email
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        },
        {
          Name: 'name',
          Value: name
        },
        {
          Name: 'custom:tenantId',
          Value: tenantId
        }
      ]
    };

    try {
      const result = await this.cognito.adminCreateUser(params).promise();
      
      // Add the user to the appropriate tenant group
      const groupName = role === 'Admin' ? `${tenantId}_Admins` : `${tenantId}_Users`;
      await this.addUserToGroup(email, groupName);
      
      return {
        username: result.User.Username,
        userStatus: result.User.UserStatus,
        created: result.User.UserCreateDate,
        tenantId,
        role,
        temporaryPassword
      };
    } catch (error) {
      console.error('Error creating tenant user:', error);
      throw new Error(`Failed to create tenant user: ${error.message}`);
    }
  }

  /**
   * Create tenant groups in Cognito
   * @param {string} tenantId - ID of the tenant
   * @returns {Promise<Object>} - Created groups information
   */
  async createTenantGroups(tenantId) {
    try {
      // Create Admin group
      const adminGroupParams = {
        GroupName: `${tenantId}_Admins`,
        UserPoolId: this.userPoolId,
        Description: `Administrators for tenant ${tenantId}`
      };
      await this.cognito.createGroup(adminGroupParams).promise();
      
      // Create Users group
      const usersGroupParams = {
        GroupName: `${tenantId}_Users`,
        UserPoolId: this.userPoolId,
        Description: `Users for tenant ${tenantId}`
      };
      await this.cognito.createGroup(usersGroupParams).promise();
      
      return {
        tenantId,
        groups: [`${tenantId}_Admins`, `${tenantId}_Users`]
      };
    } catch (error) {
      console.error('Error creating tenant groups:', error);
      throw new Error(`Failed to create tenant groups: ${error.message}`);
    }
  }

  /**
   * Add a user to a Cognito group
   * @param {string} username - Username (email) of the user
   * @param {string} groupName - Name of the group
   * @returns {Promise<Object>} - Result of the operation
   */
  async addUserToGroup(username, groupName) {
    const params = {
      GroupName: groupName,
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      await this.cognito.adminAddUserToGroup(params).promise();
      return { username, groupName, added: true };
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw new Error(`Failed to add user to group: ${error.message}`);
    }
  }

  /**
   * Remove a user from a Cognito group
   * @param {string} username - Username (email) of the user
   * @param {string} groupName - Name of the group
   * @param {string} adminUsername - Username of the admin performing this action
   * @returns {Promise<Object>} - Result of the operation
   */
  async removeUserFromGroup(username, groupName, adminUsername) {
    // Extract tenantId from the group name
    const tenantId = groupName.split('_')[0];
    
    // Verify that the admin belongs to the same tenant
    await this._verifyAdminTenantAccess(adminUsername, tenantId);
    
    const params = {
      GroupName: groupName,
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      await this.cognito.adminRemoveUserFromGroup(params).promise();
      return { username, groupName, removed: true };
    } catch (error) {
      console.error('Error removing user from group:', error);
      throw new Error(`Failed to remove user from group: ${error.message}`);
    }
  }

  /**
   * List users in a tenant
   * @param {string} tenantId - ID of the tenant
   * @param {string} adminUsername - Username of the admin performing this action
   * @param {string} limit - Maximum number of users to return
   * @param {string} paginationToken - Token for pagination
   * @returns {Promise<Object>} - List of users
   */
  async listTenantUsers(tenantId, adminUsername, limit = 60, paginationToken = null) {
    // Verify that the admin belongs to the same tenant
    await this._verifyAdminTenantAccess(adminUsername, tenantId);
    
    // We'll use the filter to get users with the specific tenantId
    const params = {
      UserPoolId: this.userPoolId,
      Filter: `"custom:tenantId" = "${tenantId}"`,
      Limit: limit
    };
    
    if (paginationToken) {
      params.PaginationToken = paginationToken;
    }

    try {
      const result = await this.cognito.listUsers(params).promise();
      
      // Process the users to extract relevant information
      const users = await Promise.all(result.Users.map(async user => {
        const attributes = {};
        user.Attributes.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });
        
        // Get groups for this user
        const userGroups = await this.getUserGroups(user.Username);
        const role = userGroups.Groups.some(g => g.GroupName === `${tenantId}_Admins`) ? 'Admin' : 'User';
        
        return {
          username: user.Username,
          email: attributes.email,
          name: attributes.name,
          tenantId: attributes['custom:tenantId'],
          role,
          status: user.UserStatus,
          enabled: user.Enabled,
          created: user.UserCreateDate
        };
      }));
      
      return {
        users,
        paginationToken: result.PaginationToken
      };
    } catch (error) {
      console.error('Error listing tenant users:', error);
      throw new Error(`Failed to list tenant users: ${error.message}`);
    }
  }

  /**
   * Get groups for a user
   * @param {string} username - Username (email) of the user
   * @returns {Promise<Object>} - Groups the user belongs to
   */
  async getUserGroups(username) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      return await this.cognito.adminListGroupsForUser(params).promise();
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw new Error(`Failed to get user groups: ${error.message}`);
    }
  }

  /**
   * Update user attributes
   * @param {string} username - Username (email) of the user
   * @param {Object} attributes - Attributes to update
   * @param {string} adminUsername - Username of the admin performing this action
   * @returns {Promise<Object>} - Result of the operation
   */
  async updateUserAttributes(username, attributes, adminUsername) {
    // Get the user to check their tenantId
    const user = await this.getUser(username);
    const tenantId = user.UserAttributes.find(attr => attr.Name === 'custom:tenantId')?.Value;
    
    if (!tenantId) {
      throw new Error('User does not have a tenantId');
    }
    
    // Verify that the admin belongs to the same tenant
    await this._verifyAdminTenantAccess(adminUsername, tenantId);
    
    // Prepare the attributes for update
    const userAttributes = [];
    for (const [key, value] of Object.entries(attributes)) {
      // Don't allow updating tenantId
      if (key === 'custom:tenantId') continue;
      
      userAttributes.push({
        Name: key,
        Value: value
      });
    }
    
    const params = {
      UserPoolId: this.userPoolId,
      Username: username,
      UserAttributes: userAttributes
    };

    try {
      await this.cognito.adminUpdateUserAttributes(params).promise();
      return { username, updated: true, attributes: Object.keys(attributes) };
    } catch (error) {
      console.error('Error updating user attributes:', error);
      throw new Error(`Failed to update user attributes: ${error.message}`);
    }
  }

  /**
   * Delete a user
   * @param {string} username - Username (email) of the user
   * @param {string} adminUsername - Username of the admin performing this action
   * @returns {Promise<Object>} - Result of the operation
   */
  async deleteUser(username, adminUsername) {
    // Get the user to check their tenantId
    const user = await this.getUser(username);
    const tenantId = user.UserAttributes.find(attr => attr.Name === 'custom:tenantId')?.Value;
    
    if (!tenantId) {
      throw new Error('User does not have a tenantId');
    }
    
    // Verify that the admin belongs to the same tenant
    await this._verifyAdminTenantAccess(adminUsername, tenantId);
    
    const params = {
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      await this.cognito.adminDeleteUser(params).promise();
      return { username, deleted: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Get a user
   * @param {string} username - Username (email) of the user
   * @returns {Promise<Object>} - User information
   */
  async getUser(username) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      return await this.cognito.adminGetUser(params).promise();
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Verify that an admin has access to a tenant
   * @param {string} adminUsername - Username of the admin
   * @param {string} tenantId - ID of the tenant
   * @returns {Promise<boolean>} - True if admin has access
   * @private
   */
  async _verifyAdminTenantAccess(adminUsername, tenantId) {
    try {
      // Get the admin user
      const adminUser = await this.getUser(adminUsername);
      
      // Check if the admin belongs to the same tenant
      const adminTenantId = adminUser.UserAttributes.find(attr => attr.Name === 'custom:tenantId')?.Value;
      
      if (adminTenantId !== tenantId) {
        throw new Error('Admin does not have access to this tenant');
      }
      
      // Check if the admin is in the Admins group
      const userGroups = await this.getUserGroups(adminUsername);
      const isAdmin = userGroups.Groups.some(g => g.GroupName === `${adminTenantId}_Admins`);
      
      if (!isAdmin) {
        throw new Error('User is not an admin');
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying admin tenant access:', error);
      throw new Error(`Access verification failed: ${error.message}`);
    }
  }

  /**
   * Generate a temporary password
   * @returns {string} - Temporary password
   * @private
   */
  _generateTemporaryPassword() {
    // Generate a random password that meets Cognito requirements
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    
    // Ensure at least one character from each required character class
    password += 'A'; // Uppercase
    password += 'a'; // Lowercase
    password += '0'; // Number
    password += '!'; // Special character
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}

module.exports = CognitoService;