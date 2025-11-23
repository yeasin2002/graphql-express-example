# GraphQL API Documentation

## Overview

JobSphere GraphQL API provides a modern, type-safe interface for user management and authentication. Built with GraphQL Yoga and integrated with JWT authentication.

**GraphQL Endpoint:** `http://localhost:4000/graphql`  
**GraphiQL Playground:** Available at the same endpoint (development only)

---

## Quick Start

### 1. Start the Server

```bash
pnpm dev
```

### 2. Access GraphiQL Playground

Open your browser and navigate to: `http://localhost:4000/graphql`

### 3. Try Your First Query

```graphql
query GetAllUsers {
  users {
    id
    name
    email
    role
  }
}
```

> **Note:** This query requires authentication. See [Authentication](#authentication) section below.

---

## Authentication

### How It Works

1. **Register** a new user account
2. **Login** to receive JWT tokens
3. Include the **access token** in request headers
4. Access **protected** queries and mutations

### Setting Headers in GraphiQL

Click on "Headers" at the bottom of GraphiQL and add:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

---

## Schema

### Types

#### User

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
```

#### UserRole Enum

```graphql
enum UserRole {
  CUSTOMER
  CONTRACTOR
  ADMIN
}
```

#### AuthPayload

```graphql
type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}
```

#### SuccessResponse

```graphql
type SuccessResponse {
  success: Boolean!
  message: String!
}
```

---

## Queries

### users

Get all users (requires authentication).

**Query:**
```graphql
query GetAllUsers {
  users {
    id
    email
    name
    role
    phone
    isSuspend
  }
}
```

**Headers Required:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "1",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "customer",
        "phone": "+1234567890",
        "isSuspend": false
      }
    ]
  }
}
```

---

### user(id)

Get a single user by ID.

**Query:**
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    name
    role
    createdAt
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "1",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "customer",
      "createdAt": "2025-11-23T04:49:00.000Z"
    }
  }
}
```

---

### me

Get the currently authenticated user (requires authentication).

**Query:**
```graphql
query GetCurrentUser {
  me {
    id
    email
    name
    role
    phone
    createdAt
    updatedAt
  }
}
```

**Headers Required:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Response:**
```json
{
  "data": {
    "me": {
      "id": "1",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "customer",
      "phone": "+1234567890",
      "createdAt": "2025-11-23T04:49:00.000Z",
      "updatedAt": "2025-11-23T04:49:00.000Z"
    }
  }
}
```

---

## Mutations

### register

Register a new user account.

**Mutation:**
```graphql
mutation RegisterUser($input: RegisterInput!) {
  register(input: $input) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "role": "CUSTOMER",
    "phone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "data": {
    "register": {
      "success": true,
      "message": "User registered successfully"
    }
  }
}
```

**Input Fields:**
- `email` (String, required) - Valid email address
- `password` (String, required) - User password (will be hashed)
- `name` (String, required) - Full name
- `role` (UserRole, required) - CUSTOMER, CONTRACTOR, or ADMIN
- `phone` (String, optional) - Phone number

---

### login

Authenticate and receive JWT tokens.

**Mutation:**
```graphql
mutation LoginUser($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
}
```

**Response:**
```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "1",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "customer"
      }
    }
  }
}
```

**Token Information:**
- **Access Token:** Expires in 15 days (configurable)
- **Refresh Token:** Expires in 30 days, used for token rotation
- Store tokens securely on the client side

---

### updateUser

Update user information (requires authentication and ownership/admin rights).

**Mutation:**
```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    phone
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "1",
  "input": {
    "name": "John Updated Doe",
    "phone": "+9876543210"
  }
}
```

**Headers Required:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Response:**
```json
{
  "data": {
    "updateUser": {
      "id": "1",
      "name": "John Updated Doe",
      "phone": "+9876543210",
      "updatedAt": "2025-11-23T05:30:00.000Z"
    }
  }
}
```

**Authorization:**
- Users can only update their own profile
- Admins can update any user profile

---

### deleteUser

Delete a user account (requires authentication and ownership/admin rights).

**Mutation:**
```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "id": "1"
}
```

**Headers Required:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

**Response:**
```json
{
  "data": {
    "deleteUser": {
      "success": true,
      "message": "User deleted successfully"
    }
  }
}
```

**Authorization:**
- Users can only delete their own account
- Admins can delete any user account

---

## Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Error message here",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHENTICATED` | No valid authentication token provided |
| `FORBIDDEN` | Insufficient permissions for this operation |
| `BAD_USER_INPUT` | Invalid input data (e.g., wrong password, duplicate email) |

### Example Errors

**Unauthenticated:**
```json
{
  "errors": [
    {
      "message": "Unauthorized - Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**Invalid Credentials:**
```json
{
  "errors": [
    {
      "message": "Invalid email or password",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

**Account Suspended:**
```json
{
  "errors": [
    {
      "message": "Account is suspended",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

**Duplicate Email:**
```json
{
  "errors": [
    {
      "message": "User with this email already exists",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

---

## Complete Example Workflow

### 1. Register a New User

```graphql
mutation {
  register(input: {
    email: "alice@example.com"
    password: "Alice123!"
    name: "Alice Smith"
    role: CONTRACTOR
    phone: "+1987654321"
  }) {
    success
    message
  }
}
```

### 2. Login

```graphql
mutation {
  login(input: {
    email: "alice@example.com"
    password: "Alice123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}
```

**Copy the `accessToken` from the response!**

### 3. Get Current User Profile

Set headers:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Query:
```graphql
query {
  me {
    id
    email
    name
    role
    phone
  }
}
```

### 4. Update Profile

```graphql
mutation {
  updateUser(id: "2", input: {
    name: "Alice Johnson"
    phone: "+1555555555"
  }) {
    id
    name
    phone
    updatedAt
  }
}
```

### 5. Get All Users

```graphql
query {
  users {
    id
    name
    email
    role
  }
}
```

---

## Best Practices

### Security

1. **Always use HTTPS in production**
2. **Store tokens securely** (e.g., HttpOnly cookies or secure storage)
3. **Never log or expose tokens**
4. **Implement token refresh** before access token expires
5. **Use strong passwords** (minimum 8 characters, mixed case, numbers)

### Performance

1. **Request only needed fields** - GraphQL allows you to specify exactly what data you need
2. **Use variables** instead of inline values for reusability
3. **Batch related queries** when possible

### Development

1. **Use GraphiQL** for testing and exploration
2. **Enable introspection** in development (disabled in production)
3. **Check schema documentation** in GraphiQL for available fields
4. **Test error scenarios** to understand error handling

---

## Additional Resources

- **GraphiQL Playground:** `http://localhost:4000/graphql`
- **REST API Docs:** `http://localhost:4000/swagger`
- **Scalar API Reference:** `http://localhost:4000/scaler`

For database management, see [Database Documentation](./database.md).
