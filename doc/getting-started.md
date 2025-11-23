# JobSphere Backend - Getting Started

Welcome to JobSphere! This guide will help you set up and start developing with the JobSphere backend API.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Project Structure](#project-structure)
8. [Development Workflow](#development-workflow)
9. [Useful Commands](#useful-commands)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([download](https://nodejs.org))
- **pnpm** v10.18.3 or higher ([installation](https://pnpm.io/installation))
- **Neon Account** for PostgreSQL database ([sign up](https://neon.tech))
- **Git** for version control

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd express-ts-starter
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Express.js framework
- GraphQL and GraphQL Yoga
- Drizzle ORM
- TypeScript
- And more...

---

## Environment Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Open `.env` and set the following:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Server Configuration
PORT=4000
API_BASE_URL=http://localhost:4000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# JWT Configuration
ACCESS_SECRET=your-super-secret-access-key-change-me
REFRESH_SECRET=your-super-secret-refresh-key-change-me
```

**Important:** Replace the JWT secrets with secure random strings in production!

### 3. Get Your Neon Database URL

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Create a new project
3. Copy the **connection string**
4. Paste it into your `.env` file as `DATABASE_URL`

---

## Database Setup

### 1. Push Schema to Database

```bash
pnpm db:push
```

This will create all necessary tables in your Neon database.

### 2. Verify Database (Optional)

Open Drizzle Studio to visualize your database:

```bash
pnpm db:studio
```

Navigate to `https://local.drizzle.studio` to browse your tables.

---

## Running the Application

### Development Mode

Start the server with hot-reload:

```bash
pnpm dev
```

The server will start at: `http://localhost:4000`

**You should see:**
```
🚀 Server is running on port http://localhost:4000
✨ Server is running on port http://172.30.48.1:4000

✍️ Swagger doc: http://localhost:4000/swagger
📋 Scaler doc: http://localhost:4000/scaler
🎨 GraphQL playground: http://localhost:4000/graphql
```

### Production Mode

Build and run for production:

```bash
pnpm build
pnpm start
```

---

## API Documentation

JobSphere provides multiple API interfaces:

### 🎨 GraphQL API

**Endpoint:** `http://localhost:4000/graphql`

- Modern, type-safe API
- Built-in GraphiQL playground
- JWT authentication
- User management

**Quick Test:**
1. Open `http://localhost:4000/graphql` in your browser
2. Run this query:
```graphql
query {
  users {
    id
    name
    email
  }
}
```

📖 **Full Documentation:** [GraphQL API Guide](./graphql-api.md)

---

### 📝 REST API

**Swagger UI:** `http://localhost:4000/swagger`  
**Scalar Docs:** `http://localhost:4000/scaler`

- Traditional REST endpoints
- OpenAPI 3.0 specification
- Interactive documentation

---

## Project Structure

```
express-ts-starter/
├── src/
│   ├── api/              # REST API modules (feature-based)
│   ├── db/               # Database schema and connection
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── index.ts      # Database connection
│   ├── graphql/          # GraphQL layer
│   │   ├── typeDefs.ts   # GraphQL schema
│   │   ├── resolvers/    # Query & mutation resolvers
│   │   ├── context.ts    # Authentication context
│   │   ├── guards.ts     # Auth guards
│   │   └── server.ts     # GraphQL Yoga server
│   ├── lib/              # Shared utilities
│   │   ├── jwt.ts        # JWT token management
│   │   ├── logger.ts     # Winston logger
│   │   └── openapi.ts    # OpenAPI registry
│   ├── middleware/       # Express middleware
│   └── app.ts            # Application entry point
├── doc/                  # Documentation
├── drizzle/              # SQL migrations
├── drizzle.config.ts     # Drizzle Kit config
├── package.json          # Dependencies & scripts
└── tsconfig.json         # TypeScript config
```

---

## Development Workflow

### 1. Creating New Features

For **GraphQL**:
1. Add types to `src/graphql/typeDefs.ts`
2. Create resolvers in `src/graphql/resolvers/`
3. Update `src/graphql/resolvers/index.ts`
4. Test in GraphiQL playground

For **REST API**:
1. Use module generator: `pnpm generate:module`
2. Follow the architecture pattern
3. Update OpenAPI documentation

### 2. Database Changes

**Development:**
```bash
# 1. Modify src/db/schema.ts
# 2. Push changes
pnpm db:push
```

**Production:**
```bash
# 1. Modify src/db/schema.ts
# 2. Generate migration
pnpm db:generate
# 3. Review migration files
# 4. Apply migration
pnpm db:migrate
```

### 3. Code Quality

**Check for linting errors:**
```bash
pnpm check
```

**Format code:**
```bash
pnpm format
```

**Type checking:**
```bash
pnpm check-types
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot-reload |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm check` | Run oxlint |
| `pnpm check-types` | TypeScript type checking |
| `pnpm format` | Format code with Biome |
| `pnpm generate:module` | Scaffold new API module |
| `pnpm db:push` | Push schema to database (dev) |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Troubleshooting

### Server Won't Start

**Error:** `ERR_MODULE_NOT_FOUND`

**Solution:** 
1. Run `pnpm install`
2. Check all environment variables are set
3. Ensure `DATABASE_URL` is valid

---

### Database Connection Failed

**Error:** `Connection refused` or `ENOTFOUND`

**Solution:**
1. Verify `DATABASE_URL` in `.env`
2. Check Neon instance is running
3. Ensure network connectivity
4. Try copying connection string again from Neon

---

### GraphQL Playground Not Loading

**Problem:** `/graphql` shows error

**Solution:**
1. Check server is running: `pnpm dev`
2. Clear browser cache
3. Try incognito/private mode
4. Check console for errors

---

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Change PORT in .env
PORT=5000

# Or kill process using port 4000
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:4000 | xargs kill -9
```

---

### Type Errors

**Error:** TypeScript compilation errors

**Solution:**
```bash
# Check types
pnpm check-types

# If errors persist, try:
rm -rf node_modules
pnpm install
```

---

## Next Steps

Now that you're set up, try:

1. **Explore the GraphQL API**
   - Open GraphiQL at `http://localhost:4000/graphql`
   - Try the example queries in [GraphQL API Docs](./graphql-api.md)

2. **Create a User**
   ```graphql
   mutation {
     register(input: {
       email: "test@example.com"
       password: "Test123!"
       name: "Test User"
       role: CUSTOMER
     }) {
       success
       message
     }
   }
   ```

3. **Explore the Database**
   - Run `pnpm db:studio`
   - Browse your tables and data

4. **Read the Documentation**
   - [GraphQL API Guide](./graphql-api.md)
   - [Database Documentation](./database.md)

---

## Getting Help

- **Check Documentation:** Browse files in `doc/` directory
- **Check Logs:** Server logs show detailed error messages
- **Drizzle Studio:** Visualize database state
- **GraphiQL:** Test GraphQL queries interactively

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm check` and `pnpm check-types`
4. Format code with `pnpm format`
5. Commit and push
6. Create pull request

---

**Happy Coding! 🚀**

Need help? Check the documentation in the `doc/` folder or reach out to the team.
