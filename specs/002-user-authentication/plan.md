# Implementation Plan: User Authentication & Access Control (NextAuth v4)

**Branch**: `002-user-authentication` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: User description: "Adicionar a feature de autenticacao obrigando ao usuario logar no sistema para visualizar e gerenciar o sistema como um todo. NextAuthJS v4, autenticacao simples User/Password (sem email), JWT com expiracao maxima de 6 horas em caso de inatividade."

## Summary

Implement full user authentication, mandatory route protection, and role-based user management for AAW GarageFlow using **NextAuth.js v4** with a custom **CredentialsProvider (Username + Password)**, **JWT session strategy with 6-hour inactivity expiration (`maxAge: 21600`)**, and **Next.js middleware** to enforce login across all system views and API endpoints. Architecture strictly isolates domain business rules (`User`, `AuthenticateUserUseCase`, `CreateUserUseCase`) from NextAuth and Prisma infrastructure details.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js (Next.js 16.3+ App Router, React 19)  
**Primary Dependencies**: `next-auth` (v4.24.11), `bcryptjs`, `@types/bcryptjs`, `@prisma/client`  
**Storage**: PostgreSQL (Prisma ORM with Neon serverless adapter)  
**Testing**: Jest (TDD unit/use-case tests + Integration / Harness tests)  
**Target Platform**: Web (Garage shop floor kiosks, tablets, desktop browsers)  
**Project Type**: Next.js Fullstack Web Application with Clean Architecture  
**Performance Goals**: < 100ms middleware authentication verification; < 500ms login response time  
**Constraints**: 
- Mandatory authentication on all dashboard, vehicle, work-order, and management screens.
- Simple username + password credential mechanism (no email requirement on registration/login).
- JWT session token with maximum 6 hours expiration on inactivity (`maxAge: 21600`).
- Strict Clean Architecture separation (Domain -> Use Cases -> Adapters/Infra -> NextAuth Driver).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Clean Architecture & Domain-Centric Design)**: PASS. `User` entity and `UserRepository` interface live in `src/core/domain`. `AuthenticateUserUseCase`, `CreateUserUseCase`, and `ListUsersUseCase` live in `src/core/use-cases`. NextAuth credentials provider acts purely as an interface adapter in `src/lib/auth.ts` / `src/app/api/auth/[...nextauth]/route.ts`.
- **Principle II (SOLID & Modularity)**: PASS. Single responsibility per use case and repository adapter. Open for extension to additional auth strategies in the future.
- **Principle III (Test-First & Harness-Driven Execution)**: PASS. Unit tests for Domain/Use-Cases and integration harness tests for route interception & auth token verification are scheduled. Red-Green-Refactor will be strictly enforced.
- **Principle IV (UX Consistency & Accessibility)**: PASS. Login page, User Management UI, and header user status utilize existing Tailwind design tokens and Shadcn/Radix components with accessible labels and error states.
- **Principle V (Performance & Observability)**: PASS. Stateless JWT sessions eliminate per-request DB hits on navigation while strictly enforcing the 6-hour window.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-authentication/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Technical decisions and NextAuth v4 configuration
├── data-model.md        # User entity & Prisma schema updates
├── quickstart.md        # Environment, seed, and verification guide
├── contracts/
│   └── auth-contracts.md # API endpoints, middleware behavior, UI contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts               # NextAuth v4 API route handler
│   │   └── users/
│   │       └── route.ts                   # User management API endpoints
│   ├── login/
│   │   └── page.tsx                       # Dedicated Login page
│   ├── users/
│   │   └── page.tsx                       # In-app User Management page
│   ├── layout.tsx                         # Auth SessionProvider wrapper
│   ├── page.tsx                           # Protected Dashboard
│   ├── vehicles/                          # Protected Vehicles views
│   └── work-orders/                       # Protected Work Orders views
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx                  # Username/Password form component
│   │   ├── SessionProviderWrapper.tsx     # Client-side NextAuth SessionProvider
│   │   └── UserNav.tsx                    # User badge and Logout button
│   ├── users/
│   │   ├── UserListTable.tsx              # User table component
│   │   └── CreateUserModal.tsx            # Modal for adding staff accounts
│   └── layout/
│       └── Header.tsx                     # Integrated with active UserNav & /users link
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── User.ts                    # User domain entity
│   │   └── repositories/
│   │       └── UserRepository.ts          # Domain repository interface
│   └── use-cases/
│       └── auth/
│           ├── AuthenticateUserUseCase.ts # Verify username + password
│           ├── CreateUserUseCase.ts       # Hash password & persist user
│           └── ListUsersUseCase.ts        # Retrieve user list
├── infrastructure/
│   ├── database/
│   │   └── repositories/
│   │       └── PrismaUserRepository.ts    # Prisma implementation of UserRepository
│   └── security/
│       └── BcryptPasswordHasher.ts        # Password hashing adapter
├── lib/
│   └── auth.ts                            # NextAuth v4 options & credentials provider config
├── middleware.ts                          # NextAuth middleware enforcing authentication globally
prisma/
├── schema.prisma                          # Updated SystemUser with username & passwordHash
└── seed.ts                                # Seed default admin and technician accounts
tests/
├── unit/
│   ├── User.test.ts                       # Domain entity tests
│   └── AuthenticateUserUseCase.test.ts    # Use case tests
└── harness/
    └── us-auth-interception.test.ts       # Route protection & harness verification
```

**Structure Decision**: Monolithic Next.js project with strictly partitioned Clean Architecture layers (`src/core/domain`, `src/core/use-cases`, `src/infrastructure`, `src/components`, `src/app`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | Standard Clean Architecture implementation | Directly writing DB logic in route handlers rejected per Constitution Principle I. |
