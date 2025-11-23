import { db, usersTable } from "@/db";
import {
    comparePassword,
    hashPassword,
    signAccessToken,
    signRefreshToken,
} from "@/lib/jwt";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../context";
import { requireOwnership } from "../guards";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: "customer" | "contractor" | "admin";
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
}

export const userMutations = {
  // Register a new user
  register: async (
    _parent: unknown,
    args: { input: RegisterInput },
    _context: GraphQLContext
  ) => {
    const { email, password, name, role, phone } = args.input;

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUsers.length > 0) {
      throw new GraphQLError("User with this email already exists", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (convert GraphQL enum to lowercase for database)
    await db.insert(usersTable).values({
      email,
      password: hashedPassword,
      name,
      role: role.toLowerCase() as "customer" | "contractor" | "admin",
      phone,
    });

    return {
      success: true,
      message: "User registered successfully",
    };
  },

  // Login user
  login: async (
    _parent: unknown,
    args: { input: LoginInput },
    _context: GraphQLContext
  ) => {
    const { email, password } = args.input;

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    const user = users[0];

    // Check if user is suspended
    if (user.isSuspend) {
      throw new GraphQLError("Account is suspended", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // Generate tokens
    const payload = {
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const { token: refreshToken, jti } = signRefreshToken(payload);

    // Store refresh token
    const currentTokens = (user.refreshTokens as string[]) || [];
    await db
      .update(usersTable)
      .set({
        refreshTokens: [...currentTokens, jti],
      })
      .where(eq(usersTable.id, user.id));

    // Return tokens and user data (excluding password)
    const { password: _, ...userData } = user;

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  },

  // Update user
  updateUser: async (
    _parent: unknown,
    args: { id: string; input: UpdateUserInput },
    context: GraphQLContext
  ) => {
    const userId = Number.parseInt(args.id, 10);

    // Check ownership
    requireOwnership(context, args.id);

    // Update user
    await db
      .update(usersTable)
      .set({
        ...args.input,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    // Get updated user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (users.length === 0) {
      throw new GraphQLError("User not found");
    }

    // Exclude password field
    const { password, ...user } = users[0];
    return user;
  },

  // Delete user
  deleteUser: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    const userId = Number.parseInt(args.id, 10);

    // Check ownership
    requireOwnership(context, args.id);

    // Delete user
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    return {
      success: true,
      message: "User deleted successfully",
    };
  },
};
