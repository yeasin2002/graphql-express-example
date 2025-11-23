export const typeDefs = `#graphql
  scalar DateTime

  enum UserRole {
    CUSTOMER
    CONTRACTOR
    ADMIN
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    phone: String
    isSuspend: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type TokenPayload {
    accessToken: String!
    refreshToken: String!
  }

  type SuccessResponse {
    success: Boolean!
    message: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: UserRole!
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    phone: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User!
  }

  type Mutation {
    register(input: RegisterInput!): SuccessResponse!
    login(input: LoginInput!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): SuccessResponse!
  }
`;
