# Research & Technical Decisions: User Authentication & Access Control

**Feature**: 002-user-authentication  
**Status**: Completed  
**Date**: 2026-08-29  

## Technical Decisions

### Decision 1: Authentication Engine & Protocol
- **Decision**: Use `next-auth` (NextAuth.js v4) with `CredentialsProvider` and JWT Session Strategy.
- **Documentation Reference**: https://next-auth.js.org/getting-started/introduction
- **Rationale**: 
  - Standardized authentication layer for Next.js App Router applications.
  - Native API handler (`/api/auth/[...nextauth]/route.ts`) handles CSRF tokens, secure HTTP-only cookies, and session encryption out-of-the-box.
  - The `authorize` callback cleanly delegates to our Clean Architecture application use case (`AuthenticateUserUseCase`).
- **Alternatives Considered**:
  - Custom JWT in cookies with raw route handlers: Requires bespoke cookie encryption, CSRF mitigation, and custom React hook bindings.
  - NextAuth v5 (Auth.js beta): NextAuth v4 is explicitly required by user requirements.

### Decision 2: Username & Password Authentication Model (No Email required)
- **Decision**: Update Prisma schema to store `username` (unique) and `passwordHash` (hashed with `bcryptjs`), completely removing email from login and registration requirements.
- **Rationale**: 
  - Fulfills the explicit instruction: *"A autenticacao sera de forma simples. User, Password. Nao ira utilizar email no cadastro, apenas usuario e senha."*
  - Fast kiosk/terminal usage in a workshop setting where staff use short usernames (e.g., `admin`, `tech1`).
- **Alternatives Considered**:
  - Requiring emails: Unnecessary friction and contrary to user specification.

### Decision 3: Session Expiration & Inactivity (Max 6 Hours)
- **Decision**: Configure NextAuth session configuration with `strategy: "jwt"` and `maxAge: 6 * 60 * 60` (21,600 seconds / 6 hours).
- **Rationale**:
  - Fulfills the requirement: *"Tera JWT e limite de tempo que o usuario ficara autenticado em no maximo 6 horas em caso de inatividade."*
  - JWT tokens allow stateless verification in Next.js middleware without database queries on every navigation, while automatically invalidating when exceeding 6 hours.
- **Alternatives Considered**:
  - Database-persisted sessions: Higher latency and unnecessary database load for simple credential session tracking.

### Decision 4: Global Route Protection & Middleware
- **Decision**: Implement Next.js `middleware.ts` using NextAuth `withAuth` to protect all application routes (`/`, `/work-orders/*`, `/vehicles/*`, `/users/*`, `/api/work-orders/*`, `/api/vehicles/*`, `/api/users/*`), leaving only `/login`, `/api/auth/*`, and static assets public.
- **Rationale**:
  - Ensures complete server-side access control, eliminating unauthorized HTML rendering or client-side data leaks.
  - Automatically captures and redirects to intended `callbackUrl` upon successful sign-in.
- **Alternatives Considered**:
  - Client-side-only `useEffect` guards: Prone to layout flashes and data exposure before redirection triggers.

### Decision 5: In-App User Management (`/users`)
- **Decision**: Provide a dedicated Manager/Admin UI (`/users`) and Clean Architecture use cases (`CreateUserUseCase`, `ListUsersUseCase`, `DeleteUserUseCase`) to manage shop technicians and staff.
- **Rationale**:
  - Fulfills clarified User Story 4, allowing administrators to onboard technicians without touching database scripts directly.
- **Alternatives Considered**:
  - Seed-only provisioning: Limits shop managers from managing technician turnover directly from the UI.

### Decision 6: Clean Architecture & SOLID Adherence
- **Decision**: Keep NextAuth strictly in the Interface Adapters / Infrastructure layer. 
  - `User` entity & `UserRepository` interface live in `src/core/domain/`.
  - `AuthenticateUserUseCase` and `CreateUserUseCase` live in `src/core/use-cases/auth/`.
  - NextAuth's `authorize` callback simply invokes `AuthenticateUserUseCase.execute()`.
- **Rationale**:
  - Guarantees strict compliance with Constitution Principles I & II.
