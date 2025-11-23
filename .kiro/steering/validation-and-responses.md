---
inclusion: always
---

# Validation & Response Handling

## Request Validation with Zod

JobSphere uses Zod for runtime type validation with OpenAPI integration.

### Schema Definition

Always extend Zod with OpenAPI support:

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UserSchema = z
  .object({
    name: z.string().min(1).openapi({
      description: "User's full name",
      example: "John Doe",
    }),
    email: z.string().email().openapi({
      description: "User's email address",
      example: "john@example.com",
    }),
    age: z.number().int().min(18).openapi({
      description: "User's age (must be 18+)",
      example: 25,
    }),
  })
  .openapi("User");

export type User = z.infer<typeof UserSchema>;
```

### Validation Middleware

Use validation middleware from `@/middleware`:

#### Validate Request Body

```typescript
import { validateBody } from "@/middleware";
import { CreateUserSchema } from "./user.validation";

router.post("/users", validateBody(CreateUserSchema), handler);
```

#### Validate Request Params

```typescript
import { validateParams } from "@/middleware";

const ParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

router.get("/users/:id", validateParams(ParamsSchema), handler);
```

#### Validate Request Query

```typescript
import { validateQuery } from "@/middleware";

const QuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)),
});

router.get("/users", validateQuery(QuerySchema), handler);
```

#### Validate Multiple Parts

```typescript
import { validate } from "@/middleware";

router.put(
  "/users/:id",
  validate({
    params: ParamsSchema,
    body: UpdateUserSchema,
    query: QuerySchema,
  }),
  handler
);
```

### Validation Error Response

Validation errors return standardized format:

```json
{
  "success": false,
  "status": 400,
  "message": "name and email is required",
  "data": null,
  "errors": [
    {
      "field": "name",
      "message": "Required"
    },
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

## Response Handling

### Standard Response Structure

All API responses follow this structure:

```typescript
interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T | null;
  success: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}
```

### Response Helper Functions

Import from `@/helpers`:

```typescript
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendInternalError,
} from "@/helpers";
```

#### Success Response (200)

```typescript
return sendSuccess(res, 200, "Users retrieved successfully", users);

// Response:
{
  "status": 200,
  "message": "Users retrieved successfully",
  "data": [...],
  "success": true
}
```

#### Created Response (201)

```typescript
return sendCreated(res, "User created successfully", newUser);

// Response:
{
  "status": 201,
  "message": "User created successfully",
  "data": {...},
  "success": true
}
```

#### Bad Request (400)

```typescript
return sendBadRequest(res, "Invalid input data");

// With validation errors:
return sendBadRequest(res, "Validation failed", [
  { path: "email", message: "Email already exists" },
]);
```

#### Unauthorized (401)

```typescript
return sendUnauthorized(res, "Invalid credentials");
```

#### Forbidden (403)

```typescript
return sendForbidden(res, "Admin access required");
```

#### Not Found (404)

```typescript
return sendNotFound(res, "User not found");
```

#### Internal Server Error (500)

```typescript
return sendInternalError(res, "Failed to process request");
```

### Response Handler Class

Alternative chaining API:

```typescript
import { createResponseHandler } from "@/helpers";

export const handler: RequestHandler = async (req, res) => {
  const response = createResponseHandler(res);

  try {
    const data = await fetchData();
    return response.success(200, "Success", data);
  } catch (error) {
    return response.internalError("Failed to fetch data");
  }
};
```

## Service Handler Pattern

All service handlers follow this pattern:

```typescript
import type { RequestHandler } from "express";
import { sendSuccess, sendInternalError, sendNotFound } from "@/helpers";

export const getUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Business logic
    const user = await User.findById(id);

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    return sendSuccess(res, 200, "User retrieved successfully", user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendInternalError(res, "Failed to fetch user");
  }
};
```

## Error Handling

### Database Error Handling

Use MongoDB error handler for database operations:

```typescript
import { exceptionErrorHandler } from "@/helpers";

export const createUser: RequestHandler = async (req, res) => {
  try {
    const user = await User.create(req.body);
    return sendCreated(res, "User created successfully", user);
  } catch (error) {
    return exceptionErrorHandler(error, res, "Failed to create user");
  }
};
```

The error handler automatically handles:

- **CastError**: Invalid ObjectId format
- **ValidationError**: Mongoose validation errors
- **Duplicate Key Error (E11000)**: Unique constraint violations

### Global Error Handler

All unhandled errors are caught by the global error handler in `src/middleware/common/global-error-handler.ts`.

Errors are logged with full context:

- Status code
- Route and method
- Request body, params, query
- IP address and user agent
- Stack trace

## Common Validation Patterns

### Email Validation

```typescript
email: z.string().email().openapi({ description: "Email address" });
```

### Password Validation

```typescript
password: z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .openapi({ description: "Password" });
```

### MongoDB ObjectId Validation

```typescript
id: z.string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
  .openapi({ description: "MongoDB ObjectId" });
```

### Enum Validation

```typescript
role: z.enum(["customer", "contractor", "admin"]).openapi({
  description: "User role",
});
```

### Optional Fields

```typescript
bio: z.string().optional().openapi({ description: "User biography" });
```

### Array Validation

```typescript
tags: z.array(z.string())
  .min(1)
  .max(10)
  .openapi({ description: "Tags (1-10 items)" });
```

### Nested Object Validation

```typescript
address: z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
}).openapi({ description: "Address" });
```

### Transform and Refine

```typescript
// Transform string to number
page: z.string().transform(Number).pipe(z.number().int().min(1));

// Custom validation
password: z.string().refine((val) => val.length >= 8, {
  message: "Password too short",
});
```

## Best Practices

1. **Always validate input**: Use Zod schemas for all request data
2. **Consistent responses**: Use response helpers for all endpoints
3. **Meaningful messages**: Provide clear, actionable error messages
4. **Log errors**: Always log errors before sending response
5. **Type safety**: Use `z.infer<typeof Schema>` for TypeScript types
6. **OpenAPI integration**: Add `.openapi()` to all schemas for documentation
7. **Error context**: Include relevant context in error logs
8. **Avoid exposing internals**: Don't leak implementation details in errors
