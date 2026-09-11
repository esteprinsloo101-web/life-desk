# Life Desk

**Life Desk** is a polished, mobile-first static web demo of a South African **household life-management autopilot** (L3–L4).

Sample household: **Prinsloo · Bloemfontein**. Demo / sample data only. **Not** financial, tax, insurance, labour, or legal advice. No mining, chemistry, or environmental advisory.

It is a **personal family capability showcase**. Modules adapt via Settings toggles (persisted in `localStorage`). Installable as a **PWA** (Add to Home Screen) with an offline-ish shell cache.

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
| **Retirement / Insurance / Kids / Home ops** | Coverage already in demo — process-backed where due |
| **Science Desk** | Weekly improve tips (methods + limits) |
| **Settings** | Module show/hide · quiet hours · notifications · export/import |

Shared DNA with Garage Desk and other Este apps: the app **reminds, chases, prepares, closes**; human only **Approves** money / legal / government.

Master function map: `/workspace/ops/research/2026-09-10-life-and-business-apps-master.md`

## Live URL

**https://esteprinsloo101-web.github.io/life-desk/**

(GitHub Pages from `main`; allow a minute after push for deploy. Source: Settings → Pages → Deploy from branch `main` / root, or the repo’s Pages workflow if configured.)

## Open locally

Plain static files. No build step. **Serve over http(s)** so the service worker and notifications can register (file:// is fine for a quick look, but PWA/SW need a server).

```bash
# from this folder
python3 -m http.server 8765
# then open http://127.0.0.1:8765/
```

Files: `index.html` · `styles.css` · `app.js` · `manifest.webmanifest` · `service-worker.js` · `icons/` · `README.md`

## PWA (install + offline shell)

1. Open the live URL or local server in Chrome / Edge / Safari.
2. Use **Install** / **Add to Home Screen** when the banner appears (or browser menu).
3. On iOS Safari: Share → **Add to Home Screen**.
4. The service worker caches the shell: `index.html`, `app.js`, `styles.css`, `manifest.webmanifest` (+ icons). Offline use is **shell-only** — open the app once online first.

Theme colour and manifest are linked from `index.html`.

## Reminders v1

- **Today → Next reminders** shows the in-app queue for due / lead-window processes (tap to run the wizard).
- **Enable notifications** (or Settings → Request permission). If denied, the UI stays graceful — in-app queue still works.
- **Quiet hours** (default 21:00–07:00) are stored in `localStorage` with app state; alerts are skipped during quiet hours and fire times shift outside them.
- After you finish a process (**Done**), the next reminder is scheduled from the new **next due** (when permission is granted and the tab can run timers).

## Backup (export / import)

In **Settings → Backup**:

1. **Export JSON** — downloads app state (`life-desk-v4` payload: processes, history, modules, prefs, household data).
2. **Import JSON** — pick a previous export to restore (round-trip). Invalid files toast an error and leave current data alone.

## Guided processes (not checklists)

Clicking a due bill/payment opens a **ProcessRunner** wizard: **Open payment** (exact stored https URL via `window.open`) → **Confirm paid** (amount optional) → **Done** with **next due auto-filled from cadence** (override optional). Item leaves Today until the lead window. Prepaid top-ups use the same pattern. Add/edit processes and payment URLs in **Settings**.

## How to try

1. **Today** / **Money** — tap an outstanding bill → **Open payment** → confirm paid → next due auto from cadence; check reminders + history.
2. **Settings** — set quiet hours; request notifications; export then import JSON to verify backup.
3. **Install** — Add to Home Screen; reload offline to confirm the shell still loads.
4. **Vehicle** — log a fuel fill; try disc checklist / mark renewed.
5. **More → Tax / Household / Docs / Kids / Insurance / Retirement / Science Desk** — explore coverage.
6. **↺** — reset demo data anytime.

## Related business apps (separate SKUs)

| App | Notes |
|-----|--------|
| Garage Desk | Live: https://esteprinsloo101-web.github.io/garage-desk/ · `/workspace/garage-desk` |
| Trade Job Pipeline | Brief: `/workspace/ops/research/business-apps/trade.md` |
| Rental Case | Brief: `/workspace/ops/research/business-apps/rental.md` |
| Shared Group Money | Brief: `/workspace/ops/research/business-apps/group-money.md` |

## Disclaimer

Demo / sample data only. **Not** financial, tax, insurance, labour, or legal advice. Life Desk does **not** file with SARS, submit uFiling, move money, or act as your attorney. **No** mining, chemistry, or environmental advisory. Confirm real-world compliance with qualified professionals and official channels.

## Update 2026-09-11

Platform bar: Science Desk, elderly UI (18px+), location+purpose onboarding, household-with-kids (retirement, insurance hub, kids, home ops).

**feat/pwa-reminders-export:** PWA manifest + service worker shell cache, install affordance, reminders v1 (notifications + quiet hours + post-Done schedule), JSON export/import backup.
