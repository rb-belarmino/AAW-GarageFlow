# Phase 1 Data Model: AAW GarageFlow

## Overview
The data model supports vehicle fleet tracking, free-form work order checklists with quick completion toggles, recurring maintenance schedules, and audit trails.

---

## Prisma Schema Specification

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum WorkOrderStatus {
  OPEN
  IN_PROGRESS
  DONE
  CANCELLED
}

enum ScheduleRecurrenceType {
  TIME_BASED
  MILEAGE_BASED
  BOTH
}

model Vehicle {
  id              String                @id @default(uuid())
  vin             String                @unique // 17-character standard VIN
  year            Int
  make            String
  model           String
  trim            String?
  color           String
  licensePlate    String?
  currentMileage  Int                   @default(0)
  sourceTag       String                @default("AAW Dealer")
  status          String                @default("ACTIVE") // ACTIVE, ARCHIVED, SOLD
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  workOrders      WorkOrder[]
  schedules       MaintenanceSchedule[]

  @@index([vin])
  @@index([sourceTag])
  @@index([status])
}

model WorkOrder {
  id              String          @id @default(uuid())
  orderNumber     String          @unique // e.g. "WO-1001"
  vehicleId       String
  vehicle         Vehicle         @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  
  toDoText        String          // Free-form multiline notes, defect repairs, and portal instructions
  isDone          Boolean         @default(false) // One-click completion toggle
  status          WorkOrderStatus @default(IN_PROGRESS)
  
  scheduledDate   DateTime?
  completedAt     DateTime?
  completedBy     String?         // Technician or Manager name/ID
  notes           String?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([vehicleId])
  @@index([status])
  @@index([isDone])
  @@index([createdAt])
}

model MaintenanceSchedule {
  id                   String                 @id @default(uuid())
  vehicleId            String
  vehicle              Vehicle                @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  
  serviceName          String                 // e.g. "Oil & Filter Change", "Brake Pad Inspection"
  defaultToDoText      String                 // Default task description populated into auto-dispatched WO
  recurrenceType       ScheduleRecurrenceType @default(BOTH)
  
  intervalMonths       Int?                   // e.g., 6 (every 6 months)
  intervalMiles        Int?                   // e.g., 5000 (every 5000 miles)
  
  lastServicedDate     DateTime?
  lastServicedMileage  Int?
  
  nextDueDate          DateTime?
  nextDueMileage       Int?
  
  isActive             Boolean                @default(true)
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt

  @@index([vehicleId])
  @@index([isActive])
  @@index([nextDueDate])
  @@index([nextDueMileage])
}

model SystemUser {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  role      String   @default("TECHNICIAN") // ADMIN, SERVICE_ADVISOR, TECHNICIAN
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## State Transitions & Rules

### Work Order Lifecycle
1. **Creation**: Status = `IN_PROGRESS`, `isDone = false`.
2. **Toggle Completion**: When user clicks the `✓ Done` toggle:
   - `isDone` set to `true`.
   - `status` set to `DONE`.
   - `completedAt` set to `current timestamp`.
   - If un-toggled: `isDone` set to `false`, `status` set to `IN_PROGRESS`, `completedAt` cleared.
3. **Recurring Maintenance Trigger**:
   - Evaluates `nextDueDate <= now()` OR `vehicle.currentMileage >= nextDueMileage`.
   - Auto-dispatches new `WorkOrder` with `status = IN_PROGRESS`, `toDoText = schedule.defaultToDoText`.
   - On completion of the auto-dispatched work order, `lastServicedDate` and `lastServicedMileage` are updated, and next thresholds recalculated.
