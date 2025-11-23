import { makeExecutableSchema } from "@graphql-tools/schema";
import { createYoga } from "graphql-yoga";
import { createContext } from "./context";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Yoga server
export const yogaServer = createYoga({
  schema,
  context: async ({ request }) => {
    // Extract Express request from Yoga request
    return createContext(request as any);
  },
  graphiql: {
    title: "JobSphere GraphQL API",
  },
  // Custom error handling
  maskedErrors: process.env.NODE_ENV === "production",
});
