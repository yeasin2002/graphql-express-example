---
inclusion: always
---

# Authentication & Authorization

## Overview

JobSphere uses **GraphQL** for API communication with JWT-based authentication and refresh token rotation.

## JWT Token System

JobSphere uses JWT with access and refresh token rotation for secure authentication.

### Token Configuration

```typescript
// Access Token
- Lifetime: 15 days (development), 15 minutes (production recommended)
- Secret: process.env.ACCESS_SECRET
- Contains: userId, email, role

// Refresh Token
- Lifetime: 30 days
- Secret: process.env.REFRESH_SECRET
- Contains: userId, email, role, jti (unique token ID)
- Rotated on each use
- Stored in user document's refreshTokens array
```

### Token Generation

```typescript
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const payload = {
  userId: user._id.toString(),
  email: user.email,
  role: user.role
};

const accessToken = signAccessToken(payload);
const { token: refreshToken, jti } = signRefreshToken(payload);
```

### Token Verification

```typescript
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";

try {
  const decoded = verifyAccessToken(token);
  // decoded contains: userId, email, role
} catch (error) {
  // Token invalid or expired
}
```

## GraphQL Context Authentication

### Context Setup

Authentication is handled in GraphQL context, not middleware:

```typescript
import { verifyAccessToken } from "@/lib/jwt";

interface GraphQLContext {
  user?: {
    userId: string;
    email: string;
    role: "customer" | "contractor" | "admin";
  };
}

// Context function
export const createContext = async ({ req }): Promise<GraphQLContext> => {
  const authHeader = req.headers.authorization;
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyAccessToken(token);
      return {
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      };
    } catch (error) {
      // Token invalid, return empty context
      return {};
    }
  }
  
  return {};
};
```

### Resolver Authentication Guards

Create guard functions for resolvers:

```typescript
// Check if user is authenticated
export function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError("Unauthorized - Authentication required", {
      extensions: { code: "UNAUTHENTICATED" }
    });
  }
  return context.user;
}

// Check if user has specific role
export function requireRole(context: GraphQLContext, role: "customer" | "contractor" | "admin") {
  const user = requireAuth(context);
  if (user.role !== role) {
    throw new GraphQLError(`Forbidden - ${role} access required`, {
      extensions: { code: "FORBIDDEN" }
    });
  }
  return user;
}

// Check if user has any of the specified roles
export function requireAnyRole(context: GraphQLContext, roles: Array<"customer" | "contractor" | "admin">) {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new GraphQLError("Forbidden - Insufficient permissions", {
      extensions: { code: "FORBIDDEN" }
    });
  }
  return user;
}

// Check if user is accessing their own resource
export function requireOwnership(context: GraphQLContext, resourceUserId: string) {
  const user = requireAuth(context);
  if (user.userId !== resourceUserId && user.role !== "admin") {
    throw new GraphQLError("Forbidden - You can only access your own resources", {
      extensions: { code: "FORBIDDEN" }
    });
  }
  return user;
}
```

### Using Guards in Resolvers

```typescript
// Protected resolver - any authenticated user
const getProfile = async (_parent, _args, context: GraphQLContext) => {
  const user = requireAuth(context);
  return await User.findById(user.userId);
};

// Role-specific resolver - customer only
const createJob = async (_parent, args, context: GraphQLContext) => {
  const user = requireRole(context, "customer");
  return await Job.create({ ...args.input, customerId: user.userId });
};

// Multiple roles allowed
const getDashboard = async (_parent, _args, context: GraphQLContext) => {
  const user = requireAnyRole(context, ["customer", "contractor"]);
  return await fetchDashboardData(user.userId, user.role);
};

// Ownership check
const updateUser = async (_parent, args, context: GraphQLContext) => {
  const user = requireOwnership(context, args.id);
  return await User.findByIdAndUpdate(args.id, args.input);
};

// Optional authentication
const getJobs = async (_parent, _args, context: GraphQLContext) => {
  // context.user may or may not exist
  if (context.user) {
    // Return personalized results
    return await Job.find({ customerId: context.user.userId });
  }
  // Return public results
  return await Job.find({ status: "public" });
};
```

## GraphQL Authentication Mutations & Queries

### Registration

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    success
    message
  }
}

# Input
{
  "input": {
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe",
    "role": "CUSTOMER",
    "phone": "+1234567890"
  }
}

# Process:
# 1. Validate input data
# 2. Check if email exists
# 3. Hash password with bcrypt
# 4. Create user document
# 5. Send verification email (optional)
# 6. Return success message
```

### Login

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}

# Input
{
  "input": {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
}

# Process:
# 1. Validate credentials
# 2. Check user status (isSuspend)
# 3. Generate access token
# 4. Generate refresh token with JTI
# 5. Store refresh token in user document
# 6. Return tokens + user data
```

### Refresh Token

```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
  }
}

# Input
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Process:
# 1. Verify refresh token validity
# 2. Check token exists in user's refreshTokens array
# 3. Generate new access token
# 4. Generate new refresh token (rotation)
# 5. Remove old refresh token from array
# 6. Store new refresh token
# 7. Return new tokens
```

### Forgot Password

```graphql
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email) {
    success
    message
  }
}

# Input
{
  "email": "user@example.com"
}

# Process:
# 1. Verify email exists
# 2. Generate 4-digit OTP
# 3. Store OTP in user document with expiration (10-15 minutes)
# 4. Send OTP via email
# 5. Return success message
```

### Verify OTP

```graphql
mutation VerifyOTP($input: VerifyOTPInput!) {
  verifyOTP(input: $input) {
    success
    message
  }
}

# Input
{
  "input": {
    "email": "user@example.com",
    "otp": "1234"
  }
}

# Process:
# 1. Verify OTP validity and expiration
# 2. Mark OTP as verified
# 3. Return success message
```

### Reset Password

```graphql
mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    success
    message
  }
}

# Input
{
  "input": {
    "email": "user@example.com",
    "otp": "1234",
    "newPassword": "NewSecurePass123"
  }
}

# Process:
# 1. Verify OTP validity and expiration
# 2. Hash new password
# 3. Update user password
# 4. Invalidate OTP
# 5. Return success message
```

### Get Current User (Me)

```graphql
query Me {
  me {
    id
    email
    name
    role
    phone
    createdAt
  }
}

# Headers
{
  "Authorization": "Bearer <accessToken>"
}

# Process:
# 1. Verify access token (in context)
# 2. Fetch user data using context.user.userId
# 3. Return user profile without sensitive fields
```

### Logout

```graphql
mutation Logout($refreshToken: String!) {
  logout(refreshToken: $refreshToken) {
    success
    message
  }
}

# Input
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Process:
# 1. Remove refresh token from user's refreshTokens array
# 2. Return success message
```

## Password Security

```typescript
import { hashPassword, comparePassword } from "@/lib/jwt";

// Hash password (bcrypt with 10 salt rounds)
const hashedPassword = await hashPassword(plainPassword);

// Verify password
const isValid = await comparePassword(plainPassword, hashedPassword);
```

## OTP Generation

```typescript
import { generateOTP } from "@/lib/jwt";

// Generates 4-digit OTP
const otp = generateOTP(); // e.g., "1234"
```

## Security Best Practices

1. **Token Storage**: Send tokens in JSON response (for mobile app)
2. **Password Hashing**: Use bcrypt with 10 salt rounds
3. **Token Secrets**: Store in environment variables
4. **Token Expiration**: Short-lived access tokens, longer refresh tokens
5. **Token Rotation**: Rotate refresh tokens on each use
6. **HTTPS Only**: Enforce secure connections in production
7. **Rate Limiting**: Implement on auth endpoints (to be added)
8. **Input Validation**: Use Zod schemas for all auth inputs

## Express Request Type Extension

The `req.user` property is globally typed:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: "customer" | "contractor" | "admin";
      };
    }
  }
}
```

## GraphQL Type Definitions

### Auth Types

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  phone: String
  isSuspend: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  CUSTOMER
  CONTRACTOR
  ADMIN
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

type TokenPayload {
  accessToken: String!
  refreshToken: String!
}

type SuccessResponse {
  success: Boolean!
  message: String!
}

input RegisterInput {
  email: String!
  password: String!
  name: String!
  role: UserRole!
  phone: String
}

input LoginInput {
  email: String!
  password: String!
}

input VerifyOTPInput {
  email: String!
  otp: String!
}

input ResetPasswordInput {
  email: String!
  otp: String!
  newPassword: String!
}

type Query {
  me: User!
}

type Mutation {
  register(input: RegisterInput!): SuccessResponse!
  login(input: LoginInput!): AuthPayload!
  refreshToken(refreshToken: String!): TokenPayload!
  forgotPassword(email: String!): SuccessResponse!
  verifyOTP(input: VerifyOTPInput!): SuccessResponse!
  resetPassword(input: ResetPasswordInput!): SuccessResponse!
  logout(refreshToken: String!): SuccessResponse!
}
```

## Common GraphQL Auth Patterns

### Protected Query
```typescript
const getProfile = async (_parent, _args, context: GraphQLContext) => {
  const user = requireAuth(context);
  return await User.findById(user.userId);
};
```

### Role-Specific Mutation
```typescript
const adminAction = async (_parent, args, context: GraphQLContext) => {
  const user = requireRole(context, "admin");
  // Admin-only logic
};
```

### Owner or Admin Access
```typescript
const updateUser = async (_parent, args, context: GraphQLContext) => {
  const user = requireOwnership(context, args.id);
  // User can update their own profile, or admin can update any
  return await User.findByIdAndUpdate(args.id, args.input);
};
```

### Public with Optional Auth
```typescript
const getJobs = async (_parent, _args, context: GraphQLContext) => {
  if (context.user) {
    // Return personalized results for authenticated user
    return await Job.find({ customerId: context.user.userId });
  }
  // Return public results for anonymous user
  return await Job.find({ status: "public" });
};
```

## GraphQL Error Handling

Use GraphQL errors for authentication failures:

```typescript
import { GraphQLError } from "graphql";

// Unauthenticated
throw new GraphQLError("Unauthorized - Authentication required", {
  extensions: { code: "UNAUTHENTICATED" }
});

// Forbidden
throw new GraphQLError("Forbidden - Insufficient permissions", {
  extensions: { code: "FORBIDDEN" }
});

// Invalid credentials
throw new GraphQLError("Invalid email or password", {
  extensions: { code: "BAD_USER_INPUT" }
});

// Token expired
throw new GraphQLError("Token expired", {
  extensions: { code: "UNAUTHENTICATED" }
});
```
