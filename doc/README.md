# JobSphere Backend Documentation

Welcome to the JobSphere backend documentation! This guide will help you understand, develop, and deploy the JobSphere API.

## 📚 Documentation Index

### Quick Start
- **[Getting Started Guide](./getting-started.md)** - Setup instructions, installation, and running the application

### API Documentation
- **[GraphQL API](./graphql-api.md)** - Complete GraphQL API reference with queries, mutations, and examples
- **[REST API](http://localhost:4000/swagger)** - Interactive Swagger documentation (when server is running)

### Database
- **[Database Guide](./database.md)** - Drizzle ORM, schema, queries, and migrations

### Additional Resources
- **[Architecture Overview](../.kiro/steering/architecture.md)** - Project structure and patterns
- **[Authentication Guide](../.kiro/steering/authentication.md)** - JWT authentication and authorization
- **[Project Overview](../.kiro/steering/project-overview.md)** - Tech stack and features

---

## 🚀 Quick Links

| Resource | URL (Local Development) |
|----------|------------------------|
| GraphQL Playground | http://localhost:4000/graphql |
| Swagger API Docs | http://localhost:4000/swagger |
| Scalar API Reference | http://localhost:4000/scaler |
| Drizzle Studio | https://local.drizzle.studio |

---

## 💡 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Push schema to database
pnpm db:push

# Start development server
pnpm dev
```

**Server will be running at:** `http://localhost:4000`

---

## 🎯 Common Tasks

### Test GraphQL API

1. Start the server: `pnpm dev`
2. Open: http://localhost:4000/graphql
3. Try this query:
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

### View Database

```bash
pnpm db:studio
```

Opens visual database browser at `https://local.drizzle.studio`

### Check Code Quality

```bash
pnpm check         # Lint code
pnpm check-types   # Type checking
pnpm format        # Format code
```

---

## 📖 Documentation Contents

### 1. Getting Started
- Prerequisites and installation
- Environment configuration
- Database setup
- Running the application
- Development workflow

**Read:** [getting-started.md](./getting-started.md)

---

### 2. GraphQL API
- Authentication flow
- Schema reference
- All queries and mutations
- Complete examples
- Error handling
- Best practices

**Read:** [graphql-api.md](./graphql-api.md)

**Example Usage:**

```graphql
# Register
mutation {
  register(input: {
    email: "user@example.com"
    password: "Pass123!"
    name: "John Doe"
    role: CUSTOMER
  }) {
    success
    message
  }
}

# Login
mutation {
  login(input: {
    email: "user@example.com"
    password: "Pass123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      name
      email
    }
  }
}

# Get Current User (with auth header)
query {
  me {
    id
    email
    name
    role
  }
}
```

---

### 3. Database
- Drizzle ORM basics
- Schema definitions
- Common queries
- Migrations
- Type safety
- Best practices

**Read:** [database.md](./database.md)

**Example Usage:**

```typescript
import { db, usersTable } from "@/db";
import { eq } from "drizzle-orm";

// Find user
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, "[email protected]"));

// Insert user
await db.insert(usersTable).values({
  email: "[email protected]",
  password: "hashed",
  name: "John Doe",
  role: "customer",
});
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js, TypeScript |
| **Framework** | Express.js v5 |
| **API** | GraphQL (Yoga), REST |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Drizzle ORM |
| **Authentication** | JWT |
| **Validation** | Zod |
| **Documentation** | Swagger, Scalar |
| **Code Quality** | Oxlint, Biome |
| **Package Manager** | pnpm |

---

## 📊 Project Structure

```
express-ts-starter/
├── src/
│   ├── api/           # REST API modules
│   ├── db/            # Database & schema
│   ├── graphql/       # GraphQL layer
│   │   ├── typeDefs.ts
│   │   ├── resolvers/
│   │   ├── context.ts
│   │   ├── guards.ts
│   │   └── server.ts
│   ├── lib/           # Utilities (JWT, logger, etc.)
│   ├── middleware/    # Express middleware
│   └── app.ts         # Application entry
├── doc/               # You are here!
│   ├── README.md
│   ├── getting-started.md
│   ├── graphql-api.md
│   └── database.md
├── drizzle/           # Migrations
├── .kiro/steering/    # Architecture docs
└── package.json
```

---

## 🔐 Authentication

JobSphere uses **JWT-based authentication** with access and refresh tokens.

**Flow:**
1. User registers → Account created
2. User logs in → Receives access token + refresh token
3. Client sends access token in `Authorization` header
4. Server validates token and grants access

**Token Lifetimes:**
- Access Token: 15 days (development)
- Refresh Token: 30 days

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Full Details:** [authentication.md](../.kiro/steering/authentication.md)

---

## 🧪 Testing

### GraphQL Playground

1. Start server: `pnpm dev`
2. Open: http://localhost:4000/graphql
3. Set headers (for protected routes):
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```
4. Run queries/mutations

### Manual Testing

Use GraphiQL interface to:
- Test all queries and mutations
- Verify authentication
- Check error handling
- Explore schema documentation

---

## 📝 Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server with hot-reload |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm check` | Lint with oxlint |
| `pnpm check-types` | TypeScript type checking |
| `pnpm format` | Format with Biome |
| `pnpm db:push` | Push schema (development) |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm generate:module` | Create new API module |

---

## 🐛 Troubleshooting

### Common Issues

**Server won't start**
- Check `.env` file exists and has all required variables
- Ensure `DATABASE_URL` is valid
- Run `pnpm install` to ensure dependencies are installed

**Database connection errors**
- Verify Neon database is running
- Check `DATABASE_URL` format
- Ensure network connectivity

**GraphQL errors**
- Check server logs for detailed error messages
- Verify authentication token is valid
- Review query syntax

**TypeScript errors**
- Run `pnpm check-types` to see all errors
- Check imports are correct
- Ensure schema types are exported

For more troubleshooting, see [Getting Started Guide](./getting-started.md#troubleshooting).

---

## 📚 Learning Resources

### Drizzle ORM
- Official Docs: https://orm.drizzle.team
- Getting Started: https://orm.drizzle.team/docs/get-started

### GraphQL
- Official Docs: https://graphql.org
- GraphQL Yoga: https://the-guild.dev/graphql/yoga-server

### Neon (Database)
- Official Docs: https://neon.tech/docs
- Quickstart: https://neon.tech/docs/get-started-with-neon

---

## 🤝 Contributing

1. Read the [Architecture Guide](../.kiro/steering/architecture.md)
2. Follow the established patterns
3. Run `pnpm check` and `pnpm check-types`
4. Format with `pnpm format`
5. Write tests for new features
6. Update documentation

---

## 📞 Support

- **Documentation Issues:** Check this `doc/` folder
- **API Questions:** See [graphql-api.md](./graphql-api.md)
- **Database Help:** See [database.md](./database.md)
- **Setup Problems:** See [getting-started.md](./getting-started.md)

---

## 🗺️ Roadmap

Future enhancements to consider:

- [ ] Implement refresh token mutation
- [ ] Add password reset flow (forgot password, OTP verification)
- [ ] Implement logout mutation
- [ ] Add input validation with Zod schemas
- [ ] Implement pagination for queries
- [ ] Add filtering and sorting
- [ ] Real-time subscriptions with GraphQL
- [ ] Rate limiting
- [ ] Caching strategies
- [ ] Comprehensive test suite

---

**Last Updated:** November 23, 2025  
**Version:** 1.0.0

---

**Happy Developing! 🚀**
