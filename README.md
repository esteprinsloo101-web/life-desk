# Life Desk

**Life Desk** is a polished, mobile-first static web demo of a South African **household life-management autopilot** (L3–L4).

Sample household: **Prinsloo · Bloemfontein**. Demo / sample data only. **Not** tax, legal, labour, or financial advice.

It is a **personal family capability showcase**. Modules adapt via Settings toggles (persisted in `localStorage`).

## Product shape

**ONE app** with toggleable modules (not separate SKUs):

| Module | Role |
|--------|------|
| **Today** | Due **processes** (tap → guided wizard) · reminders · completion history |
| **Money** | Bills, budget envelopes, prepaid/municipal, mark paid |
| **Vehicle** | Licence disc countdown, service due, insurance, fuel log |
| **Tax** | Upcoming deadline cards + prep packs (**not** filing as you) |
| **Household** | Workers stub + payroll **Approve** card (disable if unused) |
| **Docs** | Simple vault list with expiry watch |
| **Settings** | Module show/hide flags |

Shared DNA with Garage Desk and other Este apps: the app **reminds, chases, prepares, closes**; human only **Approves** money / legal / government.

Master function map: `/workspace/ops/research/2026-09-10-life-and-business-apps-master.md`

## Live URL

**https://esteprinsloo101-web.github.io/life-desk/**

(GitHub Pages from `main`; allow a minute after push for first deploy.)

## Open locally

Plain static files. No build step.

```bash
# from this folder
python3 -m http.server 8765
# then open http://127.0.0.1:8765/
```

Or open `index.html` directly in a browser (file:// works for this demo).

Files: `index.html` · `styles.css` · `app.js` · `README.md`

## Guided processes (not checklists)

Clicking a due item opens a **ProcessRunner** wizard: Start → steps (with optional **Open account** deep links) → Done → confirm **next due** from cadence. The item returns to Today when the next due approaches. Add/edit processes and account links in **Settings**.

## How to try

1. **Today** — tap a due process → run the wizard → confirm next due; check history.
2. **Money** — mark a bill paid (persists).
3. **Vehicle** — log a fuel fill; try disc checklist / mark renewed.
4. **More → Tax / Household / Docs** — prep packs, Approve payroll, vault.
5. **More → Settings** — turn off Household (or any module); Today and nav adapt.
6. **↺** — reset demo data anytime.

## Related business apps (separate SKUs)

| App | Notes |
|-----|--------|
| Garage Desk | Live: https://esteprinsloo101-web.github.io/garage-desk/ · `/workspace/garage-desk` |
| Trade Job Pipeline | Brief: `/workspace/ops/research/business-apps/trade.md` |
| Rental Case | Brief: `/workspace/ops/research/business-apps/rental.md` |
| Shared Group Money | Brief: `/workspace/ops/research/business-apps/group-money.md` |

## Disclaimer

Demo / sample data only. Not tax, legal, labour, or financial advice. Life Desk does **not** file with SARS, submit uFiling, move money, or act as your attorney. Confirm real-world compliance with qualified professionals and official channels.
