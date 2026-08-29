# Authentication API & UI Contracts

**Feature**: 002-user-authentication  
**Status**: Completed  
**Date**: 2026-08-29  

## 1. NextAuth Endpoint Routes (`/api/auth/[...nextauth]`)

Managed standard endpoints powered by NextAuth.js v4 (with JWT session strategy, 6h maxAge):

### `POST /api/auth/callback/credentials`
- **Purpose**: Authenticate user credentials using Username and Password.
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Password123!",
    "redirect": false,
    "csrfToken": "<csrf-token>"
  }
  ```
- **Response Success (200 OK)**:
  - Sets HTTP-only, secure session cookie `next-auth.session-token` (TTL 6 hours).
  - Body:
    ```json
    {
      "url": "/",
      "status": 200,
      "ok": true,
      "error": null
    }
    ```
- **Response Failure (401 Unauthorized)**:
  - Body:
    ```json
    {
      "error": "CredentialsSignin",
      "status": 401,
      "ok": false,
      "url": null
    }
    ```

### `POST /api/auth/signout`
- **Purpose**: Invalidate current session and clear session cookies.
- **Response**: Clears `next-auth.session-token` cookie and redirects to `/login`.

### `GET /api/auth/session`
- **Purpose**: Retrieve active session payload.
- **Response (Authenticated)**:
  ```json
  {
    "user": {
      "id": "uuid-1234",
      "username": "admin",
      "name": "Shop Admin",
      "role": "MANAGER"
    },
    "expires": "2026-08-29T15:22:40.000Z"
  }
  ```

---

## 2. User Management API Endpoints (`/api/users`)

### `GET /api/users`
- **Access**: Restricted to authenticated Managers / Admins.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "user-uuid-1",
      "username": "admin",
      "name": "Shop Administrator",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-08-29T10:00:00Z"
    }
  ]
  ```

### `POST /api/users`
- **Access**: Restricted to authenticated Managers / Admins.
- **Request Body**:
  ```json
  {
    "username": "tech2",
    "password": "Password123!",
    "name": "Carlos Mechanic",
    "role": "TECHNICIAN"
  }
  ```
- **Response (201 Created)**: Returns created user object (excluding `passwordHash`).

---

## 3. UI Component Contracts

### `<LoginForm />` (Page: `/login`)
- **Inputs**:
  - `username` (text input, required, placeholder: "Enter username")
  - `password` (password input, required, placeholder: "••••••••")
- **Actions**:
  - `submit`: Calls `signIn("credentials", { username, password, redirect: false })`.
  - Error Feedback: Accessible alert banner on invalid credentials.

### `<UserNav />` (Header Component)
- Shows logged in user's full name, username badge, and role.
- Contains accessible "Sign Out" button triggering `signOut({ callbackUrl: "/login" })`.
- If role is `MANAGER` or `ADMIN`, displays navigation link to `/users` (User Management).
