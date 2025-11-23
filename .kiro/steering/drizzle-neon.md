---
inclusion: always
---

# Drizzle ORM with Neon Database

This project uses Drizzle ORM with Neon serverless Postgres database.

## Database Setup

### Connection

- Use `drizzle-orm/neon-http` for serverless environments
- Database connection string is stored in `DATABASE_URL` environment variable
- For synchronous connections, use the `neon` client from `@neondatabase/serverless`

### File Structure

```
src/
  db/
    schema.ts    # Database table definitions
drizzle/         # SQL migration files and snapshots
drizzle.config.ts # Drizzle Kit configuration
```

## Schema Definition

Define tables in `src/db/schema.ts` using Drizzle's schema builder:

```typescript
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
```

## Database Connection

Initialize the database connection:

```typescript
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL);
```

For synchronous connection:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
```

## Migrations

### Quick Schema Changes (Development)

Use `push` for rapid prototyping without migration files:

```bash
npx drizzle-kit push
```

### Production Migrations

Generate and apply migrations:

```bash
npx drizzle-kit generate  # Generate migration files
npx drizzle-kit migrate   # Apply migrations
```

## Common Queries

### Insert

```typescript
await db.insert(usersTable).values({
  name: "John",
  age: 30,
  email: "[email protected]",
});
```

### Select

```typescript
const users = await db.select().from(usersTable);
```

### Update

```typescript
import { eq } from "drizzle-orm";

await db
  .update(usersTable)
  .set({ age: 31 })
  .where(eq(usersTable.email, "[email protected]"));
```

### Delete

```typescript
import { eq } from "drizzle-orm";

await db.delete(usersTable).where(eq(usersTable.email, "[email protected]"));
```

## Type Inference

Use Drizzle's type inference for type-safe inserts:

```typescript
const user: typeof usersTable.$inferInsert = {
  name: "John",
  age: 30,
  email: "[email protected]",
};
```

## Best Practices

1. Always define schemas in `src/db/schema.ts`
2. Use `drizzle-kit push` for development, migrations for production
3. Keep `drizzle.config.ts` in sync with your schema location
4. Use type inference for insert/select operations
5. Import filters like `eq`, `gt`, `lt` from `drizzle-orm` for queries
6. Use `neon-http` driver for serverless environments (faster for single transactions)
7. Use `neon-websockets` if you need session or interactive transaction support

## Required Packages

```json
{
  "dependencies": {
    "drizzle-orm": "latest",
    "@neondatabase/serverless": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "latest"
  }
}
```
