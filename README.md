# Life Desk

**Life Desk** is a mobile-first, installable (PWA) South African **household life-management autopilot** (L3–L4).

This public page is a **free try of the live Gumroad product**. Sample household: **Mokoena · Bloemfontein**. Sample data only. **Not** financial, tax, insurance, labour, medical, or legal advice. No mining, chemistry, or environmental advisory.

**Buy live unlock (Gumroad):** [Life Desk Autopilot — R179](https://stofficial.gumroad.com/l/xnofrn)  
Also: [Stokvel OS — R99](https://stofficial.gumroad.com/l/ydbgne) (primary meeting pack).

Modules adapt via Settings toggles (persisted in `localStorage`).

## Product spine

**ONE app** with toggleable modules (not separate SKUs):

| Module | Role |
|--------|------|
| **Today** | Due **processes** (tap → guided wizard) · reminders · completion history |
| **Money** | Bills, budget envelopes, prepaid/municipal, mark paid |
| **Vehicle** | Licence disc countdown, service due, insurance, fuel log |
| **Tax** | Upcoming deadline cards + prep packs (**not** filing as you) |
| **Household** | Workers stub + payroll **Approve** card (disable if unused) |
| **Docs** | Simple vault list with expiry watch |
| **Retirement / Insurance / Kids / Home ops** | Coverage already in this free try — process-backed where due |
| **Settings** | Module show/hide · quiet hours · notifications · JSON backup |

Shared DNA with the other desk apps: the app **reminds, chases, prepares, closes**; human only **Approves** money / legal / government.

Master function map: `/workspace/ops/research/2026-09-10-life-and-business-apps-master.md`

## Free try (live)

**https://esteprinsloo101-web.github.io/life-desk/**

GitHub Pages from `main` at repo root (allow a minute after merge for deploy). Paid unlock: [Gumroad R179](https://stofficial.gumroad.com/l/xnofrn).

## Open locally

Plain static files. No build step. **Serve over http(s)** so the service worker and notifications can register (`file://` is fine for a quick look, but PWA/SW need a server).

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
4. The service worker caches the shell: `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, icons. Offline use is **shell-only** — open the app once online first.

`theme-color`, Apple web-app meta, and the web manifest are linked from `index.html`. The service worker is registered from `index.html`.

## Reminders

- **Today → Next reminders** shows the in-app queue for due / lead-window processes (tap to run the wizard).
- **Settings → Request notification permission** (or Today → Enable notifications). Prefs persist in `localStorage` (`prefs.notificationsEnabled`, quiet hours).
- **Quiet hours** (default 21:00–07:00) skip alerts; fire times shift outside them.
- Browser **Notification API**, best-effort: alerts for items **due Today / overdue** fire while Life Desk is open in this tab or installed PWA.
- **Limitation:** this static GitHub Pages app has **no background sync or push server**. A fully closed tab/PWA will not receive reminders. Timers only run while the page is alive.

## Backup (export / import)

In **Settings → Backup**:

1. **Export JSON** — downloads full Life Desk `localStorage` app state with a `version` field (`app`, `exportedAt`, `keys.life-desk-v4`).
2. **Import JSON** — pick a previous export; confirm to **replace** local data. Invalid files toast an error and leave current data alone.

## Guided processes (not checklists)

Clicking a due bill/payment opens a **ProcessRunner** wizard: **Open payment** (exact stored https URL via `window.open`) → **Confirm paid** (amount optional) → **Done** with **next due auto-filled from cadence** (override optional). Item leaves Today until the lead window. Prepaid top-ups use the same pattern. Add/edit processes and payment URLs in **Settings**.

## How to try

1. **Today** / **Money** — tap an outstanding bill → **Open payment** → confirm paid → next due auto from cadence; check reminders + history.
2. **Settings** — set quiet hours; request notifications; export then import JSON to verify backup (confirm replace).
3. **Install** — Add to Home Screen; reload offline to confirm the shell still loads.
4. **Vehicle** — log a fuel fill; try disc checklist / mark renewed.
5. **More → Tax / Household / Docs / Kids / Insurance / Retirement** — explore coverage.
6. **↺** — reset sample data anytime.

## Related apps

| App | Notes |
|-----|--------|
| Trade Job Pipeline | Brief: `/workspace/ops/research/business-apps/trade.md` |
| Rental Case | Brief: `/workspace/ops/research/business-apps/rental.md` |
| Shared Group Money | Brief: `/workspace/ops/research/business-apps/group-money.md` |

## Disclaimer

Free try / sample data only. **Not** financial, tax, insurance, labour, medical, or legal advice. Life Desk does **not** file with SARS, submit uFiling, move money, or act as your attorney. **No** mining, chemistry, or environmental advisory. Confirm real-world compliance with qualified professionals and official channels.

## Update 2026-09-11

Platform bar: elderly UI (18px+), location+purpose onboarding, household-with-kids (retirement, insurance hub, kids, home ops).

**PWA + reminders + backup:** web manifest + service worker shell cache, install affordance, device reminders (Notification API + quiet hours; no background sync), JSON export/import with version field.
