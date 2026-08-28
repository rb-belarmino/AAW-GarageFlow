# Feature Specification: Vehicle Work Orders & Recurring Maintenance Management

**Feature Branch**: `001-work-orders-management`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Construir um sistema como Ordens de Servicos de uma Oficina que no qual precisara gerenciar manutencoes recorrentes de veiculos. Segue o documento que no qual estavam utilizando para gerenciar as Ordens de servicos Dealer cars _ to do.xlsx. Essa empresa e uma empresa americana e precisara ser construida 100% em Ingles."

## Clarifications

### Session 2026-08-28
- Q: How should recurring maintenance schedules trigger and manage newly generated work orders? → A: Option B: Directly create and dispatch an active "Open / In Progress" work order directly into technician queues.
- Q: How should dealership client accounts and vehicle ownership be structured and differentiated in the system? → A: Option B: Single default shop fleet ("AAW Dealer") with simple text tag for external source/account.
- Q: How should spreadsheet imports (e.g. bulk importing legacy records from Excel .xlsx) be handled by the system? → A: Option C: Manual entry only via UI forms (no bulk import capability in MVP).
- Q: How should the "To Do" field and work order scope be structured? → A: Free-form text field capturing all pending repairs, defects, and notes per vehicle work order, with quick status toggles.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vehicle Inventory & Free-Form Work Order Management (Priority: P1)

As an automotive shop manager or technician for the AAW Dealer fleet, I want to register vehicles (Year, Make/Model, Color, VIN, Source Tag) and record free-form "To Do" notes and pending repair items (e.g., photo shoots, portal uploading, mechanical defects, electrical glitches, parts needs) with a one-click completion toggle so that I can track and complete jobs rapidly without rigid schema constraints.

**Why this priority**: Directly reproduces and upgrades the flexible free-text workflow of the legacy spreadsheet ("Dealer cars / to do") while adding structured vehicle records, auditability, and live status tracking.

**Independent Test**: Can be fully tested by creating a vehicle record, writing free-form text in the "To Do" section (e.g., "take photos / upload at Deal center: detailing clean - Buy Fuel cap"), updating status, and toggling completion.

**Acceptance Scenarios**:

1. **Given** a vehicle arrives at the garage, **When** the manager enters Year, Make/Model, Color, VIN, and free-form "To Do" text, **Then** an active Work Order is created with status "In Progress" and marked pending (Done toggle unchecked).
2. **Given** an active Work Order with "To Do" text, **When** a technician completes the tasks and marks the order as Done, **Then** the completion status toggles to "Done / Completed", the completed counter updates, and a completion timestamp is saved.
3. **Given** an existing Work Order, **When** additional issues or diagnostic notes are discovered, **Then** the technician can freely edit and append notes directly to the "To Do" field.

---

### User Story 2 - Recurring Maintenance Schedules & Automated Service Dispatch (Priority: P2)

As a garage operations supervisor, I want recurring maintenance rules (based on elapsed time and/or mileage intervals like oil changes, brake inspections, tire rotations) to automatically create and dispatch active "Open / In Progress" work orders with pre-populated "To Do" maintenance instructions directly into technician queues when thresholds are reached so that maintenance is never delayed.

**Why this priority**: Eliminates manual triage overhead for routine fleet maintenance and guarantees automated dispatch for recurring dealer obligations.

**Independent Test**: Can be tested independently by setting a recurring maintenance schedule (e.g., 6 months or 5,000 miles), advancing the vehicle mileage/calendar date past the threshold, and verifying that an active "Open / In Progress" Work Order appears directly in the technician dispatch queue.

**Acceptance Scenarios**:

1. **Given** a vehicle configured with a recurring service rule (e.g., "Every 5,000 miles or 6 months - Oil & Filter Change"), **When** the vehicle approaches or exceeds the threshold, **Then** the system automatically generates and dispatches an active "Open / In Progress" Work Order with populated maintenance instructions directly into the technician board.
2. **Given** an automatically dispatched recurring maintenance work order is completed, **When** the work order is marked closed/done, **Then** the system resets the interval counter and schedules the next maintenance cycle.

---

### User Story 3 - Dealership Fleet Overview & Status Dashboard (Priority: P3)

As a shop lead or manager, I want an executive dashboard displaying total fleet vehicles, active work orders, completed jobs ratio (e.g., "9/0 Done"), overdue items, and search/filtering capabilities so that I have complete visibility into shop throughput and turnaround times.

**Why this priority**: Delivers real-time operational insights, replaces manual spreadsheet summaries (e.g. "9/0 Done"), and prevents bottlenecks across shop bays.

**Independent Test**: Can be tested by loading the dashboard with multiple vehicle work orders across various states and confirming accurate aggregation of completed vs. open tasks, bottlenecks, and urgent repair alerts.

**Acceptance Scenarios**:

1. **Given** multiple active and completed work orders across vehicles, **When** opening the shop dashboard, **Then** aggregate metrics (e.g., Done vs Open counts, total fleet vehicles) are accurately displayed.
2. **Given** vehicles with unresolved issues in the "To Do" field (e.g., "Checking engine light", "Middle screen not working"), **When** viewing the dashboard, **Then** pending vehicles are clearly highlighted for quick access.

---

### Edge Cases

- **Incomplete Vehicle Identification**: How does the system handle older or incoming vehicles where the VIN is temporarily unknown or missing? (System must allow temporary placeholder with a warning flag, requiring VIN before final work order closure).
- **Concurrent Free-Text Edits**: What happens if two technicians edit the "To Do" field for the same work order at the same time? (System must use optimistic concurrency or timestamp conflict resolution to prevent accidental overwrites).
- **Service Interval Overlap**: How does the system handle multiple overlapping recurring maintenance schedules triggering on the same vehicle? (System groups them into a single consolidated active Work Order in the queue with merged "To Do" descriptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide 100% of user interface, notifications, exports, and data models in English (US terminology).
- **FR-002**: System MUST allow manual creation, viewing, updating, and archiving of Vehicle records via UI forms with attributes including Year, Make, Model, Trim, Color, License Plate, 17-character VIN, and optional Source/Dealer tag (defaulting to "AAW Dealer").
- **FR-003**: System MUST support creating Work Orders with a free-form "To Do" text area accommodating multi-line notes, repairs, inspection items, parts mentions, and external portal instructions.
- **FR-004**: System MUST track work order completion state with an intuitive "Done / Completed" toggle (reproducing the ✓ / Done column from the spreadsheet) and display real-time summary ratios (e.g., "X Done / Y Pending").
- **FR-005**: System MUST support recurring maintenance profiles (Time-based such as monthly/annual intervals, or Mileage-based thresholds) linked to vehicle types or individual vehicles.
- **FR-006**: System MUST automatically generate and dispatch active "Open / In Progress" Work Orders directly into the technician queue when recurrence thresholds (due date or mileage) are reached.
- **FR-007**: System MUST record historical logs and completion audit trails for every vehicle, including technician notes, completion dates, and past "To Do" records.
- **FR-008**: System MUST provide a filterable and searchable work order board (by VIN, Source/Tag, Status, Year, Make/Model, and free-text search inside the "To Do" field).

### Key Entities *(include if feature involves data)*

- **Vehicle**: Represents an automotive unit managed by the garage. Key attributes: `id`, `vin`, `year`, `make`, `model`, `color`, `current_mileage`, `source_tag` (default "AAW Dealer"), `status`.
- **WorkOrder**: Represents a service session/ticket for a vehicle. Key attributes: `id`, `vehicle_id`, `order_number`, `to_do_text` (free-form text for all tasks/notes), `is_done` (boolean toggle), `status` (Open, In Progress, Done, Cancelled), `created_at`, `completed_at`, `completed_by`.
- **MaintenanceSchedule**: Definition of recurring service interval. Key attributes: `id`, `vehicle_id` or `vehicle_template`, `service_name`, `default_to_do_text`, `interval_months`, `interval_miles`, `last_serviced_date`, `last_serviced_mileage`, `next_due_date`, `next_due_mileage`.
- **Technician / User**: Shop personnel performing or inspecting work. Key attributes: `id`, `name`, `role` (Admin, Service Advisor, Technician), `email`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Technicians can log a vehicle and create a complete work order with free-form "To Do" notes in under 30 seconds.
- **SC-002**: 100% of legacy spreadsheet fields and entries ("Dealer cars / to do") can be represented, searched, and updated without data loss.
- **SC-003**: 100% of recurring maintenance intervals trigger automated active work orders dispatched directly into technician queues upon reaching due dates/mileage thresholds.
- **SC-004**: Work order status toggles and metrics reflect across active shop views in under 1 second.
- **SC-005**: 0 non-English terms in any user-facing interface, documentation, or exported service summaries.

## Assumptions

- **Language & Localization**: The entire application (UI, dates, currency, distance units: USD, Miles, MM/DD/YYYY) is configured strictly for US automotive shop standards.
- **Fleet Scope**: Single shop management model operating primarily on the "AAW Dealer" inventory with source tags.
- **Data Ingestion**: Manual data entry via web UI forms for MVP; bulk Excel file import is deferred/out of scope for initial release.
- **Task Format**: Flexible free-form text entry for the "To Do" field with a single-click completion toggle per work order, exactly matching the operational speed and simplicity of the shop spreadsheet.
- **User Roles & Devices**: Primary users are shop managers and technicians using tablets and desktop browsers in a garage bay environment with responsive layouts.
