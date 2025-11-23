---
inclusion: always
---

# Module Generator

## Overview

JobSphere includes a module generator script to quickly scaffold new API modules with consistent structure and boilerplate code.

## Usage

### Generate Standard Module

```bash
pnpm run generate:module
```

This will prompt for a module name and create the module in `src/api/[module]/`.

### Generate with Module Name Flag

```bash
pnpm run generate:module --module user
```

Skips the prompt and creates the module directly.

### Generate Sub-Module

```bash
pnpm run generate:module --sub auth --module login
```

Creates a sub-module under an existing parent module: `src/api/auth/login/`.

## Generated Structure

The generator creates the following structure:

```
src/api/[module]/
├── [module].route.ts       # Express router with route definitions
├── [module].validation.ts  # Zod schemas with OpenAPI extensions
├── [module].openapi.ts     # OpenAPI route registration
└── services/               # Business logic handlers
    ├── index.ts            # Service exports
    └── example.service.ts  # Example service handler
```

## Generated Files

### 1. Route File (`[module].route.ts`)

```typescript
import "./[module].openapi";

import express, { type Router } from "express";

export const [module]: Router = express.Router();

// TODO: Add your routes here
// Example:
// [module].get("/", handler);
// [module].post("/", validateBody(schema), handler);
```

### 2. Validation File (`[module].validation.ts`)

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// TODO: Define your validation schemas here
// Example:
// export const ExampleValidation = z.object({
//   name: z.string().min(1).openapi({ description: "Name" }),
// }).openapi("Example");
//
// export type Example = z.infer<typeof ExampleValidation>;
```

### 3. OpenAPI File (`[module].openapi.ts`)

```typescript
import { registry } from "@/lib/openapi";

// registry.register("[module]", [module]Schema);
registry.registerPath({
  method: "post",
  path: "/api/[module]",
  description: "",
  summary: "",
  tags: ["[module]"],
  responses: {
    200: {
      description: "[module] retrieved successfully",
      // content: {"application/json": {schema: [module]ResponseSchema,},},
    },
  },
});

// TODO: Add your openAPI specification here
```

### 4. Service Index (`services/index.ts`)

```typescript
// Export all service handlers
// Example:
// export * from "./login";
// export * from "./register";
```

### 5. Example Service (`services/example.service.ts`)

```typescript
import type { RequestHandler } from "express";
import { sendInternalError, sendSuccess } from "@/helpers";

// TODO: Implement your service handler
// Example: Get all [module]
export const getAll[Module]: RequestHandler = async (req, res) => {
  try {
    // Add your business logic here
    return sendSuccess(res, 200, "Success", null);
  } catch (error) {
    console.log(error);
    return sendInternalError(res, "Internal Server Error");
  }
};
```

## Next Steps After Generation

The generator provides a checklist of next steps:

1. **Define schemas** in `[module].validation.ts`
   - Create Zod schemas for request/response validation
   - Add OpenAPI descriptions and examples
   - Export TypeScript types

2. **Add service handlers** in `services/` folder
   - Create separate files for each handler (e.g., `create.service.ts`, `get.service.ts`)
   - Implement business logic
   - Use response helpers for consistent responses

3. **Export services** in `services/index.ts`
   ```typescript
   export * from "./create.service";
   export * from "./get.service";
   export * from "./update.service";
   export * from "./delete.service";
   ```

4. **Define routes** in `[module].route.ts`
   ```typescript
   import "./[module].openapi";
   import express, { type Router } from "express";
   import { validateBody, validateParams } from "@/middleware";
   import { requireAuth } from "@/middleware";
   import * as service from "./services";
   import { CreateSchema, UpdateSchema, ParamsSchema } from "./[module].validation";

   export const [module]: Router = express.Router();

   [module].get("/", requireAuth, service.getAll);
   [module].get("/:id", requireAuth, validateParams(ParamsSchema), service.getById);
   [module].post("/", requireAuth, validateBody(CreateSchema), service.create);
   [module].put("/:id", requireAuth, validateParams(ParamsSchema), validateBody(UpdateSchema), service.update);
   [module].delete("/:id", requireAuth, validateParams(ParamsSchema), service.remove);
   ```

5. **Register route** in `src/app.ts`
   ```typescript
   import { [module] } from "@/api/[module]/[module].route";
   
   app.use("/api/[module]", [module]);
   ```

6. **Document OpenAPI** in `[module].openapi.ts`
   - Register all endpoints with full documentation
   - Add request/response schemas
   - Include authentication requirements
   - Add examples and descriptions

## Examples

### Generate User Module

```bash
pnpm run generate:module --module user
```

Creates: `src/api/user/`

Register in `app.ts`:
```typescript
import { user } from "@/api/user/user.route";
app.use("/api/user", user);
```

### Generate Auth Sub-Modules

```bash
pnpm run generate:module --sub auth --module login
pnpm run generate:module --sub auth --module register
pnpm run generate:module --sub auth --module refresh
```

Creates:
- `src/api/auth/login/`
- `src/api/auth/register/`
- `src/api/auth/refresh/`

Register in parent or `app.ts`:
```typescript
import { login } from "@/api/auth/login/login.route";
import { register } from "@/api/auth/register/register.route";
import { refresh } from "@/api/auth/refresh/refresh.route";

app.use("/api/auth/login", login);
app.use("/api/auth/register", register);
app.use("/api/auth/refresh", refresh);
```

## Module Naming Conventions

- Use lowercase for module names
- Use hyphens for multi-word modules (e.g., `user-profile`)
- The generator converts to PascalCase for types and camelCase for variables
- Route paths use the original lowercase name

Examples:
- Input: `user` → Variable: `user`, Type: `User`, Path: `/api/user`
- Input: `user-profile` → Variable: `userProfile`, Type: `UserProfile`, Path: `/api/user-profile`

## Tips

1. **Plan module structure**: Decide if you need sub-modules before generating
2. **Generate early**: Create module structure before writing code
3. **Follow patterns**: Use generated templates as starting point
4. **Consistent naming**: Stick to naming conventions for clarity
5. **Service organization**: Create separate service files for each operation
6. **Reuse schemas**: Define common schemas once and import where needed
7. **Test as you go**: Test each endpoint after implementation

## Common Module Patterns

### CRUD Module
```bash
pnpm run generate:module --module product
```

Implement:
- `services/create.service.ts` - Create product
- `services/get-all.service.ts` - List products
- `services/get-by-id.service.ts` - Get single product
- `services/update.service.ts` - Update product
- `services/delete.service.ts` - Delete product

### Auth Module with Sub-Modules
```bash
pnpm run generate:module --module auth
pnpm run generate:module --sub auth --module login
pnpm run generate:module --sub auth --module register
pnpm run generate:module --sub auth --module refresh
pnpm run generate:module --sub auth --module forgot-password
pnpm run generate:module --sub auth --module reset-password
```

### Feature Module
```bash
pnpm run generate:module --module payment
```

Implement:
- `services/create-intent.service.ts`
- `services/confirm.service.ts`
- `services/refund.service.ts`
- `services/webhook.service.ts`
