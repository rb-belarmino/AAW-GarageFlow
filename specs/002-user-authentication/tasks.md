# Tasks: User Authentication & Access Control (NextAuth.js v4)

**Feature Branch**: `002-user-authentication`  
**Input**: User stories and requirements from `specs/002-user-authentication/spec.md` and `plan.md`

---

## Phase 1: Setup (Dependencies & Configuration)

**Purpose**: Project dependencies and authentication environment setup

- [x] T001 Install NextAuth v4 and bcrypt dependencies in `package.json` (`next-auth@^4.24.11`, `bcryptjs`, `@types/bcryptjs`)
- [x] T002 Configure environment variables in `.env` / `.env.local` (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`)

---

## Phase 2: Foundational (Domain, Storage & Hashing Core)

**Purpose**: Core Clean Architecture domain entities, repository interfaces, password hashing adapter, and database schema

**⚠️ CRITICAL**: Must be completed before implementing user stories and route protection.

- [x] T003 Update Prisma schema with `SystemUser` (fields: `username`, `passwordHash`, `name`, `role`, `isActive`) in `prisma/schema.prisma`
- [x] T004 Run Prisma db push to sync PostgreSQL schema in `prisma/schema.prisma`
- [x] T005 [P] Create User domain entity and validation rules in `src/core/domain/entities/User.ts`
- [x] T006 [P] Create UserRepository domain interface in `src/core/domain/repositories/UserRepository.ts`
- [x] T007 [P] Implement BcryptPasswordHasher security adapter in `src/infrastructure/security/BcryptPasswordHasher.ts`
- [x] T008 Implement PrismaUserRepository database repository in `src/infrastructure/database/repositories/PrismaUserRepository.ts`
- [x] T009 Update database seed script with default accounts (admin / tech1) in `prisma/seed.ts`

**Checkpoint**: Core domain, data access layer, and hashing adapters ready and verified.

---

## Phase 3: User Story 1 - Mandatory Login to Access the System (Priority: P1) 🎯 MVP

**Goal**: Block unauthenticated visitors from accessing dashboard, work orders, and vehicle inventory; authenticate staff via username/password with 6h JWT session.

**Independent Test**: Requesting `/`, `/work-orders`, or `/vehicles` as a guest redirects to `/login`. Submitting `admin` and `Password123!` authenticates the user and navigates to the requested page.

### Tests for User Story 1 ⚠️

- [x] T010 [P] [US1] Unit test for AuthenticateUserUseCase in `tests/unit/AuthenticateUserUseCase.test.ts`
- [x] T011 [P] [US1] Route protection and authentication harness test in `tests/harness/us-auth-interception.test.ts`

### Implementation for User Story 1

- [x] T012 [US1] Implement AuthenticateUserUseCase in `src/core/use-cases/auth/AuthenticateUserUseCase.ts`
- [x] T013 [US1] Configure NextAuth v4 CredentialsProvider, 6h JWT maxAge, and callbacks in `src/lib/auth.ts`
- [x] T014 [US1] Create NextAuth catch-all API route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [x] T015 [US1] Implement NextAuth SessionProvider wrapper component in `src/components/auth/SessionProviderWrapper.tsx`
- [x] T016 [US1] Integrate SessionProviderWrapper into root layout in `src/app/layout.tsx`
- [x] T017 [US1] Create LoginForm component with username & password inputs in `src/components/auth/LoginForm.tsx`
- [x] T018 [US1] Create dedicated Login page in `src/app/login/page.tsx`
- [x] T019 [US1] Implement global Next.js auth middleware protecting routes in `src/middleware.ts`

**Checkpoint**: System requires login for all operational pages. Valid username/password grants 6h JWT session access.

---

## Phase 4: User Story 2 - User Session Termination (Logout) (Priority: P2)

**Goal**: Allow authenticated operators to securely sign out from any view, terminating the session and preventing back-navigation access.

**Independent Test**: Sign in, click "Sign Out", verify redirection to `/login` and confirm that accessing protected routes immediately redirects back to `/login`.

### Implementation for User Story 2

- [x] T020 [US2] Implement Sign Out action and session clearing in `src/components/auth/UserNav.tsx`
- [x] T021 [US2] Integrate UserNav sign-out controls into main header navigation in `src/components/layout/Header.tsx`

**Checkpoint**: Users can securely terminate their session from the top navigation bar.

---

## Phase 5: User Story 3 - Authenticated User Identity Context (Priority: P3)

**Goal**: Display the active operator's full name, username badge, and role in the navigation header across all screens.

**Independent Test**: Log in with different accounts (e.g. `admin` vs `tech1`), confirm the top navigation dynamically reflects their name, username, and assigned role.

### Implementation for User Story 3

- [x] T022 [US3] Extend NextAuth JWT and Session types to include username and role in `src/types/next-auth.d.ts`
- [x] T023 [US3] Update UserNav to render user avatar, name, username, and role badge in `src/components/auth/UserNav.tsx`

**Checkpoint**: Logged-in user context is visible throughout the application.

---

## Phase 6: User Story 4 - In-App User Management (Priority: P4)

**Goal**: Allow Managers/Admins to create and view staff user accounts (username, password, role) from a dedicated UI.

**Independent Test**: Sign in as a Manager, navigate to `/users`, create a new technician account with username `tech2` and password `Password123!`, log out and verify `tech2` can log in.

### Tests for User Story 4 ⚠️

- [x] T024 [P] [US4] Unit test for CreateUserUseCase and ListUsersUseCase in `tests/unit/UserManagementUseCases.test.ts`

### Implementation for User Story 4

- [x] T025 [P] [US4] Implement CreateUserUseCase in `src/core/use-cases/auth/CreateUserUseCase.ts`
- [x] T026 [P] [US4] Implement ListUsersUseCase in `src/core/use-cases/auth/ListUsersUseCase.ts`
- [x] T027 [US4] Create user management API routes (`GET /api/users`, `POST /api/users`) in `src/app/api/users/route.ts`
- [x] T028 [P] [US4] Create CreateUserModal dialog component in `src/components/users/CreateUserModal.tsx`
- [x] T029 [P] [US4] Create UserListTable component in `src/components/users/UserListTable.tsx`
- [x] T030 [US4] Build User Management page in `src/app/users/page.tsx`
- [x] T031 [US4] Add User Management navigation link for Managers/Admins in `src/components/layout/Header.tsx`

**Checkpoint**: Managers can manage and create staff accounts from the UI without database scripts.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification, test harness execution, and final cleanup

- [x] T032 [P] Run seed script to ensure sample accounts are populated (`npm run seed`)
- [x] T033 Execute full test harness and Jest suite (`npm test`)
- [x] T034 Run build and lint verification (`npm run build`)
- [x] T035 Execute quickstart verification walkthrough per `specs/002-user-authentication/quickstart.md`
