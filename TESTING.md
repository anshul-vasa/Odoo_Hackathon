# TransitOps — Run It & Test It Yourself

Follow this once and you'll have verified every mandatory rule plus all the
polish rounds with your own eyes.

## 1. Start it up

```bash
node -v          # need >= 22.5.0
npm install
npm run seed
npm run dev
```

`npm run seed` is safe to re-run any time. It creates:

| Role | Email | Password |
|---|---|---|
| Fleet Manager | fleet.manager@transitops.demo | password123 |
| Driver | driver@transitops.demo | password123 |
| Safety Officer | safety.officer@transitops.demo | password123 |
| Financial Analyst | financial.analyst@transitops.demo | password123 |

Plus the spec's example vehicles/drivers (`Van-05`, `Truck-11`, `Van-12`,
`Truck-02`, `Alex`, `Bianca`, `Carlos`), and a bulk set of ~30 vehicles, ~30
drivers, 40-60 trips, fuel/expense/maintenance history, FASTag data, and a
few traffic challans — so every screen has real data immediately.

Open **http://localhost:3000** — it should redirect you to `/login`.

## 2. The spec's exact example workflow

Log in as **Fleet Manager**. Trips → + Create Trip → Van-05 / Alex / 450kg /
120km → Dispatch → check Vehicles (`Van-05` = On Trip) and Drivers (`Alex` =
On Trip) → Complete with actual distance 118 / fuel 15 → both back to
Available, odometer +118.

## 3. Rule-breaking tests (should all fail with a clear message)

- Cargo weight over a vehicle's max load capacity — rejected.
- `Carlos` (expired license) doesn't even appear in the driver dropdown.
- A vehicle already On Trip doesn't appear in the vehicle dropdown for a
  second trip.
- Cancel a Draft trip — no vehicle/driver status change.
- Cancel a Dispatched trip — vehicle and driver both revert to Available.

## 4. RBAC — log out, try each role

- **Driver**: can create/dispatch/complete/cancel trips and log fuel, but
  vehicle/driver register buttons and edit/retire/suspend actions are hidden.
- **Safety Officer**: can Suspend/Reinstate drivers; vehicles are read-only.
- **Financial Analyst**: everything read-only except Reports (their home
  screen).
- Visit `/dashboard` logged out — bounces to `/login`.

## 5. Role-tailored dashboards

Log in as each role and check `/dashboard` — each looks structurally
different, not just re-colored:

- **Fleet Manager**: KPI grid + trips chart on the left, a brand-colored
  utilization card + fleet status donut + "in the shop" list + quick links
  on the right.
- **Safety Officer**: a horizontal stat strip (avg safety score, total
  drivers, suspended, licenses flagged) then a safety-score chart + license
  donut next to a suspended-driver watchlist with avatar initials.
- **Financial Analyst**: a dark "statement" hero card with the total
  operational cost, then a cost-by-vehicle chart + cost breakdown donut +
  cost-recovery ratio.
- **Driver**: a single-column, card-based list (not a table) — "Create a
  Trip" button up top, then active/pending trips as cards.

All four show an amber "expiring soon" banner (licenses/insurance/PUC) when
applicable — seed data deliberately includes some expiring within 30 days.

## 6. Search, filter, sort, bulk import, empty states

On `/vehicles`, `/drivers`, `/trips`, `/maintenance`: use the search box and
status dropdown, click column headers to sort (click again to reverse).
Clear a search that matches nothing to see the "no records match" empty
state vs. the genuinely-empty-list one.

On `/vehicles` or `/drivers`, click **Bulk Import** → download the template
→ upload a filled-in CSV/XLSX → see a per-row success/failure report. Try
re-uploading the same file to see the duplicate-registration/license error.

## 7. Language switcher

Click the sidebar's Language control and switch to Hindi/Gujarati/Marathi/
Tamil/Bengali. Confirm the change is visible well beyond the nav: page
titles and subtitles, every table's column headers and search placeholder,
and each dashboard's headings/labels should all translate.

## 8. Dark mode

Toggle dark mode from the sidebar. Check the **login page specifically**
(log out first) — input text should be clearly readable, not white-on-white.

## 9. Toasts and confirmations

Every create/edit form shows a toast (top-right) on success/error instead of
an inline red box. Retiring a vehicle, suspending a driver, or cancelling a
trip asks for confirmation first — the dialog should appear centered over
the whole page, not clipped or overlapping the table underneath it.

## 10. Reports export

On `/reports`, try all three export buttons. CSV and Excel should match the
on-screen table exactly. The **PDF** should show a branded purple header
banner, a hand-drawn "Top Operational Cost by Vehicle" bar chart and a
"Distance Covered" line chart above the data table — not just plain text.

## 11. Trips section: Billing/GST, Vehicle Compliance, Weather

Click into any trip from `/trips` (its route text is a link) to open the
trip detail page, which has four tabs:

- **Overview**: trip info + the same dispatch/complete/cancel actions as the
  list page.
- **Billing & GST**: if no invoice exists yet, fill in a taxable amount, GST
  slab (0/5/12/18/28%), and CGST+SGST vs IGST, then Generate Invoice. Once
  generated, it shows the tax breakdown, total, and an e-way bill number +
  validity window (auto-computed from distance) + whether an e-way bill is
  actually required (value > ₹50,000). Download it as a PDF.
- **Vehicle Compliance**: the assigned vehicle's chassis number, insurance/
  PUC expiry (with a color-coded days-left pill), FASTag ID/balance, and a
  traffic challan ledger — add a challan, mark one paid.
- **Weather & Route**: live current weather for the trip's source and
  destination (via the free, keyless Open-Meteo API) plus a plain-language
  advisory (rain/fog/heat/wind warnings). Note: this is a weather advisory,
  not live traffic routing — the UI says so; a real "best route with
  diversions" feature needs a paid mapping API with a key.

## 12. Automated tests

```bash
npm test
```

Should print `pass 11`, `fail 0` — covering the example workflow, every
rejection rule, cancel behavior, maintenance transitions, and the RBAC
matrix, all against a disposable database.
