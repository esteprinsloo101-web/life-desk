/* Life Desk — static demo autopilot
   Sample SA household · localStorage · module toggles */

(function () {
  "use strict";

  const STORAGE_KEY = "life-desk-v1";
  const TZ = "Africa/Johannesburg";

  const DEFAULT_MODULES = {
    money: true,
    vehicle: true,
    tax: true,
    household: true,
    docs: true,
  };

  function seed() {
    const today = startOfDay(new Date());
    return {
      modules: { ...DEFAULT_MODULES },
      household: {
        name: "Prinsloo household",
        city: "Bloemfontein",
      },
      bills: [
        { id: "b1", name: "Mangaung rates & taxes", category: "Municipal", amount: 1850, dueDay: 7, status: "due", accountRef: "MM-44291" },
        { id: "b2", name: "Fibre (Openserve)", category: "Utilities", amount: 799, dueDay: 1, status: "paid", accountRef: "FB-1882" },
        { id: "b3", name: "School fees — Term", category: "School", amount: 4200, dueDay: 15, status: "due", accountRef: "SF-09" },
        { id: "b4", name: "Car insurance — OUTsurance", category: "Insurance", amount: 1120, dueDay: 3, status: "paid", accountRef: "POL-7741" },
        { id: "b5", name: "DSTV Compact", category: "Media", amount: 689, dueDay: 20, status: "due", accountRef: "DSTV" },
        { id: "b6", name: "Medical aid — Discovery", category: "Health", amount: 3850, dueDay: 1, status: "paid", accountRef: "MA-220" },
      ],
      envelopes: [
        { id: "e1", name: "Fixed bills", cap: 14000, spent: 9758 },
        { id: "e2", name: "Groceries", cap: 6500, spent: 4120 },
        { id: "e3", name: "Fuel & transport", cap: 2500, spent: 1680 },
        { id: "e4", name: "Buffer / emergency", cap: 3000, spent: 0 },
      ],
      prepaid: [
        { id: "p1", type: "Electricity (prepaid)", lastTopUpDaysAgo: 12, cadenceDays: 18, note: "Top-up ~every 2–3 weeks" },
        { id: "p2", type: "Water — municipal", lastTopUpDaysAgo: 0, cadenceDays: 30, note: "Monthly statement" },
      ],
      vehicle: {
        reg: "FS 12 GP GP",
        makeModel: "Toyota Fortuner 2.4",
        year: 2019,
        odometerKm: 78240,
        discExpiry: isoDate(addDays(today, 18)),
        serviceIntervalKm: 15000,
        serviceIntervalMonths: 12,
        lastServiceAt: isoDate(addDays(today, -250)),
        lastServiceOdo: 68000,
        insurance: { insurer: "OUTsurance", premium: 1120, renewsAt: isoDate(addDays(today, 95)) },
        fills: [
          { at: isoDate(addDays(today, -4)), litres: 48, amount: 1056, odo: 77990 },
          { at: isoDate(addDays(today, -11)), litres: 52, amount: 1144, odo: 77610 },
        ],
      },
      tax: [
        { id: "t1", type: "provisional", label: "Provisional tax — 1st period", dueAt: isoDate(addDays(today, 24)), status: "open", prepDone: 2, prepTotal: 5 },
        { id: "t2", type: "personal", label: "Personal ITR12 filing window", dueAt: isoDate(addDays(today, 62)), status: "open", prepDone: 1, prepTotal: 6 },
        { id: "t3", type: "vat", label: "VAT 201 (if registered) — demo", dueAt: isoDate(addDays(today, 11)), status: "open", prepDone: 0, prepTotal: 4 },
      ],
      workers: [
        { id: "w1", name: "Thandi Mokoena", role: "Domestic", days: "Mon–Fri", wage: 3200, nextPay: isoDate(addDays(today, 2)) },
        { id: "w2", name: "Pieter Botha", role: "Gardener", days: "Tue & Fri", wage: 1800, nextPay: isoDate(addDays(today, 2)) },
      ],
      payrollApproved: false,
      docs: [
        { id: "d1", title: "IDs — household adults", category: "Identity", expiresAt: null, module: "docs" },
        { id: "d2", title: "Vehicle licence disc copy", category: "Vehicle", expiresAt: isoDate(addDays(today, 18)), module: "vehicle" },
        { id: "d3", title: "OUTsurance policy schedule", category: "Insurance", expiresAt: isoDate(addDays(today, 95)), module: "vehicle" },
        { id: "d4", title: "Thandi — contract + ID", category: "Household", expiresAt: isoDate(addDays(today, 200)), module: "household" },
        { id: "d5", title: "Provisional tax prep pack", category: "Tax", expiresAt: isoDate(addDays(today, 24)), module: "tax" },
        { id: "d6", title: "Medical aid membership", category: "Health", expiresAt: null, module: "money" },
      ],
    };
  }

  /* ── date helpers (SAST-oriented display) ── */
  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }
  function isoDate(d) {
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function parseISO(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function daysUntil(iso) {
    const a = startOfDay(new Date());
    const b = startOfDay(parseISO(iso));
    return Math.round((b - a) / 86400000);
  }
  function fmtDate(iso) {
    try {
      return parseISO(iso).toLocaleDateString("en-ZA", {
        timeZone: TZ,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }
  function fmtMoney(n) {
    return "R" + Number(n).toLocaleString("en-ZA");
  }
  function todayLabel() {
    return new Date().toLocaleDateString("en-ZA", {
      timeZone: TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  /* ── state ── */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed();
      const data = JSON.parse(raw);
      data.modules = { ...DEFAULT_MODULES, ...(data.modules || {}) };
      return data;
    } catch {
      return seed();
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = load();
  let currentView = "today";

  /* ── queue builder ── */
  function buildQueue() {
    const items = [];
    const m = state.modules;

    if (m.money) {
      state.bills.filter((b) => b.status !== "paid").forEach((b) => {
        const due = daysUntil(dueDateForBill(b));
        items.push({
          id: "q-bill-" + b.id,
          module: "money",
          title: b.name,
          meta: fmtMoney(b.amount) + " · due " + fmtDate(dueDateForBill(b)),
          severity: due < 0 ? "red" : due <= 3 ? "amber" : "green",
          due,
          action: "money",
          icon: "R",
        });
      });
      state.prepaid.forEach((p) => {
        const left = p.cadenceDays - p.lastTopUpDaysAgo;
        if (left <= 5) {
          items.push({
            id: "q-pre-" + p.id,
            module: "money",
            title: p.type + " top-up",
            meta: left <= 0 ? "Overdue cadence" : "Due in ~" + left + " days",
            severity: left <= 0 ? "red" : "amber",
            due: left,
            action: "money",
            icon: "⚡",
          });
        }
      });
    }

    if (m.vehicle) {
      const d = daysUntil(state.vehicle.discExpiry);
      items.push({
        id: "q-disc",
        module: "vehicle",
        title: "Licence disc renewal",
        meta: d < 0 ? "Expired" : d + " days left · " + state.vehicle.reg,
        severity: d <= 7 ? "red" : d <= 30 ? "amber" : "green",
        due: d,
        action: "vehicle",
        icon: "▣",
      });
      const svc = serviceProgress();
      if (svc.pct >= 80) {
        items.push({
          id: "q-svc",
          module: "vehicle",
          title: "Vehicle service window",
          meta: svc.label,
          severity: svc.pct >= 100 ? "red" : "amber",
          due: svc.pct >= 100 ? 0 : 14,
          action: "vehicle",
          icon: "🔧",
        });
      }
    }

    if (m.tax) {
      state.tax.forEach((t) => {
        const d = daysUntil(t.dueAt);
        if (d <= 45) {
          items.push({
            id: "q-tax-" + t.id,
            module: "tax",
            title: t.label,
            meta: "Prep " + t.prepDone + "/" + t.prepTotal + " · " + fmtDate(t.dueAt),
            severity: d <= 7 ? "red" : d <= 21 ? "amber" : "green",
            due: d,
            action: "tax",
            icon: "📋",
          });
        }
      });
    }

    if (m.household && state.workers.length) {
      const pay = state.workers[0].nextPay;
      const d = daysUntil(pay);
      items.push({
        id: "q-pay",
        module: "household",
        title: state.payrollApproved ? "Payroll approved — mark paid on day" : "Employer payday — Approve payroll",
        meta: state.workers.length + " workers · " + fmtDate(pay),
        severity: state.payrollApproved ? "green" : d <= 1 ? "red" : "amber",
        due: d,
        action: "household",
        icon: "👥",
      });
    }

    if (m.docs) {
      state.docs.forEach((doc) => {
        if (!doc.expiresAt) return;
        const d = daysUntil(doc.expiresAt);
        if (d <= 30) {
          items.push({
            id: "q-doc-" + doc.id,
            module: "docs",
            title: "Doc expiring: " + doc.title,
            meta: fmtDate(doc.expiresAt),
            severity: d <= 7 ? "red" : "amber",
            due: d,
            action: "docs",
            icon: "📄",
          });
        }
      });
    }

    items.sort((a, b) => a.due - b.due || a.title.localeCompare(b.title));
    return items;
  }

  function dueDateForBill(b) {
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), b.dueDay);
    if (d < startOfDay(now) && b.status !== "paid") {
      /* keep this month if still unpaid past due — show overdue */
      return isoDate(d);
    }
    if (d < startOfDay(now)) {
      d = new Date(now.getFullYear(), now.getMonth() + 1, b.dueDay);
    }
    return isoDate(d);
  }

  function serviceProgress() {
    const v = state.vehicle;
    const kmUsed = v.odometerKm - v.lastServiceOdo;
    const kmPct = Math.min(120, Math.round((kmUsed / v.serviceIntervalKm) * 100));
    const months = Math.round(
      (startOfDay(new Date()) - startOfDay(parseISO(v.lastServiceAt))) / (30.4 * 86400000)
    );
    const moPct = Math.min(120, Math.round((months / v.serviceIntervalMonths) * 100));
    const pct = Math.max(kmPct, moPct);
    return {
      pct,
      label:
        kmUsed.toLocaleString("en-ZA") +
        " km since service · " +
        months +
        " mo · interval " +
        v.serviceIntervalKm.toLocaleString("en-ZA") +
        " km / " +
        v.serviceIntervalMonths +
        " mo",
    };
  }

  function buildReminders() {
    const q = buildQueue().slice(0, 5);
    const base = new Date();
    return q.map((item, i) => {
      const fire = new Date(base);
      fire.setHours(7 + i, i === 0 ? 0 : 30, 0, 0);
      if (fire < base) fire.setDate(fire.getDate() + 1);
      const time = fire.toLocaleTimeString("en-ZA", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
      });
      const day = fire.toLocaleDateString("en-ZA", {
        timeZone: TZ,
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      return {
        when: day + " · " + time,
        title: item.title,
        src: item.module,
      };
    });
  }

  /* ── UI ── */
  function $(sel) {
    return document.querySelector(sel);
  }
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function showView(name) {
    currentView = name;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const el = document.getElementById("view-" + name);
    if (el) el.classList.add("active");
    document.querySelectorAll("#bottom-nav button").forEach((b) => {
      b.classList.toggle("active", b.dataset.nav === name || (name !== "today" && name !== "money" && name !== "vehicle" && name !== "more" && b.dataset.nav === "more"));
      if (["today", "money", "vehicle", "more"].includes(name)) {
        b.classList.toggle("active", b.dataset.nav === name);
      }
    });
    render();
    window.scrollTo(0, 0);
  }

  function openModal(title, html) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = html;
    $("#modal").classList.add("open");
    $("#modal").setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    $("#modal").classList.remove("open");
    $("#modal").setAttribute("aria-hidden", "true");
  }

  function renderNavVisibility() {
    document.querySelectorAll("#bottom-nav button[data-mod]").forEach((btn) => {
      const mod = btn.dataset.mod;
      btn.classList.toggle("hidden-nav", !state.modules[mod]);
    });
    if (!state.modules.money && currentView === "money") showView("today");
    if (!state.modules.vehicle && currentView === "vehicle") showView("today");
  }

  function renderToday() {
    $("#today-date").textContent = todayLabel();
    const queue = buildQueue();
    $("#today-count").innerHTML = '<span class="dot"></span> ' + queue.length + " items";
    const root = $("#today-queue");
    if (!queue.length) {
      root.innerHTML = '<div class="empty">Nothing urgent — autopilot is clear. Toggle modules in Settings if this looks empty.</div>';
    } else {
      root.innerHTML = queue
        .map(
          (item) => `
        <button type="button" class="row sev-${item.severity}" data-goto="${item.action}">
          <div class="row-icon">${item.icon}</div>
          <div class="row-body">
            <div class="row-title">${esc(item.title)}</div>
            <div class="row-meta">${esc(item.meta)}</div>
          </div>
          <div class="row-right">
            <span class="badge ${item.severity === "red" ? "danger" : item.severity === "amber" ? "warn" : "ok"}">${item.due < 0 ? "Overdue" : item.due === 0 ? "Today" : item.due + "d"}</span>
          </div>
        </button>`
        )
        .join("");
    }

    const rem = buildReminders();
    const rp = $("#reminder-panel");
    if (!rem.length) {
      rp.innerHTML = '<div class="empty">No scheduled reminders</div>';
    } else {
      rp.innerHTML = rem
        .map(
          (r) => `
        <div class="reminder-item">
          <div class="r-time">${esc(r.when)}</div>
          <div class="r-body">${esc(r.title)}<div class="r-src">${esc(r.src)}</div></div>
        </div>`
        )
        .join("");
    }
  }

  function renderMoney() {
    const due = state.bills.filter((b) => b.status !== "paid");
    const paid = state.bills.filter((b) => b.status === "paid");
    $("#money-due-total").textContent = fmtMoney(due.reduce((s, b) => s + b.amount, 0));
    $("#money-paid-count").textContent = String(paid.length);
    $("#bills-badge").textContent = due.length + " open";

    $("#envelope-list").innerHTML = state.envelopes
      .map((e) => {
        const pct = Math.min(100, Math.round((e.spent / e.cap) * 100));
        const over = e.spent > e.cap;
        return `
        <div class="env-row">
          <div class="env-head"><span>${esc(e.name)}</span><span class="env-amt">${fmtMoney(e.spent)} / ${fmtMoney(e.cap)}</span></div>
          <div class="progress"><span style="width:${pct}%;background:${over ? "var(--red)" : "linear-gradient(90deg,var(--accent-dim),var(--accent-bright))"}"></span></div>
        </div>`;
      })
      .join("");

    $("#bills-list").innerHTML = state.bills
      .map(
        (b) => `
      <div class="row ${b.status === "paid" ? "paid" : "sev-amber"}" data-bill="${b.id}">
        <div class="row-icon">R</div>
        <div class="row-body">
          <div class="row-title">${esc(b.name)}</div>
          <div class="row-meta">${esc(b.category)} · due day ${b.dueDay} · ${esc(b.accountRef)}</div>
        </div>
        <div class="row-right">
          <div class="amount">${fmtMoney(b.amount)}</div>
          ${
            b.status === "paid"
              ? '<span class="badge ok">Paid</span>'
              : `<button type="button" class="btn btn-primary btn-sm" data-pay="${b.id}">Mark paid</button>`
          }
        </div>
      </div>`
      )
      .join("");

    $("#prepaid-list").innerHTML = state.prepaid
      .map((p) => {
        const left = p.cadenceDays - p.lastTopUpDaysAgo;
        return `
        <div class="row sev-${left <= 0 ? "red" : left <= 5 ? "amber" : "teal"}">
          <div class="row-icon">⚡</div>
          <div class="row-body">
            <div class="row-title">${esc(p.type)}</div>
            <div class="row-meta">${esc(p.note)} · last top-up ${p.lastTopUpDaysAgo}d ago</div>
          </div>
          <div class="row-right"><span class="badge ${left <= 0 ? "danger" : left <= 5 ? "warn" : "teal"}">${left <= 0 ? "Now" : "~" + left + "d"}</span></div>
        </div>`;
      })
      .join("");
  }

  function renderVehicle() {
    const v = state.vehicle;
    $("#vehicle-subtitle").textContent = v.makeModel + " · " + v.reg;
    const d = daysUntil(v.discExpiry);
    const cd = $("#disc-countdown");
    cd.textContent = d < 0 ? "Expired" : d + " days";
    cd.className = "countdown-big " + (d <= 7 ? "danger" : d <= 30 ? "warn" : "");
    $("#disc-meta").textContent = "Expires " + fmtDate(v.discExpiry) + " · odo " + v.odometerKm.toLocaleString("en-ZA") + " km";
    $("#disc-badge").textContent = d <= 7 ? "Urgent" : d <= 30 ? "Soon" : "OK";
    $("#disc-badge").className = "badge " + (d <= 7 ? "danger" : d <= 30 ? "warn" : "ok");

    const svc = serviceProgress();
    $("#service-meta").textContent = svc.label;
    $("#service-bar").style.width = Math.min(100, svc.pct) + "%";
    $("#service-badge").textContent = svc.pct + "%";
    $("#service-badge").className = "badge " + (svc.pct >= 100 ? "danger" : svc.pct >= 80 ? "warn" : "ok");

    $("#insurance-meta").innerHTML =
      "<strong>" +
      esc(v.insurance.insurer) +
      "</strong> · " +
      fmtMoney(v.insurance.premium) +
      "/mo · renews " +
      fmtDate(v.insurance.renewsAt);

    $("#fill-log").innerHTML = (v.fills || [])
      .slice(0, 5)
      .map(
        (f) => `
      <div class="row">
        <div class="row-body">
          <div class="row-title">${f.litres} L · ${fmtMoney(f.amount)}</div>
          <div class="row-meta">${fmtDate(f.at)} · ${f.odo.toLocaleString("en-ZA")} km</div>
        </div>
      </div>`
      )
      .join("") || '<div class="empty">No fills logged</div>';
  }

  function renderMore() {
    const items = [
      { id: "tax", mod: "tax", icon: "📋", title: "Tax", meta: "Deadlines · prep packs" },
      { id: "household", mod: "household", icon: "👥", title: "Household", meta: "Workers · payroll Approve" },
      { id: "docs", mod: "docs", icon: "📄", title: "Docs", meta: "Vault · expiry watch" },
      { id: "settings", mod: null, icon: "⚙", title: "Settings", meta: "Module toggles" },
    ];
    $("#more-grid").innerHTML = items
      .filter((i) => !i.mod || state.modules[i.mod])
      .map(
        (i) => `
      <button type="button" class="more-item" data-nav="${i.id}">
        <div class="mi-icon">${i.icon}</div>
        <div class="mi-body">
          <div class="mi-title">${i.title}</div>
          <div class="mi-meta">${i.meta}</div>
        </div>
        <div class="mi-chevron">›</div>
      </button>`
      )
      .join("");
  }

  function renderTax() {
    $("#tax-list").innerHTML = state.tax
      .map((t) => {
        const d = daysUntil(t.dueAt);
        const pct = Math.round((t.prepDone / t.prepTotal) * 100);
        return `
        <div class="card mb-12 sev-${d <= 7 ? "red" : d <= 21 ? "amber" : "teal"}">
          <div class="card-head">
            <h3>${esc(t.label)}</h3>
            <span class="badge ${d <= 7 ? "danger" : d <= 21 ? "warn" : "info"}">${d < 0 ? "Overdue" : d + "d"}</span>
          </div>
          <p style="font-size:13px;color:var(--text-dim);margin-bottom:8px">Due ${fmtDate(t.dueAt)} · ${esc(t.type)}</p>
          <div class="env-head"><span>Prep pack</span><span class="env-amt">${t.prepDone}/${t.prepTotal}</span></div>
          <div class="progress"><span style="width:${pct}%"></span></div>
          <div class="btn-row">
            <button type="button" class="btn btn-ghost btn-sm" data-tax-prep="${t.id}">Advance prep</button>
            <button type="button" class="btn btn-primary btn-sm" data-tax-done="${t.id}">Mark submitted</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderHousehold() {
    $("#workers-count").textContent = String(state.workers.length);
    $("#workers-list").innerHTML = state.workers
      .map(
        (w) => `
      <div class="row">
        <div class="row-icon">👤</div>
        <div class="row-body">
          <div class="row-title">${esc(w.name)}</div>
          <div class="row-meta">${esc(w.role)} · ${esc(w.days)} · next pay ${fmtDate(w.nextPay)}</div>
        </div>
        <div class="row-right"><div class="amount">${fmtMoney(w.wage)}</div></div>
      </div>`
      )
      .join("");

    const box = $("#payroll-approve");
    if (state.payrollApproved) {
      box.innerHTML = `
        <h3>Payroll approved ✓</h3>
        <p>Slips filed to Docs vault on pay day. UIF checklist still open.</p>
        <button type="button" class="btn btn-ghost btn-block" id="btn-payroll-undo">Undo (demo)</button>`;
      $("#btn-payroll-undo")?.addEventListener("click", () => {
        state.payrollApproved = false;
        save();
        render();
        toast("Payroll Approve cleared");
      });
    } else {
      const total = state.workers.reduce((s, w) => s + w.wage, 0);
      $("#payroll-copy").textContent =
        state.workers.length +
        " payslips ready · total " +
        fmtMoney(total) +
        " · pay day " +
        fmtDate(state.workers[0].nextPay) +
        ". You Approve — app does not move money.";
    }
  }

  function renderDocs() {
    const docs = state.docs.filter((d) => {
      if (d.module === "docs") return state.modules.docs;
      return !d.module || state.modules[d.module] !== false;
    });
    $("#docs-list").innerHTML =
      docs
        .map((d) => {
          const exp = d.expiresAt ? daysUntil(d.expiresAt) : null;
          return `
        <div class="row ${exp !== null && exp <= 14 ? "sev-amber" : ""}">
          <div class="row-icon">📄</div>
          <div class="row-body">
            <div class="row-title">${esc(d.title)}</div>
            <div class="row-meta">${esc(d.category)}${d.expiresAt ? " · exp " + fmtDate(d.expiresAt) : ""}</div>
          </div>
          <div class="row-right">
            ${
              exp === null
                ? '<span class="badge muted">Active</span>'
                : `<span class="badge ${exp <= 7 ? "danger" : exp <= 30 ? "warn" : "ok"}">${exp}d</span>`
            }
          </div>
        </div>`;
        })
        .join("") || '<div class="empty">Vault empty for enabled modules</div>';
  }

  function renderSettings() {
    const defs = [
      { key: "money", title: "Money", meta: "Bills, envelopes, prepaid / municipal" },
      { key: "vehicle", title: "Vehicle", meta: "Disc, service, tyres, insurance, fuel" },
      { key: "tax", title: "Tax", meta: "Provisional / VAT / personal reminders + prep" },
      { key: "household", title: "Household employer", meta: "Domestic / gardener / nanny — disable if unused" },
      { key: "docs", title: "Docs vault", meta: "Expiry watch + module filings" },
    ];
    $("#module-toggles").innerHTML = defs
      .map(
        (d) => `
      <label class="toggle-row">
        <div>
          <div class="t-label">${d.title}</div>
          <div class="t-meta">${d.meta}</div>
        </div>
        <div class="switch">
          <input type="checkbox" data-mod-toggle="${d.key}" ${state.modules[d.key] ? "checked" : ""} />
          <span class="slider"></span>
        </div>
      </label>`
      )
      .join("");
  }

  function render() {
    renderNavVisibility();
    if (currentView === "today") renderToday();
    if (currentView === "money") renderMoney();
    if (currentView === "vehicle") renderVehicle();
    if (currentView === "more") renderMore();
    if (currentView === "tax") renderTax();
    if (currentView === "household") renderHousehold();
    if (currentView === "docs") renderDocs();
    if (currentView === "settings") renderSettings();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ── events ── */
  function resetDemo() {
    if (!confirm("Reset all Life Desk demo data?")) return;
    state = seed();
    save();
    showView("today");
    toast("Demo reset");
  }

  document.getElementById("bottom-nav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-nav]");
    if (!btn) return;
    showView(btn.dataset.nav);
  });

  document.getElementById("main").addEventListener("click", (e) => {
    const back = e.target.closest("[data-nav]");
    if (back && back.classList.contains("back-link")) {
      showView(back.dataset.nav);
      return;
    }
    const more = e.target.closest(".more-item[data-nav]");
    if (more) {
      showView(more.dataset.nav);
      return;
    }
    const goto = e.target.closest("[data-goto]");
    if (goto) {
      showView(goto.dataset.goto);
      return;
    }
    const pay = e.target.closest("[data-pay]");
    if (pay) {
      const bill = state.bills.find((b) => b.id === pay.dataset.pay);
      if (bill) {
        bill.status = "paid";
        save();
        render();
        toast("Marked paid — " + bill.name);
      }
      return;
    }
    const taxPrep = e.target.closest("[data-tax-prep]");
    if (taxPrep) {
      const t = state.tax.find((x) => x.id === taxPrep.dataset.taxPrep);
      if (t && t.prepDone < t.prepTotal) {
        t.prepDone++;
        save();
        render();
        toast("Prep advanced " + t.prepDone + "/" + t.prepTotal);
      }
      return;
    }
    const taxDone = e.target.closest("[data-tax-done]");
    if (taxDone) {
      const t = state.tax.find((x) => x.id === taxDone.dataset.taxDone);
      if (t) {
        t.status = "submitted";
        t.prepDone = t.prepTotal;
        save();
        render();
        toast("Marked submitted (you filed — app did not)");
      }
      return;
    }
    const modToggle = e.target.closest("[data-mod-toggle]");
    if (modToggle) {
      state.modules[modToggle.dataset.modToggle] = !!modToggle.checked;
      save();
      render();
      toast((modToggle.checked ? "Enabled " : "Hidden ") + modToggle.dataset.modToggle);
      return;
    }
  });

  $("#btn-reset").addEventListener("click", resetDemo);
  $("#btn-reset-2").addEventListener("click", resetDemo);

  $("#btn-info").addEventListener("click", () => {
    openModal(
      "About Life Desk",
      `<p><strong>Life Desk</strong> is a mobile-first demo of a South African household life-management autopilot (L3–L4).</p>
       <p>It invents a Today queue from bills, vehicle disc, tax deadlines, employer payday and doc expiry. You only <strong>Approve</strong> money / legal / government steps.</p>
       <p>Sample data: Prinsloo household, Bloemfontein. Toggle modules in Settings.</p>
       <p style="font-size:12px;color:var(--muted)">Not tax, legal, labour or financial advice. Does not file with SARS or uFiling. Demo / localStorage only.</p>`
    );
  });
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });

  $("#btn-log-fill").addEventListener("click", () => {
    const litres = Number($("#fill-litres").value);
    const amount = Number($("#fill-amount").value);
    const odo = Number($("#fill-odo").value) || state.vehicle.odometerKm;
    if (!litres || !amount) {
      toast("Enter litres and amount");
      return;
    }
    state.vehicle.fills.unshift({
      at: isoDate(new Date()),
      litres,
      amount,
      odo,
    });
    state.vehicle.odometerKm = Math.max(state.vehicle.odometerKm, odo);
    $("#fill-litres").value = "";
    $("#fill-amount").value = "";
    $("#fill-odo").value = "";
    save();
    render();
    toast("Fuel fill saved");
  });

  $("#btn-disc-checklist").addEventListener("click", () => {
    openModal(
      "Disc renewal checklist",
      `<ul style="font-size:13px;line-height:1.7;padding-left:18px;list-style:disc">
        <li>Valid driving licence</li>
        <li>Proof of address (≤3 months)</li>
        <li>Insurance / police clearance if required</li>
        <li>Roadworthy (if due)</li>
        <li>Attend licensing department / NaTIS agent</li>
      </ul>
      <p style="font-size:12px;color:var(--muted);margin-top:10px">App prepares — you attend. Not a licensing agent.</p>`
    );
  });

  $("#btn-disc-renewed").addEventListener("click", () => {
    const next = isoDate(addDays(new Date(), 365));
    state.vehicle.discExpiry = next;
    const doc = state.docs.find((d) => d.id === "d2");
    if (doc) doc.expiresAt = next;
    save();
    render();
    toast("Disc marked renewed (+12 months demo)");
  });

  document.getElementById("view-household").addEventListener("click", (e) => {
    if (e.target.id === "btn-payroll-approve") {
      state.payrollApproved = true;
      if (!state.docs.find((d) => d.id === "d-payslips")) {
        state.docs.unshift({
          id: "d-payslips",
          title: "Payslips — " + fmtDate(state.workers[0].nextPay),
          category: "Household",
          expiresAt: null,
          module: "household",
        });
      }
      save();
      render();
      toast("Payroll Approved — slips ready");
    }
    if (e.target.id === "btn-payroll-later") {
      toast("Kept in Today queue");
    }
    if (e.target.id === "btn-ufiling") {
      openModal(
        "UIF checklist",
        `<ul style="font-size:13px;line-height:1.7;padding-left:18px;list-style:disc">
          <li>Confirm worker declarations</li>
          <li>Contribution amount calculated (demo)</li>
          <li>Open uFiling in your browser (you log in)</li>
          <li>Mark period complete in Life Desk after you file</li>
        </ul>
        <p style="font-size:12px;color:var(--muted);margin-top:10px">Life Desk does not submit to uFiling for you.</p>`
      );
    }
  });

  /* boot */
  save();
  render();
})();
