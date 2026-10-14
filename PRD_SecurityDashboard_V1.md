# Security Personnel Management System
**Product Requirements & Technical Brief — Version 1.1**

**Status:** Initial development specification — updated with UI libraries and technical integration requirements  
**Product type:** Internal web application  
**Primary users:** Security agency management, administrators, and authorized personnel  
**Primary objective:** Centralize security personnel data, organizational relationships, deployment information, and project timelines.

---

# 1. Product Overview

## 1.1 Background

A security agency manages personnel who work across different clients, projects, and deployment locations. Management needs a reliable way to access personnel profiles, understand reporting relationships, identify current assignments, and track project end dates.

Without a centralized system, this information can become fragmented across spreadsheets, documents, and manual communication.

The Security Personnel Management System will provide a single internal platform for managing and monitoring this information.

## 1.2 Product Objective

The application must enable authorized users to:

1. View an overview of the agency's personnel and deployment status.
2. Search and manage individual personnel profiles.
3. Understand the organizational hierarchy and reporting relationships.
4. Identify which personnel are assigned to each active location.
5. Monitor project end dates and remaining project duration.
6. Identify active personnel who do not have an active deployment.
7. Review historical personnel assignments.
8. Export relevant personnel and deployment data.

## 1.3 Product Principles

- **One source of truth:** Personnel and deployment information should be maintained centrally.
- **Actionable information:** Dashboard metrics should link to the underlying records.
- **Historical integrity:** Changes to current assignments must not erase historical records.
- **Clear data relationships:** Organizational hierarchy, projects, locations, and assignments must remain distinct.
- **Simple operations:** Prioritize straightforward workflows over complex administrative features.
- **Secure by default:** Access to personal information and administrative actions must be controlled.

# 2. Version 1 Scope

Version 1 focuses on personnel management and deployment visibility. It is not intended to be a complete workforce scheduling or security operations platform.

## 2.1 Included Modules

| Module | Purpose |
|---|---|
| Dashboard | Overview of personnel, deployment, and upcoming project endings |
| Personnel | Searchable directory and individual profiles |
| Organization | Organizational tree and reporting relationships |
| Deployments | Active locations, assigned personnel, project dates, and placement history |
| Administration | Authorized management of personnel, organization, and assignment records |

## 2.2 Excluded from Version 1

The following features are outside the initial scope:

- Attendance and shift scheduling.
- Payroll and compensation.
- Recruitment and onboarding.
- Incident and security report management.
- GPS or real-time tracking.
- Automated personnel placement recommendations.
- Automated notifications and reminders.
- Staffing optimization and advanced workforce forecasting.
- Client-facing portals.
- Advanced reporting dashboards.

The architecture should allow future expansion without requiring these features to be implemented now.

# 3. User Roles & Permissions

Version 1 should implement role-based access control (RBAC).

## 3.1 Administrator

Can:
- View all personnel and deployment data.
- Create and edit personnel records.
- Manage organizational relationships.
- Create and edit client, project, and location records.
- Create, update, and close assignments.
- Export authorized data.

## 3.2 Management / Executive

Can:
- View the dashboard.
- Search and view personnel profiles.
- Explore the organizational tree.
- View deployment locations and assigned personnel.
- Review project timelines and placement history.
- Export reports if granted permission.

Management should not automatically receive permission to modify records.

## 3.3 Read-Only User

Can:
- Search personnel.
- View permitted profiles.
- View organizational relationships and deployment information within their access scope.

Cannot modify records or export data unless explicitly authorized.

**Implementation note:** Permissions must be enforced on the server, not merely by hiding buttons in the interface. The final role definitions and any location-level restrictions must be confirmed with the agency.

# 4. Functional Requirements

## 4.1 Dashboard

The dashboard is the primary overview page for management.

Its purpose is to answer three questions:

1. How many personnel does the agency have, and what is their current status?
2. Where are personnel deployed?
3. Which projects are approaching their end dates, and which personnel are currently unassigned?

### A. Personnel overview

Display these metrics:

- Total registered personnel.
- Active personnel.
- Inactive personnel.
- Male personnel.
- Female personnel.
- Currently deployed personnel.
- Idle personnel.

Each metric should use a consistent counting definition and, where useful, be clickable to open a filtered personnel directory.

**Definitions**

- **Total personnel:** All registered personnel records, including inactive personnel.
- **Active personnel:** Personnel whose employment status is active.
- **Inactive personnel:** Personnel whose employment status is inactive.
- **Deployed personnel:** Active personnel with at least one qualifying active assignment.
- **Idle personnel:** Active personnel without any qualifying active assignment.
- **Gender distribution:** Counts based on recorded gender data. Missing values must not be silently assigned to either category.

If multiple simultaneous assignments are allowed, a person must be counted only once in deployed-personnel totals, even if they appear at multiple locations.

### B. Active deployment locations

Display a list of locations with active projects or deployments.

Each row must include:
- Client name.
- Project name, if applicable.
- Location or site name.
- Number of currently assigned personnel.
- Project start date.
- Project end date.
- Remaining project duration.
- Project status.

Users must be able to open a location to see its details and assigned personnel.

The location count and personnel count must be derived from stored project, location, and assignment records rather than manually entered dashboard values.

### C. Project timeline

For each project, display the remaining duration calculated from its end date.

Examples:
- `45 days remaining`
- `7 days remaining`
- `Ends today`
- `End date passed`

The system must distinguish the project's end date from the end date of an individual personnel assignment.

For Version 1, the countdown is calculated dynamically when the page is loaded. Automated notifications are not required.

If a project end date is missing, display `End date not set` rather than inventing a duration.

### D. Upcoming project endings

Display projects that are approaching their end dates.

Required capabilities:
- Show project and location information.
- Show the end date and remaining days.
- Open the corresponding project or location details.
- Filter by an agreed time range, such as the next 30, 60, or 90 days.

Projects that have passed their end dates should be identifiable and should not be presented as having a positive remaining duration.

The project status and date must remain distinct. An overdue end date should not automatically change a project's operational status without a defined business rule.

### E. Idle personnel

Display active personnel who do not have an active deployment.

Each row should include:
- Profile photo.
- Name.
- Personnel ID.
- Position.
- Relevant qualification badges, if recorded.
- Last assignment, if available.
- Link to the personnel profile.

Users should be able to open the complete filtered list.

Idle status must be calculated from employment and assignment records, not manually maintained as a separate status.

### F. Quick actions

Provide shortcuts to:
- Search personnel.
- View the organizational tree.
- Add a personnel record, for authorized users.
- Access deployment records.

### Dashboard acceptance criteria

The dashboard is complete when:

1. All personnel metrics reflect the current database records.
2. Deployed and idle counts follow the agreed counting rules.
3. Every active location shows the correct assigned-personnel count.
4. Clicking a location opens the correct personnel list.
5. Project end dates and remaining durations are calculated correctly.
6. Missing or overdue dates are displayed clearly.
7. Unauthorized users cannot access restricted records or actions.

## 4.2 Personnel Directory

The directory is the central list of registered personnel.

### Required fields

- Profile photo.
- Full name.
- Personnel ID.
- Gender, if recorded.
- Position.
- Employment status.
- Current deployment status.
- Current location, if applicable.

### Required interactions

- Search by name or personnel ID.
- Filter by employment status.
- Filter by position.
- Filter by deployment status.
- Filter by current location.
- Open an individual profile.
- Export the filtered list to CSV or Excel.

Search and filters should work together. Clearing a filter must not unexpectedly clear the user's search query unless explicitly requested.

Pagination or equivalent data loading should be implemented so the directory remains usable with large personnel datasets.

## 4.3 Personnel Profile

Each personnel record has a dedicated detail page.

### Section A — Personal information

- Profile photo.
- Full name.
- Personnel ID.
- Gender.
- Other necessary personal information, if approved by the agency.

### Section B — Contact information

- Phone number.
- Email address, if available.

### Section C — Employment information

- Current position or rank.
- Organizational unit.
- Direct supervisor.
- Employment status.
- Date of joining, if required.

### Section D — Qualifications and badges

Display recorded qualifications as badges.

Each qualification record should support:
- Qualification or certification name.
- Issuing organization, if relevant.
- Issue date, if applicable.
- Expiration date, if applicable.
- Current validity status.

For Version 1, badges are informational. Users should be able to filter the directory by qualification if this information is maintained consistently.

An expired certification must not be displayed as valid. Missing expiration information should not be treated as proof of validity.

### Section E — Current deployment

Display:
- Client.
- Project.
- Location or site.
- Position during the assignment, if applicable.
- Assignment start date.
- Assignment end date, if applicable.
- Assignment status.

If a person has multiple simultaneous assignments, all current assignments should be visible.

### Section F — Placement history

Display previous assignments chronologically.

Each entry should show:
- Client and location.
- Project, if applicable.
- Assignment start date.
- Assignment end date.
- Position during the assignment, if recorded.

Previous assignments must remain accessible after reassignment.

### Profile actions

Authorized users can:
- Edit personnel information.
- Update organizational relationships.
- Create or close an assignment.

Changing a person's profile must not accidentally overwrite their assignment history.

## 4.4 Organization Tree

The organizational tree visualizes reporting relationships.

### Required capabilities

- Display the organizational hierarchy.
- Show each person's name, photo, position, and personnel ID.
- Expand and collapse branches.
- Select a person to open their profile.
- Navigate to their direct supervisor.
- View direct subordinates.

The initial version should prioritize a single agency hierarchy.

Deployment locations must not be used as a substitute for organizational relationships. A supervisor may oversee personnel across multiple locations.

If the agency requires separate site-level supervisory structures, that requirement should be clarified before implementing multiple hierarchy types.

## 4.5 Deployments

This module provides access to current and historical deployment information.

### A. Deployment list

Display projects and locations with:
- Client.
- Project name.
- Location or site.
- Project status.
- Project start and end dates.
- Number of currently assigned personnel.
- Remaining project duration.

Provide search and filters for client, location, project status, and date range where applicable.

### B. Location and project details

When a user opens a project or location, display:
- Client and project information.
- Location details.
- Project start and end dates.
- Current assignment count.
- List of personnel assigned to the location.
- Relevant assignment dates.
- Links to individual profiles.
- Historical assignment information.

If one project includes multiple locations, each location must be distinguishable while retaining its relationship to the parent project.

### C. Assignment management

Authorized users can:
- Assign personnel to a project or location.
- Set the assignment start date.
- Set an optional assignment end date.
- Update assignment information.
- Close an assignment when it ends.
- Review historical assignments.

Creating a new assignment must not delete the previous assignment.

The system must validate assignment dates and prevent invalid records, such as an end date earlier than the start date.

Whether multiple simultaneous assignments are permitted must be confirmed before finalizing conflict validation.

## 4.6 Administration

Administration should provide the minimum tools required to maintain accurate records.

Required capabilities:
- Create and edit personnel records.
- Create and edit client records.
- Create and edit projects and locations.
- Manage reporting relationships.
- Create and close assignments.
- Update recorded qualifications.
- Manage user roles and access permissions.

Permanent deletion of personnel and historical assignment records should not be part of normal operations. Deactivation or record correction should be preferred, with appropriate access controls.

## 4.7 Export

Version 1 supports export to CSV and Excel.

### Exportable datasets

- Filtered personnel directory.
- Personnel assigned to a selected location.
- Deployment and project list.
- Placement history for a selected personnel record, where permitted.

### Requirements

- Export must respect the active filters.
- Export must respect the user's authorization.
- Column names must be clear and consistent.
- Dates should use a consistent format.
- The exported data must match the corresponding records shown in the application.

A configurable report builder and automated scheduled exports are excluded.

# 5. Data Model

The following entities define the initial database structure. Exact column names can be finalized during implementation.

## 5.1 Personnel

Stores the primary personnel record.

Suggested fields:
- `id`
- `personnel_number` — unique personnel identifier.
- `full_name`
- `photo_path`
- `gender`
- `phone`
- `email`
- `position_id`
- `organizational_unit_id`
- `employment_status`
- `join_date`
- `created_at`
- `updated_at`

Personnel status should be represented using controlled values rather than arbitrary free text.

## 5.2 Organizational Units

Stores organizational departments or teams.

Suggested fields:
- `id`
- `name`
- `parent_unit_id`, nullable
- `created_at`
- `updated_at`

## 5.3 Organizational Relationships

Stores direct reporting relationships.

Suggested fields:
- `id`
- `personnel_id`
- `supervisor_personnel_id`
- `effective_from`, optional.
- `effective_to`, optional.

If historical hierarchy is not required for Version 1, the implementation may use a simpler direct supervisor reference on the personnel record. Historical relationships can be introduced later without conflating them with deployment records.

## 5.4 Clients

Stores client organizations.

Suggested fields:
- `id`
- `name`
- `status`
- `created_at`
- `updated_at`

## 5.5 Projects

Stores contractual or operational projects.

Suggested fields:
- `id`
- `client_id`
- `name`
- `project_code`, optional.
- `start_date`
- `end_date`
- `status`
- `created_at`
- `updated_at`

A project belongs to a client. Project dates represent the project period, not an individual person's assignment period.

## 5.6 Locations

Stores deployment sites.

Suggested fields:
- `id`
- `client_id`
- `name`
- `address`, optional.
- `status`
- `created_at`
- `updated_at`

If a project can cover multiple locations, use a project-location relationship table rather than assuming every project has exactly one location.

## 5.7 Assignments

Stores personnel deployment records.

Suggested fields:
- `id`
- `personnel_id`
- `project_id`
- `location_id`
- `position_id`, optional.
- `start_date`
- `end_date`, nullable.
- `status`
- `created_at`
- `updated_at`

An assignment represents a person's placement at a particular location during a specific period.

Assignment history should be retained. When an assignment ends, its end date and status are updated rather than deleting the record.

## 5.8 Qualifications

Stores qualification definitions.

Suggested fields:
- `id`
- `name`
- `description`, optional.

## 5.9 Personnel Qualifications

Links personnel to their recorded qualifications.

Suggested fields:
- `id`
- `personnel_id`
- `qualification_id`
- `issuing_organization`, optional.
- `issue_date`, optional.
- `expiration_date`, nullable.
- `status`

## 5.10 Users and Roles

Stores application users and their permissions, or references the authentication provider's user records.

Suggested concepts:
- User identity.
- Assigned role.
- Account status.
- Permitted data scope, if required.

The authentication provider should remain responsible for credentials. Passwords must never be stored as plain text in application tables.

## 5.11 Audit Logs

For Version 1, record important changes to personnel, assignments, projects, and organizational relationships if auditability is required by the agency's operating policy.

Suggested fields:
- `id`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `action`
- `changed_at`
- `change_summary` or structured change data.

Avoid storing unnecessary sensitive personal data in log messages.

# 6. Technical Architecture

## 6.1 Recommended Stack

| Layer | Recommendation | Purpose |
|---|---|---|
| Frontend | Next.js with TypeScript | Web interface and server-rendered application |
| Styling and UI | Tailwind CSS and shadcn/ui | Consistent, customizable UI components |
| Backend | Next.js server-side application modules | Business logic and protected data operations |
| Database | PostgreSQL | Relational personnel, organization, project, and assignment data |
| ORM | Prisma | Type-safe database queries and migrations |
| Authentication | Managed authentication provider, such as Supabase Auth | Secure login and session management |
| File storage | Private object storage | Personnel photos and approved documents |
| Hosting | Managed Next.js-compatible hosting | Application deployment |
| Database hosting | Managed PostgreSQL | Database operations, backups, and maintenance |

These are recommendations, not requirements to adopt every vendor. The final provider should be selected based on budget, data residency, operational capability, and the agency's security requirements.

Supabase is one possible option for managed PostgreSQL, authentication, and private storage. If selected, its Row Level Security policies and service-role credentials must be configured carefully.

## 6.2 Architecture Pattern

Use a **modular monolith** with clear separation between application modules.

<CodeBlock language="mermaid" editable={true}>flowchart TD
    U[Authorized User] --> UI[Next.js Web Application]

    UI --> AUTH[Authentication and Session]
    UI --> API[Server-side Application Layer]

    API --> RBAC[Authorization and Validation]
    RBAC --> PERSONNEL[Personnel Module]
    RBAC --> ORG[Organization Module]
    RBAC --> DEPLOY[Projects and Deployments Module]
    RBAC --> REPORT[Dashboard and Export Module]

    PERSONNEL --> DB[(PostgreSQL)]
    ORG --> DB
    DEPLOY --> DB
    REPORT --> DB

    PERSONNEL --> STORAGE[Private Object Storage]
    API --> AUDIT[Audit Log Module]
    AUDIT --> DB</CodeBlock>

### Architectural rules

- All database writes must go through validated server-side application logic.
- Sensitive data must not be exposed directly to unauthorized clients.
- Authorization must be checked for every protected operation.
- Database transactions should be used when multiple related records must change together.
- Dashboard calculations should use database queries or server-side aggregation, not hardcoded values.
- Business logic should be independent of individual page components.
- Avoid introducing microservices, a message broker, or a separate analytics database in Version 1.

## 6.3 Suggested Project Structure

<CodeBlock language="text" editable={true}>src/
  app/
    (auth)/
      login/
    (dashboard)/
      dashboard/
      personnel/
      organization/
      deployments/
      administration/
    api/
      exports/
  components/
    ui/
    layout/
    personnel/
    organization/
    deployments/
    dashboard/
  modules/
    personnel/
      schemas.ts
      service.ts
      repository.ts
    organization/
      schemas.ts
      service.ts
      repository.ts
    deployments/
      schemas.ts
      service.ts
      repository.ts
    dashboard/
      service.ts
    exports/
      service.ts
  lib/
    auth/
    authorization/
    database/
    storage/
    validation/
  prisma/
    schema.prisma
    migrations/
  tests/</CodeBlock>

This is a suggested logical structure. The implementation may adapt it to the selected Next.js conventions while preserving module boundaries.



## 6.7 UI Libraries & Technical Integration

### Purpose

Prepare the application for incremental Version 1 development using shadcn/ui as the primary UI component system. This section extends the recommended stack in Section 6.1 and does not replace the backend, security, or data-model requirements above.

### Recommended frontend dependencies

Inspect the existing project before installing packages. Reuse compatible dependencies and avoid duplicates.

| Layer | Technology | Purpose |
|---|---|---|
| UI components | shadcn/ui | Reusable, customizable interface components |
| Icons | Lucide React | Consistent interface icons |
| Data tables | TanStack Table | Sorting, filtering, pagination, and row selection |
| Forms | React Hook Form | Form state and submission |
| Validation | Zod | Client and server input validation |
| Date utilities | date-fns | Date formatting and calculations |
| Notifications | Sonner | Success, error, and status feedback |
| Charts | Recharts | Dashboard visualizations, only where useful |

Use these libraries alongside the existing stack: Next.js App Router, TypeScript, and Tailwind CSS. Do not add Mantine, Material UI, PrimeReact, or HeroUI alongside shadcn/ui without a demonstrated requirement.

Database and authentication technologies remain separate concerns. Use PostgreSQL, Prisma, and the selected authentication provider as defined in Sections 6.1–6.6, preserving suitable existing implementations.

### shadcn/ui component coverage

Add components incrementally, based on implemented screens. Verify component names and availability against the installed shadcn/ui version.

- **Application shell:** Sidebar, Breadcrumb, Separator, Sheet.
- **Dashboard:** Card, Badge, Skeleton, Tooltip.
- **Personnel directory:** Table, Input, Select, Dropdown Menu, Pagination.
- **Personnel profile:** Avatar, Tabs, Badge, Card.
- **Forms:** Form, Input, Textarea, Checkbox, Switch, Label, Select.
- **Dialogs and actions:** Dialog, Alert Dialog, Sheet, Button.
- **Dates:** Calendar and Popover.
- **Feedback:** Sonner.
- **Charts:** Recharts with shadcn/ui chart integration, if required.

Reuse existing local components and configurations. Do not install every available component by default.

### Data tables

Use TanStack Table for the personnel directory, deployment list, and placement history where appropriate.

Required capabilities:
- Sorting and filtering.
- Search by relevant personnel or deployment attributes.
- Pagination.
- Column visibility where useful.
- Row selection only where bulk actions are supported.
- Loading, empty, error, and no-results states.
- Responsive layouts and accessible interactions.

Keep reusable table logic separate from page-specific column definitions and business logic. Use server-side filtering and pagination when required by dataset size. TanStack Table does not provide database queries or persistence by itself.

### Forms and validation

Use React Hook Form and Zod for personnel, organizational, project, location, assignment, and qualification forms.

Requirements:
- Reusable validation schemas.
- Clear field-level error messages.
- Required-field and date-range validation.
- Server-side validation for submitted data.
- Consistent rules between client and server.
- Confirmation before destructive actions.
- Appropriate loading and submission feedback.

Do not invent business rules for overlapping assignments, mandatory fields, or qualification expiry behavior when they have not been confirmed. Critical validation and authorization must not rely on client-side checks alone.

### Date and assignment utilities

Use date-fns for date formatting and calculations, including:
- Project end dates.
- Individual assignment start and end dates.
- Remaining days until an end date.
- Overdue and missing-date states.
- Consistent date formatting.

A project's end date and an individual's assignment end date are separate data points. Centralize deployment-status calculations in reusable business logic so dashboard metrics, directory filters, and deployment tables use consistent definitions. Apply the business timezone consistently.

### Dashboard visualizations

Use Recharts only where visualizations support operational decisions. Potential charts include:
- Active versus inactive personnel.
- Personnel distribution by gender.
- Deployment status distribution.

Prioritize KPI cards, active deployment locations, assigned-personnel counts, and upcoming project endings over decorative charts. Derive production metrics from persisted application data. Do not use hardcoded demo values as production metrics. If simultaneous assignments are allowed, prevent double-counting a person in overall deployed-personnel totals.

### Organizational tree implementation

The organizational tree must support:
- Expanding and collapsing reporting relationships.
- Viewing supervisors and subordinates.
- Opening a personnel profile from a tree node.

shadcn/ui does not provide a complete organizational chart component. Start with a simple custom React component. Add a dedicated tree or graph library only if the required interactions or hierarchy complexity justify it.

Keep organizational reporting relationships separate from deployment assignments.

### Export dependencies

Version 1 must support exporting relevant personnel and deployment data, subject to permissions.

- Prefer CSV export for straightforward tabular data.
- Add an `.xlsx` generation dependency only if actual Excel workbook output is required.
- Respect active filters and user permissions.
- Exclude unauthorized or unnecessary sensitive personal data.
- Ensure exported values match the corresponding records shown in the application.

### Integration workflow for coding agents

When setting up or modifying the project, follow this sequence:

1. Inspect the framework, package manager, framework versions, dependencies, routes, UI configuration, and existing data layer.
2. Report which required dependencies are already available and which are missing.
3. Check compatibility before installing packages or changing configuration.
4. Initialize or verify shadcn/ui.
5. Add required components and supporting libraries incrementally.
6. Verify the application shell and one representative table and form.
7. Run TypeScript checks, linting, tests, and a production build where supported.
8. Document dependencies added, files changed, setup steps requiring credentials, and unresolved issues.

Do not rebuild the application or implement every business feature during dependency integration. Preserve existing functionality and limit changes to the agreed task.

### Integration acceptance criteria

The integration is complete when:
- The application builds successfully, or pre-existing failures are clearly documented.
- Existing routes and features continue to work.
- shadcn/ui is the primary component system.
- Form, table, date, notification, and chart dependencies are configured only where needed.
- No unnecessary duplicate UI libraries are introduced.
- TypeScript, lint, and available tests pass, or failures are documented.
- Environment-specific setup is documented without exposing secrets.
- The project is ready for incremental implementation of Version 1 features.

## 6.4 Database Design Principles

- Use PostgreSQL foreign keys to enforce relationships.
- Use unique constraints for personnel numbers and other unique identifiers.
- Index fields frequently used in search and filters, such as personnel number, name, status, client, project, and location.
- Store timestamps consistently; use date types for calendar dates such as project start and end dates.
- Use database migrations for schema changes.
- Avoid duplicating calculated dashboard metrics in separate tables unless a demonstrated performance need justifies it.
- Preserve assignment history rather than overwriting prior records.

## 6.5 Authentication and Authorization

Implement:
- Secure sign-in and sign-out.
- Server-side session verification.
- Role-based permissions.
- Protected routes and server actions or API endpoints.
- Authorization checks on record access and mutation.
- Secure account recovery through the authentication provider.
- Secure handling of secrets through environment variables.

If row-level security is used, policies must cover every exposed table and operation. Never expose a privileged database or service-role secret to the browser.

## 6.6 File Storage

Personnel photos and approved supporting documents should use private storage where appropriate.

Requirements:
- Validate file type and size.
- Generate safe storage keys.
- Do not expose private storage credentials.
- Use authenticated access or short-lived signed URLs where necessary.
- Avoid public access to personnel documents by default.

# 7. Business Rules

The following rules must be implemented consistently.

1. Employment status and assignment status are separate.
2. Inactive personnel are not classified as idle.
3. Idle means an active person has no qualifying active assignment, subject to the agency's availability policy.
4. A deployed person is counted once in overall deployed-personnel metrics, even if multiple assignments are allowed.
5. Project end dates and personnel assignment end dates are distinct.
6. Closing an assignment must preserve its history.
7. A project end date passing does not automatically mean the project is operationally closed.
8. Expired qualifications must not be shown as valid.
9. Dashboard and export results must follow the same counting and filtering rules.
10. All date-dependent statuses must be calculated using a consistent business timezone.

Before implementation, confirm whether simultaneous assignments are allowed and how to classify personnel on leave or otherwise unavailable.

# 8. Non-Functional Requirements

## Security and privacy
- Enforce least-privilege access.
- Protect personnel contact information and documents.
- Validate all input on the server.
- Use secure session and cookie settings.
- Maintain appropriate auditability for sensitive changes.
- Establish backup and recovery procedures.

## Performance
- Use pagination for large directories and personnel lists.
- Optimize database queries for dashboard summaries.
- Avoid loading every personnel record into the browser for aggregation.
- Add indexes based on actual query patterns.

## Reliability
- Use managed database backups.
- Apply database migrations in a controlled manner.
- Handle failed writes and validation errors clearly.
- Prevent accidental duplicate records where practical.

## Maintainability
- Use TypeScript and shared validation schemas.
- Keep business logic in server-side modules.
- Use reusable UI components.
- Include automated tests for critical business rules.

# 9. Testing and Acceptance

Version 1 should not be considered complete until the following scenarios pass.

### Personnel
- An authorized administrator can create and edit a personnel record.
- A user can search by name and personnel number.
- Filters can be combined and cleared correctly.
- Unauthorized users cannot modify records.

### Organization
- A supervisor's direct reports are displayed correctly.
- Selecting a person opens the correct profile.
- The tree remains navigable when there are multiple hierarchy levels.

### Deployment
- A location displays the correct current personnel list.
- Personnel counts match qualifying assignments.
- Closing an assignment removes it from current deployment counts but preserves its history.
- Invalid assignment dates are rejected.

### Project timelines
- Remaining days are calculated correctly.
- Projects with missing end dates display an explicit missing-date state.
- Past end dates are clearly identified.
- Project dates do not overwrite assignment dates.

### Dashboard and export
- Dashboard metrics match the underlying records.
- Inactive personnel are not counted as idle.
- Export respects filters and user permissions.
- Exported values match the displayed records.

### Security
- Protected routes and operations require valid authentication.
- Role permissions are enforced server-side.
- Private photos and documents cannot be accessed without authorization.

# 10. Suggested Implementation Sequence

**Phase 1 — Foundation**
- Establish the application, database, authentication, and authorization.
- Define the schema and initial migrations.
- Build shared layout and UI components.

**Phase 2 — Core records**
- Implement personnel management.
- Implement organizational relationships.
- Implement clients, projects, locations, and assignments.
- Implement qualification records.

**Phase 3 — Main user experience**
- Build the personnel directory and profile.
- Build the organizational tree.
- Build deployment lists and location details.
- Build placement history.

**Phase 4 — Dashboard and export**
- Implement personnel metrics.
- Implement active location summaries and project countdowns.
- Implement idle personnel lists.
- Implement CSV/Excel export.

**Phase 5 — Validation and release**
- Run acceptance tests.
- Verify permissions and data consistency.
- Test realistic data volumes.
- Verify backup and recovery.
- Prepare production deployment.

The sequence can be adjusted where parallel work is practical, but the data model and business rules should be established before dashboard calculations are finalized.

# 11. Decisions Required Before Development

The following are the remaining business decisions that could materially affect implementation:

1. Can a security officer have multiple simultaneous active assignments?
2. Does one project contain multiple deployment locations?
3. Can a deployment location be associated with more than one project?
4. Does the agency need a separate site-level reporting hierarchy?
5. Which personal information is mandatory?
6. How are idle, leave, and other availability states defined?
7. What project end-date warning windows should the interface use?
8. What data should each user role be allowed to access and export?
9. Will existing personnel and deployment data be imported?
10. What hosting, data residency, and retention requirements apply?

Where a decision remains open, the implementation team must document the assumption rather than silently inventing a business rule.

---

# Definition of Done

Version 1 is ready for release when an authorized user can manage personnel records, navigate reporting relationships, identify personnel at each active location, understand project end dates, distinguish deployed from idle personnel, review assignment history, and export permitted data — all backed by consistent database records and enforced access controls.