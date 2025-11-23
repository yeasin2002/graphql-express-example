import { verifyAccessToken } from "@/lib/jwt";
import type { Request } from "express";

export interface GraphQLContext {
	user?: {
		userId: string;
		email: string;
		role: "customer" | "contractor" | "admin";
	};
}

export const createContext = async (req: Request): Promise<GraphQLContext> => {
	const authHeader = req.headers.authorization;

	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.substring(7);
		try {
			const decoded = verifyAccessToken(token);
			return {
				user: {
					userId: decoded.userId,
					email: decoded.email,
					role: decoded.role,
				},
			};
		} catch (error) {
			// Token invalid, return empty context
			return {};
		}
	}

	return {};
};
