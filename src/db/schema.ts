import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// User role enum matching authentication.md
export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "contractor",
  "admin",
]);

// Users table schema
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
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Type inference for TypeScript
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
