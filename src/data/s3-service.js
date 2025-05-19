/**
 * S3 Service for Multi-tenant Data Storage
 * 
 * This service provides functions for managing tenant data in Amazon S3
 * with proper tenant isolation using prefixes.
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class S3Service {
  constructor() {
    this.s3 = new AWS.S3();
    this.bucketName = process.env.TENANT_BUCKET_NAME;
  }

  /**
   * Upload a file to the tenant's S3 prefix
   * @param {string} tenantId - ID of the tenant
   * @param {string} filePath - Path within the tenant's prefix
   * @param {Buffer|Readable} fileContent - Content of the file
   * @param {Object} options - Additional options (contentType, metadata, etc.)
   * @returns {Promise<Object>} - Upload result
   */
  async uploadFile(tenantId, filePath, fileContent, options = {}) {
    // Ensure the path starts with the tenant ID
    const key = this._getTenantKey(tenantId, filePath);
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: options.contentType || 'application/octet-stream',
      Metadata: {
        ...options.metadata,
        tenantId // Always include tenantId in metadata for additional verification
      }
    };
    
    // Add encryption context if KMS is used
    if (process.env.USE_KMS === 'true') {
      params.ServerSideEncryption = 'aws:kms';
      params.SSEKMSEncryptionContext = {
        tenantId
      };
    }
    
    try {
      const result = await this.s3.upload(params).promise();
      return {
        location: result.Location,
        key: result.Key,
        etag: result.ETag
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get a file from the tenant's S3 prefix
   * @param {string} tenantId - ID of the tenant
   * @param {string} filePath - Path within the tenant's prefix
   * @returns {Promise<Object>} - File content and metadata
   */
  async getFile(tenantId, filePath) {
    const key = this._getTenantKey(tenantId, filePath);
    
    const params = {
      Bucket: this.bucketName,
      Key: key
    };
    
    try {
      const result = await this.s3.getObject(params).promise();
      
      // Verify that the file belongs to the tenant (additional security check)
      if (result.Metadata && result.Metadata.tenantid !== tenantId) {
        throw new Error('File does not belong to the specified tenant');
      }
      
      return {
        content: result.Body,
        contentType: result.ContentType,
        metadata: result.Metadata,
        lastModified: result.LastModified,
        contentLength: result.ContentLength,
        etag: result.ETag
      };
    } catch (error) {
      console.error('Error getting file from S3:', error);
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Delete a file from the tenant's S3 prefix
   * @param {string} tenantId - ID of the tenant
   * @param {string} filePath - Path within the tenant's prefix
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteFile(tenantId, filePath) {
    const key = this._getTenantKey(tenantId, filePath);
    
    const params = {
      Bucket: this.bucketName,
      Key: key
    };
    
    try {
      await this.s3.deleteObject(params).promise();
      return {
        deleted: true,
        key
      };
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List files in the tenant's S3 prefix
   * @param {string} tenantId - ID of the tenant
   * @param {string} prefix - Optional additional prefix within the tenant's prefix
   * @param {Object} options - Additional options (maxKeys, continuationToken, etc.)
   * @returns {Promise<Object>} - List of files
   */
  async listFiles(tenantId, prefix = '', options = {}) {
    const tenantPrefix = this._getTenantKey(tenantId, prefix);
    
    const params = {
      Bucket: this.bucketName,
      Prefix: tenantPrefix,
      MaxKeys: options.maxKeys || 1000,
      ContinuationToken: options.continuationToken
    };
    
    try {
      const result = await this.s3.listObjectsV2(params).promise();
      
      // Process the results to remove the tenant prefix from the keys
      const files = result.Contents.map(item => {
        const relativePath = item.Key.substring(tenantId.length + 1); // +1 for the slash
        return {
          key: item.Key,
          relativePath,
          size: item.Size,
          lastModified: item.LastModified,
          etag: item.ETag
        };
      });
      
      return {
        files,
        isTruncated: result.IsTruncated,
        nextContinuationToken: result.NextContinuationToken
      };
    } catch (error) {
      console.error('Error listing files in S3:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Generate a pre-signed URL for direct browser upload
   * @param {string} tenantId - ID of the tenant
   * @param {string} filePath - Path within the tenant's prefix
   * @param {string} contentType - MIME type of the file
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<string>} - Pre-signed URL
   */
  async getSignedUploadUrl(tenantId, filePath, contentType, expiresIn = 3600) {
    const key = this._getTenantKey(tenantId, filePath);
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn
    };
    
    // Add metadata including tenantId
    params.Metadata = {
      tenantId
    };
    
    try {
      return await this.s3.getSignedUrlPromise('putObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Generate a pre-signed URL for direct browser download
   * @param {string} tenantId - ID of the tenant
   * @param {string} filePath - Path within the tenant's prefix
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<string>} - Pre-signed URL
   */
  async getSignedDownloadUrl(tenantId, filePath, expiresIn = 3600) {
    const key = this._getTenantKey(tenantId, filePath);
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn
    };
    
    try {
      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Copy a file within the tenant's S3 prefix
   * @param {string} tenantId - ID of the tenant
   * @param {string} sourceFilePath - Source path within the tenant's prefix
   * @param {string} destinationFilePath - Destination path within the tenant's prefix
   * @returns {Promise<Object>} - Copy result
   */
  async copyFile(tenantId, sourceFilePath, destinationFilePath) {
    const sourceKey = this._getTenantKey(tenantId, sourceFilePath);
    const destinationKey = this._getTenantKey(tenantId, destinationFilePath);
    
    const params = {
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: destinationKey
    };
    
    try {
      const result = await this.s3.copyObject(params).promise();
      return {
        copied: true,
        sourceKey,
        destinationKey,
        etag: result.CopyObjectResult.ETag
      };
    } catch (error) {
      console.error('Error copying file in S3:', error);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Get the full S3 key with tenant prefix
   * @param {string} tenantId - ID of the tenant
   * @param {string} filePath - Path within the tenant's prefix
   * @returns {string} - Full S3 key
   * @private
   */
  _getTenantKey(tenantId, filePath) {
    // Remove leading slash if present
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    return `${tenantId}/${filePath}`;
  }
}

module.exports = S3Service;