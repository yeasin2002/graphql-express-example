---
inclusion: always
---

# Code Quality & Standards

## Code Formatting

### Biome Formatter

JobSphere uses Biome for code formatting (configured in `biome.json`).

#### Configuration
- **Indent**: Tabs
- **Quote Style**: Double quotes
- **Line Width**: Default (80 characters)
- **Organize Imports**: Automatic on save

#### Usage

```bash
# Format all files
pnpm format

# Format specific files
pnpm biome format --write ./src/api/user
```

#### Auto-formatting
Biome is configured to organize imports automatically with the assist feature enabled.

## Linting

### Oxlint

Fast Rust-based linter for catching common issues.

#### Usage

```bash
# Run linter
pnpm check

# Lint specific files
oxlint src/api/user
```

#### Configuration

Configured in `.oxlintrc.json` with comprehensive rules.

### Biome Linter

Biome also provides linting capabilities.

#### Rules
- **Recommended rules**: Enabled by default
- **Complexity rules**: `noBannedTypes` disabled
- **Suspicious rules**: `noExplicitAny` set to info level

#### Inline Disabling

When necessary, disable rules inline:

```typescript
// oxlint-disable-next-line no-unused-vars
const _unused = value;

// biome-ignore lint/suspicious/noExplicitAny: Legacy code
const data: any = legacyFunction();
```

## Type Checking

### TypeScript Configuration

Strict TypeScript configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

#### Type Checking

```bash
# Check types
pnpm check-types

# Watch mode
tsc -b --watch
```

### Type Safety Best Practices

1. **Avoid `any`**: Use specific types or `unknown`
2. **Use type inference**: Let TypeScript infer types when obvious
3. **Define interfaces**: Create interfaces for complex objects
4. **Use generics**: Make reusable type-safe functions
5. **Strict null checks**: Handle null/undefined explicitly

#### Examples

```typescript
// Good: Specific types
interface User {
  id: string;
  email: string;
  role: "customer" | "contractor" | "admin";
}

// Good: Type inference
const users = await User.find(); // Type inferred from model

// Good: Generic function
function findById<T>(id: string): Promise<T | null> {
  // Implementation
}

// Avoid: any type
const data: any = await fetchData(); // Bad

// Better: unknown with type guard
const data: unknown = await fetchData();
if (isUser(data)) {
  // data is now typed as User
}
```

## Git Hooks

### Husky Configuration

Pre-commit hooks are configured with Husky in `.husky/pre-commit`.

#### Pre-commit Hook

Runs automatically before each commit:
1. Lints staged files with oxlint
2. Prevents commit if linting fails

#### Configuration

Configured in `package.json`:

```json
{
  "lint-staged": {
    "**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,astro,svelte}": "oxlint"
  }
}
```

#### Bypass Hook (Not Recommended)

```bash
git commit --no-verify -m "message"
```

## Code Style Guidelines

### Naming Conventions

#### Variables and Functions
```typescript
// camelCase for variables and functions
const userName = "John";
const getUserById = (id: string) => {};
```

#### Types and Interfaces
```typescript
// PascalCase for types and interfaces
interface UserProfile {}
type UserRole = "customer" | "contractor";
```

#### Constants
```typescript
// UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_BASE_URL = process.env.API_BASE_URL;
```

#### Files and Directories
```typescript
// kebab-case for files
user-profile.route.ts
user-profile.validation.ts

// camelCase for TypeScript files
userProfile.ts
```

### Import Organization

Organize imports in this order:

```typescript
// 1. External dependencies
import express from "express";
import { z } from "zod";

// 2. Internal modules with @ alias
import { sendSuccess } from "@/helpers";
import { requireAuth } from "@/middleware";
import { logger } from "@/lib";

// 3. Relative imports
import { UserSchema } from "./user.validation";
import * as service from "./services";

// 4. Type imports (separate)
import type { RequestHandler } from "express";
import type { User } from "./user.validation";
```

### Function Structure

#### Service Handlers

```typescript
import type { RequestHandler } from "express";
import { sendSuccess, sendInternalError } from "@/helpers";
import { logger } from "@/lib";

export const getUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation
    if (!id) {
      return sendBadRequest(res, "User ID is required");
    }
    
    // Business logic
    const user = await User.findById(id);
    
    // Not found check
    if (!user) {
      return sendNotFound(res, "User not found");
    }
    
    // Success response
    return sendSuccess(res, 200, "User retrieved successfully", user);
  } catch (error) {
    // Error logging
    logger.error("Failed to get user", {
      error,
      userId: id,
      route: req.originalUrl
    });
    
    // Error response
    return sendInternalError(res, "Failed to retrieve user");
  }
};
```

### Comments

#### When to Comment

1. **Complex logic**: Explain non-obvious algorithms
2. **Business rules**: Document business requirements
3. **Workarounds**: Explain temporary solutions
4. **TODOs**: Mark incomplete features

#### Comment Style

```typescript
// Good: Explains why
// Using bcrypt with 10 rounds for optimal security/performance balance
const hashedPassword = await hashPassword(password);

// Good: Documents business rule
// Contractors must be 18+ per platform policy
if (age < 18 && role === "contractor") {
  return sendBadRequest(res, "Contractors must be 18 or older");
}

// Avoid: States the obvious
// Set the user name
user.name = name;
```

### Error Handling

#### Consistent Pattern

```typescript
export const handler: RequestHandler = async (req, res) => {
  try {
    // Business logic
    const result = await performOperation();
    return sendSuccess(res, 200, "Success", result);
  } catch (error) {
    // Log with context
    logger.error("Operation failed", {
      error,
      context: { /* relevant data */ }
    });
    
    // Return appropriate error
    return sendInternalError(res, "Operation failed");
  }
};
```

#### Database Errors

```typescript
import { exceptionErrorHandler } from "@/helpers";

try {
  const user = await User.create(data);
  return sendCreated(res, "User created", user);
} catch (error) {
  // Handles CastError, ValidationError, Duplicate Key
  return exceptionErrorHandler(error, res, "Failed to create user");
}
```

## Testing Standards

### Test Structure (To Be Implemented)

```typescript
describe("User Service", () => {
  describe("createUser", () => {
    it("should create user with valid data", async () => {
      // Arrange
      const userData = { name: "John", email: "john@example.com" };
      
      // Act
      const result = await createUser(userData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });
    
    it("should reject duplicate email", async () => {
      // Test implementation
    });
  });
});
```

## Documentation Standards

### Code Documentation

#### Function Documentation

```typescript
/**
 * Create a new user account
 * @param userData - User registration data
 * @returns Created user object
 * @throws {ValidationError} If user data is invalid
 * @throws {DuplicateError} If email already exists
 */
export async function createUser(userData: CreateUserInput): Promise<User> {
  // Implementation
}
```

#### Complex Logic

```typescript
/**
 * Calculate contractor payout after platform commission
 * Platform takes 10% commission from each transaction
 * Minimum payout is $10 to cover transaction fees
 */
function calculatePayout(amount: number): number {
  const commission = amount * 0.10;
  const payout = amount - commission;
  return payout >= 10 ? payout : 0;
}
```

### API Documentation

Always document endpoints in OpenAPI files:

```typescript
registry.registerPath({
  method: "post",
  path: "/api/users",
  summary: "Create a new user",
  description: "Register a new user account with email and password",
  tags: ["Users"],
  // ... rest of documentation
});
```

## Performance Best Practices

### Database Queries

```typescript
// Good: Select only needed fields
const users = await User.find().select("name email role");

// Good: Use lean for read-only data
const users = await User.find().lean();

// Good: Use indexes for frequent queries
// Define in schema: { email: { type: String, index: true } }

// Avoid: Fetching all fields when not needed
const users = await User.find(); // Returns all fields
```

### Async/Await

```typescript
// Good: Parallel execution
const [users, jobs] = await Promise.all([
  User.find(),
  Job.find()
]);

// Avoid: Sequential when not needed
const users = await User.find();
const jobs = await Job.find(); // Waits for users
```

## Security Best Practices

### Input Validation

```typescript
// Always validate with Zod
import { validateBody } from "@/middleware";

router.post("/users", validateBody(CreateUserSchema), handler);
```

### Password Handling

```typescript
// Never log passwords
logger.info("User created", { 
  email: user.email 
  // password: user.password // NEVER DO THIS
});

// Always hash passwords
const hashedPassword = await hashPassword(password);
```

### Token Handling

```typescript
// Never expose tokens in logs
logger.info("User logged in", {
  userId: user.id
  // token: accessToken // NEVER DO THIS
});
```

## Best Practices Summary

1. **Format code**: Use Biome formatter before committing
2. **Type everything**: Avoid `any`, use specific types
3. **Validate input**: Use Zod schemas for all user input
4. **Handle errors**: Log errors with context, return safe messages
5. **Document code**: Add comments for complex logic and business rules
6. **Test thoroughly**: Write tests for critical functionality
7. **Follow patterns**: Use established patterns from existing code
8. **Review changes**: Check diffs before committing
9. **Keep it simple**: Write clear, maintainable code
10. **Security first**: Validate, sanitize, and protect sensitive data
