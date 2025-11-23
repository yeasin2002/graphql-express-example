# Database Documentation - Drizzle ORM with Neon

## Overview

JobSphere uses **Drizzle ORM** with **Neon PostgreSQL** database for serverless deployment and type-safe database operations.

**Database Type:** PostgreSQL (Neon Serverless)  
**ORM:** Drizzle ORM  
**Driver:** `@neondatabase/serverless` (HTTP)

---

## Quick Start

### Prerequisites

1. **Neon Account:** Sign up at [neon.tech](https://neon.tech)
2. **Database URL:** Get your connection string from Neon dashboard

### Setup

1. **Add Database URL to `.env`:**

```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require
```

2. **Push Schema to Database:**

```bash
pnpm db:push
```

3. **Verify Connection:**

```bash
pnpm dev
```

Server should start without errors.

---

## Schema

### Users Table

Located in: `src/db/schema.ts`

```typescript
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  role: userRoleEnum().notNull().default("customer"),
  phone: varchar({ length: 50 }),
  isSuspend: boolean().notNull().default(false),
  refreshTokens: json().$type<string[]>().default([]),
  passwordResetOTP: varchar({ length: 10 }),
  otpExpiry: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});
```

**Field Descriptions:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | integer | PK, Auto-increment | Unique user identifier |
| `email` | varchar(255) | NOT NULL, UNIQUE | User email address |
| `password` | varchar(255) | NOT NULL | Bcrypt hashed password |
| `name` | varchar(255) | NOT NULL | User's full name |
| `role` | enum | NOT NULL, DEFAULT 'customer' | customer, contractor, or admin |
| `phone` | varchar(50) | NULL | Optional phone number |
| `isSuspend` | boolean | NOT NULL, DEFAULT false | Account suspension flag |
| `refreshTokens` | json | DEFAULT [] | Array of active refresh token JTIs |
| `passwordResetOTP` | varchar(10) | NULL | OTP for password reset |
| `otpExpiry` | timestamp | NULL | OTP expiration time |
| `createdAt` | timestamp | NOT NULL, DEFAULT now() | Record creation time |
| `updatedAt` | timestamp | NOT NULL, AUTO-UPDATE | Last update time |

### User Role Enum

```typescript
export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "contractor", 
  "admin",
]);
```

---

## Database Commands

### Push Schema Changes

Directly apply schema changes to the database (development):

```bash
pnpm db:push
```

> **Warning:** This is for development only. Use migrations in production.

**When to use:**
- Rapid prototyping
- Local development
- Quick schema iterations

**What it does:**
- Compares local schema with database
- Generates SQL to sync them
- Applies changes directly

---

### Generate Migrations

Create migration files for production deployment:

```bash
pnpm db:generate
```

**Output:** Creates SQL migration files in `drizzle/` directory

**Migration files include:**
- SQL statements
- Metadata snapshots
- Timestamps

**Example migration:**
```
drizzle/
  0000_create_users_table.sql
  meta/
    _journal.json
    0000_snapshot.json
```

---

### Apply Migrations

Execute pending migrations:

```bash
pnpm db:migrate
```

**Use this in:**
- Production deployments
- CI/CD pipelines
- Team collaboration

---

### Drizzle Studio

Open visual database browser:

```bash
pnpm db:studio
```

**Features:**
- Browse all tables
- View and edit data
- Execute queries
- Visual schema explorer

**Runs at:** `https://local.drizzle.studio`

---

## Database Connection

### Connection File

Located in: `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create Neon client
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle database instance
export const db = drizzle({ client: sql, schema });
```

### Using the Database

Import the `db` instance in your code:

```typescript
import { db, usersTable } from "@/db";
import { eq } from "drizzle-orm";

// Select all users
const users = await db.select().from(usersTable);

// Find user by email
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, "[email protected]"));

// Insert new user
await db.insert(usersTable).values({
  email: "[email protected]",
  password: hashedPassword,
  name: "John Doe",
  role: "customer",
});

// Update user
await db
  .update(usersTable)
  .set({ name: "Jane Doe" })
  .where(eq(usersTable.id, 1));

// Delete user
await db.delete(usersTable).where(eq(usersTable.id, 1));
```

---

## Common Queries

### Select Operations

**Get all users:**
```typescript
const users = await db.select().from(usersTable);
```

**Select specific fields:**
```typescript
const users = await db
  .select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
  })
  .from(usersTable);
```

**Filter with WHERE:**
```typescript
import { eq, and, or } from "drizzle-orm";

// Single condition
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, "[email protected]"));

// Multiple AND conditions
const users = await db
  .select()
  .from(usersTable)
  .where(
    and(
      eq(usersTable.role, "customer"),
      eq(usersTable.isSuspend, false)
    )
  );

// OR conditions
const users = await db
  .select()
  .from(usersTable)
  .where(
    or(
      eq(usersTable.role, "customer"),
      eq(usersTable.role, "contractor")
    )
  );
```

**Limit and Offset:**
```typescript
const users = await db
  .select()
  .from(usersTable)
  .limit(10)
  .offset(0);
```

---

### Insert Operations

**Insert single record:**
```typescript
await db.insert(usersTable).values({
  email: "[email protected]",
  password: "hashed_password",
  name: "John Doe",
  role: "customer",
  phone: "+1234567890",
});
```

**Insert multiple records:**
```typescript
await db.insert(usersTable).values([
  {
    email: "[email protected]",
    password: "hash1",
    name: "User 1",
    role: "customer",
  },
  {
    email: "[email protected]",
    password: "hash2",
    name: "User 2",
    role: "contractor",
  },
]);
```

**Insert and return:**
```typescript
const [newUser] = await db
  .insert(usersTable)
  .values({
    email: "[email protected]",
    password: "hashed_password",
    name: "John Doe",
    role: "customer",
  })
  .returning();

console.log(newUser.id); // Auto-generated ID
```

---

### Update Operations

**Update single record:**
```typescript
await db
  .update(usersTable)
  .set({ name: "Updated Name" })
  .where(eq(usersTable.id, 1));
```

**Update multiple fields:**
```typescript
await db
  .update(usersTable)
  .set({
    name: "New Name",
    phone: "+9876543210",
    updatedAt: new Date(),
  })
  .where(eq(usersTable.id, 1));
```

**Update and return:**
```typescript
const [updatedUser] = await db
  .update(usersTable)
  .set({ name: "New Name" })
  .where(eq(usersTable.id, 1))
  .returning();
```

---

### Delete Operations

**Delete single record:**
```typescript
await db
  .delete(usersTable)
  .where(eq(usersTable.id, 1));
```

**Delete multiple records:**
```typescript
await db
  .delete(usersTable)
  .where(eq(usersTable.isSuspend, true));
```

**Delete and return:**
```typescript
const deletedUsers = await db
  .delete(usersTable)
  .where(eq(usersTable.isSuspend, true))
  .returning();
```

---

## Type Safety

### Type Inference

Drizzle automatically infers TypeScript types from your schema:

```typescript
import { User, NewUser } from "@/db";

// Type for SELECT operations
type User = typeof usersTable.$inferSelect;

// Type for INSERT operations
type NewUser = typeof usersTable.$inferInsert;
```

**Usage:**

```typescript
// Type-safe insert
const newUser: NewUser = {
  email: "[email protected]",
  password: "hashed",
  name: "John Doe",
  role: "customer",
  // TypeScript will error if required fields are missing
};

await db.insert(usersTable).values(newUser);

// Type-safe select
const users: User[] = await db.select().from(usersTable);
```

---

## Best Practices

### 1. Use Transactions for Related Operations

```typescript
await db.transaction(async (tx) => {
  // All operations succeed or all fail
  await tx.insert(usersTable).values(newUser);
  await tx.insert(otherTable).values(relatedData);
});
```

### 2. Always Use Prepared Statements

Drizzle uses prepared statements by default, protecting against SQL injection:

```typescript
// ✅ Safe - parameterized
const email = userInput;
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, email));

// ❌ Never do this
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

### 3. Index Frequently Queried Fields

```typescript
// Add indexes in schema
export const usersTable = pgTable("users", {
  email: varchar({ length: 255 }).notNull().unique(), // Automatically indexed
  // Add more indexes as needed
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));
```

### 4. Use Migrations in Production

```bash
# Development
pnpm db:push

# Production
pnpm db:generate
pnpm db:migrate
```

### 5. Handle Errors Properly

```typescript
try {
  await db.insert(usersTable).values(newUser);
} catch (error) {
  if (error.code === '23505') { // Unique violation
    throw new Error('Email already exists');
  }
  throw error;
}
```

---

## Environment Configuration

### Required Environment Variables

```env
# Neon Database URL
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### Getting Your Neon Database URL

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Paste into `.env` file

**Connection string format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## Troubleshooting

### Connection Errors

**Error:** `Error: getaddrinfo ENOTFOUND`

**Solution:** Check your `DATABASE_URL` is correct and network connectivity.

---

### Migration Conflicts

**Error:** `Warning: Found data-loss statements`

**Solution:** 
1. Backup your data
2. Use `pnpm db:generate` for controlled migrations
3. Review generated SQL before applying

---

### Schema Sync Issues

**Error:** Schema mismatch

**Solution:**
```bash
# Force push (development only)
pnpm db:push

# Or generate migration
pnpm db:generate
pnpm db:migrate
```

---

## Migration Workflow

### Development

```bash
# 1. Make schema changes in src/db/schema.ts

# 2. Push to database
pnpm db:push

# 3. Verify in Drizzle Studio
pnpm db:studio
```

### Production

```bash
# 1. Make schema changes in src/db/schema.ts

# 2. Generate migration
pnpm db:generate

# 3. Review migration files in drizzle/

# 4. Commit migration files to git

# 5. Deploy and run migrations
pnpm db:migrate
```

---

## Additional Resources

- **Drizzle ORM Docs:** [orm.drizzle.team](https://orm.drizzle.team)
- **Neon Docs:** [neon.tech/docs](https://neon.tech/docs)
- **PostgreSQL Docs:** [postgresql.org/docs](https://www.postgresql.org/docs)

For GraphQL API usage, see [GraphQL API Documentation](./graphql-api.md).
