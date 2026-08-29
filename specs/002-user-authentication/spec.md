# Feature Specification: User Authentication & Access Control

**Feature Branch**: `002-user-authentication`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "Adicionar a feature de autenticacao obrigando ao usuario logar no sistema para visualizar e gerenciar o sistema como um todo"

## Clarifications

### Session 2026-08-29
- Q: Should the system allow an Administrator or Manager to create new users from an in-app User Management screen, or should user provisioning remain strictly via database seeds / CLI scripts for this phase? → A: Option B - In-app User Management UI (admin screen to create/list/deactivate users and set passwords).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mandatory Login to Access the System (Priority: P1)

As a garage operator or manager, I want the system to require authentication before allowing access to any dashboard, vehicle records, work orders, or management features, so that garage data and operations remain secure and restricted to verified personnel.

**Why this priority**: Core security foundation. Without authentication enforcement across all protected views and actions, unauthorized users can view and alter critical garage data.

**Independent Test**: Can be tested by trying to access any application page (such as `/`, `/work-orders`, `/vehicles`) as an unauthenticated guest. The system must immediately intercept the request and redirect to the login screen. Once valid credentials are provided, the user is authenticated and granted access to the originally requested screen.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor accessing any protected page (e.g., `/`, `/work-orders`, `/vehicles`), **When** the page loads, **Then** the user is redirected to `/login` with an indication to sign in.
2. **Given** a user on the login screen, **When** they submit valid credentials (username and password), **Then** they are authenticated, a secure session is established (valid up to 6 hours), and they are redirected to their destination or dashboard.
3. **Given** a user on the login screen, **When** they enter incorrect credentials, **Then** authentication fails, the session is not created, and a clear error message is displayed without exposing sensitive system details.

---

### User Story 2 - User Session Termination (Logout) (Priority: P2)

As an authenticated user, I want to securely log out of the system at any time so that subsequent users on the same device cannot access or modify garage operations under my identity.

**Why this priority**: Prevents unauthorized access on shared garage/shop terminal devices.

**Independent Test**: Log in as a valid user, click the logout action, and verify that the session is invalidated immediately, redirecting the user back to the login screen and preventing access via browser history/back navigation.

**Acceptance Scenarios**:

1. **Given** an authenticated user on any system page, **When** they trigger the "Logout" action, **Then** their session is destroyed and they are redirected to the login page.
2. **Given** a user who just logged out, **When** they try to use the browser "Back" button or access protected URLs, **Then** they remain unauthenticated and are forced back to `/login`.

---

### User Story 3 - Authenticated User Identity Context (Priority: P3)

As an authenticated user, I want to see my current profile indicator (name/username) and role in the system header, so that I know which account is actively operating the application.

**Why this priority**: Provides clear operational context for auditability and UX transparency across shop operations.

**Independent Test**: Log in as a specific user account, verify that the application header displays the user's identifier and status, and confirm that API requests carry the active identity context.

**Acceptance Scenarios**:

1. **Given** an authenticated user navigating the application, **When** viewing the main navigation/header, **Then** their name/username is visible alongside a sign-out control.
2. **Given** an expired session (exceeding 6 hours of inactivity), **When** the user attempts an action or page transition, **Then** they receive clear feedback that the session has expired and are prompted to log in again.

---

### User Story 4 - In-App User Management (Priority: P4)

As a Manager/Administrator, I want to create, list, and manage user accounts and assign roles within the application, so that new shop technicians and staff can be onboarded directly from the UI without database interventions.

**Why this priority**: Enables self-contained operations for shop managers to manage technician accounts and access credentials.

**Independent Test**: Log in as a Manager, navigate to `/users`, create a new user account with username and password, and verify that the new user can successfully log in.

**Acceptance Scenarios**:

1. **Given** an authenticated Manager on `/users`, **When** they submit the form with username, full name, role, and password, **Then** the user account is created with encrypted credentials.
2. **Given** an authenticated Manager on `/users`, **When** attempting to create a user with a duplicate username, **Then** an explicit validation error is displayed.
3. **Given** an authenticated Technician (non-Manager), **When** attempting to access `/users`, **Then** access is forbidden or restricted.

---

### Edge Cases

- **Session Expiration during Form Submission**: What happens when a user's session expires while filling out a work order or editing a vehicle? The system must reject unauthenticated state modifications safely, preserve or prevent silent loss of user inputs where possible, and prompt for re-authentication.
- **Direct Deep-Link Access**: When an unauthenticated user opens a deep link (e.g., `/work-orders/WO-123`), the system must redirect to `/login` while preserving the intended destination, redirecting to the deep link post-authentication.
- **Concurrent Logins / Multiple Tabs**: If a user logs out in one browser tab, actions in other open tabs must recognize the invalid session on their next action and redirect to login.
- **Invalid or Malformed Credentials**: Repeated invalid login attempts must be handled gracefully without application crash or credential leakage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST restrict access to all operational views and data management routes (including Dashboard, Vehicles, Work Orders, and APIs) to authenticated users only.
- **FR-002**: System MUST provide a dedicated Login screen where users can authenticate with their credentials (username and password - no email required).
- **FR-003**: System MUST provide a secure Logout mechanism accessible from all application layouts that terminates the user session immediately.
- **FR-004**: System MUST maintain authenticated session state securely using JWT with a maximum inactivity lifetime of 6 hours.
- **FR-005**: System MUST redirect unauthenticated requests intended for protected views to the login screen, preserving the intended destination path for post-login redirect.
- **FR-006**: System MUST provide clear, user-friendly error messages upon failed login attempts without disclosing whether the specific username or password was the incorrect element.
- **FR-007**: System MUST display the active user's identity details in the application navigation header.
- **FR-008**: System MUST provide a User Management interface for Managers/Admins to create, view, and manage user accounts with unique usernames, passwords, and roles.

### Key Entities *(include if feature involves data)*

- **User**: Represents a system operator or manager authorized to access AAW GarageFlow (attributes: ID, username, passwordHash, full name, role, status/active flag, timestamps).
- **Session**: Represents an active authenticated state for a user (attributes: session identifier, user reference, expiration timestamp, creation timestamp).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of protected routes and operational endpoints reject unauthenticated access and redirect to the login screen.
- **SC-002**: Users can complete login in under 5 seconds from entering valid credentials.
- **SC-003**: 0% unauthorized data leakage or page visibility occurs for unauthenticated visitors.
- **SC-004**: Post-login redirect returns users to their intended destination in 100% of valid deep-link attempts.
- **SC-005**: Logging out terminates active session state across all application routes within 1 second.
- **SC-006**: Managers can create a new staff account and enable login within under 30 seconds.

## Assumptions

- Username and password authentication is the standard mechanism (no email required).
- Initial system administrator account is pre-provisioned via database seed to allow initial access.
- User management is restricted to users with Manager/Admin role.
