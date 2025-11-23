---
inclusion: always
---

# Authentication & Authorization

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

## Authentication Middleware

### `requireAuth`
Verifies JWT access token and adds user data to `req.user`.

```typescript
import { requireAuth } from "@/middleware";

router.get("/profile", requireAuth, handler);
```

Adds to request:
```typescript
req.user = {
  userId: string;
  email: string;
  role: "customer" | "contractor" | "admin";
};
```

### `requireRole`
Checks if user has specific role (must be used after `requireAuth`).

```typescript
import { requireAuth, requireRole } from "@/middleware";

// Customer only
router.post("/jobs", requireAuth, requireRole("customer"), handler);

// Contractor only
router.get("/earnings", requireAuth, requireRole("contractor"), handler);

// Admin only
router.get("/analytics", requireAuth, requireRole("admin"), handler);
```

### `requireAnyRole`
Checks if user has any of the specified roles.

```typescript
import { requireAuth, requireAnyRole } from "@/middleware";

router.get("/dashboard", 
  requireAuth, 
  requireAnyRole(["customer", "contractor"]), 
  handler
);
```

### `requireOwnership`
Ensures user can only access their own resources.

```typescript
import { requireAuth, requireOwnership } from "@/middleware";

// User can only access their own profile
router.get("/users/:id", requireAuth, requireOwnership("id"), handler);
```

### `optionalAuth`
Adds user data if token is present but doesn't require authentication.

```typescript
import { optionalAuth } from "@/middleware";

// Public route with optional user context
router.get("/jobs", optionalAuth, handler);
```

## Authentication Flows

### Registration
```typescript
POST /api/auth/register
Body: { email, password, name, role, phone }

Process:
1. Validate input
2. Check if email exists
3. Hash password with bcrypt
4. Create user document
5. Return success message
```

### Login
```typescript
POST /api/auth/login
Body: { email, password }

Process:
1. Validate credentials
2. Check user status
3. Generate access token
4. Generate refresh token
5. Store refresh token in database
6. Return tokens + user data

Response: {
  accessToken: string,
  refreshToken: string,
  user: { id, email, name, role }
}
```

### Refresh Token
```typescript
POST /api/auth/refresh
Body: { refreshToken }

Process:
1. Verify refresh token
2. Check token exists in database
3. Generate new access token
4. Generate new refresh token (rotation)
5. Invalidate old refresh token
6. Return new tokens

Response: {
  accessToken: string,
  refreshToken: string
}
```

### Forgot Password
```typescript
POST /api/auth/forgot-password
Body: { email }

Process:
1. Verify email exists
2. Generate 4-digit OTP
3. Store OTP with expiration (10-15 minutes)
4. Send OTP via email
5. Return success message
```

### Reset Password
```typescript
POST /api/auth/reset-password
Body: { email, otp, newPassword }

Process:
1. Verify OTP validity and expiration
2. Hash new password
3. Update user password
4. Invalidate OTP
5. Return success message
```

### Get Current User
```typescript
GET /api/auth/me
Headers: { Authorization: "Bearer <accessToken>" }

Process:
1. Verify access token
2. Fetch user data
3. Return user profile
```

### Logout
```typescript
POST /api/auth/logout
Body: { refreshToken }

Process:
1. Invalidate refresh token in database
2. Return success message
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

## Common Auth Patterns

### Protected Route
```typescript
router.get("/protected", requireAuth, handler);
```

### Role-Specific Route
```typescript
router.post("/admin-only", requireAuth, requireRole("admin"), handler);
```

### Owner or Admin Access
```typescript
router.put("/users/:id", requireAuth, requireOwnership("id"), handler);
// Admin can access any user due to role check in requireOwnership
```

### Public with Optional Auth
```typescript
router.get("/public", optionalAuth, (req, res) => {
  if (req.user) {
    // Authenticated user
  } else {
    // Anonymous user
  }
});
```
