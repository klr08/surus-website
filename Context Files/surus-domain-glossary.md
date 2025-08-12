# Surus Domain Glossary

This glossary defines key terms used throughout Surus's codebase. Understanding these terms is essential for implementing features correctly.

## Financial Terms

### Asset Custody
The safekeeping and administration of financial assets on behalf of clients. In Surus's context, this refers to traditional assets (not digital/crypto assets) held in trust structures.

### Bankruptcy Remote
A legal structure designed to isolate assets from the bankruptcy risk of the operating company. Surus uses bankruptcy-remote trusts to ensure client assets are protected even if Surus itself faces financial difficulties.

### Reserve Management
The administration and investment of funds that back financial instruments. Examples include:
- Assets backing stablecoins
- Treasury funds for DAOs
- Collateral for tokenized assets

### RWA (Real World Assets)
Physical or traditional financial assets that are represented on-chain through tokenization. Examples:
- Real estate
- Commodities
- Securities
- Treasury bills

### Stablecoin
A cryptocurrency designed to maintain a stable value relative to a reference asset (usually USD). Surus can issue white-label stablecoins backed by reserves they manage.

### White-Label Service
A service produced by Surus but branded and sold by another company. Surus provides the infrastructure and regulatory compliance while clients provide the branding.

## Trust and Legal Terms

### Grantor Trust
A trust where the grantor (creator) retains certain powers or interests. Surus uses North Carolina Grantor Trusts for asset custody.

### Delaware Statutory Trust (DST)
A legally recognized trust created under Delaware law, often used for its flexibility and favorable legal framework. Used by Surus for certain custody arrangements.

### Qualified Custodian
An entity authorized by regulatory bodies to hold customer assets. Must meet specific regulatory requirements for safeguarding client assets.

### Trust Company
A financial institution chartered to act as a trustee, fiduciary, or agent. Surus Trust Company is a North Carolina-chartered trust company.

### Off Balance Sheet
Assets or liabilities not appearing on a company's balance sheet. Surus's custody structures are off balance sheet, meaning client assets don't appear as Surus assets.

## Digital Asset Terms

### DAO (Decentralized Autonomous Organization)
An organization governed by smart contracts and token holders rather than traditional management structures. Surus provides reserve management for DAO treasuries.

### Token Offering
The process of issuing new tokens to investors. Can be:
- **Security tokens**: Tokens that represent ownership in an asset or company
- **Utility tokens**: Tokens that provide access to a service or platform

### KYC (Know Your Customer)
Regulatory requirement to verify the identity of clients. Critical for compliance in financial services.

### AML (Anti-Money Laundering)
Regulations and procedures designed to prevent money laundering. Includes transaction monitoring and suspicious activity reporting.

## Technical Terms

### Adapter Pattern
A design pattern used to allow incompatible interfaces to work together. In Surus code, adapters wrap external services (like KYC providers) to provide a consistent interface.

### MVVM (Model-View-ViewModel)
Architectural pattern separating:
- **Model**: Business logic and data
- **View**: UI presentation
- **ViewModel**: Manages view state and coordinates between Model and View

### Result Type
A type that explicitly represents either success (Ok) or failure (Err). Used throughout Surus code for explicit error handling.

### Branded Type
A TypeScript pattern using nominal typing to create distinct types for semantically different values:
```typescript
type UserId = string & { readonly __brand: 'UserId' };
type AccountId = string & { readonly __brand: 'AccountId' };
```

### Correlation ID
A unique identifier that tracks a request across multiple services and log entries. Essential for debugging distributed systems.

## Compliance Terms

### SOC 1/2 (Service Organization Control)
- **SOC 1**: Report on controls relevant to financial reporting
- **SOC 2**: Report on controls relevant to security, availability, processing integrity, confidentiality, and privacy

### Audit Trail
A chronological record of system activities that enables reconstruction and examination of events. Required for regulatory compliance.

### RBAC (Role-Based Access Control)
Access control method that restricts system access based on user roles. Essential for implementing principle of least privilege.

## Business Operations Terms

### MRR (Monthly Recurring Revenue)
Predictable revenue received every month. Key metric for SaaS and service businesses.

### AUM (Assets Under Management)
Total market value of assets that Surus manages on behalf of clients. Key metric for trust and custody businesses.

### Originator
In Surus context, a party that creates or issues financial instruments (like tokens or securities) using Surus's platform.

### Protocol
In blockchain context, refers to the rules and standards governing a blockchain network. Example: "Protocol Labs" is a client, but "the Ethereum protocol" refers to Ethereum's technical standards.

## Development Terms

### Idempotent
An operation that produces the same result whether executed once or multiple times. Critical for financial operations to prevent double-processing.

### Transactional
Operations that either complete entirely or fail entirely, with no partial state. Database transactions ensure consistency.

### Event Sourcing
Storing all changes as a sequence of events rather than just current state. Useful for audit trails and system recovery.

### Circuit Breaker
A pattern that prevents cascading failures by stopping requests to a failing service. Important for system resilience.

## Code-Specific Terms

### ctx_error
Surus-specific error handling macro that adds context to errors. Used throughout Rust code for better error diagnostics.

### Money Type
A specific type used to represent monetary values with precision. Never use floating-point for money:
```rust
pub struct Money {
    pub amount: Decimal, // Maintains precision
    pub currency: String, // ISO 4217 code
}
```

### Feature Flag
A toggle that enables/disables functionality without deploying new code. Used for gradual rollouts and A/B testing.

## Common Acronyms

- **API**: Application Programming Interface
- **CI/CD**: Continuous Integration/Continuous Deployment
- **DTO**: Data Transfer Object
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **TLS**: Transport Layer Security
- **UUID**: Universally Unique Identifier
- **UTC**: Coordinated Universal Time (always use for timestamps)

## Important Notes

1. **Precision Matters**: When dealing with financial amounts, always use appropriate types (Decimal in Rust, string in TypeScript) to maintain precision.

2. **Regulatory Context**: Many terms have specific legal meanings. When in doubt, consider the regulatory implications.

3. **Audit Everything**: Any term related to client assets or financial operations implies audit logging requirements.

4. **Security First**: Terms related to authentication, authorization, or cryptography require careful implementation with security reviews.