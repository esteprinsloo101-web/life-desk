/* Life Desk — static demo autopilot
   Sample SA household · localStorage · module toggles */

(function () {
  "use strict";

  const STORAGE_KEY = "life-desk-v2";
  const TZ = "Africa/Johannesburg";

  /* ── Process types (guided wizards, not checklists) ── */
  const PROCESS_TYPES = {
    pay_bill: {
      label: "Pay bill",
      icon: "R",
      defaultCadenceDays: 30,
      leadDays: 7,
      disclaimer: "Not financial advice. You pay — Life Desk only guides.",
      steps: [
        { key: "review", title: "Review bill", body: "Confirm payee, amount and due date. Check your statement if unsure." },
        { key: "account", title: "Open account / pay", body: "Use the account link below (bank app, municipal portal, or debit order note). Complete payment yourself." },
        { key: "confirm", title: "Confirm paid", body: "Tick when the payment is done on your side.", checks: ["I paid / authorised this bill"] },
      ],
    },
    renew_disc: {
      label: "Renew licence disc",
      icon: "▣",
      defaultCadenceDays: 365,
      leadDays: 30,
      disclaimer: "Not a licensing agent. Confirm NaTIS / licensing requirements yourself.",
      steps: [
        { key: "docs", title: "Gather documents", body: "Prepare what the licensing department typically asks for.", checks: ["Driving licence", "Proof of address (≤3 months)", "Insurance / clearance if required", "Roadworthy if due"] },
        { key: "visit", title: "Renew at agent", body: "Attend licensing department / NaTIS agent. Use any portal link if you renew online." },
        { key: "confirm", title: "Confirm renewed", body: "Mark when the new disc is issued.", checks: ["New disc issued / collected"] },
      ],
    },
    tax_deadline: {
      label: "Tax deadline prep",
      icon: "📋",
      defaultCadenceDays: 180,
      leadDays: 21,
      disclaimer: "Not tax advice. Life Desk does not file on SARS eFiling.",
      steps: [
        { key: "prep", title: "Prep pack", body: "Gather IRP5s, medical, travel, and other docs. Advance prep as you go." },
        { key: "efiling", title: "Open eFiling", body: "Log into SARS eFiling yourself. App does not submit." },
        { key: "confirm", title: "Confirm filed", body: "Mark only after you submitted.", checks: ["I submitted / authorised filing myself"] },
      ],
    },
    payroll: {
      label: "Approve payroll",
      icon: "👥",
      defaultCadenceDays: 30,
      leadDays: 5,
      disclaimer: "Not labour advice. You Approve pay — app does not move money.",
      steps: [
        { key: "review", title: "Review slips", body: "Check worker names, days and wage totals prepared by the app." },
        { key: "approve", title: "Approve pay", body: "Confirm you will pay workers. Open bank / uFiling links if needed." },
        { key: "confirm", title: "Confirm approved", body: "Mark Approve complete.", checks: ["Payroll Approved for this cycle"] },
      ],
    },
    prepaid_topup: {
      label: "Prepaid / municipal top-up",
      icon: "⚡",
      defaultCadenceDays: 18,
      leadDays: 5,
      disclaimer: "Confirm municipal amounts on your metro statement.",
      steps: [
        { key: "check", title: "Check balance", body: "Note meter / account balance before top-up." },
        { key: "topup", title: "Top up", body: "Use vendor, bank app or municipal portal." },
        { key: "confirm", title: "Log top-up", body: "Confirm top-up done.", checks: ["Top-up completed"] },
      ],
    },
    custom: {
      label: "Custom process",
      icon: "◎",
      defaultCadenceDays: 30,
      leadDays: 5,
      disclaimer: "Demo process — adapt steps to your household.",
      steps: [
        { key: "do", title: "Do the work", body: "Follow your own checklist for this recurring item." },
        { key: "confirm", title: "Confirm done", body: "Mark complete when finished.", checks: ["Work completed"] },
      ],
    },
  };


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
      processes: seedProcesses(today),
      history: [],
    };
  }

  function seedProcesses(today) {
    const billDue = (dueDay) => {
      const now = startOfDay(today);
      let d = new Date(now.getFullYear(), now.getMonth(), dueDay);
      if (d < now) {/* keep overdue this month */}
      return isoDate(d);
    };
    return [
      {
        id: "pr-b1", type: "pay_bill", title: "Pay Mangaung rates & taxes",
        nextDue: billDue(7), cadenceDays: 30, leadDays: 7, module: "money",
        accountLinks: [{ label: "Mangaung portal", url: "https://www.mangaung.co.za/" }],
        meta: { amount: 1850, billId: "b1", accountRef: "MM-44291" },
      },
      {
        id: "pr-b3", type: "pay_bill", title: "Pay school fees — Term",
        nextDue: billDue(15), cadenceDays: 30, leadDays: 7, module: "money",
        accountLinks: [{ label: "School fees note", url: "https://www.gov.za/" }],
        meta: { amount: 4200, billId: "b3", accountRef: "SF-09" },
      },
      {
        id: "pr-b5", type: "pay_bill", title: "Pay DSTV Compact",
        nextDue: billDue(20), cadenceDays: 30, leadDays: 5, module: "money",
        accountLinks: [{ label: "DStv account", url: "https://www.dstv.co.za/" }],
        meta: { amount: 689, billId: "b5", accountRef: "DSTV" },
      },
      {
        id: "pr-pre1", type: "prepaid_topup", title: "Electricity (prepaid) top-up",
        nextDue: isoDate(addDays(today, 6)), cadenceDays: 18, leadDays: 5, module: "money",
        accountLinks: [{ label: "Prepaid vendor / bank", url: "https://www.fnb.co.za/" }],
        meta: { prepaidId: "p1" },
      },
      {
        id: "pr-disc", type: "renew_disc", title: "Licence disc renewal",
        nextDue: isoDate(addDays(today, 18)), cadenceDays: 365, leadDays: 30, module: "vehicle",
        accountLinks: [{ label: "NaTIS / RTMC info", url: "https://www.natis.gov.za/" }],
        meta: { reg: "FS 12 GP GP" },
      },
      {
        id: "pr-tax1", type: "tax_deadline", title: "Provisional tax — 1st period",
        nextDue: isoDate(addDays(today, 24)), cadenceDays: 180, leadDays: 21, module: "tax",
        accountLinks: [{ label: "SARS eFiling", url: "https://www.sarsefiling.co.za/" }],
        meta: { taxId: "t1" },
      },
      {
        id: "pr-tax3", type: "tax_deadline", title: "VAT 201 (if registered) — demo",
        nextDue: isoDate(addDays(today, 11)), cadenceDays: 60, leadDays: 14, module: "tax",
        accountLinks: [{ label: "SARS eFiling", url: "https://www.sarsefiling.co.za/" }],
        meta: { taxId: "t3" },
      },
      {
        id: "pr-pay", type: "payroll", title: "Approve household payroll",
        nextDue: isoDate(addDays(today, 2)), cadenceDays: 30, leadDays: 5, module: "household",
        accountLinks: [
          { label: "uFiling", url: "https://www.ufiling.co.za/" },
          { label: "Bank app note", url: "https://www.standardbank.co.za/" },
        ],
        meta: {},
      },
    ];
  }

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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
      if (!Array.isArray(data.processes) || !data.processes.length) {
        data.processes = seedProcesses(startOfDay(new Date()));
      }
      if (!Array.isArray(data.history)) data.history = [];
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

  /* ── queue builder (actionable processes) ── */
  function processDue(p) {
    return daysUntil(p.nextDue);
  }
  function processInQueue(p) {
    if (p.paused) return false;
    const m = state.modules;
    if (p.module && m[p.module] === false) return false;
    const lead = p.leadDays != null ? p.leadDays : (PROCESS_TYPES[p.type] || PROCESS_TYPES.custom).leadDays;
    const due = processDue(p) <= lead;
    if (due && p.type === "pay_bill" && p.meta && p.meta.billId) {
      const bill = state.bills.find((b) => b.id === p.meta.billId);
      if (bill && bill.status === "paid" && processDue(p) <= lead) bill.status = "due";
    }
    if (due && p.type === "payroll") state.payrollApproved = false;
    if (due && p.type === "tax_deadline" && p.meta && p.meta.taxId) {
      const t = state.tax.find((x) => x.id === p.meta.taxId);
      if (t && t.status === "submitted") {
        t.status = "open";
        t.prepDone = 0;
      }
    }
    return due;
  }
  function buildQueue() {
    const items = [];
    (state.processes || []).filter(processInQueue).forEach((p) => {
      const due = processDue(p);
      const def = PROCESS_TYPES[p.type] || PROCESS_TYPES.custom;
      items.push({
        id: "q-" + p.id,
        processId: p.id,
        module: p.module || "docs",
        title: p.title,
        meta: (def.label || p.type) + " · due " + fmtDate(p.nextDue) + (p.accountLinks && p.accountLinks.length ? " · link" : ""),
        severity: due < 0 ? "red" : due <= 3 ? "amber" : "green",
        due,
        icon: def.icon || "◎",
      });
    });
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
    $("#today-count").innerHTML = '<span class="dot"></span> ' + queue.length + " due";
    const root = $("#today-queue");
    if (!queue.length) {
      root.innerHTML = '<div class="empty">Nothing due — all processes are ahead of their lead window. Add one below or wait for the next cadence.</div>';
    } else {
      root.innerHTML = queue
        .map(
          (item) => `
        <button type="button" class="row sev-${item.severity}" data-process="${item.processId}">
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

    renderHistoryPanel($("#history-panel"), 5);
  }

  function renderHistoryPanel(el, limit) {
    if (!el) return;
    const hist = (state.history || []).slice(0, limit || 8);
    if (!hist.length) {
      el.innerHTML = '<div class="empty">No completions yet — run a process from the queue</div>';
      return;
    }
    el.innerHTML = hist
      .map(
        (h) => `
      <div class="history-item">
        <div><strong>${esc(h.title)}</strong> · done</div>
        <div class="h-meta">${fmtDate(h.completedAt)} · next ${fmtDate(h.nextDueSet)}${h.note ? " · " + esc(h.note) : ""}</div>
      </div>`
      )
      .join("");
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

    const pl = $("#process-list");
    if (pl) {
      const procs = state.processes || [];
      pl.innerHTML =
        procs
          .map((p) => {
            const def = PROCESS_TYPES[p.type] || PROCESS_TYPES.custom;
            const links = (p.accountLinks || []).map((a) => esc(a.label)).join(", ") || "no account link";
            return `
        <button type="button" class="row" data-edit-process="${p.id}">
          <div class="row-icon">${def.icon}</div>
          <div class="row-body">
            <div class="row-title">${esc(p.title)}</div>
            <div class="row-meta">${esc(def.label)} · every ${p.cadenceDays}d · next ${fmtDate(p.nextDue)} · ${links}</div>
          </div>
          <div class="row-right"><span class="badge muted">Edit</span></div>
        </button>`;
          })
          .join("") || '<div class="empty">No processes — add one</div>';
    }
    renderHistoryPanel($("#history-list-full"), 20);
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


  /* ── ProcessRunner ── */
  let prState = null; // { processId, phaseIndex, answers, suggestedNext }

  function getProcess(id) {
    return (state.processes || []).find((p) => p.id === id);
  }

  function prPhases(proc) {
    const def = PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom;
    const steps = def.steps || [];
    return ["start", ...steps.map((_, i) => "step:" + i), "done", "nextdue"];
  }

  function openProcessRunner(processId) {
    const proc = getProcess(processId);
    if (!proc) {
      toast("Process not found");
      return;
    }
    prState = { processId, phaseIndex: 0, answers: {}, checks: {} };
    $("#process-runner").classList.add("open");
    $("#process-runner").setAttribute("aria-hidden", "false");
    renderProcessRunner();
  }

  function closeProcessRunner() {
    prState = null;
    $("#process-runner").classList.remove("open");
    $("#process-runner").setAttribute("aria-hidden", "true");
  }

  function suggestNextDue(proc) {
    const days = Number(proc.cadenceDays) || (PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom).defaultCadenceDays || 30;
    return isoDate(addDays(new Date(), days));
  }

  function renderProcessRunner() {
    if (!prState) return;
    const proc = getProcess(prState.processId);
    if (!proc) return closeProcessRunner();
    const def = PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom;
    const phases = prPhases(proc);
    const phase = phases[prState.phaseIndex];
    const total = phases.length;
    $("#pr-title").textContent = proc.title;
    $("#pr-badge").textContent = prState.phaseIndex + 1 + "/" + total;

    const stepper = $("#pr-stepper");
    stepper.innerHTML = phases
      .map((_, i) => `<span class="${i < prState.phaseIndex ? "done" : i === prState.phaseIndex ? "on" : ""}"></span>`)
      .join("");

    const body = $("#pr-body");
    const actions = $("#pr-actions");
    let html = "";
    let act = "";

    if (phase === "start") {
      html = `
        <div class="pr-phase-label">Start</div>
        <div class="pr-title">${esc(proc.title)}</div>
        <div class="pr-meta">${esc(def.label)} · due ${fmtDate(proc.nextDue)} · cadence every ${proc.cadenceDays} days</div>
        <div class="pr-card">
          <h4>What happens</h4>
          <p>This is a guided process (${def.steps.length} steps). On complete you confirm the next due date — the item returns to Today when that date approaches.</p>
          <p style="margin-top:8px;font-size:12px;color:var(--muted)">${esc(def.disclaimer || "")}</p>
        </div>
        ${renderAccountLinks(proc)}
        ${proc.meta && proc.meta.amount ? `<div class="pr-card"><h4>Amount</h4><p>${fmtMoney(proc.meta.amount)}${proc.meta.accountRef ? " · ref " + esc(proc.meta.accountRef) : ""}</p></div>` : ""}
      `;
      act = `
        <button type="button" class="btn btn-ghost" id="pr-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="pr-next">Start →</button>
      `;
    } else if (phase.startsWith("step:")) {
      const si = Number(phase.split(":")[1]);
      const step = def.steps[si];
      html = `
        <div class="pr-phase-label">Step ${si + 1} of ${def.steps.length}</div>
        <div class="pr-title">${esc(step.title)}</div>
        <div class="pr-meta">${esc(step.body)}</div>
        ${si === 1 || step.key === "account" || step.key === "efiling" || step.key === "visit" || step.key === "topup" || step.key === "approve" ? renderAccountLinks(proc) : ""}
        ${
          step.checks
            ? `<div class="pr-card">${step.checks
                .map(
                  (c, i) => `
              <label class="pr-check"><input type="checkbox" data-pr-check="${si}-${i}" ${prState.checks[si + "-" + i] ? "checked" : ""} /><span>${esc(c)}</span></label>`
                )
                .join("")}</div>`
            : ""
        }
        ${
          step.key === "prep"
            ? `<div class="form-row"><label>Prep notes (optional)</label><textarea id="pr-note" placeholder="Docs gathered…">${esc(prState.answers.note || "")}</textarea></div>`
            : ""
        }
        <p style="font-size:11px;color:var(--muted);margin-top:8px">${esc(def.disclaimer || "")}</p>
      `;
      act = `
        <button type="button" class="btn btn-ghost" id="pr-back">Back</button>
        <button type="button" class="btn btn-primary" id="pr-next">Continue →</button>
      `;
    } else if (phase === "done") {
      html = `
        <div class="pr-done-hero">
          <div class="big">✓</div>
          <h4>Marked done</h4>
          <p class="pr-meta">Nice — ${esc(proc.title)} is complete for this cycle.</p>
        </div>
        <div class="pr-card">
          <h4>Next</h4>
          <p>Set the next expiry / due date so this process returns to Today automatically.</p>
        </div>
      `;
      act = `
        <button type="button" class="btn btn-ghost" id="pr-back">Back</button>
        <button type="button" class="btn btn-primary" id="pr-next">Set next due →</button>
      `;
    } else if (phase === "nextdue") {
      const suggested = prState.suggestedNext || suggestNextDue(proc);
      prState.suggestedNext = suggested;
      html = `
        <div class="pr-phase-label">Next due</div>
        <div class="pr-title">When should this return?</div>
        <div class="pr-meta">Suggested from cadence (every ${proc.cadenceDays} days). Confirm or adjust.</div>
        <div class="form-row"><label>Next due date</label>
          <input type="date" id="pr-next-due" value="${suggested}" />
        </div>
        <div class="form-row"><label>Cadence (days)</label>
          <input type="number" id="pr-cadence" value="${proc.cadenceDays}" min="1" />
        </div>
        <div class="form-row"><label>Note (optional)</label>
          <input type="text" id="pr-final-note" placeholder="e.g. Paid via FNB" value="${esc(prState.answers.note || "")}" />
        </div>
        <div class="pr-card"><p style="font-size:12px;color:var(--muted)">Item reappears in Today when within its lead window (${proc.leadDays != null ? proc.leadDays : def.leadDays} days before due). Reminder panel updates automatically.</p></div>
      `;
      act = `
        <button type="button" class="btn btn-ghost" id="pr-back">Back</button>
        <button type="button" class="btn btn-primary" id="pr-finish">Confirm &amp; close</button>
      `;
    }

    body.innerHTML = html;
    actions.innerHTML = act;

    $("#pr-cancel")?.addEventListener("click", closeProcessRunner);
    $("#pr-back")?.addEventListener("click", () => {
      if (prState.phaseIndex > 0) {
        prState.phaseIndex--;
        renderProcessRunner();
      }
    });
    $("#pr-next")?.addEventListener("click", () => {
      if (!validatePrStep(proc, phase, def)) return;
      capturePrAnswers();
      prState.phaseIndex++;
      renderProcessRunner();
    });
    $("#pr-finish")?.addEventListener("click", () => finishProcess(proc));
    body.querySelectorAll("[data-pr-check]").forEach((el) => {
      el.addEventListener("change", () => {
        prState.checks[el.getAttribute("data-pr-check")] = el.checked;
      });
    });
    body.querySelectorAll("[data-open-link]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-open-link");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

  function renderAccountLinks(proc) {
    const links = proc.accountLinks || [];
    if (!links.length) {
      return `<div class="pr-card"><p style="font-size:12px;color:var(--muted)">No account link yet — add one in Settings → Recurring processes.</p></div>`;
    }
    return (
      `<div class="pr-card"><h4>Account links</h4>` +
      links
        .map(
          (a, i) =>
            `<button type="button" class="pr-link-btn" data-open-link="${esc(a.url)}"><span>Open account · ${esc(a.label)}</span><span>↗</span></button>`
        )
        .join("") +
      `</div>`
    );
  }

  function validatePrStep(proc, phase, def) {
    if (!phase.startsWith("step:")) return true;
    const si = Number(phase.split(":")[1]);
    const step = def.steps[si];
    if (step.checks) {
      for (let i = 0; i < step.checks.length; i++) {
        if (!prState.checks[si + "-" + i]) {
          toast("Tick all confirmations to continue");
          return false;
        }
      }
    }
    return true;
  }

  function capturePrAnswers() {
    const note = document.getElementById("pr-note");
    if (note) prState.answers.note = note.value.trim();
  }

  function finishProcess(proc) {
    const nextEl = document.getElementById("pr-next-due");
    const cadEl = document.getElementById("pr-cadence");
    const noteEl = document.getElementById("pr-final-note");
    const nextDue = (nextEl && nextEl.value) || suggestNextDue(proc);
    const cadence = Math.max(1, Number(cadEl && cadEl.value) || proc.cadenceDays);
    const note = (noteEl && noteEl.value.trim()) || prState.answers.note || "";

    proc.nextDue = nextDue;
    proc.cadenceDays = cadence;
    proc.lastCompletedAt = isoDate(new Date());

    // Sync underlying demo entities
    if (proc.type === "pay_bill" && proc.meta && proc.meta.billId) {
      const bill = state.bills.find((b) => b.id === proc.meta.billId);
      if (bill) bill.status = "paid";
    }
    if (proc.type === "renew_disc") {
      state.vehicle.discExpiry = nextDue;
      const doc = state.docs.find((d) => d.id === "d2");
      if (doc) doc.expiresAt = nextDue;
    }
    if (proc.type === "tax_deadline" && proc.meta && proc.meta.taxId) {
      const t = state.tax.find((x) => x.id === proc.meta.taxId);
      if (t) {
        t.status = "submitted";
        t.prepDone = t.prepTotal;
        t.dueAt = nextDue;
      }
    }
    if (proc.type === "payroll") {
      state.payrollApproved = true;
      state.workers.forEach((w) => {
        w.nextPay = nextDue;
      });
    }
    if (proc.type === "prepaid_topup" && proc.meta && proc.meta.prepaidId) {
      const p = state.prepaid.find((x) => x.id === proc.meta.prepaidId);
      if (p) p.lastTopUpDaysAgo = 0;
    }

    state.history = state.history || [];
    state.history.unshift({
      id: uid("h"),
      processId: proc.id,
      title: proc.title,
      type: proc.type,
      completedAt: isoDate(new Date()),
      nextDueSet: nextDue,
      note,
    });
    if (state.history.length > 50) state.history.length = 50;

    save();
    closeProcessRunner();
    render();
    toast("Done · next due " + fmtDate(nextDue));
  }

  function openAddProcessModal(editId) {
    const editing = editId ? getProcess(editId) : null;
    const types = Object.keys(PROCESS_TYPES)
      .map((k) => `<option value="${k}" ${editing && editing.type === k ? "selected" : ""}>${esc(PROCESS_TYPES[k].label)}</option>`)
      .join("");
    openModal(
      editing ? "Edit process" : "Add recurring process",
      `
      <div class="form-row"><label>Title</label>
        <input type="text" id="np-title" value="${editing ? esc(editing.title) : ""}" placeholder="e.g. Pay fibre bill" />
      </div>
      <div class="form-row"><label>Process type</label>
        <select id="np-type">${types}</select>
      </div>
      <div class="form-row"><label>Next due</label>
        <input type="date" id="np-due" value="${editing ? editing.nextDue : isoDate(addDays(new Date(), 7))}" />
      </div>
      <div class="form-row"><label>Cadence (days)</label>
        <input type="number" id="np-cadence" min="1" value="${editing ? editing.cadenceDays : 30}" />
      </div>
      <div class="form-row"><label>Lead days (show in Today)</label>
        <input type="number" id="np-lead" min="0" value="${editing ? editing.leadDays : 7}" />
      </div>
      <div class="form-row"><label>Account link label</label>
        <input type="text" id="np-link-label" value="${editing && editing.accountLinks && editing.accountLinks[0] ? esc(editing.accountLinks[0].label) : ""}" placeholder="e.g. uFiling" />
      </div>
      <div class="form-row"><label>Account link URL</label>
        <input type="url" id="np-link-url" value="${editing && editing.accountLinks && editing.accountLinks[0] ? esc(editing.accountLinks[0].url) : ""}" placeholder="https://…" />
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary btn-block" id="np-save">${editing ? "Save" : "Add process"}</button>
      </div>
      ${editing ? `<button type="button" class="btn btn-danger btn-block" id="np-run" style="margin-top:8px">Run wizard now</button>
                   <button type="button" class="btn btn-ghost btn-block" id="np-delete" style="margin-top:8px">Delete process</button>` : ""}
      <p style="font-size:11px;color:var(--muted);margin-top:10px">Not tax/legal advice. Links open in a new tab — no OAuth in this demo.</p>`
    );
    // Hide default close flow briefly — keep close btn
    setTimeout(() => {
      $("#np-save")?.addEventListener("click", () => {
        const title = $("#np-title").value.trim();
        const type = $("#np-type").value;
        const nextDue = $("#np-due").value || isoDate(addDays(new Date(), 7));
        const cadenceDays = Math.max(1, Number($("#np-cadence").value) || 30);
        const leadDays = Math.max(0, Number($("#np-lead").value) || 7);
        const label = $("#np-link-label").value.trim();
        const url = $("#np-link-url").value.trim();
        if (!title) {
          toast("Enter a title");
          return;
        }
        const def = PROCESS_TYPES[type] || PROCESS_TYPES.custom;
        const links = label && url ? [{ label, url }] : label ? [{ label, url: "#" }] : url ? [{ label: "Open account", url }] : [];
        const moduleGuess =
          type === "pay_bill" || type === "prepaid_topup"
            ? "money"
            : type === "renew_disc"
              ? "vehicle"
              : type === "tax_deadline"
                ? "tax"
                : type === "payroll"
                  ? "household"
                  : "docs";
        if (editing) {
          editing.title = title;
          editing.type = type;
          editing.nextDue = nextDue;
          editing.cadenceDays = cadenceDays;
          editing.leadDays = leadDays;
          editing.accountLinks = links.length ? links : editing.accountLinks || [];
          editing.module = moduleGuess;
        } else {
          state.processes.unshift({
            id: uid("pr"),
            type,
            title,
            nextDue,
            cadenceDays,
            leadDays,
            module: moduleGuess,
            accountLinks: links,
            meta: {},
          });
        }
        save();
        closeModal();
        render();
        toast(editing ? "Process updated" : "Process added");
      });
      $("#np-run")?.addEventListener("click", () => {
        closeModal();
        openProcessRunner(editing.id);
      });
      $("#np-delete")?.addEventListener("click", () => {
        if (!confirm("Delete this process?")) return;
        state.processes = state.processes.filter((p) => p.id !== editing.id);
        save();
        closeModal();
        render();
        toast("Process deleted");
      });
    }, 0);
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
    const procBtn = e.target.closest("[data-process]");
    if (procBtn) {
      openProcessRunner(procBtn.getAttribute("data-process"));
      return;
    }
    const editProc = e.target.closest("[data-edit-process]");
    if (editProc) {
      openAddProcessModal(editProc.getAttribute("data-edit-process"));
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

  $("#pr-close").addEventListener("click", closeProcessRunner);
  $("#btn-add-process")?.addEventListener("click", () => openAddProcessModal());
  $("#btn-add-process-today")?.addEventListener("click", () => openAddProcessModal());

  /* boot */
  save();
  render();
})();
