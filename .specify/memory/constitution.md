<!--
Sync Impact Report
Version change: Initial template -> 1.0.0
Modified principles:
  - [PRINCIPLE_1_NAME] -> I. Clean Architecture & Domain-Centric Design
  - [PRINCIPLE_2_NAME] -> II. SOLID Principles & Modularity
  - [PRINCIPLE_3_NAME] -> III. Test-First & Harness-Driven Execution (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] -> IV. UX Consistency & Accessibility Standards
  - [PRINCIPLE_5_NAME] -> V. Performance, Reliability & Observability
Added sections:
  - Technical Quality & Performance Standards
  - Development Workflow & Quality Gates
Removed sections:
  - None (scaffold placeholders replaced)
Follow-up TODOs: None
-->

# AAW GarageFlow Constitution

## Core Principles

### I. Clean Architecture & Domain-Centric Design
All systems MUST follow Clean Architecture separation of concerns:
- **Domain/Entities**: Enterprise business rules, completely independent of frameworks, UI, or external databases.
- **Use Cases/Application**: Application business rules orchestrating domain flows, independent of UI or persistence details.
- **Interface Adapters (Controllers, Presenters, Gateways)**: Translators between internal use cases and external representations.
- **Frameworks & Drivers**: Outermost layer containing UI frameworks, database connections, and external APIs.
- The **Dependency Rule** is strictly enforced: source code dependencies MUST only point inward toward higher-level policies.

### II. SOLID Principles & Modularity
Every module, class, and component MUST adhere to SOLID principles:
- **Single Responsibility Principle (SRP)**: Each class/module MUST have only one reason to change.
- **Open/Closed Principle (OCP)**: Entities MUST be open for extension but closed for modification.
- **Liskov Substitution Principle (LSP)**: Subtypes MUST be substitutable for their base types without altering correctness.
- **Interface Segregation Principle (ISP)**: Clients MUST NOT be forced to depend upon interfaces they do not use; define granular interfaces.
- **Dependency Inversion Principle (DIP)**: High-level modules MUST NOT depend on low-level modules; both MUST depend on abstractions.

### III. Test-First & Harness-Driven Execution (NON-NEGOTIABLE)
Quality verification is an automated, rigorous requirement across all tasks:
- **Test-Driven Development (TDD)**: Test cases (unit/integration/contract) MUST be written, reviewed, and verified to fail prior to feature implementation (Red-Green-Refactor).
- **Harness Mandatory**: Every task and feature increment MUST be built and verified against a dedicated test/evaluation Harness. No task is marked complete without full verification through its automated harness.
- **Regression Prevention**: Automated regression suites MUST pass before merging code into main branches.

### IV. UX Consistency & Accessibility Standards
The user interface and overall experience MUST remain coherent, accessible, and intuitive:
- Standardized design tokens, components, and layout hierarchies MUST be reused across screens and workflows.
- All user-facing states (loading, empty, success, validation error, edge cases) MUST be explicitly handled with user-friendly feedback.
- Interfaces MUST adhere to WCAG accessibility guidelines (semantic HTML, proper contrast, keyboard navigation, and ARIA labels where required).

### V. Performance, Reliability & Observability
Applications MUST maintain high performance benchmarks and operational transparency:
- Performance budgets for critical user paths (load time, interaction responsiveness, memory footprints) MUST be defined and enforced.
- Asynchronous and long-running operations MUST be non-blocking and communicate progress to the user.
- Structured logging, error telemetry, and meaningful metrics MUST be instrumented across application layers without exposing sensitive data.

## Technical Quality & Performance Standards

- **Code Quality**: Strict static typing, linter rules, and automated formatting must pass with zero warnings in CI pipelines.
- **Performance Budgets**: Client-side First Contentful Paint (FCP) and Time to Interactive (TTI) must remain within acceptable performance thresholds (<1.5s on standard networks). Database queries and API calls must be profiled and optimized against N+1 bottlenecks.
- **Error Handling**: Graceful degradation with contextual error boundaries; no uncaught runtime exceptions exposed to end-users.

## Development Workflow & Quality Gates

- **Specification Alignment**: Every implementation task must trace back to an active specification and task breakdown.
- **Quality Gate**: A task is deemed "Done" ONLY when:
  1. All unit, integration, and contract tests pass.
  2. The dedicated Harness suite executes and verifies the feature end-to-end.
  3. Linter, type checker, and build steps pass with 0 errors.
  4. UX matches design tokens and states specification.
- **Peer Review**: Code reviews MUST explicitly verify adherence to Clean Architecture layer boundaries and SOLID principles.

## Governance

- The Constitution supersedes ad-hoc coding conventions and team shortcuts.
- Any architectural exceptions, modifications, or rule waivers require explicit documentation, stakeholder approval, and an associated migration plan.
- Version increments follow Semantic Versioning rules:
  - **MAJOR**: Incompatible governance/architectural changes or principle redefinitions.
  - **MINOR**: Additions of new principles, sections, or expanded standards.
  - **PATCH**: Clarifications, wording refinements, and non-semantic fixes.

**Version**: 1.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
