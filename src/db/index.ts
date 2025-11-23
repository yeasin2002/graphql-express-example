import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create Neon client
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle database instance
export const db = drizzle({ client: sql, schema });

// Re-export schema types and tables
export * from "./schema";
