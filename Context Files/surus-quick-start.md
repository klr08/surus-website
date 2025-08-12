# Surus Quick Start Examples

This document provides complete, working examples of common patterns. These examples demonstrate our coding guidelines in practice.

## Token Offering Example (Full Stack)

This example shows creating a token offering with proper error handling, validation, and audit logging.

### Backend (Rust)

#### 1. Domain Types (`domain_types/src/token_offering.rs`)

```rust
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenOfferingId(Uuid);

impl TokenOfferingId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenOffering {
    pub id: TokenOfferingId,
    pub name: String,
    pub symbol: String,
    pub total_supply: Decimal,
    pub price_per_token: Money,
    pub min_investment: Money,
    pub max_investment: Money,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub status: OfferingStatus,
    pub created_by: UserId,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OfferingStatus {
    Draft,
    PendingApproval,
    Active,
    Closed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Money {
    pub amount: Decimal,
    pub currency: String, // ISO 4217
}

impl Money {
    pub fn from_cents(cents: i64, currency: &str) -> Self {
        Self {
            amount: Decimal::new(cents, 2),
            currency: currency.to_string(),
        }
    }
}
```

#### 2. Repository Interface (`token_offering_interface/src/lib.rs`)

```rust
use async_trait::async_trait;
use domain_types::{TokenOffering, TokenOfferingId, UserId};

#[async_trait]
pub trait ITokenOfferingRepository: Send + Sync {
    type Error: std::error::Error + Send + Sync + 'static;
    
    async fn create(&self, offering: &TokenOffering) -> Result<(), Self::Error>;
    
    async fn get_by_id(&self, id: &TokenOfferingId) -> Result<Option<TokenOffering>, Self::Error>;
    
    async fn list_by_creator(&self, creator_id: &UserId) -> Result<Vec<TokenOffering>, Self::Error>;
    
    async fn update(&self, offering: &TokenOffering) -> Result<(), Self::Error>;
}
```

#### 3. Application Service (`application/src/token_offering_service.rs`)

```rust
use crate::error::{Error, Result};
use domain_types::{TokenOffering, TokenOfferingId, OfferingStatus, Money, UserId};
use token_offering_interface::ITokenOfferingRepository;
use ctx_error::ctx_error;
use tracing::{info, instrument};
use validator::Validate;

#[derive(Debug, Validate, Deserialize)]
pub struct CreateTokenOfferingRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    
    #[validate(length(min = 1, max = 10))]
    pub symbol: String,
    
    #[validate(range(min = 1))]
    pub total_supply: Decimal,
    
    pub price_per_token: Money,
    pub min_investment: Money,
    pub max_investment: Money,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
}

pub struct TokenOfferingService<R: ITokenOfferingRepository> {
    repository: R,
    audit_logger: AuditLogger,
}

impl<R: ITokenOfferingRepository> TokenOfferingService<R> {
    #[instrument(skip(self, request), fields(user_id = %user_id.as_ref()))]
    pub async fn create_offering(
        &self,
        user_id: &UserId,
        request: CreateTokenOfferingRequest,
    ) -> Result<TokenOffering> {
        // Validate request
        request.validate()
            .map_err(|e| Error::Validation(e.to_string()))?;
        
        // Business rule validations
        if request.start_date >= request.end_date {
            return Err(Error::BusinessRule(
                "Start date must be before end date".to_string()
            ));
        }
        
        if request.min_investment.amount > request.max_investment.amount {
            return Err(Error::BusinessRule(
                "Minimum investment cannot exceed maximum investment".to_string()
            ));
        }
        
        // Create domain object
        let offering = TokenOffering {
            id: TokenOfferingId::new(),
            name: request.name,
            symbol: request.symbol,
            total_supply: request.total_supply,
            price_per_token: request.price_per_token,
            min_investment: request.min_investment,
            max_investment: request.max_investment,
            start_date: request.start_date,
            end_date: request.end_date,
            status: OfferingStatus::Draft,
            created_by: user_id.clone(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        
        // Save to repository
        self.repository.create(&offering).await
            .map_err(|e| Error::Repository(Box::new(e)))?;
        
        // Audit log
        self.audit_logger.log(AuditEvent {
            action: "TOKEN_OFFERING_CREATED",
            user_id: user_id.clone(),
            resource_type: "TokenOffering",
            resource_id: offering.id.to_string(),
            metadata: json!({
                "name": &offering.name,
                "symbol": &offering.symbol,
                "total_supply": &offering.total_supply.to_string(),
            }),
            timestamp: Utc::now(),
        }).await?;
        
        info!(
            offering_id = %offering.id.as_ref(),
            "Token offering created successfully"
        );
        
        Ok(offering)
    }
}

// Error types
#[derive(Debug, Error)]
pub enum Error {
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Business rule violation: {0}")]
    BusinessRule(String),
    
    #[error("Repository error: {0}")]
    Repository(Box<dyn std::error::Error + Send + Sync>),
    
    #[error("Audit log error: {0}")]
    AuditLog(Box<dyn std::error::Error + Send + Sync>),
}

ctx_error!(Error);
pub type Result<T, E = CtxError> = std::result::Result<T, E>;
```

#### 4. REST API Handler (`api/src/token_offering_handler.rs`)

```rust
use actix_web::{web, HttpResponse, Result};
use application::token_offering_service::{TokenOfferingService, CreateTokenOfferingRequest};
use serde_json::json;

pub async fn create_token_offering(
    service: web::Data<TokenOfferingService>,
    auth: AuthenticatedUser,
    request: web::Json<CreateTokenOfferingRequest>,
) -> Result<HttpResponse> {
    let result = service
        .create_offering(&auth.user_id, request.into_inner())
        .await;
    
    match result {
        Ok(offering) => Ok(HttpResponse::Created().json(&offering)),
        Err(e) => {
            let error_response = json!({
                "error": {
                    "code": error_code_from_error(&e),
                    "message": e.to_string(),
                    "request_id": request_id(),
                }
            });
            
            match e.downcast_ref::<application::Error>() {
                Some(application::Error::Validation(_)) => {
                    Ok(HttpResponse::BadRequest().json(&error_response))
                }
                Some(application::Error::BusinessRule(_)) => {
                    Ok(HttpResponse::UnprocessableEntity().json(&error_response))
                }
                _ => Ok(HttpResponse::InternalServerError().json(&error_response))
            }
        }
    }
}
```

### Frontend (TypeScript/React)

#### 1. Domain Types (`packages/interfaces/src/token-offering.ts`)

```typescript
// Branded types for type safety
export type TokenOfferingId = string & { readonly __brand: 'TokenOfferingId' };
export type UserId = string & { readonly __brand: 'UserId' };

export interface Money {
  amount: string; // Use string to maintain precision
  currency: string; // ISO 4217
}

export interface TokenOffering {
  id: TokenOfferingId;
  name: string;
  symbol: string;
  totalSupply: string;
  pricePerToken: Money;
  minInvestment: Money;
  maxInvestment: Money;
  startDate: string; // ISO 8601
  endDate: string;
  status: OfferingStatus;
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
}

export enum OfferingStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Active = 'Active',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
}

export interface CreateTokenOfferingRequest {
  name: string;
  symbol: string;
  totalSupply: string;
  pricePerToken: Money;
  minInvestment: Money;
  maxInvestment: Money;
  startDate: string;
  endDate: string;
}
```

#### 2. API Client (`packages/adapters/api-client/src/token-offering-service.ts`)

```typescript
import { Result, Ok, Err } from '@surus/core';
import { ApiError } from './errors';
import { TokenOffering, CreateTokenOfferingRequest, TokenOfferingId } from '@surus/interfaces';

export class TokenOfferingService {
  constructor(private apiClient: ApiClient) {}

  async create(
    request: CreateTokenOfferingRequest
  ): Promise<Result<TokenOffering, ApiError>> {
    try {
      const response = await this.apiClient.post<TokenOffering>(
        '/api/v1/token-offerings',
        request
      );
      
      return Ok(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        return Err(new ApiError(
          error.response?.data?.error?.message || 'Failed to create token offering',
          error.response?.status,
          { request, response: error.response?.data }
        ));
      }
      
      return Err(new ApiError(
        'Unexpected error creating token offering',
        undefined,
        { request, error: error.message }
      ));
    }
  }

  async getById(
    id: TokenOfferingId
  ): Promise<Result<TokenOffering, ApiError>> {
    try {
      const response = await this.apiClient.get<TokenOffering>(
        `/api/v1/token-offerings/${id}`
      );
      
      return Ok(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return Err(new ApiError('Token offering not found', 404));
      }
      
      return Err(new ApiError(
        'Failed to fetch token offering',
        isAxiosError(error) ? error.response?.status : undefined
      ));
    }
  }
}
```

#### 3. View Model Hook (`packages/app/src/hooks/use-token-offering-form.ts`)

```typescript
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useApiClient } from './use-api-client';
import { CreateTokenOfferingRequest } from '@surus/interfaces';
import { FormErrors, mapApiErrorToFormErrors } from '../utils/form-errors';

// Validation schema
const tokenOfferingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  symbol: z.string().min(1, 'Symbol is required').max(10),
  totalSupply: z.string().regex(/^\d+$/, 'Must be a positive integer'),
  pricePerToken: z.object({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
    currency: z.string().length(3, 'Must be 3-letter currency code'),
  }),
  minInvestment: z.object({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
    currency: z.string().length(3, 'Must be 3-letter currency code'),
  }),
  maxInvestment: z.object({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
    currency: z.string().length(3, 'Must be 3-letter currency code'),
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => parseFloat(data.minInvestment.amount) <= parseFloat(data.maxInvestment.amount),
  {
    message: 'Maximum investment must be greater than minimum investment',
    path: ['maxInvestment'],
  }
);

export const useTokenOfferingForm = () => {
  const apiClient = useApiClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<CreateTokenOfferingRequest>({
    name: '',
    symbol: '',
    totalSupply: '',
    pricePerToken: { amount: '', currency: 'USD' },
    minInvestment: { amount: '', currency: 'USD' },
    maxInvestment: { amount: '', currency: 'USD' },
    startDate: '',
    endDate: '',
  });

  const updateField = useCallback(<K extends keyof CreateTokenOfferingRequest>(
    field: K,
    value: CreateTokenOfferingRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user modifies it
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const result = tokenOfferingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach(error => {
        const path = error.path.join('.');
        fieldErrors[path] = error.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return { success: false as const, error: 'Validation failed' };
    }

    setIsSubmitting(true);
    try {
      const result = await apiClient.tokenOfferings.create(formData);
      
      if (!result.success) {
        const formErrors = mapApiErrorToFormErrors(result.error);
        setErrors(formErrors);
        return { success: false as const, error: result.error.message };
      }

      // Success - reset form
      setFormData({
        name: '',
        symbol: '',
        totalSupply: '',
        pricePerToken: { amount: '', currency: 'USD' },
        minInvestment: { amount: '', currency: 'USD' },
        maxInvestment: { amount: '', currency: 'USD' },
        startDate: '',
        endDate: '',
      });
      
      return { success: true as const, data: result.data };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, apiClient]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    validate,
  };
};
```

#### 4. React Component (`packages/app/src/components/TokenOfferingForm.tsx`)

```tsx
import React from 'react';
import { useTokenOfferingForm } from '../hooks/use-token-offering-form';
import { formatCurrency } from '../utils/format';
import { Alert } from '@surus/components';

export const TokenOfferingForm: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
  } = useTokenOfferingForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSubmit();
    
    if (result.success) {
      // Handle success - could navigate or show success message
      console.log('Token offering created:', result.data);
    }
  };

  return (
    <form onSubmit={onSubmit} className="token-offering-form">
      <div className="form-group">
        <label htmlFor="name">Offering Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          disabled={isSubmitting}
          className={errors.name ? 'error' : ''}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="error-message">
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="symbol">Token Symbol *</label>
        <input
          id="symbol"
          type="text"
          value={formData.symbol}
          onChange={(e) => updateField('symbol', e.target.value.toUpperCase())}
          disabled={isSubmitting}
          maxLength={10}
          className={errors.symbol ? 'error' : ''}
        />
        {errors.symbol && (
          <span className="error-message">{errors.symbol}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="totalSupply">Total Supply *</label>
        <input
          id="totalSupply"
          type="text"
          value={formData.totalSupply}
          onChange={(e) => updateField('totalSupply', e.target.value)}
          disabled={isSubmitting}
          placeholder="1000000"
          className={errors.totalSupply ? 'error' : ''}
        />
        {errors.totalSupply && (
          <span className="error-message">{errors.totalSupply}</span>
        )}
      </div>

      <fieldset>
        <legend>Investment Limits</legend>
        
        <div className="form-group">
          <label htmlFor="minAmount">Minimum Investment *</label>
          <input
            id="minAmount"
            type="text"
            value={formData.minInvestment.amount}
            onChange={(e) => updateField('minInvestment', {
              ...formData.minInvestment,
              amount: e.target.value,
            })}
            disabled={isSubmitting}
            placeholder="1000.00"
            className={errors['minInvestment.amount'] ? 'error' : ''}
          />
          {errors['minInvestment.amount'] && (
            <span className="error-message">
              {errors['minInvestment.amount']}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="maxAmount">Maximum Investment *</label>
          <input
            id="maxAmount"
            type="text"
            value={formData.maxInvestment.amount}
            onChange={(e) => updateField('maxInvestment', {
              ...formData.maxInvestment,
              amount: e.target.value,
            })}
            disabled={isSubmitting}
            placeholder="100000.00"
            className={errors['maxInvestment.amount'] ? 'error' : ''}
          />
          {errors['maxInvestment.amount'] && (
            <span className="error-message">
              {errors['maxInvestment.amount']}
            </span>
          )}
        </div>
      </fieldset>

      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Creating...' : 'Create Token Offering'}
        </button>
      </div>

      {errors._form && (
        <Alert type="error" className="mt-4">
          {errors._form}
        </Alert>
      )}
    </form>
  );
};
```

#### 5. Integration Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenOfferingForm } from '../TokenOfferingForm';
import { ApiClientProvider } from '../../providers/ApiClientProvider';
import { createMockApiClient } from '../../test-utils/mocks';
import { Ok, Err } from '@surus/core';
import { ApiError } from '@surus/adapters';

describe('TokenOfferingForm Integration', () => {
  it('should create token offering successfully', async () => {
    // Given
    const mockApiClient = createMockApiClient();
    const mockOffering = {
      id: 'offering_123' as TokenOfferingId,
      name: 'Test Token',
      symbol: 'TST',
      // ... other fields
    };
    
    mockApiClient.tokenOfferings.create.mockResolvedValue(Ok(mockOffering));
    
    const user = userEvent.setup();
    render(
      <ApiClientProvider client={mockApiClient}>
        <TokenOfferingForm />
      </ApiClientProvider>
    );
    
    // When
    await user.type(screen.getByLabelText(/offering name/i), 'Test Token');
    await user.type(screen.getByLabelText(/token symbol/i), 'TST');
    await user.type(screen.getByLabelText(/total supply/i), '1000000');
    await user.type(screen.getByLabelText(/minimum investment/i), '1000');
    await user.type(screen.getByLabelText(/maximum investment/i), '100000');
    
    await user.click(screen.getByRole('button', { name: /create token offering/i }));
    
    // Then
    await waitFor(() => {
      expect(mockApiClient.tokenOfferings.create).toHaveBeenCalledWith({
        name: 'Test Token',
        symbol: 'TST',
        totalSupply: '1000000',
        // ... other expected fields
      });
    });
  });

  it('should display validation errors', async () => {
    // Given
    const mockApiClient = createMockApiClient();
    const user = userEvent.setup();
    
    render(
      <ApiClientProvider client={mockApiClient}>
        <TokenOfferingForm />
      </ApiClientProvider>
    );
    
    // When - submit without filling required fields
    await user.click(screen.getByRole('button', { name: /create token offering/i }));
    
    // Then
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Symbol is required')).toBeInTheDocument();
    expect(mockApiClient.tokenOfferings.create).not.toHaveBeenCalled();
  });
});
```

## Common Patterns

### Error Handling Pattern

Always use Result types and handle all error cases:

```typescript
// Service layer
async function performOperation(): Promise<Result<Data, AppError>> {
  try {
    const data = await riskyOperation();
    return Ok(data);
  } catch (error) {
    logger.error('Operation failed', { error, context });
    return Err(new AppError('Operation failed', { cause: error }));
  }
}

// Component usage
const result = await performOperation();
if (!result.success) {
  handleError(result.error);
  return;
}
// Use result.data safely
```

### Audit Logging Pattern

Every state-changing operation must be logged:

```typescript
const auditLog = {
  action: 'RESOURCE_CREATED',
  userId: currentUser.id,
  resourceType: 'TokenOffering',
  resourceId: offering.id,
  metadata: {
    name: offering.name,
    // Only include non-sensitive data
  },
  timestamp: new Date().toISOString(),
  correlationId: context.correlationId,
};

await auditLogger.log(auditLog);
```

### Money Handling Pattern

Never use floating point for monetary values:

```typescript
// ❌ Wrong
const amount = 10.99; // JavaScript number loses precision

// ✅ Correct
const amount: Money = {
  amount: '10.99', // String maintains precision
  currency: 'USD'
};

// For calculations, use a library like decimal.js
import { Decimal } from 'decimal.js';
const total = new Decimal(amount.amount).mul(quantity).toString();
```

## Testing Patterns

### Unit Test Structure

```typescript
describe('TokenOfferingService', () => {
  describe('createOffering', () => {
    it('should create offering with valid data', async () => {
      // Given
      const mockRepo = createMockRepository();
      const service = new TokenOfferingService(mockRepo);
      const validRequest = createValidOfferingRequest();
      
      // When
      const result = await service.createOffering(userId, validRequest);
      
      // Then
      expect(result.success).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validRequest.name,
          status: OfferingStatus.Draft,
        })
      );
    });

    it('should reject offering with end date before start date', async () => {
      // Given
      const service = new TokenOfferingService(createMockRepository());
      const invalidRequest = {
        ...createValidOfferingRequest(),
        startDate: '2024-12-31T00:00:00Z',
        endDate: '2024-01-01T00:00:00Z',
      };
      
      // When
      const result = await service.createOffering(userId, invalidRequest);
      
      // Then
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('before end date');
    });
  });
});
```

## Quick Reference

### Checklist for New Features

- [ ] Define domain types with proper validation
- [ ] Create interface/trait for external dependencies
- [ ] Implement service with business logic
- [ ] Add comprehensive error handling
- [ ] Include audit logging for state changes
- [ ] Write unit tests with edge cases
- [ ] Create API endpoint with proper error responses
- [ ] Build React component following MVVM
- [ ] Add integration tests
- [ ] Document any new patterns

### Common Commands

```bash
# Backend (Rust)
cargo test --workspace
cargo clippy -- -D warnings
cargo fmt --check

# Frontend (TypeScript)
npm test
npm run lint
npm run type-check
npm run build
```

### File Naming Conventions

- Rust: `snake_case.rs`
- TypeScript: `kebab-case.ts`
- React Components: `PascalCase.tsx`
- Test files: `*.test.ts` or `*.test.tsx`

Remember: When in doubt, prioritize safety and auditability over performance or brevity.