<div align="center">

# 🚗 AAW GarageFlow

### Enterprise Dealership Yard & Work Order Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325?style=for-the-badge&logo=jest)](https://jestjs.io/)

<p align="center">
  A high-throughput dealership yard management and work order processing system featuring real-time status pipelines, hardware-accelerated VIN barcode scanning, and clean architecture domain modeling.
</p>

[Overview](#-overview) •
[Architecture & Design](#-architecture--system-design) •
[Tech Stack](#-tech-stack--engineering-rationale) •
[Core Features](#-key-features) •
[Quick Start](#-quick-start) •
[Testing Strategy](#-testing-strategy) •
[Data Model](#-data-model) •
[Available Scripts](#-available-scripts)

</div>

---

## 📌 Overview

**AAW GarageFlow** is an enterprise-grade solution engineered to eliminate bottlenecks in automotive dealership intake, vehicle triage, and service workshop operations.

Traditional pen-and-paper clipboards and fragmented spreadsheets introduce costly tracking gaps. AAW GarageFlow unifies these workflows into a single high-efficiency portal:
- **Instant Inventory Traceability**: Real-time identification and indexing of vehicles by VIN (*Vehicle Identification Number*) utilizing an integrated multi-format optical scanner (Code 39, Code 128, DataMatrix, QR Code) through native device camera feeds.
- **Dynamic Work Order Lifecycle**: Pipeline transitions (`OPEN` ➔ `IN_PROGRESS` ➔ `DONE` ➔ `CANCELLED`) equipped with granular task-level accountability, audit timestamps, and technician attribution.
- **Operational Yard Metrics**: Live throughput dashboard displaying real-time vehicle staging ratios, pending work items, and turnaround metrics.
- **Role-Based Access Control (RBAC)**: Secure stateless authentication with privilege boundaries separating workshop managers (`MANAGER`) and field technicians (`TECHNICIAN`).

---

## 🏛 Architecture & System Design

The application is structured following the principles of **Clean Architecture** and **Domain-Driven Design (DDD)**. The domain layer remains pure and decoupled from user interfaces, external libraries, and data persistence drivers through the **Ports and Adapters (Hexagonal)** pattern.

```mermaid
graph TD
    subgraph UI ["Presentation Layer (Next.js 16 App Router)"]
        Pages["Server Components & App Pages"]
        UIComp["Radix UI + Tailwind Design System"]
        Actions["Client Interactivity & Mutation Handlers"]
    end

    subgraph Core ["Core Domain & Application Layer (Pure TS)"]
        Entities["Domain Entities (Vehicle, WorkOrder, User)"]
        UseCases["Application Use Cases (Business Invariants)"]
        Ports["Repository Interfaces (Ports)"]
    end

    subgraph Infra ["Infrastructure Layer (Adapters)"]
        PrismaRepo["Prisma Repositories (Data Adapters)"]
        NeonDB["Neon Serverless PostgreSQL (Connection Pool)"]
        Security["Bcrypt Engine / NextAuth JWT Provider"]
    end

    Pages --> UseCases
    Actions --> UseCases
    UseCases --> Entities
    UseCases --> Ports
    PrismaRepo -.->|Implements| Ports
    PrismaRepo --> NeonDB
    UseCases --> Security
```

### Directory Structure

```bash
src/
├── app/                  # Next.js App Router (RSC, layouts, route handlers)
│   ├── (auth)/login/     # Isolated, secure authentication entry point
│   ├── vehicles/         # Yard inventory, triage, and intake views
│   ├── work-orders/      # Operational work order boards and detail drawers
│   └── users/            # User & technician administration (Manager-only)
├── components/           # Component hierarchy organized by domain
│   ├── ui/               # Reusable atomic design system (Radix UI + Tailwind)
│   ├── vehicles/         # Inventory cards, intake modals & ZXing barcode scanner
│   ├── work-orders/      # Pipeline status boards, checklist controls & task badges
│   └── dashboard/        # Operational performance metric cards & KPI trackers
├── core/                 # Framework-agnostic business logic (Zero external dependencies)
│   ├── domain/           # Core Entities, Enums, Value Objects & Repository Ports
│   └── use-cases/        # Orchestrated business flows (Auth, Vehicle, Work Order)
├── infrastructure/       # Concrete adapters and third-party integrations
│   ├── database/         # Prisma repository implementations adhering to domain ports
│   └── security/         # Cryptographic hashing & token generation adapters
├── lib/                  # Shared utilities, Prisma client instance, NextAuth options
└── types/                # Project-wide ambient TypeScript declarations
```

---

## ⚡ Tech Stack & Engineering Rationale

| Layer | Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components (RSC) enable instant data rendering with zero client-side waterfall latency. |
| **Language** | TypeScript 5.7 (Strict Mode) | Enforces end-to-end type safety, eliminating entire classes of runtime errors across domain models. |
| **Persistence** | Prisma ORM 7.10 + Neon | Modern serverless PostgreSQL adapter optimized for serverless connection multiplexing and low cold-start overhead. |
| **Authentication** | NextAuth.js v4 (JWT) | Stateless, cryptographically signed tokens with strict role-based access validation. |
| **UI & Styling** | Tailwind CSS + Radix UI | Accessible (WAI-ARIA compliant), unstyled headless primitives styled with predictable utility classes. |
| **Hardware / Vision** | ZXing Browser & Library | Client-side optical barcode decoding (Code 39/128, DataMatrix) directly through mobile/desktop camera streams. |
| **Testing** | Jest + React Testing Library | Unit testing for domain use cases with in-memory test doubles, plus isolated component behavior tests. |

---

## 🚀 Key Features

- [x] **Optical VIN & Barcode Scanner**:
  - Direct scanning of vehicle door-jamb and windshield VIN barcodes via device cameras.
  - Client-side stream decoding with fallback manual entry and instant inventory cross-referencing.
- [x] **Work Order Pipeline & Task Checklists**:
  - Rapid ticket creation linked to vehicles with dynamic ordered checklist items.
  - Per-item completion toggles recording technician identity and precise audit timestamps.
  - Automated status cascade (`DONE` once all checklist tasks are fulfilled).
- [x] **Executive & Yard Dashboard**:
  - Live throughput counters: total vehicles in yard, active vs. completed work orders, and completion ratios.
- [x] **Role-Based Access Control (RBAC)**:
  - `MANAGER`: Unrestricted administrative control (system user management, inventory deletion, fleet analytics).
  - `TECHNICIAN`: Focused execution workspace optimized for quick task sign-offs on mobile and shop-floor displays.

---

## 📦 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or later (LTS recommended)
- **npm** or **pnpm**
- Active **PostgreSQL** instance (local or hosted on [Neon.tech](https://neon.tech))

### 1. Clone the Repository

```bash
git clone https://github.com/rb-belarmino/AAW-GarageFlow.git
cd AAW-GarageFlow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the sample environment file:

```bash
cp .env.example .env
```

Populate `.env` with your database and authentication secrets:

```env
DATABASE_URL="postgresql://user:password@ep-sample-neon.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample-neon.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-32-byte-secret"
NEXTAUTH_URL="http://localhost:3000"
```

> **Tip**: Generate a secure 32-byte secret for `NEXTAUTH_SECRET` using OpenSSL:
> ```bash
> openssl rand -base64 32
> ```

### 4. Database Setup & Seeding

Generate the Prisma client, synchronize the schema, and populate the database with demonstration data:

```bash
# Generate the strongly-typed Prisma Client
npm run prisma:generate

# Synchronize the database schema with the data model
npm run prisma:push

# Seed demo yard inventory, work orders, and default user accounts
npm run seed
```

#### Demo Credentials (from Seed):
| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `Password123!` | `MANAGER` | Full administrative yard & user management permissions |
| `tech1` | `Password123!` | `TECHNICIAN` | Workshop technician view for executing work order tasks |

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Strategy

The repository adheres to a test pyramid emphasizing fast, deterministic domain tests:

```bash
# Run all unit and integration test suites
npm test

# Run isolated test harness suites
npm run test:harness

# Run tests with code coverage analysis
npm test -- --coverage
```

Thanks to the Ports and Adapters architecture, all use cases are tested in isolation using lightweight in-memory repositories without spinning up real database connections or mock servers.

---

## 🗄 Data Model

```mermaid
erDiagram
    SystemUser {
        string id PK
        string username UK
        string passwordHash
        string name
        string role
        boolean isActive
    }

    Vehicle {
        string id PK
        string vin UK
        int year
        string make
        string model
        string color
        string licensePlate
        int currentMileage
        string sourceTag
        string status
    }

    WorkOrder {
        string id PK
        string orderNumber UK
        string vehicleId FK
        string status
        boolean isDone
        datetime completedAt
        string completedBy
        string notes
    }

    WorkOrderItem {
        string id PK
        string workOrderId FK
        string taskText
        boolean isCompleted
        datetime completedAt
        string completedBy
        int orderIndex
    }

    Vehicle ||--o{ WorkOrder : "has"
    WorkOrder ||--o{ WorkOrderItem : "contains"
```

---

## 🛠 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Boots local Next.js development server with hot-reload |
| `npm run build` | Generates Prisma client and compiles optimized production build |
| `npm run start` | Boots production server |
| `npm run lint` | Executes ESLint across all TypeScript and React files |
| `npm run test` | Executes Jest test suites |
| `npm run test:harness` | Runs harness-specific integration tests |
| `npm run prisma:generate` | Emits fresh TypeScript definitions for the Prisma client |
| `npm run prisma:push` | Syncs schema changes directly into the PostgreSQL database |
| `npm run seed` | Runs database seeder populating users, vehicles, and initial work orders |

---

## 👨‍💻 Engineering & Contact

Architected and maintained by **Rodrigo Belarmino**.

For feature proposals, security reports, or technical inquiries, please open an [Issue](https://github.com/rb-belarmino/AAW-GarageFlow/issues) or submit a [Pull Request](https://github.com/rb-belarmino/AAW-GarageFlow/pulls).

---

<div align="center">
  <sub>Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Neon Serverless PostgreSQL.</sub>
</div>
