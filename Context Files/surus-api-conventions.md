# Surus API Conventions

This document defines API design standards for Surus services. All APIs should follow these conventions for consistency and predictability.

## General Principles

1. **RESTful Design**: Use standard HTTP methods and status codes
2. **Consistency**: Similar operations should work similarly across all endpoints
3. **Predictability**: Developers should be able to guess endpoint behavior
4. **Security First**: Always consider authentication, authorization, and audit requirements

## URL Structure

### Base URL Pattern
```
https://api.{environment}.surus.com/{version}/{resource}
```

Examples:
- `https://api.surus.com/v1/token-offerings`
- `https://api.staging.surus.com/v1/custody-accounts`

### Resource Naming
- Use **plural nouns** for collections: `/token-offerings`, `/users`, `/accounts`
- Use **kebab-case** for multi-word resources: `/custody-accounts`, `/token-offerings`
- Use **hierarchical structure** for relationships: `/accounts/{id}/transactions`

## HTTP Methods

### Standard CRUD Operations

| Method | Purpose | Example | Request Body | Response |
|--------|---------|---------|--------------|----------|
| GET | Retrieve resource(s) | `GET /token-offerings/{id}` | None | Resource |
| POST | Create new resource | `POST /token-offerings` | Resource data | Created resource |
| PUT | Full update | `PUT /token-offerings/{id}` | Complete resource | Updated resource |
| PATCH | Partial update | `PATCH /token-offerings/{id}` | Partial data | Updated resource |
| DELETE | Remove resource | `DELETE /token-offerings/{id}` | None | 204 No Content |

### Custom Actions
For non-CRUD operations, use descriptive verbs:
```
POST /token-offerings/{id}/publish
POST /accounts/{id}/freeze
POST /transfers/{id}/approve
```

## Request Format

### Headers
Required headers for all requests:
```http
Content-Type: application/json
Accept: application/json
X-Correlation-ID: {uuid}
Authorization: Bearer {token}
```

### Request Body Structure
```json
{
  "data": {
    "type": "token-offering",
    "attributes": {
      "name": "Example Token",
      "symbol": "EXT",
      "totalSupply": "1000000"
    }
  }
}
```

### Validation
- Validate all inputs at the API boundary
- Return specific validation errors
- Use consistent field names across endpoints

## Response Format

### Success Response (200 OK, 201 Created)
```json
{
  "data": {
    "type": "token-offering",
    "id": "offering_abc123",
    "attributes": {
      "name": "Example Token",
      "symbol": "EXT",
      "totalSupply": "1000000",
      "status": "draft",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "relationships": {
      "creator": {
        "data": { "type": "user", "id": "user_xyz789" }
      }
    }
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": [
      {
        "field": "totalSupply",
        "code": "INVALID_FORMAT",
        "message": "Total supply must be a positive integer"
      }
    ],
    "requestId": "req_123abc",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Status Codes

### Success Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST creating new resource
- **202 Accepted**: Request accepted for async processing
- **204 No Content**: Successful DELETE

### Client Error Codes
- **400 Bad Request**: Invalid request format
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Request conflicts with current state
- **422 Unprocessable Entity**: Valid format but business rule violation
- **429 Too Many Requests**: Rate limit exceeded

### Server Error Codes
- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Upstream service error
- **503 Service Unavailable**: Service temporarily down
- **504 Gateway Timeout**: Upstream service timeout

## Pagination

### Request Parameters
```
GET /token-offerings?limit=20&cursor=eyJpZCI6MTAwfQ
```

- `limit`: Number of items to return (default: 20, max: 100)
- `cursor`: Opaque cursor for next page

### Response Format
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "limit": 20,
      "hasMore": true,
      "nextCursor": "eyJpZCI6MTIwfQ"
    }
  }
}
```

## Filtering and Sorting

### Filtering
Use query parameters for filters:
```
GET /token-offerings?status=active&minInvestment.gte=1000
```

Common operators:
- `eq`: Equals (default)
- `ne`: Not equals
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `in`: In array
- `contains`: Contains substring

### Sorting
```
GET /token-offerings?sort=-createdAt,name
```
- Prefix with `-` for descending order
- Multiple fields separated by commas

## Versioning

### URL Versioning
Version in URL path: `/v1/`, `/v2/`

### Version Lifecycle
1. **Active**: Current version, fully supported
2. **Deprecated**: Still functional but not recommended
3. **Sunset**: Will be removed by specific date

### Breaking Changes
Changes requiring new version:
- Removing fields
- Changing field types
- Changing required fields
- Modifying authentication

Non-breaking changes (no version bump):
- Adding optional fields
- Adding new endpoints
- Adding new optional parameters

## Authentication & Authorization

### Authentication Headers
```http
Authorization: Bearer {jwt_token}
X-API-Key: {api_key} // For service-to-service
```

### JWT Token Structure
```json
{
  "sub": "user_123",
  "iat": 1516239022,
  "exp": 1516242622,
  "aud": "api.surus.com",
  "iss": "auth.surus.com",
  "permissions": ["token-offerings:read", "token-offerings:write"]
}
```

### Permission Format
`{resource}:{action}`

Examples:
- `token-offerings:read`
- `token-offerings:write`
- `accounts:admin`

## Rate Limiting

### Headers
Response headers for rate limiting:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1516242622
```

### Rate Limit Response (429)
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## Async Operations

### Initial Request
```http
POST /large-reports
```

Response (202 Accepted):
```json
{
  "data": {
    "type": "job",
    "id": "job_123",
    "attributes": {
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "links": {
    "self": "/jobs/job_123"
  }
}
```

### Status Check
```http
GET /jobs/job_123
```

Response:
```json
{
  "data": {
    "type": "job",
    "id": "job_123",
    "attributes": {
      "status": "completed",
      "result": { ... },
      "completedAt": "2024-01-15T10:35:00Z"
    }
  }
}
```

## Webhooks

### Webhook Payload
```json
{
  "id": "webhook_123",
  "type": "token-offering.published",
  "occurredAt": "2024-01-15T10:30:00Z",
  "data": {
    "tokenOfferingId": "offering_123",
    "previousStatus": "draft",
    "currentStatus": "active"
  }
}
```

### Webhook Security
Include signature header:
```http
X-Surus-Signature: sha256=5d61e4b...
```

Verify with:
```typescript
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
```

## Audit Requirements

### Audit Headers
Every state-changing request must include:
```http
X-Idempotency-Key: {uuid}
X-Client-ID: {client_identifier}
```

### Audit Log Fields
All responses include:
```json
{
  "meta": {
    "requestId": "req_123",
    "correlationId": "corr_abc",
    "timestamp": "2024-01-15T10:30:00Z",
    "duration": 145
  }
}
```

## API Documentation

### OpenAPI Specification
Every API must provide OpenAPI 3.0 documentation:
```yaml
openapi: 3.0.0
info:
  title: Surus Token Offering API
  version: 1.0.0
  description: API for managing token offerings
paths:
  /token-offerings:
    post:
      summary: Create a new token offering
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTokenOffering'
```

### Example Requests
Include examples for:
- Successful requests
- Common error scenarios
- Edge cases

## Testing APIs

### Integration Test Pattern
```typescript
describe('POST /token-offerings', () => {
  it('should create token offering with valid data', async () => {
    const response = await request(app)
      .post('/v1/token-offerings')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        data: {
          type: 'token-offering',
          attributes: validTokenOfferingData
        }
      });
      
    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('token-offering');
  });
});
```

## Common Patterns

### Money Representation
Always use strings for monetary values:
```json
{
  "amount": "1000.50",
  "currency": "USD"
}
```

### Date/Time Format
Always use ISO 8601 format in UTC:
```json
{
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Enumeration Values
Use UPPER_SNAKE_CASE:
```json
{
  "status": "PENDING_APPROVAL",
  "type": "SECURITY_TOKEN"
}
```

## Security Considerations

1. **Never expose internal IDs**: Use public identifiers
2. **Validate all inputs**: Don't trust client data
3. **Use HTTPS always**: No exceptions
4. **Implement CORS properly**: Whitelist allowed origins
5. **Log security events**: Failed auth, permission denials
6. **Sanitize outputs**: Prevent XSS in responses

## Performance Guidelines

1. **Use field selection**: `?fields=id,name,status`
2. **Implement caching**: ETags for GET requests
3. **Compress responses**: gzip/brotli
4. **Set appropriate timeouts**: 30s default
5. **Use connection pooling**: For database and HTTP

Remember: APIs are contracts with clients. Breaking changes require careful planning and communication.