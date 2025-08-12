# Surus Development Documentation

## Start Here

This documentation helps AI coding agents understand Surus's codebase and deliver high-quality code. Read documents in order of relevance to your task.

### Core Documents

1. **[Coding Guidelines](./coding-guidelines.md)** - **READ FIRST**
   - Core principles, patterns, and standards
   - Language-specific guidelines (Rust backend, TypeScript/React frontend)
   - Security and compliance requirements

2. **[Quick Start Examples](./quick-start-examples.md)** - **READ SECOND**
   - Complete token offering example with frontend and backend
   - Demonstrates all key patterns in practice
   - Copy-paste starting points for common tasks

3. **[Domain Glossary](./domain-glossary.md)** - Reference when you see unfamiliar terms
   - Financial and crypto terminology
   - Surus-specific concepts
   - Regulatory terms

4. **[API Conventions](./api-conventions.md)** - When building or consuming APIs
   - RESTful patterns
   - Request/response formats
   - Error handling standards

5. **[Technical Decisions](./technical-decisions.md)** - For understanding "why"
   - Architecture choices and rationale
   - Approved libraries and tools
   - Patterns to avoid

### How to Use This Documentation

- **For new features**: Start with Guidelines → Quick Start → API Conventions
- **For bug fixes**: Review Guidelines → Check Technical Decisions for context
- **For frontend work**: Focus on TypeScript sections of Guidelines → Quick Start React example
- **For backend work**: Focus on Rust sections of Guidelines → Quick Start Rust example

### Important Notes

- These are internal documents - do not share outside Surus
- When in doubt, prioritize security and auditability
- Financial calculations must be exact - never use floating point for money
- All code handling client assets requires 100% test coverage

### Getting Help

If something is unclear or missing from these docs, note it in your PR description so we can improve the documentation.