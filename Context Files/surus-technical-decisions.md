# Surus Technical Decisions Record

This document captures key technical decisions and their rationale. Understanding the "why" helps maintain consistency and avoid repeating past mistakes.

## Architecture Decisions

### 1. Rust for Backend Services

**Decision**: Use Rust for all backend financial services

**Rationale**:
- **Memory safety**: Prevents entire classes of bugs critical in financial systems
- **Performance**: Zero-cost abstractions ideal for high-throughput operations
- **Correctness**: Strong type system catches errors at compile time
- **No garbage collection**: Predictable latency for financial operations

**Trade-offs**:
- Steeper learning curve
- Longer initial development time
- Smaller talent pool

### 2. Result Types Over Exceptions

**Decision**: Use Result<T, E> pattern in Rust and TypeScript

**Rationale**:
- **Explicit error handling**: Can't accidentally ignore errors
- **Type safety**: Errors are part of function signatures
- **Composability**: Chain operations with clear error propagation
- **Audit trail**: Every error point is visible and loggable

**Example**:
```rust
// Rust
fn transfer_funds(from: AccountId, to: AccountId, amount: Money) -> Result<Transfer, TransferError>

// TypeScript
function transferFunds(from: AccountId, to: AccountId, amount: Money): Promise<Result<Transfer, TransferError>>
```

### 3. MVVM Architecture Pattern

**Decision**: Use Model-View-ViewModel for UI applications

**Rationale**:
- **Separation of concerns**: Business logic separate from UI
- **Testability**: ViewModels can be tested without UI
- **Reusability**: ViewModels can work with different Views
- **Compliance**: Clear audit trail of user actions

**Implementation**:
- View: React components (presentation only)
- ViewModel: Custom hooks (state and logic)
- Model: Service classes (business operations)

### 4. Microservices with Clear Boundaries

**Decision**: Service-oriented architecture with domain boundaries

**Rationale**:
- **Regulatory isolation**: Different compliance requirements per service
- **Team autonomy**: Teams own specific services
- **Scalability**: Scale services independently
- **Risk isolation**: Failures don't cascade

**Service boundaries**:
- Authentication Service
- Token Offering Service
- Custody Service
- Audit Service
- Notification Service

## Technology Choices

### 1. PostgreSQL for Primary Storage

**Decision**: PostgreSQL as primary database

**Rationale**:
- **ACID compliance**: Critical for financial data
- **JSON support**: Flexible schema for evolving requirements
- **Proven reliability**: Battle-tested in financial systems
- **Rich features**: CTEs, window functions, full-text search

**Not chosen**:
- NoSQL: Lack of ACID guarantees
- MySQL: Weaker data integrity features
- NewSQL: Not proven in our use cases

### 2. React for Frontend

**Decision**: React with TypeScript for all web UIs

**Rationale**:
- **Component model**: Reusable UI components
- **Ecosystem**: Rich library ecosystem
- **Performance**: Virtual DOM and React 18 features
- **Type safety**: With TypeScript integration

**Not chosen**:
- Angular: Too opinionated for our needs
- Vue: Smaller ecosystem
- Vanilla JS: Lack of structure for large apps

### 3. JWT for Authentication

**Decision**: JWT tokens with short expiration

**Rationale**:
- **Stateless**: Scales horizontally
- **Standard**: Wide library support
- **Flexible**: Can embed permissions
- **Audit**: Each token has clear identity

**Implementation details**:
- 15-minute access tokens
- Refresh token rotation
- RS256 signing algorithm

### 4. Kubernetes for Container Orchestration

**Decision**: Kubernetes for production deployments

**Rationale**:
- **Auto-scaling**: Handle varying loads
- **Self-healing**: Automatic recovery
- **Rolling updates**: Zero-downtime deployments
- **Secrets management**: Integrated secure config

## Data Management Decisions

### 1. Event Sourcing for Audit Trail

**Decision**: Store all state changes as events

**Rationale**:
- **Complete audit trail**: Every change is recorded
- **Time travel**: Can reconstruct state at any point
- **Compliance**: Meets regulatory requirements
- **Debugging**: Can replay events to find issues

**Implementation**:
```rust
pub struct Event {
    pub id: Uuid,
    pub aggregate_id: Uuid,
    pub event_type: String,
    pub event_data: Value,
    pub metadata: EventMetadata,
    pub created_at: DateTime<Utc>,
}
```

### 2. Decimal Types for Money

**Decision**: Never use floating point for monetary values

**Rationale**:
- **Precision**: No rounding errors
- **Compliance**: Regulatory requirement
- **Consistency**: Same behavior across systems

**Implementation**:
- Rust: `rust_decimal::Decimal`
- TypeScript: Strings parsed by `decimal.js`
- Database: `NUMERIC` type

### 3. UUID for Public Identifiers

**Decision**: Use UUIDs for all public resource identifiers

**Rationale**:
- **No information leakage**: Can't guess other IDs
- **Distributed generation**: No central ID service
- **Merge-friendly**: No conflicts in distributed systems

**Format**: Prefixed UUIDs for clarity
```
user_550e8400-e29b-41d4-a716-446655440000
token_6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

## Security Decisions

### 1. Zero Trust Network Architecture

**Decision**: Assume no network is secure

**Rationale**:
- **Defense in depth**: Multiple security layers
- **Compliance**: Meets SOC 2 requirements
- **Cloud-native**: Works in any environment

**Implementation**:
- mTLS between services
- Service mesh (Istio)
- Network policies
- Encrypted data at rest

### 2. Principle of Least Privilege

**Decision**: Minimal permissions by default

**Rationale**:
- **Security**: Limits blast radius
- **Compliance**: Regulatory requirement
- **Audit**: Clear permission trails

**Implementation**:
- RBAC for users
- Service accounts for systems
- Time-limited elevated permissions

### 3. Structured Logging

**Decision**: JSON structured logs with correlation IDs

**Rationale**:
- **Searchability**: Easy to query
- **Correlation**: Track requests across services
- **Compliance**: Standardized audit format

**Format**:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "correlation_id": "corr_123",
  "service": "token-offering",
  "user_id": "user_456",
  "action": "CREATE_OFFERING",
  "metadata": {...}
}
```

## Performance Decisions

### 1. Read Replicas for Queries

**Decision**: Separate read and write databases

**Rationale**:
- **Scalability**: Scale reads independently
- **Performance**: Optimize for different workloads
- **Availability**: Reads continue if primary fails

**Implementation**:
- Primary for writes
- Multiple read replicas
- Eventually consistent reads OK for most queries

### 2. Caching Strategy

**Decision**: Multi-layer caching approach

**Rationale**:
- **Performance**: Reduce database load
- **Cost**: Fewer database queries
- **User experience**: Faster responses

**Layers**:
1. CDN: Static assets
2. Redis: Session data, hot data
3. Application: Computed values
4. Database: Query result cache

### 3. Async Processing for Heavy Operations

**Decision**: Queue-based async processing

**Rationale**:
- **Responsiveness**: Fast API responses
- **Reliability**: Retry failed operations
- **Scalability**: Process at sustainable rate

**Implementation**:
- RabbitMQ for job queue
- Separate worker processes
- Exponential backoff for retries

## Development Process Decisions

### 1. Monorepo Structure

**Decision**: Single repository for related services

**Rationale**:
- **Atomic changes**: Update multiple services together
- **Code sharing**: Common libraries
- **Consistency**: Same tooling everywhere

**Structure**:
```
/
├── packages/          # Frontend packages
├── services/          # Backend services
├── libraries/         # Shared code
└── infrastructure/    # Deployment configs
```

### 2. Infrastructure as Code

**Decision**: All infrastructure in version control

**Rationale**:
- **Reproducibility**: Identical environments
- **Audit trail**: Track infrastructure changes
- **Disaster recovery**: Rebuild from scratch

**Tools**:
- Terraform for cloud resources
- Helm for Kubernetes deployments
- Ansible for configuration

### 3. Continuous Deployment

**Decision**: Automated deployments on main branch

**Rationale**:
- **Speed**: Fast iteration
- **Consistency**: Same process every time
- **Safety**: Automated checks catch issues

**Pipeline**:
1. Run tests
2. Security scan
3. Build artifacts
4. Deploy to staging
5. Run integration tests
6. Deploy to production
7. Monitor metrics

## Anti-Patterns to Avoid

### 1. Shared Mutable State

**Why it's bad**: Race conditions, hard to reason about
**Instead**: Use message passing or immutable data

### 2. Anemic Domain Models

**Why it's bad**: Logic scattered across services
**Instead**: Rich domain models with behavior

### 3. God Objects/Services

**Why it's bad**: Hard to test, maintain, understand
**Instead**: Single responsibility principle

### 4. Premature Optimization

**Why it's bad**: Complex code without proven need
**Instead**: Measure first, optimize what matters

### 5. Not Handling Errors

**Why it's bad**: Crashes, data corruption, poor UX
**Instead**: Explicit error handling everywhere

## Library and Tool Restrictions

### License Restrictions

**Not Allowed**:
- GPL (GNU General Public License)
- AGPL (Affero GPL)
- Other viral/copyleft licenses

**Allowed**:
- MIT
- Apache 2.0
- BSD
- ISC

**Rationale**: Avoid license obligations that could affect our proprietary code

### Approved Core Libraries

**Rust**:
- `tokio`: Async runtime
- `serde`: Serialization
- `sqlx`: Database access
- `tracing`: Logging
- `thiserror`: Error handling

**TypeScript**:
- `react`: UI framework
- `zod`: Schema validation
- `decimal.js`: Precise decimals
- `date-fns`: Date manipulation

## Future Considerations

### Being Evaluated

1. **GraphQL**: For flexible client queries
2. **WebAssembly**: For compute-heavy frontend operations
3. **Blockchain Integration**: For on-chain operations

### Decided Against (For Now)

1. **Microservices per entity**: Too much operational overhead
2. **Blockchain as primary storage**: Regulatory uncertainty
3. **Serverless functions**: Cold start latency issues

## Decision Process

When making new technical decisions:

1. **Document the problem**: What are we solving?
2. **List options**: What are the alternatives?
3. **Evaluate trade-offs**: Pros and cons of each
4. **Make decision**: Choose based on our principles
5. **Set review date**: When to revisit

Remember: These decisions are guidelines, not rules. Document deviations and learn from outcomes.