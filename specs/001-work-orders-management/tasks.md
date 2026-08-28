# Tasks: AAW GarageFlow (Vehicle Work Orders & Recurring Maintenance)

**Feature Branch**: `001-work-orders-management`
**Input**: Design artifacts from `specs/001-work-orders-management/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/api-contracts.md`, `research.md`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Next.js 15+ App Router, Tailwind CSS, ShadCN UI primitives, Jest, and Prisma setup.

- [X] T001 Initialize Next.js project with TypeScript, Tailwind CSS, ESLint, and PostCSS in repository root
- [X] T002 Configure Jest and React Testing Library in `jest.config.ts` and `package.json`
- [X] T003 [P] Initialize Prisma with Neon Postgres connection settings in `prisma/schema.prisma` and `.env.example`
- [X] T004 [P] Setup ShadCN UI configuration and utilities in `components.json` and `src/lib/utils.ts`
- [X] T005 [P] Setup Clean Architecture directory structure (`src/core/domain/`, `src/core/use-cases/`, `src/infrastructure/`, `src/presentation/`, `src/app/`, `tests/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Clean Architecture entities, repository interfaces, Prisma database client, and the Test Evaluation Harness base.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Define Prisma models (`Vehicle`, `WorkOrder`, `MaintenanceSchedule`, `SystemUser`) in `prisma/schema.prisma` per `data-model.md`
- [X] T007 [P] Create Prisma Client singleton and Neon connection pooling in `src/infrastructure/database/prisma.ts`
- [X] T008 [P] Define core domain entities (`Vehicle`, `WorkOrder`, `MaintenanceSchedule`) with pure TypeScript in `src/core/domain/entities/`
- [X] T009 [P] Define repository interfaces (`IVehicleRepository`, `IWorkOrderRepository`, `IScheduleRepository`) in `src/core/domain/repositories/`
- [X] T010 [P] Implement Prisma repositories (`PrismaVehicleRepository`, `PrismaWorkOrderRepository`, `PrismaScheduleRepository`) in `src/infrastructure/database/repositories/`
- [X] T011 Create base Test Evaluation Harness runner in `tests/harness/garage-flow-harness.test.ts`
- [X] T012 [P] Setup base App layout and navigation header (English US, AAW Dealer branding) in `src/app/layout.tsx` and `src/components/layout/Header.tsx`

**Checkpoint**: Foundation ready - domain entities, persistence adapters, and testing harness verified.

---

## Phase 3: User Story 1 - Vehicle Inventory & Free-Form Work Order Management (Priority: P1) 🎯 MVP

**Goal**: Enable managers and technicians to register vehicles (Year, Make/Model, Color, VIN, Source Tag) and create/manage Work Orders with free-form "To Do" repair text and single-click Done toggles (✓).

**Independent Test**: Create a vehicle record, dispatch a work order with "To Do" text (e.g. "take photos / upload at Deal center: detailing clean - Buy Fuel cap"), click Done toggle, verify status updates to "DONE" with timestamp.

### Tests for User Story 1
- [X] T013 [P] [US1] Unit test for Vehicle domain entity & `CreateVehicleUseCase` in `tests/unit/use-cases/CreateVehicle.test.ts`
- [X] T014 [P] [US1] Unit test for WorkOrder domain entity & `ToggleWorkOrderDoneUseCase` in `tests/unit/use-cases/ToggleWorkOrderDone.test.ts`
- [X] T015 [P] [US1] Integration harness test for vehicle creation & work order lifecycle in `tests/harness/us1-work-orders.test.ts`

### Implementation for User Story 1
- [X] T016 [P] [US1] Implement `CreateVehicleUseCase`, `ListVehiclesUseCase`, and `GetVehicleByVinUseCase` in `src/core/use-cases/vehicle/`
- [X] T017 [P] [US1] Implement `CreateWorkOrderUseCase`, `ToggleWorkOrderDoneUseCase`, and `ListWorkOrdersUseCase` in `src/core/use-cases/work-order/`
- [X] T018 [US1] Implement Server Actions / API Route Handlers for Vehicles (`/api/vehicles`) in `src/app/api/vehicles/route.ts`
- [X] T019 [US1] Implement Server Actions / API Route Handlers for Work Orders (`/api/work-orders`, `/api/work-orders/[id]/toggle-done`) in `src/app/api/work-orders/route.ts`
- [X] T020 [P] [US1] Build ShadCN UI components (Button, Dialog, Input, Textarea, Table, Badge, Switch, Card) in `src/components/ui/`
- [X] T021 [US1] Build Vehicle Registration dialog & table component in `src/components/vehicles/VehicleManagement.tsx`
- [X] T022 [US1] Build Work Order board with free-form "To Do" editor and live Done toggle (✓) in `src/components/work-orders/WorkOrderBoard.tsx`
- [X] T023 [US1] Connect Vehicle & Work Order views in `src/app/work-orders/page.tsx` and `src/app/vehicles/page.tsx`

**Checkpoint**: User Story 1 (MVP) is fully functional and verifiable with the automated test harness.

---

## Phase 4: User Story 2 - Recurring Maintenance Schedules & Automated Service Dispatch (Priority: P2)

**Goal**: Define recurring maintenance intervals (mileage / time-based) that automatically generate and dispatch active "Open / In Progress" Work Orders directly into technician queues.

**Independent Test**: Set a 5,000-mile or 6-month maintenance schedule, trigger evaluation against a vehicle exceeding threshold, verify an active "IN_PROGRESS" Work Order is auto-dispatched with populated "To Do" instructions.

### Tests for User Story 2
- [X] T024 [P] [US2] Unit test for `EvaluateRecurringSchedulesUseCase` and date/mileage evaluator in `tests/unit/use-cases/EvaluateRecurringSchedules.test.ts`
- [X] T025 [P] [US2] Integration harness test for recurring maintenance trigger & automated queue dispatch in `tests/harness/us2-recurring-maintenance.test.ts`

### Implementation for User Story 2
- [X] T026 [P] [US2] Implement threshold evaluator utility (mileage & date calculations) in `src/infrastructure/evaluators/ScheduleEvaluator.ts`
- [X] T027 [P] [US2] Implement `CreateScheduleUseCase` and `EvaluateRecurringSchedulesUseCase` in `src/core/use-cases/schedule/`
- [X] T028 [US2] Implement Schedule API route / Server Action (`/api/schedules/evaluate`, `/api/schedules`) in `src/app/api/schedules/route.ts`
- [X] T029 [US2] Build Maintenance Schedule management and trigger UI panel in `src/components/schedules/ScheduleConfigurator.tsx`
- [X] T030 [US2] Integrate recurring maintenance overview and manual "Run Evaluation" trigger into `src/app/schedules/page.tsx`

**Checkpoint**: User Story 2 is fully operational, automatically dispatching maintenance orders upon threshold criteria.

---

## Phase 5: User Story 3 - Dealership Fleet Overview & Status Dashboard (Priority: P3)

**Goal**: Executive dashboard displaying fleet inventory metrics, completed vs. open jobs counter (reproducing "9/0 Done"), overdue maintenance alerts, and VIN search.

**Independent Test**: Load main dashboard with active/completed work orders, verify real-time metric counter, VIN search filter, and overdue maintenance badge displays.

### Tests for User Story 3
- [X] T031 [P] [US3] Unit test for Dashboard summary aggregation in `tests/unit/use-cases/GetDashboardMetrics.test.ts`
- [X] T032 [P] [US3] Integration harness test for dashboard metrics and filtering in `tests/harness/us3-dashboard.test.ts`

### Implementation for User Story 3
- [X] T033 [P] [US3] Implement `GetDashboardMetricsUseCase` in `src/core/use-cases/dashboard/GetDashboardMetricsUseCase.ts`
- [X] T034 [US3] Build metric cards widget (Total Vehicles, Active Work Orders, "X/Y Done" Ratio, Maintenance Due) in `src/components/dashboard/MetricCards.tsx`
- [X] T035 [US3] Build global search and filter bar (by VIN, Make/Model, Source Tag, Status) in `src/components/dashboard/GlobalSearchBar.tsx`
- [X] T036 [US3] Assemble unified Fleet Overview Dashboard in `src/app/page.tsx`

**Checkpoint**: All three User Stories are integrated and independently functional.

---

## Phase 6: Polish, Legacy Data Seed & Harness Verification

**Purpose**: End-to-end integration, automated spreadsheet migration seed, full test harness execution, performance validation, and documentation.

- [X] T037 Create automated database seed script in `prisma/seed.ts` migrating all 9 vehicles and free-form "To Do" tasks from `Dealer cars _ to do.xlsx` (Genesis, Pacifica, Equinox, Forte, Tesla Model, Soul, Jeep Sahara, Elantra, Evoque)
- [X] T038 [P] Execute full Jest test suite (`npm test`) and comprehensive Test Evaluation Harness (`npm run test:harness`)
- [X] T039 Validate English US localization across all components, tooltips, dialogs, and error messages
- [X] T040 Complete quickstart verification per `specs/001-work-orders-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Completed.
- **Phase 2 (Foundational)**: Completed.
- **Phase 3 (User Story 1 - MVP)**: Completed.
- **Phase 4 (User Story 2)**: Completed.
- **Phase 5 (User Story 3)**: Completed.
- **Phase 6 (Polish & Harness)**: Completed.
