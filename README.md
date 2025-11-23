# GraphQL Express Example

A modern full-stack backend API server built with GraphQL and REST, featuring type-safe queries, authentication, and comprehensive API documentation.

## 🚀 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.1.0
- **API Layer**: 
  - GraphQL with GraphQL Yoga v5.16.2
  - REST API with OpenAPI 3.0 specification
- **Database**: 
  - PostgreSQL with Drizzle ORM v0.44.7 (Neon serverless)
  - MongoDB with Mongoose v8.19.2
- **Authentication**: JWT with bcryptjs
- **Documentation**: 
  - Swagger UI Express
  - Scalar API Reference
- **File Upload**: Multer v2.0.2
- **Logging**: Winston with daily rotation
- **Validation**: Zod v4.1.12
- **Package Manager**: pnpm v10.18.3

## ✨ Key Features

- 🎯 **Dual API Architecture**: Both GraphQL and REST endpoints
- 🔐 **JWT Authentication**: Secure access and refresh token system
- 👥 **Role-Based Access**: Customer, Contractor, and Admin roles
- 📊 **Type-Safe**: Full TypeScript support with Drizzle ORM
- 📚 **Auto-Generated Docs**: Swagger and Scalar API documentation
- 🗄️ **Dual Database**: PostgreSQL (Drizzle) + MongoDB (Mongoose)
- 📤 **File Uploads**: Built-in file upload support
- 🔍 **Validation**: Zod schemas with OpenAPI integration
- 🎨 **Code Quality**: Oxlint, Biome formatter, and TypeScript checks
- 🔧 **Module Generator**: CLI tool to scaffold new API modules

## 📚 Documentation

**API Documentation is automatically generated and available at:**

- **GraphQL Playground**: `http://localhost:4000/graphql` - Interactive GraphQL IDE
- **Swagger UI**: `http://localhost:4000/swagger` - REST API documentation
- **Scalar Docs**: `http://localhost:4000/scaler` - Modern API reference
- **OpenAPI JSON**: `http://localhost:4000/api-docs.json` - Raw OpenAPI spec

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm v10.18.3+
- PostgreSQL database (Neon recommended)
- MongoDB instance (optional, based on modules)

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Server Configuration
PORT=4000
API_BASE_URL=http://localhost:4000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# JWT Configuration
ACCESS_SECRET=your-access-secret-key-change-in-production
REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

### Development

```bash
# Start with hot reload (tsx)
pnpm dev

# Start with Bun hot reload (alternative)
pnpm dev:b
```

### Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start

# Compile to standalone binary (Bun)
pnpm compile
```

### Database Commands

```bash
# Push schema changes to database (development)
pnpm db:push

# Generate migration files
pnpm db:generate

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Code Quality

```bash
# Run oxlint for fast linting
pnpm check
pnpm lint

# TypeScript type checking
pnpm check-types

# Format code with Biome
pnpm format

# Run tests
pnpm test
```

## 🛠️ Module Generator

Quickly scaffold new API modules with all necessary boilerplate:

```bash
pnpm generate:module
```

This interactive CLI will create:
- `[module].route.ts` - Express router with CRUD endpoints
- `[module].openapi.ts` - OpenAPI documentation
- `[module].validation.ts` - Zod validation schemas
- `services/[module].service.ts` - Business logic layer

Example generated structure in `src/api/example/`

## 📁 Project Structure

```
graphql-express-example/
├── src/
│   ├── app.ts              # Application entry point
│   ├── api/                # REST API modules
│   │   └── example/        # Example module
│   │       ├── example.route.ts
│   │       ├── example.openapi.ts
│   │       ├── example.validation.ts
│   │       └── services/
│   ├── graphql/            # GraphQL setup
│   │   ├── server.ts       # GraphQL Yoga server
│   │   ├── typeDefs.ts     # GraphQL schema
│   │   ├── context.ts      # GraphQL context
│   │   ├── guards.ts       # Auth guards
│   │   └── resolvers/      # Query & mutation resolvers
│   ├── db/                 # Database layer
│   │   ├── index.ts        # Drizzle connection
│   │   └── schema.ts       # Database schema
│   ├── middleware/         # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── common/         # Error handling, etc.
│   ├── lib/                # Utility libraries
│   │   ├── generate-openapi.ts
│   │   ├── morgan.ts
│   │   └── get-my-ip.ts
│   ├── helpers/            # Helper functions
│   └── data/               # Static data/constants
├── uploads/                # File upload directory
├── script/                 # CLI scripts
│   └── generate-module.js  # Module generator
├── doc/                    # Documentation
└── .husky/                 # Git hooks
```

## 🔐 GraphQL API

### User Schema

```graphql
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

enum UserRole {
  CUSTOMER
  CONTRACTOR
  ADMIN
}
```

### Queries

```graphql
# Get all users
users: [User!]!

# Get user by ID
user(id: ID!): User

# Get current authenticated user
me: User!
```

### Mutations

```graphql
# Register new user
register(input: RegisterInput!): SuccessResponse!

# Login user
login(input: LoginInput!): AuthPayload!

# Update user
updateUser(id: ID!, input: UpdateUserInput!): User!

# Delete user
deleteUser(id: ID!): SuccessResponse!
```

## 👥 User Roles

- **CUSTOMER**: Regular user role for customers
- **CONTRACTOR**: Service provider role
- **ADMIN**: Administrator with elevated permissions

User roles are defined in both GraphQL schema and database schema for consistency.

## 🔒 Authentication

JWT-based authentication with access and refresh tokens:

1. **Register/Login**: Returns `accessToken`, `refreshToken`, and user data
2. **Protected Routes**: Require `Authorization: Bearer <accessToken>` header
3. **Token Refresh**: Use refresh token to get new access token when expired
4. **Role Guards**: GraphQL resolvers protected with role-based guards

## 🗄️ Database Schema

PostgreSQL schema using Drizzle ORM:

```typescript
users {
  id: serial primary key
  email: varchar(255) unique
  password: varchar(255)
  name: varchar(255)
  role: enum('customer', 'contractor', 'admin')
  phone: varchar(50)
  isSuspend: boolean
  refreshTokens: json
  passwordResetOTP: varchar(10)
  otpExpiry: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with tsx hot reload |
| `pnpm dev:b` | Start development server with Bun hot reload |
| `pnpm build` | Build for production with tsdown |
| `pnpm start` | Start production server |
| `pnpm compile` | Compile to standalone binary |
| `pnpm check-types` | TypeScript type checking |
| `pnpm check` / `pnpm lint` | Run oxlint |
| `pnpm format` | Format code with Biome |
| `pnpm test` | Run tests |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm generate:module` | Generate new API module |

## 🔧 Development Tools

- **TypeScript**: Full type safety across the application
- **Oxlint**: Ultra-fast linting (100x faster than ESLint)
- **Biome**: Fast formatter and linter alternative
- **Husky**: Git hooks for pre-commit linting
- **tsdown**: Fast TypeScript bundler for production
- **Drizzle Kit**: Database migrations and studio

## 🚀 Deployment

### Production Build

```bash
# Build the project
pnpm build

# Start production server
NODE_ENV=production pnpm start
```

### Standalone Binary

```bash
# Compile to single executable
pnpm compile

# Run the binary
./server
```

## 🤝 Contributing

1. Code is automatically linted on commit via Husky hooks
2. Follow the existing code style (Biome formatting)
3. Ensure TypeScript types are correct
4. Use the module generator for consistency

## 📄 License

Private - All rights reserved
