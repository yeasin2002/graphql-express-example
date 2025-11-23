---
inclusion: always
---

# Architecture & Project Structure

## Directory Structure

```
src/
├── api/                    # API modules (feature-based organization)
│   └── [module]/
│       ├── [module].route.ts       # Express routes
│       ├── [module].validation.ts  # Zod schemas
│       ├── [module].openapi.ts     # OpenAPI specs
│       └── services/               # Business logic handlers
│           ├── index.ts
│           └── *.service.ts
├── db/                     # Database connection and schemas
├── lib/                    # Shared utilities
│   ├── jwt.ts             # JWT token management
│   ├── logger.ts          # Winston logger
│   ├── openapi.ts         # OpenAPI registry
│   ├── multer.ts          # File upload config
│   └── morgan.ts          # HTTP request logger
├── middleware/            # Express middleware
│   ├── auth.middleware.ts # Authentication & authorization
│   ├── validation.middleware.ts # Request validation
│   └── common/
│       ├── global-error-handler.ts
│       └── default-not-found.ts
├── helpers/               # Helper functions
│   ├── response-handler.ts        # Standardized API responses
│   └── mongodb-error-handler.ts   # Database error handling
└── app.ts                 # Application entry point
```

## Module Structure Pattern

Each API module follows this consistent pattern:

### 1. Route File (`[module].route.ts`)
- Defines Express router
- Imports and registers routes
- Applies middleware (validation, auth)
- Imports OpenAPI registration

```typescript
import "./[module].openapi";
import express, { type Router } from "express";
import { validateBody } from "@/middleware";
import * as service from "./services";

export const [module]: Router = express.Router();

[module].post("/", validateBody(schema), service.handler);
```

### 2. Validation File (`[module].validation.ts`)
- Defines Zod schemas with OpenAPI extensions
- Exports TypeScript types
- Schemas for: body, params, query, responses

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const ExampleSchema = z.object({
  name: z.string().min(1).openapi({ description: "Name" }),
}).openapi("Example");

export type Example = z.infer<typeof ExampleSchema>;
```

### 3. OpenAPI File (`[module].openapi.ts`)
- Registers schemas with OpenAPI registry
- Registers route paths with documentation
- Must be imported in route file to execute

```typescript
import { registry } from "@/lib/openapi";

registry.registerPath({
  method: "post",
  path: "/api/[module]",
  summary: "Description",
  tags: ["[module]"],
  request: {
    body: {
      content: {
        "application/json": { schema: ExampleSchema }
      }
    }
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": { schema: ResponseSchema }
      }
    }
  }
});
```

### 4. Services Directory (`services/`)
- Contains business logic handlers
- Each handler is a RequestHandler function
- Exports from `index.ts`

```typescript
import type { RequestHandler } from "express";
import { sendSuccess, sendInternalError } from "@/helpers";

export const handler: RequestHandler = async (req, res) => {
  try {
    // Business logic here
    return sendSuccess(res, 200, "Success", data);
  } catch (error) {
    return sendInternalError(res, "Error message");
  }
};
```

## Path Aliases

Use `@/` prefix for clean imports:

```typescript
import { sendSuccess } from "@/helpers";
import { requireAuth } from "@/middleware";
import { logger } from "@/lib";
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Module Registration

Register routes in `src/app.ts`:

```typescript
import { [module] } from "@/api/[module]/[module].route";

app.use("/api/[module]", [module]);
```

## Naming Conventions

- **Directories**: lowercase with hyphens (e.g., `user-profile`)
- **Files**: camelCase or kebab-case (e.g., `user.route.ts`)
- **Variables**: camelCase (e.g., `userRouter`)
- **Types/Interfaces**: PascalCase (e.g., `UserSchema`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACCESS_SECRET`)

## Import/Export Style

- Use ES modules throughout
- Prefer named exports over default exports
- Use barrel exports from `index.ts` files
- Import types with `type` keyword when possible

```typescript
import type { RequestHandler } from "express";
import { sendSuccess } from "@/helpers";
```
