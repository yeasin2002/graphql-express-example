import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context";

/**
 * Ensures user is authenticated
 */
export function requireAuth(context: GraphQLContext) {
	if (!context.user) {
		throw new GraphQLError("Unauthorized - Authentication required", {
			extensions: { code: "UNAUTHENTICATED" },
		});
	}
	return context.user;
}

/**
 * Ensures user has specific role
 */
export function requireRole(
	context: GraphQLContext,
	role: "customer" | "contractor" | "admin",
) {
	const user = requireAuth(context);
	if (user.role !== role) {
		throw new GraphQLError(`Forbidden - ${role} access required`, {
			extensions: { code: "FORBIDDEN" },
		});
	}
	return user;
}

/**
 * Ensures user has any of the specified roles
 */
export function requireAnyRole(
	context: GraphQLContext,
	roles: Array<"customer" | "contractor" | "admin">,
) {
	const user = requireAuth(context);
	if (!roles.includes(user.role)) {
		throw new GraphQLError("Forbidden - Insufficient permissions", {
			extensions: { code: "FORBIDDEN" },
		});
	}
	return user;
}

/**
 * Ensures user is accessing their own resource or is admin
 */
export function requireOwnership(
	context: GraphQLContext,
	resourceUserId: string,
) {
	const user = requireAuth(context);
	if (user.userId !== resourceUserId && user.role !== "admin") {
		throw new GraphQLError(
			"Forbidden - You can only access your own resources",
			{
				extensions: { code: "FORBIDDEN" },
			},
		);
	}
	return user;
}
