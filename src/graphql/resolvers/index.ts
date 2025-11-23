import { userMutations } from "./userMutations";
import { userQueries } from "./userQueries";

// DateTime scalar resolver
const dateTimeScalar = {
	DateTime: {
		serialize(value: unknown) {
			if (value instanceof Date) {
				return value.toISOString();
			}
			return value;
		},
		parseValue(value: unknown) {
			if (typeof value === "string") {
				return new Date(value);
			}
			return value;
		},
		parseLiteral(ast: any) {
			if (ast.kind === "StringValue") {
				return new Date(ast.value);
			}
			return null;
		},
	},
};

export const resolvers = {
	...dateTimeScalar,
	Query: {
		...userQueries,
	},
	Mutation: {
		...userMutations,
	},
};
