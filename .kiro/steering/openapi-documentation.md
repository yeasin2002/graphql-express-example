---
inclusion: always
---

# OpenAPI Documentation

## Overview

JobSphere uses `@asteasolutions/zod-to-openapi` to generate OpenAPI 3.0 documentation from Zod schemas.

## Documentation Access

- **Swagger UI**: `http://localhost:4000/swagger`
- **Scalar UI**: `http://localhost:4000/scaler` (modern, dark theme)
- **JSON Spec**: `http://localhost:4000/api-docs.json`

## OpenAPI Registry

The global registry is defined in `src/lib/openapi.ts`:

```typescript
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();
```

## Module Documentation Pattern

Each module has a `[module].openapi.ts` file that registers schemas and routes.

### 1. Import Registry

```typescript
import { registry } from "@/lib/openapi";
```

### 2. Register Schemas (Optional)

Register reusable schemas:

```typescript
import { UserSchema } from "./user.validation";

registry.register("User", UserSchema);
```

### 3. Register Routes

Register each endpoint with full documentation:

```typescript
registry.registerPath({
  method: "post",
  path: "/api/users",
  summary: "Create a new user",
  description: "Creates a new user account with the provided information",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: UserResponseSchema
        }
      }
    },
    400: {
      description: "Invalid input data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema
        }
      }
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});
```

### 4. Import in Route File

**Critical**: Import the OpenAPI file in the route file to execute registration:

```typescript
import "./user.openapi";  // Must be first import
import express from "express";
```

## Response Schemas

Define standard response schemas in validation files:

### Success Response Schema

```typescript
export const SuccessResponseSchema = z.object({
  status: z.number().openapi({ example: 200 }),
  message: z.string().openapi({ example: "Success" }),
  data: z.any(),
  success: z.boolean().openapi({ example: true })
}).openapi("SuccessResponse");
```

### Error Response Schema

```typescript
export const ErrorResponseSchema = z.object({
  status: z.number().openapi({ example: 400 }),
  message: z.string().openapi({ example: "Error message" }),
  data: z.null(),
  success: z.boolean().openapi({ example: false }),
  errors: z.array(z.object({
    path: z.string(),
    message: z.string()
  })).optional()
}).openapi("ErrorResponse");
```

### Typed Response Schemas

Create specific response schemas for each endpoint:

```typescript
export const UserResponseSchema = z.object({
  status: z.literal(200),
  message: z.string(),
  data: UserSchema,
  success: z.literal(true)
}).openapi("UserResponse");

export const UsersListResponseSchema = z.object({
  status: z.literal(200),
  message: z.string(),
  data: z.array(UserSchema),
  success: z.literal(true)
}).openapi("UsersListResponse");
```

## Authentication Documentation

Document protected endpoints with security requirements:

```typescript
registry.registerPath({
  method: "get",
  path: "/api/users/profile",
  summary: "Get current user profile",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],  // Requires authentication
  responses: {
    200: {
      description: "Profile retrieved successfully",
      content: {
        "application/json": {
          schema: UserResponseSchema
        }
      }
    },
    401: {
      description: "Unauthorized - Invalid or missing token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});
```

## Request Parameters

### Path Parameters

```typescript
registry.registerPath({
  method: "get",
  path: "/api/users/{id}",
  summary: "Get user by ID",
  tags: ["Users"],
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "User ID",
        example: "507f1f77bcf86cd799439011"
      })
    })
  },
  responses: {
    200: {
      description: "User found",
      content: {
        "application/json": {
          schema: UserResponseSchema
        }
      }
    },
    404: {
      description: "User not found"
    }
  }
});
```

### Query Parameters

```typescript
registry.registerPath({
  method: "get",
  path: "/api/users",
  summary: "List users with pagination",
  tags: ["Users"],
  request: {
    query: z.object({
      page: z.string().transform(Number).openapi({
        description: "Page number",
        example: "1"
      }),
      limit: z.string().transform(Number).openapi({
        description: "Items per page",
        example: "10"
      }),
      search: z.string().optional().openapi({
        description: "Search query",
        example: "john"
      })
    })
  },
  responses: {
    200: {
      description: "Users retrieved successfully",
      content: {
        "application/json": {
          schema: UsersListResponseSchema
        }
      }
    }
  }
});
```

## Schema Examples

Add examples to schemas for better documentation:

```typescript
export const CreateUserSchema = z.object({
  name: z.string().min(1).openapi({
    description: "User's full name",
    example: "John Doe"
  }),
  email: z.string().email().openapi({
    description: "User's email address",
    example: "john.doe@example.com"
  }),
  password: z.string().min(8).openapi({
    description: "User's password (min 8 characters)",
    example: "SecurePass123"
  }),
  role: z.enum(["customer", "contractor"]).openapi({
    description: "User role",
    example: "customer"
  })
}).openapi("CreateUser");
```

## Tags Organization

Organize endpoints by feature using tags:

```typescript
// User management endpoints
tags: ["Users"]

// Authentication endpoints
tags: ["Authentication"]

// Job management endpoints
tags: ["Jobs"]

// Payment endpoints
tags: ["Payments"]

// Admin endpoints
tags: ["Admin"]
```

## Complete Example

Here's a complete example for a user module:

### user.validation.ts

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  id: z.string().openapi({ example: "507f1f77bcf86cd799439011" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  role: z.enum(["customer", "contractor", "admin"])
}).openapi("User");

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "contractor"])
}).openapi("CreateUser");

export const UserResponseSchema = z.object({
  status: z.literal(200),
  message: z.string(),
  data: UserSchema,
  success: z.literal(true)
}).openapi("UserResponse");

export const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null(),
  success: z.literal(false),
  errors: z.array(z.object({
    path: z.string(),
    message: z.string()
  })).optional()
}).openapi("ErrorResponse");
```

### user.openapi.ts

```typescript
import { registry } from "@/lib/openapi";
import { 
  CreateUserSchema, 
  UserResponseSchema, 
  ErrorResponseSchema 
} from "./user.validation";

// Create user
registry.registerPath({
  method: "post",
  path: "/api/users",
  summary: "Create a new user",
  description: "Register a new user account",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: UserResponseSchema
        }
      }
    },
    400: {
      description: "Invalid input data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

// Get user by ID
registry.registerPath({
  method: "get",
  path: "/api/users/{id}",
  summary: "Get user by ID",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "User ID" })
    })
  },
  responses: {
    200: {
      description: "User found",
      content: {
        "application/json": {
          schema: UserResponseSchema
        }
      }
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});
```

### user.route.ts

```typescript
import "./user.openapi";  // Import first to register OpenAPI specs

import express, { type Router } from "express";
import { validateBody, validateParams } from "@/middleware";
import { requireAuth } from "@/middleware";
import * as service from "./services";
import { CreateUserSchema } from "./user.validation";

export const user: Router = express.Router();

user.post("/", validateBody(CreateUserSchema), service.createUser);
user.get("/:id", requireAuth, validateParams(ParamsSchema), service.getUser);
```

## Best Practices

1. **Import OpenAPI files first**: Always import `[module].openapi.ts` at the top of route files
2. **Use descriptive summaries**: Write clear, concise endpoint descriptions
3. **Document all responses**: Include success and error responses
4. **Add examples**: Provide realistic examples for all fields
5. **Organize with tags**: Group related endpoints with consistent tags
6. **Document authentication**: Use `security` field for protected routes
7. **Reuse schemas**: Register common schemas once and reference them
8. **Keep schemas in validation files**: Define all Zod schemas in `[module].validation.ts`
9. **Use OpenAPI extensions**: Add `.openapi()` to all schemas for documentation
10. **Test documentation**: Regularly check Swagger/Scalar UI for accuracy
