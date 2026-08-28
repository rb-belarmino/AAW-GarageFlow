# Implementation Plan: AAW GarageFlow (Vehicle Work Orders & Recurring Maintenance)

**Branch**: `001-work-orders-management` | **Date**: 2026-08-28 | **Spec**: [specs/001-work-orders-management/spec.md](spec.md)

**Input**: User technical choices: Next.js (App Router), Neon Serverless Postgres, Prisma ORM, Tailwind CSS + ShadCN UI, Jest testing with Test Evaluation Harness, deployed to Vercel.

## Summary

Build a high-performance, English-only automotive work order and recurring maintenance tracking web application. The solution replaces legacy spreadsheet logs with a clean, responsive garage dashboard, free-form "To Do" repair tracking with single-click completion toggles (✓), automated recurring maintenance evaluation and queue dispatch, and robust Clean Architecture domain layer verified via Jest and automated evaluation harnesses.

## Technical Context

**Language/Version**: TypeScript 5.5+ (Strict Mode), Node.js 20+ LTS

**Primary Dependencies**: Next.js 15+ (App Router), React 19, Prisma ORM `@prisma/client`, Lucide React icons, Class Variance Authority (`cva`), `clsx`, `tailwind-merge`

**Storage**: Neon Serverless PostgreSQL with connection pooling via Prisma ORM

**UI & Components**: Tailwind CSS v3/v4, ShadCN UI component primitives (Radix UI)

**Testing**: Jest + React Testing Library + Custom AAW GarageFlow Evaluation Test Harness (`tests/harness/`)

**Target Platform**: Vercel (Edge & Node.js Serverless Runtime), Modern Desktop & Tablet Browsers

**Project Type**: Fullstack Web Application (Next.js App Router with Server Actions & Clean Architecture Core)

**Performance Goals**: <1.5s First Contentful Paint (FCP), <100ms optimistic UI toggles, <1s real-time list filtering

**Constraints**: 100% English US automotive terminology, strict Clean Architecture inward dependency rule, zero TypeScript errors, mandatory test harness pass

**Scale/Scope**: Fleet management for multiple dealer car inventories, hundreds of active work orders and recurring maintenance schedules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check / Status | Compliance Detail |
|---|---|---|
| **I. Clean Architecture** | PASS | Pure domain entities & use cases in `src/core/` completely decoupled from Next.js / Prisma. Inward dependency rule strictly enforced. |
| **II. SOLID Principles** | PASS | Single responsibility for use cases, open/closed for recurring schedule evaluators, dependency inversion using repository interfaces. |
| **III. Test-First & Harness** | PASS | Jest unit test suites for all use cases + automated evaluation harness (`tests/harness/garage-flow-harness.test.ts`). |
| **IV. UX Consistency** | PASS | ShadCN UI components, design tokens, accessible dialogs/tables, handling of all loading, empty, and error states. |
| **V. Performance & Observability** | PASS | Server Components for instant data loading, client components optimized for snappy optimistic toggles, structured error telemetry. |

## Project Structure

### Documentation (this feature)

```text
specs/001-work-orders-management/
├── spec.md              # Feature specification & clarifications
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 tech choices & architecture decisions
├── data-model.md        # Phase 1 Prisma schema & state transitions
├── contracts/           # Phase 1 API & action contracts
│   └── api-contracts.md
├── quickstart.md        # Phase 1 setup & verification guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── app/                                 # Next.js App Router (Presentation & Routing)
│   ├── layout.tsx
│   ├── page.tsx                         # GarageFlow Main Dashboard (Summary, Fleet, Work Orders)
│   ├── vehicles/
│   │   └── page.tsx                     # Vehicle Inventory Page
│   ├── work-orders/
│   │   └── page.tsx                     # Work Order Board & Free-Form To Do Editor
│   ├── schedules/
│   │   └── page.tsx                     # Recurring Maintenance Schedules
│   ├── api/                             # API route handlers
│   └── globals.css
├── components/                          # UI & ShadCN Components
│   ├── ui/                              # ShadCN primitives (button, dialog, table, badge, input, textarea, card, switch)
│   ├── dashboard/                       # Dashboard summary widgets & metric counters (Done / In Progress)
│   ├── vehicles/                        # Vehicle creation dialog & details table
│   ├── work-orders/                     # Work order list, free-text To Do editor, quick toggle checkbox
│   └── schedules/                       # Maintenance schedule configurator & trigger panel
├── core/                                # Clean Architecture Core (Zero External Framework Dependencies)
│   ├── domain/
│   │   ├── entities/                    # Vehicle, WorkOrder, MaintenanceSchedule
│   │   ├── repositories/                # IVehicleRepository, IWorkOrderRepository, IScheduleRepository
│   │   └── value-objects/               # VIN, Mileage
│   └── use-cases/                       # Application Business Workflows
│       ├── vehicle/                     # CreateVehicle, ListVehicles, UpdateMileage
│       ├── work-order/                  # CreateWorkOrder, ToggleWorkOrderDone, ListWorkOrders
│       └── schedule/                    # CreateSchedule, EvaluateRecurringSchedules
├── infrastructure/                      # Clean Architecture Adapters & Drivers
│   ├── database/
│   │   ├── prisma.ts                    # Prisma Client Singleton for Neon
│   │   └── repositories/                # PrismaVehicleRepository, PrismaWorkOrderRepository, PrismaScheduleRepository
│   └── evaluators/                      # Date & Mileage threshold evaluators
└── lib/                                 # Utilities (utils.ts for cn helper, formatting)

prisma/
└── schema.prisma                        # Neon Postgres Schema

tests/
├── unit/                                # Core domain & use case unit tests
├── integration/                         # Prisma repository & database integration tests
└── harness/                             # Non-negotiable AAW GarageFlow Evaluation Test Harness
```

**Structure Decision**: Single Next.js Fullstack project structure with strict Clean Architecture layering under `src/core/`, ensuring domain purity and testability with Jest, combined with modern Next.js 15 App Router server actions and ShadCN UI in `src/app/` and `src/components/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | All patterns directly align with Constitution (Clean Architecture + SOLID + Test Harness). | Direct Prisma calls in UI components were rejected due to architecture coupling violations. |
