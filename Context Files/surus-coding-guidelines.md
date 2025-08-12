# Surus Coding Guidelines

## Business Context

### Who We Are
Surus operates in the digital asset and traditional finance intersection as a regulated trust company. We provide:
- Traditional asset custody through bankruptcy-remote trust structures
- Reserve management for DAOs, stablecoins, and tokenized assets
- Private fund creation and management (both on-chain and off-chain)
- White-label stablecoin and security token issuance

### Why This Matters for Code
As a regulated financial institution handling client assets, our code must be:
- **Reliable**: Downtime or bugs can affect millions in client assets
- **Auditable**: Regulators and clients need to verify our operations
- **Secure**: We're a high-value target for attacks
- **Precise**: Financial calculations must be exact, no rounding errors
- **Compliant**: SOC 1/2 requirements influence our architecture

### Key Principles
1. **Client Assets Are Sacred**: Every line of code potentially affects client funds
2. **Trust Through Transparency**: Clear audit trails and verifiable operations
3. **Defense in Depth**: Multiple layers of validation and security
4. **Fail Safe, Not Silent**: Explicit error handling over assumptions

## Shared Principles

These principles apply across all Surus codebases, regardless of language or framework.

### 1. Error Handling Philosophy

**Explicit Over Implicit**
- Use Result/Either types to make errors part of the type system
- Never use exceptions for control flow
- Always provide context with errors
- Fail fast with clear error messages

**Error Hierarchy**
```
AppError
├── ValidationError (user input issues)
├── BusinessError (domain rule violations)
├── SystemError (infrastructure issues)
└── IntegrationError (external service issues)
```

### 2. Testing Standards

**Test Structure (Given-When-Then)**
- **Given**: Set up the test scenario
- **When**: Execute the action
- **Then**: Assert the expected outcome

**Coverage Expectations**
- Critical financial operations: 100% coverage
- Business logic: >90% coverage
- UI components: Behavior coverage over line coverage
- Integration points: Contract testing required

### 3. Security Fundamentals

**Input Validation**
- Validate at system boundaries
- Use type-safe parsing
- Sanitize all external inputs
- Never trust client-provided data

**Secrets Management**
- Never commit secrets
- Use environment variables or secret management services
- Clear sensitive data from memory when possible
- Audit access to sensitive operations

### 4. Code Review Standards

**Every PR Must Have:**
- Meaningful description of changes
- Test coverage for new functionality
- Documentation updates if applicable
- Security review for sensitive changes

**Review Focus Areas:**
- Business logic correctness
- Error handling completeness
- Security implications
- Performance impact on financial operations

### 5. Documentation Requirements

**Code Documentation**
- Public APIs must have documentation
- Complex business logic needs inline explanation
- Include examples for non-obvious usage
- Document error conditions and edge cases

**Architecture Decisions**
- Document significant design choices
- Explain trade-offs considered
- Link to relevant business requirements

### 6. Audit & Compliance

**Audit Logging**
- Every state change must be logged with who/what/when/where
- Use structured logging with correlation IDs
- Include sufficient context for investigation
- Ensure logs are tamper-evident

**Access Control**
- Implement role-based access control (RBAC)
- Follow principle of least privilege
- Log all permission checks and changes
- Implement time-based access where appropriate

## Rust Guidelines (Backend)

### Project Architecture

#### 1. Modular Workspace Structure
```
workspace/
├── {service_name}/           # Main application binary
├── application/              # Application layer logic
├── domain_types/             # Core domain types
├── {service}_interface/      # Trait definitions
├── *_adapter/               # External service adapters
├── shared_const/            # Shared constants
└── test_utils/              # Testing utilities
```

#### 2. Adapter Pattern for External Services
- Each external service has its own adapter crate
- Clean boundaries enable testing with fake adapters
- Examples: `fordefi_adapter`, `sumsub_adapter`

#### 3. Interface-First Design
```rust
/// Use impl Future instead of async fn in traits
pub trait ILedger {
    type Error: CoreError + Send + Sync + 'static;
    
    fn submit_transaction(&self, tx: Self::SignedTransaction) 
        -> impl Future<Output = Result<(), Self::Error>>;
}
```

### Error Handling

#### Hierarchical Error Design
```rust
#[derive(Debug, Error)]
#[non_exhaustive]
pub enum Error {
    #[error("Database configuration error: {0}")]
    DatabaseConfiguration(Box<dyn CoreError + Send + Sync>),
    
    #[error("Network error: {0}")]
    Network(#[from] NetworkError),
}

// Module-specific Result type
pub type Result<T, E = CtxError> = CoreResult<T, E>;
```

### Configuration Management

```rust
impl Configuration {
    pub fn read_from_env_variables() -> Result<Self> {
        let field1 = Self::parse_field1()?;
        let field2 = Self::parse_field2()?;
        
        Ok(Self { field1, field2 })
    }
}
```

**Environment Variable Pattern**: `{APP}_{COMPONENT}_{SETTING}`

### Code Quality & Linting

#### Safety-Critical Clippy Configuration
```toml
[lints.clippy]
pedantic = { level = "deny", priority = -1 }
float_cmp_const = "deny"
indexing_slicing = "deny"
arithmetic_side_effects = "deny"
unwrap_used = "deny"

[lints.rust]
unsafe_code = "deny"
missing_docs = "warn"
```

### Testing Patterns

```rust
#[test]
fn transfer_completes_successfully() {
    // Given
    let account = create_test_account();
    let amount = Money::from_cents(1000);
    
    // When
    let result = transfer_service.transfer(account, amount);
    
    // Then
    assert!(result.is_ok());
    assert_eq!(account.balance(), Money::from_cents(0));
}
```

## TypeScript/React/Node Guidelines (Frontend & Services)

### Project Architecture

#### 1. Modular Monorepo Structure
```
packages/
├── app/                 # Main React application
├── core/               # Core domain types and logic
├── interfaces/         # TypeScript interface definitions
├── components/         # Shared UI components
├── adapters/           # External service adapters
├── shared/             # Shared constants and utilities
└── test-utils/         # Testing utilities
```

#### 2. MVVM Architecture Pattern
```typescript
// View Component
export const TokenOfferingForm: React.FC = () => {
  const viewModel = useTokenOfferingViewModel();
  
  return (
    <form onSubmit={viewModel.handleSubmit}>
      <input 
        value={viewModel.formData.name}
        onChange={viewModel.handleNameChange}
      />
      {viewModel.errors.name && <ErrorMessage error={viewModel.errors.name} />}
    </form>
  );
};

// ViewModel Hook
export const useTokenOfferingViewModel = () => {
  const [formData, setFormData] = useState<TokenOfferingFormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const model = useTokenOfferingModel();
  
  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    const result = await model.createOffering(formData);
    if (!result.success) {
      setErrors(mapErrorToFormErrors(result.error));
    }
  }, [formData, model]);
  
  return { formData, errors, handleSubmit };
};
```

### Type Safety

#### Branded Types for Domain Concepts
```typescript
export type UserId = string & { readonly __brand: 'UserId' };
export type TokenOfferingId = string & { readonly __brand: 'TokenOfferingId' };

// Type guards with validation
export const createUserId = (value: string): UserId => {
  if (!/^user_[a-zA-Z0-9]+$/.test(value)) {
    throw new ValidationError('Invalid user ID format');
  }
  return value as UserId;
};
```

#### Result Type Pattern
```typescript
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ success: false, error });
```

### Error Handling

```typescript
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly category: ErrorCategory;
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ApiError extends AppError {
  readonly code = 'API_ERROR';
  readonly category = ErrorCategory.Network;
}
```

### Configuration Management

```typescript
const configSchema = z.object({
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().positive(),
  }),
  features: z.object({
    enableBetaFeatures: z.boolean(),
  }),
});

export class ConfigLoader {
  static load(): AppConfig {
    const rawConfig = {
      api: {
        baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
        timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
      },
      // ... other config
    };

    return configSchema.parse(rawConfig);
  }
}
```

### Testing Patterns

```typescript
describe('TokenOfferingForm', () => {
  it('should display validation error when name is empty', async () => {
    // Given
    const mockSubmit = jest.fn();
    render(<TokenOfferingForm onSubmit={mockSubmit} />);
    
    // When
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Then
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

### Code Quality

#### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "no-console": "warn"
  }
}
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Cross-Stack Considerations

### API Design Principles

1. **RESTful with Consistent Patterns**
   - Use standard HTTP methods appropriately
   - Consistent error response format
   - Version APIs when breaking changes are needed

2. **Shared Type Definitions**
   - Generate TypeScript types from Rust types where possible
   - Use JSON Schema for validation on both sides
   - Maintain a single source of truth for domain types

3. **Error Propagation**
   ```typescript
   // Frontend
   if (!apiResult.success) {
     return Err(new BusinessError(
       'Failed to create offering',
       { originalError: apiResult.error }
     ));
   }
   ```

   ```rust
   // Backend
   #[derive(Serialize)]
   struct ApiError {
       code: String,
       message: String,
       details: Option<Value>,
   }
   ```

### Security Across the Stack

1. **Authentication Flow**
   - JWT tokens with short expiration
   - Refresh token rotation
   - Secure token storage (httpOnly cookies)

2. **Input Validation**
   - Validate on frontend for UX
   - Always validate on backend for security
   - Use the same validation schemas where possible

3. **Audit Trail**
   - Correlation IDs across services
   - Structured logging format
   - Centralized log aggregation

## Implementation Checklist

When starting a new service or feature:

- [ ] Set up linting and formatting tools
- [ ] Configure error types and Result patterns
- [ ] Implement structured logging with correlation IDs
- [ ] Set up test infrastructure with utilities
- [ ] Create adapter interfaces for external dependencies
- [ ] Document API contracts and domain types
- [ ] Implement health checks and monitoring
- [ ] Set up CI/CD with security scanning
- [ ] Create runbook for operational procedures
- [ ] Implement proper secret management

## Evolution

These guidelines are a living document. As we encounter new patterns or requirements:

1. Discuss with the team
2. Test the approach in a non-critical project
3. Document the pattern with examples
4. Update these guidelines via PR

Remember: The goal is consistency and quality, not rigidity. When these guidelines don't fit, document why and propose alternatives.