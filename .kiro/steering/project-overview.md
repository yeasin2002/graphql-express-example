---
inclusion: always
---

# JobSphere Backend - Project Overview

JobSphere is a mobile marketplace backend connecting customers with local freelance contractors (electricians, plumbers, cleaners, carpenters, etc.).

## Tech Stack

- **Runtime**: Node.js with TypeScript (ESNext)
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM v8.19.2 (migrating to Drizzle + Neon)
- **Package Manager**: pnpm v10.18.3
- **Authentication**: JWT with refresh token rotation
- **Validation**: Zod v4.1.12 with OpenAPI integration
- **API Documentation**: Swagger UI + Scalar API Reference
- **Logging**: Winston with daily log rotation
- **File Upload**: Multer (local storage, future AWS S3)
- **Code Quality**: Oxlint + Biome formatter
- **Git Hooks**: Husky with lint-staged

## Key Features

- JWT authentication with access/refresh tokens
- Role-based access control (Customer, Contractor, Admin)
- Real-time chat (Socket.IO - to be implemented)
- Push notifications (Firebase Cloud Messaging)
- Stripe payment processing with escrow
- File upload system
- OTP-based password recovery
- Comprehensive OpenAPI documentation

## User Roles

- **Customer**: Posts jobs, hires contractors, makes payments
- **Contractor**: Offers services, accepts jobs, receives payments
- **Admin**: Monitors platform, manages disputes, oversees transactions

## Development Commands

```bash
pnpm dev              # Start with tsx hot reload
pnpm dev:b            # Start with Bun hot reload
pnpm build            # Build with tsdown
pnpm start            # Start production server
pnpm check            # Run oxlint
pnpm check-types      # TypeScript type checking
pnpm format           # Format with Biome
pnpm generate:module  # Scaffold new API module
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - MongoDB/Neon connection string
- `PORT` - Server port (default: 4000)
- `API_BASE_URL` - Base URL for API
- `CORS_ORIGIN` - Allowed CORS origins
- `ACCESS_SECRET` - JWT access token secret
- `REFRESH_SECRET` - JWT refresh token secret
