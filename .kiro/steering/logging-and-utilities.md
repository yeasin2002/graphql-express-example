---
inclusion: always
---

# Logging & Utilities

## Logging with Winston

JobSphere uses Winston for structured logging with daily log rotation.

### Logger Configuration

Logger is configured in `src/lib/logger.ts` with:
- Console output (colorized for development)
- Daily rotating file logs
- Separate error logs
- HTTP request logs

### Log Levels

```typescript
{
  error: 0,   // Critical errors
  warn: 1,    // Warning messages
  info: 2,    // General information
  http: 3,    // HTTP requests
  debug: 4    // Debug information
}
```

### Using the Logger

Import from `@/lib`:

```typescript
import { logger } from "@/lib";

// Basic logging
logger.info("User created successfully");
logger.warn("Rate limit approaching");
logger.error("Database connection failed");
logger.debug("Processing request data");
logger.http("GET /api/users 200");
```

### Helper Functions

Use helper functions for common patterns:

```typescript
import { logError, logInfo, logWarn, logDebug } from "@/lib/logger";

// Log error with context
logError("Failed to create user", error, {
  userId: req.user?.userId,
  email: req.body.email
});

// Log info with metadata
logInfo("User logged in", {
  userId: user.id,
  ip: req.ip
});

// Log warning
logWarn("High memory usage detected", {
  usage: process.memoryUsage()
});

// Log debug info
logDebug("Processing payment", {
  amount: payment.amount,
  currency: payment.currency
});
```

### Error Logging Pattern

Always log errors before sending response:

```typescript
export const handler: RequestHandler = async (req, res) => {
  try {
    // Business logic
  } catch (error) {
    logger.error("Handler error", {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      route: req.originalUrl,
      method: req.method,
      userId: req.user?.userId
    });
    return sendInternalError(res, "Failed to process request");
  }
};
```

### Log Files

Logs are stored in the `logs/` directory:
- `error-YYYY-MM-DD.log` - Error logs (14 days retention)
- `combined-YYYY-MM-DD.log` - All logs (14 days retention)
- `http-YYYY-MM-DD.log` - HTTP requests (7 days retention)

### Log Rotation

- Max file size: 20MB
- Rotation: Daily
- Retention: 7-14 days depending on log type

## HTTP Request Logging with Morgan

Morgan is configured for HTTP request logging in `src/lib/morgan.ts`.

### Morgan Format

Custom format includes:
- HTTP method
- URL
- Status code
- Response time
- Content length
- User agent

### Usage

Morgan is applied globally in `src/app.ts`:

```typescript
import { morganDevFormat } from "./lib/morgan";

app.use(morgan(morganDevFormat));
```

All HTTP requests are automatically logged to console and `http-*.log` files.

## File Upload with Multer

Multer is configured in `src/lib/multer.ts` for handling file uploads.

### Configuration

- Storage: Local disk (`uploads/` directory)
- File naming: `{originalname}-{timestamp}-{random}.{ext}`
- Max file size: 5MB
- Allowed types: Images only (JPEG, PNG, GIF, WebP, SVG)

### Usage

```typescript
import { upload } from "@/lib/multer";

// Single file upload
router.post("/upload", upload.single("file"), handler);

// Multiple files upload
router.post("/upload-multiple", upload.array("files", 5), handler);

// Multiple fields
router.post("/upload-fields", upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 5 }
]), handler);
```

### Handler Example

```typescript
import { getFileUrl } from "@/lib/multer";

export const uploadFile: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return sendBadRequest(res, "No file uploaded");
    }

    const fileUrl = getFileUrl(req.file.filename);
    
    return sendSuccess(res, 200, "File uploaded successfully", {
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    return sendInternalError(res, "Failed to upload file");
  }
};
```

### File Deletion

```typescript
import { deleteFile } from "@/lib/multer";

// Delete uploaded file
await deleteFile(filename);
```

### File URL Helper

```typescript
import { getFileUrl } from "@/lib/multer";

const url = getFileUrl("avatar-1234567890.jpg");
// Returns: "/uploads/avatar-1234567890.jpg"
```

## JWT Utilities

JWT utilities are in `src/lib/jwt.ts`.

### Token Generation

```typescript
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const payload = {
  userId: user.id,
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
  // Use decoded.userId, decoded.email, decoded.role
} catch (error) {
  // Token invalid or expired
}
```

### Password Hashing

```typescript
import { hashPassword, comparePassword } from "@/lib/jwt";

// Hash password
const hashedPassword = await hashPassword(plainPassword);

// Verify password
const isValid = await comparePassword(plainPassword, hashedPassword);
```

### Token/ID Hashing

For hashing tokens or IDs (e.g., refresh token JTI):

```typescript
import { hashToken, compareHash } from "@/lib/jwt";

// Hash token
const hashedToken = await hashToken(tokenOrId);

// Verify token
const isValid = await compareHash(tokenOrId, hashedToken);
```

### OTP Generation

```typescript
import { generateOTP } from "@/lib/jwt";

const otp = generateOTP(); // Returns 4-digit string: "1234"
```

## Database Error Handling

MongoDB/Mongoose error handler in `src/helpers/mongodb-error-handler.ts`.

### Exception Handler

```typescript
import { exceptionErrorHandler } from "@/helpers";

export const createUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.create(req.body);
    return sendCreated(res, "User created", user);
  } catch (error) {
    return exceptionErrorHandler(error, res, "Failed to create user");
  }
};
```

Automatically handles:
- **CastError**: Invalid ObjectId format
- **ValidationError**: Mongoose validation failures
- **Duplicate Key (E11000)**: Unique constraint violations

### ObjectId Validation

```typescript
import { validateObjectIds } from "@/helpers";

const ids = ["507f1f77bcf86cd799439011", "invalid-id"];
const { isValid, invalidIds } = validateObjectIds(ids);

if (!isValid) {
  return sendBadRequest(res, `Invalid IDs: ${invalidIds.join(", ")}`);
}
```

## Environment Variables

Access environment variables via `process.env`:

```typescript
const port = process.env.PORT || 4000;
const dbUrl = process.env.DATABASE_URL;
const accessSecret = process.env.ACCESS_SECRET;
```

### Required Variables

See `.env.example` for all required variables:
- `DATABASE_URL` - Database connection string
- `PORT` - Server port
- `API_BASE_URL` - API base URL
- `CORS_ORIGIN` - Allowed CORS origins
- `ACCESS_SECRET` - JWT access token secret
- `REFRESH_SECRET` - JWT refresh token secret

## IP Address Utility

Get local IP address for development:

```typescript
import { getLocalIP } from "@/lib/get-my-ip";

const localIP = getLocalIP();
console.log(`Server running on http://${localIP}:${port}`);
```

## Best Practices

### Logging
1. **Log all errors**: Always log errors with context before sending response
2. **Use appropriate levels**: info for success, warn for issues, error for failures
3. **Include context**: Add relevant metadata (userId, route, params)
4. **Avoid sensitive data**: Don't log passwords, tokens, or PII
5. **Structured logging**: Use objects for metadata, not string concatenation

### File Upload
1. **Validate file types**: Only allow expected file types
2. **Limit file size**: Prevent large uploads (current: 5MB)
3. **Sanitize filenames**: Use generated filenames, not user input
4. **Store securely**: Use proper permissions on upload directory
5. **Clean up**: Delete files when no longer needed

### Error Handling
1. **Use error handlers**: Use `exceptionErrorHandler` for database errors
2. **Log before responding**: Always log errors before sending response
3. **Don't expose internals**: Send generic messages to clients
4. **Include context**: Log full error details for debugging
5. **Handle all cases**: Catch all possible error types

### Security
1. **Hash passwords**: Always use bcrypt for password hashing
2. **Validate tokens**: Verify JWT tokens on protected routes
3. **Sanitize input**: Validate all user input with Zod
4. **Use HTTPS**: Enforce secure connections in production
5. **Rate limiting**: Implement rate limiting (to be added)
