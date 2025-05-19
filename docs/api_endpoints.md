# API Endpoints - Administrador Technoagentes

## Base URL

```
https://r3i3nw4u16.execute-api.us-east-1.amazonaws.com/dev
```

## Endpoints

### Tenant Users

#### Get Tenant Users
- **URL**: `/tenants/users`
- **Method**: `GET`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `limit` (optional): Number of users to return (default: 50)
  - `paginationToken` (optional): Token for pagination
- **Success Response**: 200 OK
  ```json
  {
    "users": [
      {
        "username": "user@example.com",
        "email": "user@example.com",
        "name": "User Name",
        "tenantId": "tenant-12345",
        "role": "Admin",
        "status": "CONFIRMED",
        "enabled": true,
        "created": "2023-01-01T00:00:00.000Z",
        "profile": {
          "preferences": {}
        }
      }
    ],
    "paginationToken": "next-page-token",
    "count": 1
  }
  ```

#### Create Tenant User
- **URL**: `/tenants/users`
- **Method**: `POST`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
  - `Content-Type`: application/json
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "name": "New User",
    "role": "User",
    "preferences": {}
  }
  ```
- **Success Response**: 201 Created
  ```json
  {
    "message": "User created successfully",
    "user": {
      "username": "newuser@example.com",
      "email": "newuser@example.com",
      "name": "New User",
      "tenantId": "tenant-12345",
      "role": "User",
      "status": "FORCE_CHANGE_PASSWORD"
    }
  }
  ```

#### Update Tenant User
- **URL**: `/tenants/users/{userId}`
- **Method**: `PUT`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
  - `Content-Type`: application/json
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "role": "Admin",
    "preferences": {
      "theme": "dark"
    }
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "message": "User updated successfully",
    "userId": "user@example.com"
  }
  ```

#### Delete Tenant User
- **URL**: `/tenants/users/{userId}`
- **Method**: `DELETE`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
- **Success Response**: 200 OK
  ```json
  {
    "message": "User deleted successfully",
    "userId": "user@example.com"
  }
  ```

### Tenant Configurations

#### Get Tenant Configuration
- **URL**: `/tenants/configurations/{configType}`
- **Method**: `GET`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
- **Success Response**: 200 OK
  ```json
  {
    "tenantId": "tenant-12345",
    "configType": "ui-settings",
    "data": {
      "theme": "dark",
      "logo": "https://example.com/logo.png",
      "primaryColor": "#00FF00"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Update Tenant Configuration
- **URL**: `/tenants/configurations/{configType}`
- **Method**: `PUT`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
  - `Content-Type`: application/json
- **Request Body**:
  ```json
  {
    "tenantId": "tenant-12345",
    "configuration": {
      "theme": "dark",
      "logo": "https://example.com/logo.png",
      "primaryColor": "#00FF00"
    }
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "message": "Configuration updated successfully",
    "config": {
      "tenantId": "tenant-12345",
      "configType": "ui-settings",
      "data": {
        "theme": "dark",
        "logo": "https://example.com/logo.png",
        "primaryColor": "#00FF00"
      },
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Terms and Conditions

#### Check Terms and Conditions Acceptance
- **URL**: `/tc-acceptance`
- **Method**: `GET`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `version` (optional): Version of terms to check (default: "latest")
- **Success Response**: 200 OK
  ```json
  {
    "userId": "user@example.com",
    "tenantId": "tenant-12345",
    "termsVersion": "v1.0",
    "hasAccepted": true
  }
  ```

#### Record Terms and Conditions Acceptance
- **URL**: `/tc-acceptance`
- **Method**: `POST`
- **Auth Required**: Yes (Cognito)
- **Headers**:
  - `Authorization`: Bearer token
  - `Content-Type`: application/json
- **Request Body**:
  ```json
  {
    "termsVersion": "v1.0"
  }
  ```
- **Success Response**: 201 Created
  ```json
  {
    "message": "Terms and conditions accepted successfully",
    "acceptance": {
      "userId": "user@example.com",
      "tenantId": "tenant-12345",
      "termsVersion": "v1.0",
      "acceptanceTimestamp": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Payment Webhooks

#### Process Payment Webhook
- **URL**: `/webhooks/payment`
- **Method**: `POST`
- **Auth Required**: No (Uses signature verification)
- **Headers**:
  - `Content-Type`: application/json
  - `treli-signature`: Signature from Treli
- **Request Body**: Varies based on event type
- **Success Response**: 200 OK
  ```json
  {
    "message": "Webhook processed successfully"
  }
  ```

## Authentication

All endpoints except for webhooks require authentication using Amazon Cognito. Include the JWT token in the `Authorization` header as a Bearer token:

```
Authorization: Bearer eyJraWQiOiJxYzFWN...
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing required fields"
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```