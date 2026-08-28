# Phase 0 Research & Technology Decisions: AAW GarageFlow

## Context & Objectives
AAW GarageFlow is an automotive work order and recurring maintenance tracking system for US dealership fleets. The tech stack and deployment architecture have been specified as:
- **Framework**: Next.js (App Router, version 16.3.3 / Next 15+ App Router paradigms)
- **Language**: TypeScript 5+ (Strict mode)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Prisma ORM with `@prisma/adapter-neon` or `@neondatabase/serverless` connection pooling
- **UI & Styling**: Tailwind CSS with ShadCN UI component primitives (Radix UI)
- **Testing & Harness**: Jest + React Testing Library + End-to-End Evaluation Harness (automated regression test suites)
- **Hosting/Deployment**: Vercel Serverless Edge/Node Runtime

---

## Technical Decisions & Rationale

### 1. Clean Architecture in Next.js App Router
- **Decision**: Implement a decoupled 4-layer Clean Architecture structure within `src/`:
  1. `src/core/domain/`: Pure TypeScript entities (Vehicle, WorkOrder, MaintenanceSchedule), value objects (VIN, Mileage), and repository interfaces. No framework/ORM imports.
  2. `src/core/use-cases/`: Application business workflows (CreateVehicle, CreateWorkOrder, ToggleWorkOrderDone, CheckRecurringSchedules).
  3. `src/infrastructure/`: Prisma client adapter, Neon database repositories, date/mileage evaluators, telemetry/loggers.
  4. `src/presentation/` (and `src/app/`): Next.js App Router pages, Server Actions, API route handlers, and ShadCN UI components.
- **Rationale**: Complies strictly with Constitution Principle I (Clean Architecture) and Principle II (SOLID). Business rules and recurring maintenance calculators remain 100% testable in pure isolation without needing a live database or UI.
- **Alternatives Considered**: 
  - Direct database queries in Next.js Server Components: Rejected because it tightly couples database schemas to UI views, violating Constitution Principle I.

### 2. Database Connection & Pooling (Neon Postgres + Prisma)
- **Decision**: Use Prisma ORM with pooled Neon connection string (`DATABASE_URL`) and direct non-pooling string (`DIRECT_URL`) for migrations. Utilize `@neondatabase/serverless` with WebSocket/HTTP pooling adapter where applicable.
- **Rationale**: Neon serverless Postgres suspends compute when idle and uses connection pooling for serverless functions, preventing connection exhaustion on Vercel.
- **Alternatives Considered**:
  - Raw SQL with pg driver: Rejected due to maintenance overhead, lack of type-safe schema migrations, and slower velocity compared to Prisma.

### 3. Automated Harness & Test-First Architecture
- **Decision**: Establish a dedicated Test Evaluation Harness in `tests/harness/` alongside Jest unit and integration tests (`tests/unit/`, `tests/integration/`).
- **Rationale**: Enforces Constitution Principle III (Test-First & Harness-Driven Execution). The Harness provides a suite of simulated vehicle operations, recurring schedule triggers, and concurrent status check-offs that runs as a non-negotiable verification gate.
- **Alternatives Considered**:
  - Ad-hoc manual testing: Explicitly prohibited by constitution.

### 4. UI Components & UX Performance (ShadCN + Tailwind CSS)
- **Decision**: Initialize ShadCN UI primitives (Table, Dialog, Form, Badge, Button, Input, Textarea, Card, Switch, DropdownMenu) styled with Tailwind CSS in standard dark/light automotive dashboard theme.
- **Rationale**: Delivers consistent, accessible (WCAG compliant) UX and high interaction performance (<1s state transitions, <1.5s FCP) aligning with Constitution Principle IV and Principle V.
