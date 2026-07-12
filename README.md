# TransitOps — Smart Transport Operations Platform

Hackathon build. This README covers setup, what's built, and where teammates
plug in their modules.

## Requirements

- **Node.js >= 22** (see `.nvmrc`). If your Node is older, `nvm install 22 && nvm use 22`.

## Setup

```bash
npm install
npm run seed               # creates one demo user per role + sample data
npm run dev                 # http://localhost:3000
```

Demo accounts (password for all: `password123`):

| Role | Email |
|---|---|
| Fleet Manager | fleet.manager@transitops.demo |
| Driver | driver@transitops.demo |
| Safety Officer | safety.officer@transitops.demo |
| Financial Analyst | financial.analyst@transitops.demo |

Seed creates the spec's exact example-workflow data (vehicles `Van-05` at
500kg cap, `Truck-11`, `Van-12`, `Truck-02`, and drivers `Alex`, `Bianca`, and
`Carlos` with a pre-expired license), plus a realistic **~30 vehicles, ~30
drivers, 40-60 trips spread over the last 30 days**, with fuel logs,
expenses, maintenance history, FASTag IDs/balances, and a handful of traffic
challans (mix of paid/pending), so every dashboard/report/chart/tab has real
data on first run. Safe to re-run — the bulk section only seeds once.

## Tests

```bash
npm test
```

Runs `tests/trips.test.ts` via Node's built-in test runner (`node --test`,
Node ≥ 22 — no extra test framework installed) against a disposable local
Postgres instance (the same embedded engine described below), covering the core business rules: the spec's exact
create → dispatch → complete workflow, cargo-over-capacity rejection,
expired-license rejection, suspended-driver rejection, double-assignment
blocking, retired/in-shop vehicles blocked, Draft vs. Dispatched cancel
behavior, maintenance open/close vehicle-status transitions, and the RBAC
permission matrix. Safe to re-run any time — never touches your real dev
database.

## What's built

Full app now — every screen in the spec, plus a lot of polish:

### Core (spec-mandatory)

- **Auth + RBAC**: email/password login, httpOnly signed JWT session cookie,
  7 resources × 4 roles permission matrix (`src/lib/rbac.ts`).
- **Vehicle Registry** (`/vehicles`, `/vehicles/[id]`): CRUD with India-specific
  fields (vehicle number, chassis number, insurance expiry, PUC expiry,
  FASTag ID/balance). Each vehicle has its own detail page with
  **Overview / Maintenance / Trips / Fuel & Expenses tabs**.
- **Driver Management** (`/drivers`): CRUD, license expiry tracking, safety
  score, suspend/reinstate.
- **Trip Management** (`/trips`, `/trips/[id]`): Draft → Dispatched →
  Completed/Cancelled, every mandatory business rule enforced server-side and
  re-validated at dispatch time (cargo ≤ capacity, no expired/suspended
  drivers, no double-assignment, retired/in-shop vehicles never selectable).
  Each trip has its own detail page — see "Trips section extras" below.
- **Maintenance** (`/maintenance`): fleet-wide record list, raise/close
  requests. Creating an active record flips the vehicle to In Shop; closing
  it restores Available (unless Retired).
- **Fuel & Expenses** (`/fuel-expenses`): log fuel and other expenses per
  vehicle, fleet-wide totals.
- **Reports & Analytics** (`/reports`): fuel efficiency, fleet utilization,
  operational cost, cost-recovery ratio (see ROI note below), 30-day
  distance/cost trend charts, exportable to **CSV, PDF, and Excel**
  (`src/components/ExportButtons.tsx`) — the PDF includes a branded header
  and hand-drawn bar/line charts, not just a plain table.
- **Role-tailored dashboards** (`/dashboard`, `src/components/dashboards/`):
  each role gets a structurally different layout, not just swapped widgets —
  Fleet Manager gets a wide working area + narrow utilization/quick-link
  rail; Safety Officer gets a stat-strip + suspended-driver watchlist;
  Financial Analyst gets a dark "statement" hero card + cost ledger; Driver
  gets a single-column, mobile-style task list. All four show an **expiry
  alerts banner** for licenses/insurance/PUC expiring within 30 days.

### Trips section extras (billing, compliance, weather — all live as tabs on `/trips/[id]`)

- **Billing & GST**: generate a GST invoice for a trip (taxable amount, GST
  rate slab, CGST+SGST vs IGST), with an auto-generated e-way bill number and
  validity window (1 day per 200km, minimum 1 day) and a flag for whether an
  e-way bill is actually required (consignment value > ₹50,000, the real
  threshold). Download the invoice as a PDF.
- **Vehicle Compliance**: chassis number, insurance/PUC expiry (with a
  colored days-left pill), FASTag ID/balance, and a traffic challan ledger
  (add a challan, mark it paid) for the vehicle assigned to that trip.
- **Weather & Route**: live weather (temperature, condition, wind) for the
  trip's source and destination via the free, keyless Open-Meteo API
  (`src/lib/weather.ts`), plus a plain-language advisory (rain/fog/heat/wind
  warnings). This is a weather advisory, not live traffic routing — a real
  turn-by-turn "best route with diversions" feature needs a paid mapping API
  (Google Maps/Mapbox) with a key, which is out of scope for a keyless build;
  the UI says so explicitly rather than faking it.

### Polish

- **Sidebar shell** (`src/components/AppShell.tsx`): left-hand navigation,
  collapsible on mobile, theme toggle + language switcher + user/logout.
- **Dark mode**: class-based (Tailwind `darkMode: "class"`), persisted in
  localStorage, applied before hydration so there's no flash on load.
- **Language switcher**: English + 5 Indian languages (Hindi, Gujarati,
  Marathi, Tamil, Bengali) — `src/lib/i18n/translations.ts`, ~140 keys per
  language covering navigation, forms, every list-page table header and
  search/filter UI, every dashboard's headings/labels, and page
  titles/subtitles — not just the sidebar.
- **India city autocomplete** (`src/components/CityAutocomplete.tsx` +
  `src/lib/data/india-cities.ts`): type-ahead dropdown over ~150 major Indian
  cities, wired into Trip source/destination and Vehicle city/region fields.
- **Search, filter, sort** on every list screen (Vehicles, Drivers, Trips,
  Maintenance), with reusable **empty states** for "no results" vs.
  genuinely-empty lists.
- **Bulk CSV/Excel import** for Vehicles and Drivers, with a downloadable
  template and a per-row success/error report.
- **Toast notifications** and **confirmation modals** (both rendered via a
  React portal straight onto `<body>`, so they're never affected by an
  ancestor's CSS stacking context) replace all inline error boxes and native
  `confirm()` calls.

### Note on Vehicle ROI

The spec's formula is `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`,
but this build doesn't track per-trip revenue/billing beyond the new
per-trip GST invoices (which aren't aggregated into a fleet-wide revenue
figure). The Reports screen shows a cost-recovery ratio instead
(`-OperationalCost / AcquisitionCost`) and says so on-screen.

## Data layer

Postgres via **Netlify Database** (`@netlify/database`, powered by Neon —
`src/lib/db.ts`). No external account, no manually-copied connection string:
Netlify provisions the database itself and applies the schema automatically.

Schema lives as a migration file at
`netlify/database/migrations/0001_initial_schema.sql`. Netlify applies it
automatically at the right point in the deploy lifecycle — on every
production deploy and every deploy preview — so the database schema never
drifts from the code that's running. Repository functions live in
`src/lib/repositories/*.ts` — plain async functions, no ORM magic.

Two modes, chosen automatically, with **zero configuration either way**:

- **Local / this sandbox** (default, whenever there's no real Netlify
  environment detected): a real, in-process Postgres via `@netlify/database-dev`
  (WASM, no Docker, no native binaries, no network) — persisted to
  `data/pg-local` so it survives restarts, same as a local file would.
- **Production on Netlify**: `getConnectionString()` finds the
  platform-managed database automatically — nothing to set, no environment
  variables to copy in.

`db.ts` exports a small `db.prepare(sql).get/all/run(...)` shim (translating
SQLite-style `?` placeholders to Postgres's `$1, $2, ...` internally) so every
repository function reads the same way it always has. Transactions
(`withTransaction`) check out a dedicated connection from the pool and use
`AsyncLocalStorage` so every nested repository call automatically joins the
same transaction, with no client threading required.

## Deploying to Netlify

The app is Netlify-ready — Next.js API routes and server components become
Netlify Functions automatically (`netlify.toml` + the auto-installed
`@netlify/plugin-nextjs`), and the database provisions itself the moment
Netlify detects the `@netlify/database` package and the
`netlify/database/migrations/` directory.

1. Push this repo to GitHub (already done if you're reading this from the
   connected repo) and connect it at [app.netlify.com](https://app.netlify.com)
   → **Add new site → Import an existing project**.
2. Deploy. Netlify provisions a Postgres database, applies
   `0001_initial_schema.sql`, and your app is live — **no environment
   variables, no external account, no manual setup**.
3. Optional: seed the live database with demo data. Pull the production
   connection string with `netlify database status --show-credentials`
   (requires the [Netlify CLI](https://cli.netlify.com)), then run:
   ```bash
   NETLIFY_DB_URL="<connection string>" npm run seed
   ```

That's the entire setup — this is the one part of the earlier Turso-based
approach that got simpler by switching to Netlify's own database.

## RBAC matrix

| Resource | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| Vehicles (incl. challans/FASTag) | write | read | read | read |
| Drivers | write | read | write | read |
| Trips (incl. invoices) | write | write | read | read |
| Maintenance | write | read | read | read |
| Fuel & Expenses | write | write | read | read |
| Dashboard | read | read | read | read |
| Reports | read | none | read | write |

Adjust in `src/lib/rbac.ts` if the team wants different boundaries.

## Verified against the spec's example workflow

Register Van-05 (500kg cap) → register Alex → create trip with 450kg cargo →
dispatch (vehicle+driver → On Trip) → complete (both → Available, odometer
updates) — this exact sequence has been run end-to-end against the running
app after every round of changes, along with the negative cases (overweight
cargo rejected, expired license rejected, double-assignment rejected,
RBAC-blocked actions rejected, maintenance correctly removes a vehicle from
the dispatch pool and restores it on close). The same rules are also covered
by the automated test suite (`npm test`).
