import { db, usersTable } from "@/db";
import { eq } from "drizzle-orm";
import type { GraphQLContext } from "../context";
import { requireAuth } from "../guards";

export const userQueries = {
	// Get all users (protected)
	users: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
		requireAuth(context);

		const users = await db.select().from(usersTable);

		// Exclude password field
		return users.map(({ password, ...user }) => user);
	},

	// Get user by ID
	user: async (
		_parent: unknown,
		args: { id: string },
		_context: GraphQLContext,
	) => {
		const userId = Number.parseInt(args.id, 10);
		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!users.length) {
			return null;
		}

		// Exclude password field
		const { password, ...user } = users[0];
		return user;
	},

	// Get current authenticated user
	me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
		const currentUser = requireAuth(context);
		const userId = Number.parseInt(currentUser.userId, 10);

		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!users.length) {
			throw new Error("User not found");
		}

		// Exclude password field
		const { password, ...user } = users[0];
		return user;
	},
};
