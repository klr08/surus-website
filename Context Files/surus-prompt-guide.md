# Surus AI Agent Prompt Engineering Guide

This guide helps humans write effective prompts for AI coding agents to ensure high-quality, compliant code that follows Surus standards.

## How This Guide Works With Context Documents

This prompt guide is specifically designed to work hand-in-hand with your context documents:

**The Context Docs provide the "what":**
- Coding standards and patterns
- Domain terminology  
- API conventions
- Technical decisions
- Quick-start examples

**This Prompt Guide provides the "how":**
- How to reference those standards in prompts
- How to ask for compliance with your patterns
- How to ensure the agent uses your conventions
- How to request proper audit logging, error handling, etc.

For example, when this guide says "Follow our Rust coding guidelines," it's referring to the detailed patterns in your coding guidelines document. When it mentions audit requirements, it's invoking the standards detailed in your guidelines and API conventions.

This creates a complete system where:
1. **Humans** write clear prompts using this guide
2. **Agents** receive those prompts + your context documents
3. **Output** follows Surus standards consistently

The prompt guide essentially teaches humans how to "activate" all the knowledge in your context docs effectively. It's like having both a comprehensive manual (context docs) and instructions on how to use that manual (this guide).

## Initial Setup: How to Configure Your AI Agent

If you're starting from scratch, here's exactly how to set up an AI coding agent with Surus context:

### Step 1: Gather the Documentation Files

You'll need these 7 documents (usually provided as .md files):
1. `coding-guidelines.md` - Core coding standards
2. `quick-start-examples.md` - Complete code examples
3. `domain-glossary.md` - Business and technical terms
4. `api-conventions.md` - API design standards
5. `technical-decisions.md` - Architecture rationale
6. `gotchas-lessons-learned.md` - Common pitfalls
7. `quick-reference.md` - One-page cheat sheet

### Step 2: Attach Documents to System Prompt

**For Claude (via API or Claude.ai):**
- Attach all 7 documents to the conversation
- Or paste them into the system prompt if using API

**For ChatGPT:**
- Upload all files using the attachment feature
- Or include in the system/custom instructions

### Step 3: Use This System Prompt Introduction

Start every new conversation with:

```
You have access to Surus's complete development documentation attached to this conversation. Surus is a regulated financial technology company that handles traditional asset custody and tokenization.

The documentation includes:
- Coding guidelines for Rust (backend) and TypeScript/React (frontend)
- Quick-start examples showing our patterns in practice
- Domain glossary explaining financial and technical terms
- API conventions for RESTful services
- Technical decisions explaining our architecture choices
- Gotchas document with real-world lessons learned
- Quick reference card with critical rules

For this session, I'll be asking you to [write new code/review existing code/debug issues/create documentation] following these standards.

Please always:
1. Follow the coding patterns shown in the documentation
2. Use Result types for error handling (never exceptions)
3. Include comprehensive error handling and audit logging
4. Write tests for all new code
5. Ensure financial calculations use Decimal types (never floating point)
6. Add security validations for all user inputs

Let me know when you're ready for the specific task.
```

### Step 4: Provide Your Specific Task

After the setup, provide your task following the patterns in this guide. For example:

```
Context: Working on the token-offering-service in Rust
Task: [Your specific task]
Requirements: [Specific constraints]
...
```

### Tips for First-Time Users

1. **Start Simple**: Try a small task first to see how the agent responds with the context
2. **Check Understanding**: Ask "What Surus coding patterns will you follow for this task?" 
3. **Iterate**: If output isn't quite right, reference specific sections: "Please review the error handling section in coding-guidelines.md and revise"
4. **Save Your Setup**: Keep the system prompt and file list handy for future sessions

### Common Setup Mistakes to Avoid

❌ **Don't** provide documents piecemeal - load all at once for consistency  
❌ **Don't** forget to mention Surus is a financial company - it affects code decisions  
❌ **Don't** skip the system prompt - it frames the agent's approach  
✅ **Do** verify the agent acknowledged the documentation  
✅ **Do** reference specific documents when clarifying requirements

## Core Principles

1. **Context First**: Always provide relevant context documents
2. **Be Specific**: Vague requests lead to inconsistent results
3. **Include Constraints**: Specify security, performance, and compliance requirements
4. **Request Verification**: Ask agents to explain their approach
5. **Iterate**: Complex tasks benefit from step-by-step refinement

## Prompt Structure Template

```
Context: [Which system/service/component]
Task: [What needs to be done]
Requirements: [Specific constraints]
Standards: [Reference relevant guidelines]
Output: [Expected deliverables]
Verification: [How to validate success]
```

## Example Prompts

### Good Example: Feature Implementation

```
Context: Working on the token-offering-service in Rust, which handles creation and management of security token offerings.

Task: Implement an endpoint to update token offering status from DRAFT to PENDING_APPROVAL.

Requirements:
- Only the offering creator can initiate this transition
- Validate all required fields are present before allowing transition
- Create audit log entry for the status change
- Send notification to compliance team

Standards: Follow our Rust coding guidelines, use Result types for error handling, and implement proper authorization checks.

Output: 
1. Update to the domain model if needed
2. Service method with business logic
3. API endpoint handler
4. Unit and integration tests
5. Any necessary migrations

Verification: Explain how your implementation ensures only valid state transitions and maintains audit compliance.
```

### Good Example: Bug Fix

```
Context: Users report that large token offerings (>1M tokens) show incorrect values in the UI.

Task: Debug and fix the precision issue in the token offering display.

Requirements:
- Maintain exact precision for all monetary calculations
- Fix must work for both new and existing offerings
- No breaking changes to API

Standards: Follow TypeScript guidelines, use string representation for numbers per our Money type pattern.

Output:
1. Root cause analysis
2. Fix implementation
3. Tests demonstrating the issue and fix
4. Any data migration needed for existing data

Verification: Show examples of values that were broken before and fixed after.
```

### Poor Example (Too Vague)

❌ "Add validation to the token offering form"

**Why it's poor**: 
- No context about which validations
- No specifics about business rules
- No mention of error handling
- No test requirements

### Poor Example (Missing Constraints)

❌ "Create a service to handle transfers between accounts"

**Why it's poor**:
- No mention of security requirements
- No audit/compliance considerations
- No performance requirements
- No error scenarios

## Specific Scenarios

### 1. New Feature Development

```
I need to implement [FEATURE NAME] for [SERVICE/COMPONENT].

Business Context:
- Who will use this feature
- What business problem it solves
- Any regulatory requirements

Technical Requirements:
- Performance expectations (response time, throughput)
- Security requirements (authentication, authorization)
- Integration points with other services

Please follow our [Rust/TypeScript] guidelines and include:
1. Domain model updates
2. Service implementation with full error handling
3. API endpoint with proper validation
4. Comprehensive tests
5. Audit logging for all state changes

Before implementing, please outline your approach and identify any potential issues.
```

### 2. Security-Sensitive Operations

```
Implement [OPERATION] that handles [SENSITIVE DATA TYPE].

Security Requirements:
- Data must be encrypted at rest
- All access must be logged
- Implement rate limiting
- Use principle of least privilege

Compliance Requirements:
- SOC 2 audit trail
- Data retention per policy
- PII handling per guidelines

Include security test cases and document any assumptions about the threat model.
```

### 3. Performance Optimization

```
Optimize [OPERATION/ENDPOINT] which currently [DESCRIBE PERFORMANCE ISSUE].

Current Metrics:
- [Current performance numbers]
- [Resource usage]

Target Metrics:
- [Desired performance]
- [Acceptable resource usage]

Constraints:
- Must maintain data consistency
- Cannot break existing API contracts
- Must handle [expected load]

Please provide:
1. Analysis of current bottlenecks
2. Proposed optimization with trade-offs
3. Benchmark tests showing improvement
4. Plan for gradual rollout
```

### 4. Refactoring Legacy Code

```
Refactor [MODULE/SERVICE] to follow current Surus patterns.

Current Issues:
- [List specific problems]
- [Technical debt items]

Goals:
- Implement proper error handling with Result types
- Add comprehensive tests
- Extract business logic from handlers
- Add proper audit logging

Constraints:
- Maintain backward compatibility
- No downtime during migration
- Preserve all existing functionality

Please create a phased refactoring plan with incremental steps.
```

## Prompt Patterns

### The Verification Pattern

Always end complex prompts with:
```
Before implementing:
1. Summarize your understanding of the requirements
2. Identify any ambiguities or risks
3. Propose your implementation approach
4. List any assumptions you're making
```

### The Test-First Pattern

For new features:
```
Start by writing tests that demonstrate:
1. Happy path scenarios
2. Error cases
3. Edge cases
4. Security scenarios

Then implement the code to make these tests pass.
```

### The Documentation Pattern

For public APIs or complex logic:
```
Include:
1. Purpose and use cases
2. Example usage
3. Error scenarios
4. Performance characteristics
5. Security considerations
```

## Domain-Specific Prompts

### Financial Operations

```
When implementing financial calculations:
- Use Decimal types, never floating point
- Include tests with known edge cases (max values, rounding)
- Document precision requirements
- Show currency handling
```

### Audit and Compliance

```
For any state-changing operation:
- Include who, what, when, where in audit logs
- Add correlation IDs for tracing
- Document retention requirements
- Show compliance with SOC 2
```

### API Development

```
When creating new endpoints:
- Follow RESTful conventions per our API guide
- Include OpenAPI documentation
- Add rate limiting considerations
- Show example requests/responses
```

## Multi-Step Complex Tasks

For large features, break into steps:

### Step 1: Design Review
```
Please review this feature design and identify:
1. Security considerations
2. Performance implications
3. Integration challenges
4. Missing requirements
```

### Step 2: Implementation Plan
```
Create a detailed implementation plan with:
1. Order of components to build
2. Integration points
3. Testing strategy
4. Rollout plan
```

### Step 3: Core Implementation
```
Implement the core business logic with:
1. Full error handling
2. Unit tests
3. Documentation
```

### Step 4: Integration
```
Add API endpoints and integrate with:
1. Authentication/authorization
2. Audit logging
3. Monitoring
4. Other services
```

## Code Review Prompts

When asking for code review:

```
Please review this code for:
1. Compliance with Surus coding standards
2. Security vulnerabilities
3. Performance issues
4. Missing error cases
5. Test coverage gaps

Context: [What the code does and why]
Specific concerns: [Any areas you're unsure about]
```

## Debugging Prompts

```
I'm seeing [DESCRIBE ISSUE] in [SYSTEM/COMPONENT].

Symptoms:
- [What you observe]
- [Error messages]
- [When it occurs]

What I've tried:
- [Debugging steps taken]
- [Hypotheses tested]

Please help:
1. Identify potential root causes
2. Suggest debugging approaches
3. Recommend fixes with tests
```

## Anti-Patterns to Avoid

### 1. The "Just Make It Work" Prompt
❌ "Fix the token offering bug"
✅ Provide specific symptoms, context, and requirements

### 2. The "Figure It Out" Prompt  
❌ "Implement user management"
✅ Specify authentication method, permissions model, compliance needs

### 3. The "Ignore Standards" Prompt
❌ "Quick and dirty solution for X"
✅ Always reference coding standards and explain time constraints

### 4. The "No Context" Prompt
❌ "Write a function to process payments"
✅ Include service context, integration points, and business rules

## Prompt Checklists

### Before Submitting a Prompt

- [ ] Have I provided business context?
- [ ] Are success criteria clear?
- [ ] Did I reference relevant coding standards?
- [ ] Are security/compliance requirements specified?
- [ ] Did I ask for tests?
- [ ] Is the expected output format clear?

### For Production Code

- [ ] Audit logging requirements specified?
- [ ] Error handling expectations clear?
- [ ] Performance requirements stated?
- [ ] Integration points identified?
- [ ] Rollback plan considered?

## Getting Better Results

1. **Provide Examples**: Show similar code or patterns from your codebase
2. **Set Boundaries**: Clearly state what NOT to do
3. **Request Reasoning**: Ask agents to explain their choices
4. **Iterate**: Build complex features incrementally
5. **Verify Understanding**: Ask agents to summarize before implementing

## Templates for Common Tasks

### New Microservice
```
Create a new microservice for [PURPOSE] that:
- Follows our standard project structure
- Implements health checks
- Includes Docker configuration
- Has CI/CD pipeline setup
- Implements structured logging
- Includes comprehensive tests
```

### Database Migration
```
Create a migration to [DESCRIBE CHANGE]:
- Include rollback procedure
- Handle existing data
- Maintain referential integrity
- Document performance impact
- Test with production-like data volume
```

### Integration with External Service
```
Integrate with [SERVICE] API:
- Implement adapter pattern per our guidelines
- Include retry logic with exponential backoff
- Add circuit breaker for resilience
- Mock service for testing
- Document rate limits and quotas
```

Remember: The quality of AI output directly correlates with the quality of your prompts. Take time to craft clear, specific requests that reference our standards and include all necessary context.