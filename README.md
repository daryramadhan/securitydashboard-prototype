# PT. JISS - Security Operations & Personnel Management Dashboard

A modern, high-contrast security operations and personnel roster management prototype built for **PT. Jasa Integrasi Sekuriti Selaras (PT. JISS)** using **Next.js 14 (App Router)**, **Tailwind CSS**, and **Shadcn UI**.

---

## 🛡️ Core Highlights & Features

- **Operational KPI Dashboard:**
  - Prioritized operational metrics: Total Personnel (`350`), Active Force (`335`), Currently Deployed (`235`), and Available Personnel (`100`).
  - High-priority **Needs Attention** alert section tracking Overdue client contracts (Red), contracts ending within 30 days (Amber), and open-ended deployments.
  - Consolidated project period and remaining duration timeline (`26 Oct 2026 · 12 days left`).

- **Personnel Directory (`/personnel`):**
  - Clean 6-column table layout: Personnel, Position / Rank, Employment Status, Deployment Status, Current Site, and Actions.
  - Clear visual distinction between Employment (`● Active Employee`) and Deployment (`🛡️ Deployed` / `✓ Available`).
  - Progressive disclosure filter system with instant Search, 3 primary dropdowns, and an expandable "More Filters" panel (Current Site, Qualification Badge, Gender Demographics).
  - Configurable rows per page (`10`, `15`, `25`, `50`) with dense, high-efficiency vertical row heights.

- **Deployments & Site Rostering (`/deployments`):**
  - Full Site Inspection with dedicated Search bar across guard names and ranks.
  - **Role-Based Accordion:** Guards grouped hierarchically by leadership rank (Danru/Site Commander, Shift Supervisor, Specialists, Officers) with expand/collapse controls.
  - Export site personnel rosters directly to CSV.

- **Role-Based Access Control (RBAC):**
  - Switchable roles: `ADMIN`, `MANAGEMENT`, and `READ_ONLY`.
  - Context-aware permissions (e.g. Read-Only cannot add/edit personnel or conclude duties).

- **Fluid Full-Width Layout:**
  - Responsive, edge-to-edge layout that takes full advantage of wide displays without artificial horizontal scrolling.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or later
- npm or yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/daryramadhan/securitydashboard-prototype.git
cd securitydashboard-prototype

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### Production Build

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Tailwind Animate
- **Components:** Shadcn UI & Radix UI primitives
- **Icons:** Lucide React
- **Language:** TypeScript
- **State Management:** React Context API with LocalStorage Persistence
