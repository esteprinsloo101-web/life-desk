/* Life Desk — static demo autopilot
   Sample SA household · localStorage · module toggles */

(function () {
  "use strict";

  const STORAGE_KEY = "life-desk-v4";

  /* PLATFORM_BAR_2026_09_11 */
  const SCIENCE_TIPS = [
  {
    "h": "Bill cadence experiment",
    "body": "Pick one due bill. Pay 3 days earlier this month. Note stress and cash buffer. Keep if calmer.",
    "method": "Method: single-variable change \u00b7 Limit: sample of one household"
  },
  {
    "h": "Prepaid top-up window",
    "body": "Log meter days-to-empty for 2 cycles. Set lead days = average \u2212 3.",
    "method": "Method: simple average \u00b7 Limit: season and guests change use"
  },
  {
    "h": "Kids calendar sync",
    "body": "Put school fees + one activity fee on the same payday week. Fewer surprise cash hits.",
    "method": "Method: calendar batching \u00b7 Limit: school term dates vary"
  }
];
  const PURPOSE_MODULE_PRESETS = {
  "household": {
    "money": true,
    "vehicle": true,
    "tax": true,
    "household": true,
    "docs": true,
    "retire": true,
    "insurance": true,
    "kids": true,
    "homeops": true,
    "pets": false,
    "science": true
  },
  "farm": {
    "money": true,
    "vehicle": true,
    "tax": true,
    "household": false,
    "docs": true,
    "retire": true,
    "insurance": true,
    "kids": false,
    "homeops": true,
    "pets": true,
    "science": true
  },
  "trade": {
    "money": true,
    "vehicle": true,
    "tax": true,
    "household": false,
    "docs": true,
    "retire": true,
    "insurance": true,
    "kids": false,
    "homeops": false,
    "pets": false,
    "science": true
  },
  "rentals": {
    "money": true,
    "vehicle": false,
    "tax": true,
    "household": false,
    "docs": true,
    "retire": false,
    "insurance": true,
    "kids": false,
    "homeops": true,
    "pets": false,
    "science": true
  },
  "stokvel": {
    "money": true,
    "vehicle": false,
    "tax": false,
    "household": false,
    "docs": true,
    "retire": true,
    "insurance": true,
    "kids": false,
    "homeops": false,
    "pets": false,
    "science": true
  },
  "flood": {
    "money": false,
    "vehicle": false,
    "tax": false,
    "household": false,
    "docs": true,
    "retire": false,
    "insurance": true,
    "kids": false,
    "homeops": false,
    "pets": false,
    "science": true
  },
  "decisions": {
    "money": true,
    "vehicle": false,
    "tax": true,
    "household": false,
    "docs": true,
    "retire": true,
    "insurance": false,
    "kids": false,
    "homeops": false,
    "pets": false,
    "science": true
  }
};

  const TZ = "Africa/Johannesburg";

  /* ── Process types (guided wizards, not checklists) ── */
  const PROCESS_TYPES = {
    pay_bill: {
      label: "Pay bill",
      icon: "R",
      defaultCadenceDays: 30,
      leadDays: 7,
      moneyProcess: true,
      disclaimer: "Not financial advice. You pay — Life Desk only guides. Links open the stored payment URL; app does not move money.",
      steps: [
        { key: "review", title: "Review bill", body: "Confirm payee, amount and due date. Check your statement if unsure." },
        { key: "pay", title: "Open payment", body: "Open the exact payment URL for this account (municipal portal, DStv, bank pay-beneficiary, etc.). Complete payment yourself in the new tab, then return here.", openPay: true },
        { key: "confirm", title: "Confirm paid", body: "After you return from the payment site, confirm you paid. Amount is optional.", checks: ["I paid / authorised this bill"], amountOptional: true },
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
      moneyProcess: true,
      disclaimer: "Confirm municipal amounts on your metro statement. You top up — Life Desk only guides.",
      steps: [
        { key: "check", title: "Check balance", body: "Note meter / account balance before top-up." },
        { key: "pay", title: "Open top-up / payment", body: "Open the stored payment URL (bank prepaid, vendor, or municipal portal). Complete the top-up yourself, then return here.", openPay: true },
        { key: "confirm", title: "Confirm top-up", body: "After you return, confirm the top-up. Amount is optional.", checks: ["Top-up completed"], amountOptional: true },
      ],
    },
    retire_contrib: {
      label: "Retirement contribution",
      icon: "📈",
      defaultCadenceDays: 30,
      leadDays: 5,
      moneyProcess: true,
      disclaimer: "Not financial advice. You contribute — Life Desk only reminds. Confirm RA/pension/TFSA rules with a licensed adviser.",
      steps: [
        { key: "review", title: "Review contribution", body: "Confirm product (RA / pension / TFSA-style), amount and debit date." },
        { key: "pay", title: "Open account / pay", body: "Open your product portal or bank debit note. Complete contribution yourself.", openPay: true },
        { key: "confirm", title: "Confirm contributed", body: "Mark when debit / payment is done.", checks: ["Contribution paid or debit confirmed"], amountOptional: true },
      ],
    },
    retire_statement: {
      label: "Retirement statement check",
      icon: "📄",
      defaultCadenceDays: 90,
      leadDays: 14,
      disclaimer: "Not financial advice. Checking a statement is not a portfolio review.",
      steps: [
        { key: "open", title: "Open statement", body: "Download or view the latest statement from your provider portal." },
        { key: "check", title: "Check basics", body: "Confirm contributions received, fees line, and beneficiary details on file.", checks: ["Contributions look present", "Beneficiaries noted"] },
        { key: "confirm", title: "Log checked", body: "Mark statement reviewed for this quarter.", checks: ["Statement checked"] },
      ],
    },
    insurance_premium: {
      label: "Insurance premium",
      icon: "🛡",
      defaultCadenceDays: 30,
      leadDays: 5,
      moneyProcess: true,
      disclaimer: "Not insurance advice. You pay — Life Desk opens your stored payment link.",
      steps: [
        { key: "review", title: "Review premium", body: "Confirm policy, premium and due date." },
        { key: "pay", title: "Open payment", body: "Open insurer / medical aid payment link and pay yourself.", openPay: true },
        { key: "confirm", title: "Confirm paid", body: "Mark premium paid.", checks: ["Premium paid / debit confirmed"], amountOptional: true },
      ],
    },
    insurance_renew: {
      label: "Policy renewal",
      icon: "🔁",
      defaultCadenceDays: 365,
      leadDays: 30,
      disclaimer: "Not insurance advice. Confirm cover with your broker before renewing.",
      steps: [
        { key: "docs", title: "Gather policy pack", body: "Schedule, excesses, and any claims notes." },
        { key: "review", title: "Review cover", body: "Check sums insured still match home / car / contents.", checks: ["Cover amounts still make sense"] },
        { key: "confirm", title: "Confirm renewed", body: "Mark when renewal is done.", checks: ["Policy renewed or cancelled intentionally"] },
      ],
    },
    school_fee: {
      label: "School / activity fee",
      icon: "🎒",
      defaultCadenceDays: 30,
      leadDays: 7,
      moneyProcess: true,
      disclaimer: "Not financial advice. Confirm fee amounts with the school or activity provider.",
      steps: [
        { key: "review", title: "Review fee", body: "Confirm child, school/activity, amount and due date." },
        { key: "pay", title: "Open payment", body: "Open school portal / PayFast / bank beneficiary and pay yourself.", openPay: true },
        { key: "confirm", title: "Confirm paid", body: "Mark fee paid.", checks: ["Fee paid"], amountOptional: true },
      ],
    },
    kids_clinic: {
      label: "Kids clinic / medical",
      icon: "🩺",
      defaultCadenceDays: 180,
      leadDays: 14,
      disclaimer: "Not medical advice. Life Desk only reminds — follow your clinician.",
      steps: [
        { key: "prep", title: "Prep", body: "Note child, clinic, and reason (checkup / vaccine / follow-up)." },
        { key: "go", title: "Attend", body: "Open maps / clinic link if stored. Attend appointment." },
        { key: "confirm", title: "Log visit", body: "Mark attended and set next due if told.", checks: ["Visit done"] },
      ],
    },
    kids_permission: {
      label: "Permission slip / event",
      icon: "✍️",
      defaultCadenceDays: 0,
      leadDays: 5,
      disclaimer: "Ops reminder only — not legal advice.",
      steps: [
        { key: "read", title: "Read slip", body: "Confirm date, cost, and transport." },
        { key: "sign", title: "Sign / pay", body: "Sign and pay any fee via stored link if needed.", openPay: true },
        { key: "confirm", title: "Confirm returned", body: "Mark slip returned to school.", checks: ["Slip returned"] },
      ],
    },
    grocery_loop: {
      label: "Groceries budget loop",
      icon: "🛒",
      defaultCadenceDays: 7,
      leadDays: 2,
      moneyProcess: true,
      disclaimer: "Budget aid only — not financial advice.",
      steps: [
        { key: "plan", title: "Plan shop", body: "Check envelope left and list staples." },
        { key: "shop", title: "Shop / pay", body: "Open grocery / wallet link if you use one. Stay near budget.", openPay: true },
        { key: "confirm", title: "Log spend", body: "Note approx spend for the week.", checks: ["Shop done"], amountOptional: true },
      ],
    },
    home_maint: {
      label: "Home maintenance",
      icon: "🔧",
      defaultCadenceDays: 90,
      leadDays: 7,
      disclaimer: "Ops checklist — not a contractor quote.",
      steps: [
        { key: "inspect", title: "Inspect", body: "Check the listed item (geyser, gutters, locks, etc.)." },
        { key: "fix", title: "Fix or book", body: "DIY or open contractor WhatsApp / link.", checks: ["Issue handled or booked"] },
        { key: "confirm", title: "Confirm done", body: "Mark complete and set next due.", checks: ["Maintenance logged"] },
      ],
    },
    adult_clinic: {
      label: "Adult medical appointment",
      icon: "🏥",
      defaultCadenceDays: 365,
      leadDays: 14,
      disclaimer: "Not medical advice.",
      steps: [
        { key: "prep", title: "Prep", body: "Note who, clinic, and reason." },
        { key: "go", title: "Attend", body: "Attend appointment. Open maps link if stored." },
        { key: "confirm", title: "Log visit", body: "Mark done.", checks: ["Appointment done"] },
      ],
    },
    pet_care: {
      label: "Pet care",
      icon: "🐾",
      defaultCadenceDays: 30,
      leadDays: 7,
      disclaimer: "Not veterinary advice.",
      steps: [
        { key: "review", title: "Review need", body: "Food refill, flea treatment reminder, or vet checkup — your note." },
        { key: "do", title: "Do / book", body: "Open vet / pet shop link if stored." },
        { key: "confirm", title: "Confirm done", body: "Mark complete.", checks: ["Pet care done"] },
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
    retire: true,
    insurance: true,
    kids: true,
    homeops: true,
    pets: false,
    science: true,
  };

  function seed() {
    const today = startOfDay(new Date());
    return {
      modules: { ...DEFAULT_MODULES },
      profile: { onboarded: false, city: "", purpose: "", updatedAt: null },
      prefs: {
        quietStart: 21,
        quietEnd: 7,
        notificationsEnabled: true,
        lastNotified: {},
        installDismissed: false,
      },
      household: {
        name: "Prinsloo household",
        city: "Bloemfontein",
      },
      bills: [
        { id: "b1", name: "Mangaung rates & taxes", category: "Municipal", amount: 1850, dueDay: 7, status: "due", accountRef: "MM-44291", paymentUrl: "https://www.mangaung.co.za/residents/municipal-account/pay/" },
        { id: "b2", name: "Fibre (Openserve)", category: "Utilities", amount: 799, dueDay: 1, status: "paid", accountRef: "FB-1882", paymentUrl: "https://www.openserve.co.za/account/pay-bill/" },
        { id: "b3", name: "School fees — Term", category: "School", amount: 4200, dueDay: 15, status: "due", accountRef: "SF-09", paymentUrl: "https://www.payfast.co.za/eng/process?demo=school-fees-SF-09" },
        { id: "b4", name: "Car insurance — OUTsurance", category: "Insurance", amount: 1120, dueDay: 3, status: "paid", accountRef: "POL-7741", paymentUrl: "https://www.outsurance.co.za/my-policy/make-a-payment/" },
        { id: "b5", name: "DSTV Compact", category: "Media", amount: 689, dueDay: 20, status: "due", accountRef: "DSTV", paymentUrl: "https://www.dstv.co.za/my-dstv/pay-my-account/" },
        { id: "b6", name: "Medical aid — Discovery", category: "Health", amount: 3850, dueDay: 1, status: "paid", accountRef: "MA-220", paymentUrl: "https://www.discovery.co.za/medical-aid/pay-contribution/" },
      ],
      envelopes: [
        { id: "e1", name: "Fixed bills", cap: 14000, spent: 9758 },
        { id: "e2", name: "Groceries", cap: 6500, spent: 4120 },
        { id: "e3", name: "Fuel & transport", cap: 2500, spent: 1680 },
        { id: "e4", name: "Buffer / emergency", cap: 3000, spent: 0 },
      ],
      prepaid: [
        { id: "p1", type: "Electricity (prepaid)", lastTopUpDaysAgo: 12, cadenceDays: 18, note: "Top-up ~every 2–3 weeks", paymentUrl: "https://www.fnb.co.za/pay/buy-prepaid-electricity/" },
        { id: "p2", type: "Water — municipal", lastTopUpDaysAgo: 0, cadenceDays: 30, note: "Monthly statement", paymentUrl: "https://www.mangaung.co.za/residents/municipal-account/pay/" },
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
      retirement: [
        { id: "r1", name: "RA — Discovery Invest", kind: "RA", amount: 2500, dueDay: 25, portal: "https://www.discovery.co.za/", note: "Monthly debit" },
        { id: "r2", name: "Pension — employer", kind: "Pension", amount: 0, dueDay: 25, portal: "https://www.sarsefiling.co.za/", note: "Payslip check" },
        { id: "r3", name: "TFSA-style — EasyEquities", kind: "TFSA", amount: 1000, dueDay: 1, portal: "https://www.easyequities.co.za/", note: "Voluntary top-up" },
      ],
      insurance: [
        { id: "ins1", name: "Discovery medical aid", kind: "Medical aid", amount: 3850, dueDay: 1, renewAt: null, portal: "https://www.discovery.co.za/medical-aid/pay-contribution/" },
        { id: "ins2", name: "Life cover — Sanlam", kind: "Life", amount: 890, dueDay: 7, renewAt: isoDate(addDays(today, 200)), portal: "https://www.sanlam.co.za/" },
        { id: "ins3", name: "Funeral — family plan", kind: "Funeral", amount: 320, dueDay: 5, renewAt: isoDate(addDays(today, 340)), portal: "https://www.fnb.co.za/" },
        { id: "ins4", name: "Household contents", kind: "Contents", amount: 280, dueDay: 3, renewAt: isoDate(addDays(today, 95)), portal: "https://www.outsurance.co.za/" },
        { id: "ins5", name: "Buildings — bond insurance", kind: "Buildings", amount: 450, dueDay: 1, renewAt: isoDate(addDays(today, 120)), portal: "https://www.standardbank.co.za/" },
        { id: "ins6", name: "Car — OUTsurance", kind: "Car", amount: 1120, dueDay: 3, renewAt: isoDate(addDays(today, 95)), portal: "https://www.outsurance.co.za/my-policy/make-a-payment/" },
        { id: "ins7", name: "Gap cover", kind: "Gap", amount: 210, dueDay: 1, renewAt: isoDate(addDays(today, 180)), portal: "https://www.turnberry.co.za/" },
      ],
      kids: [
        { id: "k1", name: "Lerato", age: 9, school: "Primary · Grade 3", activities: ["Netball Tue 15:00", "Piano Thu 16:00"] },
        { id: "k2", name: "Johan", age: 14, school: "High school · Grade 8", activities: ["Rugby Wed 15:30", "Maths extra Mon 17:00"] },
      ],
      kidFees: [
        { id: "kf1", kidId: "k1", title: "School fees — Lerato", amount: 2100, dueDay: 15, portal: "https://www.payfast.co.za/eng/process?demo=school-lerato" },
        { id: "kf2", kidId: "k2", title: "School fees — Johan", amount: 2800, dueDay: 15, portal: "https://www.payfast.co.za/eng/process?demo=school-johan" },
        { id: "kf3", kidId: "k1", title: "Piano lessons", amount: 450, dueDay: 28, portal: "https://wa.me/27820001111" },
        { id: "kf4", kidId: "k2", title: "Rugby club fees", amount: 350, dueDay: 10, portal: "https://wa.me/27820002222" },
      ],
      kidEvents: [
        { id: "ke1", kidId: "k1", title: "Clinic — booster reminder", at: isoDate(addDays(today, 9)), kind: "clinic" },
        { id: "ke2", kidId: "k2", title: "Permission slip — rugby tour", at: isoDate(addDays(today, 4)), kind: "permission", portal: "https://wa.me/27820002222" },
        { id: "ke3", kidId: "k1", title: "School concert", at: isoDate(addDays(today, 21)), kind: "event" },
      ],
      groceries: { cap: 6500, spent: 4120, cadenceDays: 7 },
      maintenance: [
        { id: "m1", title: "Geyser pressure check", nextDue: isoDate(addDays(today, 12)) },
        { id: "m2", title: "Gutters clear (rain season)", nextDue: isoDate(addDays(today, 40)) },
        { id: "m3", title: "Smoke alarm battery", nextDue: isoDate(addDays(today, 3)) },
      ],
      adultAppts: [
        { id: "aa1", who: "Parent A", title: "GP checkup", at: isoDate(addDays(today, 16)) },
        { id: "aa2", who: "Parent B", title: "Dentist", at: isoDate(addDays(today, 33)) },
      ],
      pets: [
        { id: "pet1", name: "Bella (dog)", note: "Flea treatment monthly", nextDue: isoDate(addDays(today, 8)), portal: "https://wa.me/27510009999" },
      ],
      schoolCalendar: [
        { term: "Term 3", note: "Closes in ~3 weeks (sample)" },
        { term: "Term 4", note: "Opens mid-October (sample Highveld)" },
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
        accountLinks: [{ label: "Mangaung pay account", url: "https://www.mangaung.co.za/residents/municipal-account/pay/" }],
        meta: { amount: 1850, billId: "b1", accountRef: "MM-44291" },
      },
      {
        id: "pr-b3", type: "pay_bill", title: "Pay school fees — Term",
        nextDue: billDue(15), cadenceDays: 30, leadDays: 7, module: "money",
        accountLinks: [{ label: "School fees pay link", url: "https://www.payfast.co.za/eng/process?demo=school-fees-SF-09" }],
        meta: { amount: 4200, billId: "b3", accountRef: "SF-09" },
      },
      {
        id: "pr-b5", type: "pay_bill", title: "Pay DSTV Compact",
        nextDue: billDue(20), cadenceDays: 30, leadDays: 5, module: "money",
        accountLinks: [{ label: "DStv pay my account", url: "https://www.dstv.co.za/my-dstv/pay-my-account/" }],
        meta: { amount: 689, billId: "b5", accountRef: "DSTV" },
      },
      {
        id: "pr-pre1", type: "prepaid_topup", title: "Electricity (prepaid) top-up",
        nextDue: isoDate(addDays(today, 6)), cadenceDays: 18, leadDays: 5, module: "money",
        accountLinks: [{ label: "FNB buy prepaid electricity", url: "https://www.fnb.co.za/pay/buy-prepaid-electricity/" }],
        meta: { prepaidId: "p1" },
      },
      {
        id: "pr-pre2", type: "prepaid_topup", title: "Water — municipal top-up",
        nextDue: isoDate(addDays(today, 25)), cadenceDays: 30, leadDays: 5, module: "money",
        accountLinks: [{ label: "Mangaung municipal pay", url: "https://www.mangaung.co.za/residents/municipal-account/pay/" }],
        meta: { prepaidId: "p2" },
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
      {
        id: "pr-ra1", type: "retire_contrib", title: "RA contribution — Discovery Invest",
        nextDue: isoDate(addDays(today, 8)), cadenceDays: 30, leadDays: 5, module: "retire",
        accountLinks: [{ label: "Discovery Invest", url: "https://www.discovery.co.za/" }],
        meta: { amount: 2500, retireId: "r1" },
      },
      {
        id: "pr-ra-stmt", type: "retire_statement", title: "RA statement check (quarter)",
        nextDue: isoDate(addDays(today, 20)), cadenceDays: 90, leadDays: 14, module: "retire",
        accountLinks: [{ label: "Discovery Invest", url: "https://www.discovery.co.za/" }],
        meta: { retireId: "r1" },
      },
      {
        id: "pr-ins-med", type: "insurance_premium", title: "Medical aid premium",
        nextDue: isoDate(addDays(today, 1)), cadenceDays: 30, leadDays: 5, module: "insurance",
        accountLinks: [{ label: "Discovery pay contribution", url: "https://www.discovery.co.za/medical-aid/pay-contribution/" }],
        meta: { amount: 3850, insuranceId: "ins1" },
      },
      {
        id: "pr-ins-car", type: "insurance_premium", title: "Car insurance premium",
        nextDue: isoDate(addDays(today, 3)), cadenceDays: 30, leadDays: 5, module: "insurance",
        accountLinks: [{ label: "OUTsurance pay", url: "https://www.outsurance.co.za/my-policy/make-a-payment/" }],
        meta: { amount: 1120, insuranceId: "ins6" },
      },
      {
        id: "pr-ins-renew", type: "insurance_renew", title: "Contents policy renewal",
        nextDue: isoDate(addDays(today, 95)), cadenceDays: 365, leadDays: 30, module: "insurance",
        accountLinks: [{ label: "OUTsurance policy", url: "https://www.outsurance.co.za/" }],
        meta: { insuranceId: "ins4" },
      },
      {
        id: "pr-fee-k1", type: "school_fee", title: "School fees — Lerato",
        nextDue: isoDate(addDays(today, 5)), cadenceDays: 30, leadDays: 7, module: "kids",
        accountLinks: [{ label: "School PayFast", url: "https://www.payfast.co.za/eng/process?demo=school-lerato" }],
        meta: { amount: 2100, kidFeeId: "kf1" },
      },
      {
        id: "pr-fee-k2", type: "school_fee", title: "School fees — Johan",
        nextDue: isoDate(addDays(today, 5)), cadenceDays: 30, leadDays: 7, module: "kids",
        accountLinks: [{ label: "School PayFast", url: "https://www.payfast.co.za/eng/process?demo=school-johan" }],
        meta: { amount: 2800, kidFeeId: "kf2" },
      },
      {
        id: "pr-piano", type: "school_fee", title: "Piano lessons — Lerato",
        nextDue: isoDate(addDays(today, 14)), cadenceDays: 30, leadDays: 5, module: "kids",
        accountLinks: [{ label: "WhatsApp teacher", url: "https://wa.me/27820001111" }],
        meta: { amount: 450, kidFeeId: "kf3" },
      },
      {
        id: "pr-slip", type: "kids_permission", title: "Permission slip — rugby tour",
        nextDue: isoDate(addDays(today, 4)), cadenceDays: 365, leadDays: 5, module: "kids",
        accountLinks: [{ label: "Coach WhatsApp", url: "https://wa.me/27820002222" }],
        meta: { eventId: "ke2" },
      },
      {
        id: "pr-clinic-k", type: "kids_clinic", title: "Clinic — Lerato booster",
        nextDue: isoDate(addDays(today, 9)), cadenceDays: 365, leadDays: 14, module: "kids",
        accountLinks: [],
        meta: { eventId: "ke1" },
      },
      {
        id: "pr-grocery", type: "grocery_loop", title: "Weekly groceries budget",
        nextDue: isoDate(addDays(today, 2)), cadenceDays: 7, leadDays: 2, module: "homeops",
        accountLinks: [{ label: "Checkers Sixty60 stub", url: "https://www.checkers.co.za/" }],
        meta: {},
      },
      {
        id: "pr-maint", type: "home_maint", title: "Smoke alarm battery",
        nextDue: isoDate(addDays(today, 3)), cadenceDays: 180, leadDays: 7, module: "homeops",
        accountLinks: [],
        meta: { maintId: "m3" },
      },
      {
        id: "pr-adult-gp", type: "adult_clinic", title: "GP checkup — Parent A",
        nextDue: isoDate(addDays(today, 16)), cadenceDays: 365, leadDays: 14, module: "homeops",
        accountLinks: [],
        meta: { apptId: "aa1" },
      },
      {
        id: "pr-pet", type: "pet_care", title: "Bella — flea treatment",
        nextDue: isoDate(addDays(today, 8)), cadenceDays: 30, leadDays: 7, module: "pets",
        accountLinks: [{ label: "Vet WhatsApp", url: "https://wa.me/27510009999" }],
        meta: { petId: "pet1" },
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
      if (!data.profile) data.profile = { onboarded: false, city: "", purpose: "", updatedAt: null };
      data.prefs = Object.assign({
        quietStart: 21,
        quietEnd: 7,
        notificationsEnabled: true,
        lastNotified: {},
        installDismissed: false,
      }, data.prefs || {});
      if (!data.prefs.lastNotified || typeof data.prefs.lastNotified !== "object") data.prefs.lastNotified = {};
      ["retirement","insurance","kids","kidFees","kidEvents","maintenance","adultAppts","pets","schoolCalendar"].forEach(function (k) {
        if (!Array.isArray(data[k])) data[k] = (seed()[k]) || [];
      });
      if (!data.groceries) data.groceries = seed().groceries;
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

  function getPrefs() {
    if (!state.prefs) {
      state.prefs = {
        quietStart: 21,
        quietEnd: 7,
        notificationsEnabled: true,
        lastNotified: {},
        installDismissed: false,
      };
    }
    return state.prefs;
  }

  function inQuietHours(date) {
    const prefs = getPrefs();
    const h = (date || new Date()).getHours();
    const start = Number(prefs.quietStart);
    const end = Number(prefs.quietEnd);
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    if (start === end) return false;
    if (start < end) return h >= start && h < end;
    return h >= start || h < end;
  }

  function nextOutsideQuiet(from) {
    const d = new Date(from || Date.now());
    let guard = 0;
    while (inQuietHours(d) && guard < 48) {
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + 1);
      guard++;
    }
    return d;
  }

  function notifPermission() {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  }

  function requestNotificationPermission() {
    if (!("Notification" in window)) {
      toast("Notifications not supported here");
      return Promise.resolve("unsupported");
    }
    if (Notification.permission === "granted") return Promise.resolve("granted");
    if (Notification.permission === "denied") {
      toast("Notifications blocked — enable in browser settings if you want alerts");
      return Promise.resolve("denied");
    }
    return Notification.requestPermission()
      .then(function (p) {
        if (p === "granted") toast("Notifications on");
        else if (p === "denied") toast("Notifications denied — in-app reminders still work");
        else toast("Notifications not enabled");
        render();
        return p;
      })
      .catch(function () {
        toast("Could not request notifications");
        return "denied";
      });
  }

  function fireDueNotification(item) {
    const prefs = getPrefs();
    if (!prefs.notificationsEnabled) return;
    if (notifPermission() !== "granted") return;
    if (inQuietHours(new Date())) return;
    const key = item.processId || item.id;
    const today = isoDate(new Date());
    if (prefs.lastNotified[key] === today) return;
    try {
      const n = new Notification("Life Desk · due", {
        body: item.title + (item.due < 0 ? " (overdue)" : item.due === 0 ? " (today)" : " · in " + item.due + "d"),
        tag: "life-desk-" + key,
        icon: "icons/icon-192.png",
      });
      prefs.lastNotified[key] = today;
      save();
      n.onclick = function () {
        window.focus();
        if (item.processId) openProcessRunner(item.processId);
        n.close();
      };
    } catch (e) {
      /* graceful: ignore */
    }
  }

  function checkDueNotifications() {
    const prefs = getPrefs();
    if (!prefs.notificationsEnabled) return;
    if (notifPermission() !== "granted") return;
    if (inQuietHours(new Date())) return;
    buildQueue()
      .filter(function (item) { return item.due <= 0; })
      .slice(0, 3)
      .forEach(fireDueNotification);
  }

  var reminderTimers = {};

  function clearReminderTimer(processId) {
    if (reminderTimers[processId]) {
      clearTimeout(reminderTimers[processId]);
      delete reminderTimers[processId];
    }
  }

  function scheduleReminderForProcess(proc) {
    if (!proc || !proc.nextDue) return;
    clearReminderTimer(proc.id);
    const prefs = getPrefs();
    if (!prefs.notificationsEnabled) return;
    if (notifPermission() !== "granted") return;

    const dueDay = startOfDay(parseISO(proc.nextDue));
    const lead = proc.leadDays != null ? proc.leadDays : (PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom).leadDays;
    let fireAt = addDays(dueDay, -Math.min(lead, 1));
    fireAt.setHours(8, 0, 0, 0);
    fireAt = nextOutsideQuiet(fireAt);
    const delay = fireAt.getTime() - Date.now();
    if (delay <= 0) {
      /* already in lead window — nudge soon if not quiet */
      const soon = nextOutsideQuiet(new Date(Date.now() + 1500));
      const d2 = soon.getTime() - Date.now();
      if (d2 < 86400000) {
        reminderTimers[proc.id] = setTimeout(function () {
          fireDueNotification({
            processId: proc.id,
            id: proc.id,
            title: proc.title,
            due: processDue(proc),
          });
        }, Math.max(500, d2));
      }
      return;
    }
    if (delay > 2147483647) return; /* setTimeout max */
    reminderTimers[proc.id] = setTimeout(function () {
      fireDueNotification({
        processId: proc.id,
        id: proc.id,
        title: proc.title,
        due: processDue(proc),
      });
    }, delay);
  }

  function rescheduleAllReminders() {
    (state.processes || []).forEach(scheduleReminderForProcess);
  }

  function buildReminders() {
    const q = buildQueue().slice(0, 8);
    const base = new Date();
    const quietNow = inQuietHours(base);
    return q.map(function (item, i) {
      let fire = new Date(base);
      fire.setMinutes(0, 0, 0);
      if (item.due <= 0) {
        fire = nextOutsideQuiet(new Date(base.getTime() + (quietNow ? 0 : 60 * 1000)));
      } else {
        fire = addDays(startOfDay(base), Math.max(0, item.due));
        fire.setHours(8 + (i % 3), i % 2 === 0 ? 0 : 30, 0, 0);
        fire = nextOutsideQuiet(fire);
      }
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
        src: item.module + (quietNow && item.due <= 0 ? " · quiet hours" : ""),
        processId: item.processId,
        due: item.due,
        quietShifted: quietNow && item.due <= 0,
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
    const rb = $("#reminder-badge");
    const perm = notifPermission();
    if (rb) {
      rb.textContent = perm === "granted" ? "notify on" : perm === "denied" ? "in-app" : "auto";
    }
    if (!rem.length) {
      rp.innerHTML = '<div class="empty">No scheduled reminders</div>';
    } else {
      rp.innerHTML = rem
        .map(function (r) {
          return `
        <button type="button" class="reminder-item ${r.due <= 0 ? "due-now" : ""}" ${r.processId ? 'data-process="' + r.processId + '"' : ""}>
          <div class="r-time">${esc(r.when)}</div>
          <div class="r-body">${esc(r.title)}<div class="r-src ${r.quietShifted ? "quiet" : ""}">${esc(r.src)}</div></div>
        </button>`;
        })
        .join("");
    }
    const en = $("#btn-enable-notifs");
    if (en) {
      if (perm === "granted") {
        en.textContent = "Notifications on";
        en.disabled = true;
      } else if (perm === "denied") {
        en.textContent = "Notifications blocked";
        en.disabled = true;
      } else if (perm === "unsupported") {
        en.textContent = "Notifications unsupported";
        en.disabled = true;
      } else {
        en.textContent = "Enable notifications";
        en.disabled = false;
      }
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
      .map((b) => {
        const proc = (state.processes || []).find((p) => p.type === "pay_bill" && p.meta && p.meta.billId === b.id);
        const unpaid = b.status !== "paid";
        const rowAttrs = unpaid && proc
          ? `data-process="${proc.id}" role="button"`
          : `data-bill="${b.id}"`;
        return `
      <div class="row ${b.status === "paid" ? "paid" : "sev-amber"} ${unpaid && proc ? "btn-like" : ""}" ${rowAttrs}>
        <div class="row-icon">R</div>
        <div class="row-body">
          <div class="row-title">${esc(b.name)}</div>
          <div class="row-meta">${esc(b.category)} · due day ${b.dueDay} · ${esc(b.accountRef)}${b.paymentUrl ? " · pay link" : ""}</div>
        </div>
        <div class="row-right">
          <div class="amount">${fmtMoney(b.amount)}</div>
          ${
            b.status === "paid"
              ? '<span class="badge ok">Paid</span>'
              : proc
                ? `<button type="button" class="btn btn-primary btn-sm" data-process="${proc.id}">Pay →</button>`
                : `<button type="button" class="btn btn-primary btn-sm" data-pay="${b.id}">Mark paid</button>`
          }
        </div>
      </div>`;
      })
      .join("");

    $("#prepaid-list").innerHTML = state.prepaid
      .map((p) => {
        const left = p.cadenceDays - p.lastTopUpDaysAgo;
        const proc = (state.processes || []).find((x) => x.type === "prepaid_topup" && x.meta && x.meta.prepaidId === p.id);
        const rowAttrs = proc ? `data-process="${proc.id}" role="button"` : "";
        return `
        <div class="row sev-${left <= 0 ? "red" : left <= 5 ? "amber" : "teal"} ${proc ? "btn-like" : ""}" ${rowAttrs}>
          <div class="row-icon">⚡</div>
          <div class="row-body">
            <div class="row-title">${esc(p.type)}</div>
            <div class="row-meta">${esc(p.note)} · last top-up ${p.lastTopUpDaysAgo}d ago${p.paymentUrl ? " · pay link" : ""}</div>
          </div>
          <div class="row-right">
            ${proc ? `<button type="button" class="btn btn-primary btn-sm" data-process="${proc.id}">Top up →</button>` : ""}
            <span class="badge ${left <= 0 ? "danger" : left <= 5 ? "warn" : "teal"}">${left <= 0 ? "Now" : "~" + left + "d"}</span>
          </div>
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
      { id: "kids", mod: "kids", icon: "🎒", title: "Kids", meta: "School · activities · clinic" },
      { id: "insurance", mod: "insurance", icon: "🛡", title: "Insurance", meta: "Medical · life · car · gap" },
      { id: "retire", mod: "retire", icon: "📈", title: "Retirement", meta: "RA · pension · TFSA reminders" },
      { id: "homeops", mod: "homeops", icon: "🏠", title: "Home ops", meta: "Groceries · repairs · pets" },
      { id: "science", mod: "science", icon: "🔬", title: "Science Desk", meta: "Weekly tips · methods" },
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
    const settingsView = document.getElementById("view-settings");
    if (settingsView && !document.getElementById("profile-card")) {
      const card = document.createElement("div");
      card.className = "card mb-12";
      card.id = "profile-card";
      card.innerHTML = '<div class="card-head"><h3>Location &amp; purpose</h3><span class="badge teal">adapt</span></div><p id="profile-summary" style="font-size:15px;color:var(--text-dim);margin-bottom:10px"></p><button type="button" class="btn btn-ghost btn-block" id="btn-redo-onboard">Change city / purpose</button>';
      const first = settingsView.querySelector(".card");
      if (first) settingsView.insertBefore(card, first);
      else settingsView.insertBefore(card, settingsView.firstChild);
      document.getElementById("btn-redo-onboard").addEventListener("click", function () { state.profile.onboarded = false; save(); showOnboarding(); });
    }
    const ps = document.getElementById("profile-summary");
    if (ps && state.profile) ps.textContent = (state.profile.city || "—") + " · " + (state.profile.purpose || "—");

    const defs = [
      { key: "money", title: "Money", meta: "Bills, envelopes, prepaid / municipal" },
      { key: "vehicle", title: "Vehicle", meta: "Disc, service, tyres, insurance, fuel" },
      { key: "tax", title: "Tax", meta: "Provisional / VAT / personal reminders + prep" },
      { key: "household", title: "Household employer", meta: "Domestic / gardener / nanny — disable if unused" },
      { key: "docs", title: "Docs vault", meta: "Expiry watch + module filings" },
      { key: "retire", title: "Retirement & savings", meta: "RA / pension / TFSA-style reminders" },
      { key: "insurance", title: "Insurance hub", meta: "Medical · life · funeral · contents · car" },
      { key: "kids", title: "Kids", meta: "School · activities · clinic · slips" },
      { key: "homeops", title: "Home ops", meta: "Groceries · repairs · adult clinic" },
      { key: "pets", title: "Pets", meta: "Pet care reminders — optional" },
      { key: "science", title: "Science Desk", meta: "Weekly improve tips · methods + limits" },
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

    const prefs = getPrefs();
    const qs = $("#quiet-start");
    const qe = $("#quiet-end");
    const pn = $("#pref-notifs");
    const ns = $("#notif-status");
    if (qs && document.activeElement !== qs) qs.value = String(prefs.quietStart);
    if (qe && document.activeElement !== qe) qe.value = String(prefs.quietEnd);
    if (pn) pn.checked = !!prefs.notificationsEnabled;
    if (ns) {
      const p = notifPermission();
      ns.textContent =
        "Permission: " +
        p +
        (inQuietHours(new Date()) ? " · currently in quiet hours" : " · outside quiet hours");
    }
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
    if (currentView === "retire") renderRetire();
    if (currentView === "insurance") renderInsurance();
    if (currentView === "kids") renderKids();
    if (currentView === "homeops") renderHomeOps();
    if (currentView === "science") renderScience();
    if (currentView === "settings") renderSettings();
  }


  
  function renderRetire() {
    const root = $("#retire-list");
    if (!root) return;
    root.innerHTML = (state.retirement || []).map((r) => {
      const pr = (state.processes || []).find((p) => p.meta && p.meta.retireId === r.id && p.type === "retire_contrib");
      return '<div class="retire-card"><h4>' + esc(r.name) + '</h4><div class="meta">' + esc(r.kind) + ' · ' + (r.amount ? fmtMoney(r.amount) + "/mo" : "payslip check") + ' · due day ' + r.dueDay + '</div><p style="font-size:14px;color:var(--muted);margin-bottom:10px">' + esc(r.note || "") + '</p><div class="btn-row">' +
        (r.portal ? '<button type="button" class="btn btn-ghost" data-open-url="' + esc(r.portal) + '">Open account</button>' : '') +
        (pr ? '<button type="button" class="btn btn-primary" data-process="' + pr.id + '">Run contribution</button>' : '') +
        '</div></div>';
    }).join("") || '<div class="empty">No retirement items</div>';
  }

  function renderInsurance() {
    const root = $("#insurance-list");
    if (!root) return;
    root.innerHTML = (state.insurance || []).map((pol) => {
      const pr = (state.processes || []).find((p) => p.meta && p.meta.insuranceId === pol.id);
      return '<div class="policy-card"><h4>' + esc(pol.name) + '</h4><div class="meta">' + esc(pol.kind) + ' · ' + fmtMoney(pol.amount) + '/mo · due day ' + pol.dueDay +
        (pol.renewAt ? ' · renews ' + fmtDate(pol.renewAt) : '') + '</div><div class="btn-row">' +
        (pol.portal ? '<button type="button" class="btn btn-ghost" data-open-url="' + esc(pol.portal) + '">Open payment</button>' : '') +
        (pr ? '<button type="button" class="btn btn-primary" data-process="' + pr.id + '">Run process</button>' : '') +
        '</div></div>';
    }).join("");
  }

  function renderKids() {
    const kids = state.kids || [];
    $("#kids-profiles").innerHTML = kids.map((k) =>
      '<div class="kid-card"><h4>' + esc(k.name) + ' · ' + k.age + 'y</h4><div class="meta">' + esc(k.school) + '</div>' +
      (k.activities || []).map((a) => '<span class="profile-chip">' + esc(a) + '</span>').join("") + '</div>'
    ).join("");
    $("#kids-fees").innerHTML = (state.kidFees || []).map((f) => {
      const kid = kids.find((x) => x.id === f.kidId);
      const pr = (state.processes || []).find((p) => p.meta && p.meta.kidFeeId === f.id);
      return '<button type="button" class="row sev-amber" ' + (pr ? 'data-process="' + pr.id + '"' : '') + '>' +
        '<div class="row-icon">🎒</div><div class="row-body"><div class="row-title">' + esc(f.title) + '</div>' +
        '<div class="row-meta">' + esc(kid ? kid.name : "") + ' · due day ' + f.dueDay + '</div></div>' +
        '<div class="row-right"><div class="amount">' + fmtMoney(f.amount) + '</div></div></button>';
    }).join("") || '<div class="empty">No fees</div>';
    $("#kids-schedules").innerHTML = kids.map((k) =>
      '<div style="margin-bottom:10px"><strong>' + esc(k.name) + '</strong><div style="font-size:14px;color:var(--muted)">' +
      esc((k.activities || []).join(" · ") || "No activities") + '</div></div>'
    ).join("");
    $("#kids-events").innerHTML = (state.kidEvents || []).map((e) => {
      const kid = kids.find((x) => x.id === e.kidId);
      const d = daysUntil(e.at);
      const pr = (state.processes || []).find((p) => p.meta && p.meta.eventId === e.id);
      return '<button type="button" class="row sev-' + (d <= 5 ? "red" : "teal") + '" ' + (pr ? 'data-process="' + pr.id + '"' : '') + '>' +
        '<div class="row-icon">' + (e.kind === "clinic" ? "🩺" : e.kind === "permission" ? "✍️" : "📅") + '</div>' +
        '<div class="row-body"><div class="row-title">' + esc(e.title) + '</div><div class="row-meta">' + esc(kid ? kid.name : "") + ' · ' + fmtDate(e.at) + '</div></div>' +
        '<div class="row-right"><span class="badge ' + (d <= 5 ? "danger" : "ok") + '">' + (d < 0 ? "Overdue" : d + "d") + '</span></div></button>';
    }).join("");
  }

  function renderHomeOps() {
    const g = state.groceries || { cap: 0, spent: 0 };
    const pct = g.cap ? Math.min(100, Math.round((g.spent / g.cap) * 100)) : 0;
    const gPr = (state.processes || []).find((p) => p.type === "grocery_loop");
    $("#grocery-panel").innerHTML = '<div class="env-head"><span>This month</span><span class="env-amt">' + fmtMoney(g.spent) + ' / ' + fmtMoney(g.cap) + '</span></div>' +
      '<div class="progress"><span style="width:' + pct + '%"></span></div>' +
      (gPr ? '<button type="button" class="btn btn-primary btn-block" style="margin-top:10px" data-process="' + gPr.id + '">Run grocery loop</button>' : '');
    $("#maint-list").innerHTML = (state.maintenance || []).map((m) => {
      const pr = (state.processes || []).find((p) => p.meta && p.meta.maintId === m.id);
      const d = daysUntil(m.nextDue);
      return '<button type="button" class="row sev-' + (d <= 7 ? "amber" : "teal") + '" ' + (pr ? 'data-process="' + pr.id + '"' : '') + '>' +
        '<div class="row-icon">🔧</div><div class="row-body"><div class="row-title">' + esc(m.title) + '</div><div class="row-meta">next ' + fmtDate(m.nextDue) + '</div></div></button>';
    }).join("");
    $("#adult-appt-list").innerHTML = (state.adultAppts || []).map((a) => {
      const pr = (state.processes || []).find((p) => p.meta && p.meta.apptId === a.id);
      return '<button type="button" class="row" ' + (pr ? 'data-process="' + pr.id + '"' : '') + '>' +
        '<div class="row-icon">🏥</div><div class="row-body"><div class="row-title">' + esc(a.title) + '</div><div class="row-meta">' + esc(a.who) + ' · ' + fmtDate(a.at) + '</div></div></button>';
    }).join("");
    const petsCard = $("#pets-card");
    if (petsCard) petsCard.style.display = state.modules.pets ? "" : "none";
    $("#pets-list").innerHTML = (state.pets || []).map((pet) => {
      const pr = (state.processes || []).find((x) => x.meta && x.meta.petId === pet.id);
      return '<button type="button" class="row" ' + (pr ? 'data-process="' + pr.id + '"' : '') + '>' +
        '<div class="row-icon">🐾</div><div class="row-body"><div class="row-title">' + esc(pet.name) + '</div><div class="row-meta">' + esc(pet.note) + ' · ' + fmtDate(pet.nextDue) + '</div></div></button>';
    }).join("") || '<div class="empty">Enable Pets in Settings</div>';
    $("#school-calendar").innerHTML = (state.schoolCalendar || []).map((s) =>
      '<div style="display:flex;gap:10px;margin-bottom:8px"><div style="font-weight:700;min-width:70px">' + esc(s.term) + '</div><div style="font-size:14px;color:var(--muted)">' + esc(s.note) + '</div></div>'
    ).join("");
  }


  
  /* PLATFORM_BAR_2026_09_11 helpers */
  function renderScience() {
    const root = document.getElementById("science-tips");
    if (!root) return;
    root.innerHTML = SCIENCE_TIPS.map((t) =>
      '<div class="science-tip"><h4>' + esc(t.h) + '</h4><p>' + esc(t.body) + '</p><div class="method">' + esc(t.method) + '</div></div>'
    ).join("");
  }

  function applyPurposeModules(purpose) {
    const preset = PURPOSE_MODULE_PRESETS[purpose];
    if (!preset || !state.modules) return;
    Object.keys(state.modules).forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(preset, k)) state.modules[k] = !!preset[k];
    });
  }

  function updateBrandLocation() {
    const sub = document.querySelector(".brand-text p");
    if (!sub || !state.profile) return;
    const city = state.profile.city || "";
    const purpose = state.profile.purpose || "";
    if (city || purpose) sub.textContent = [city, purpose].filter(Boolean).join(" · ");
  }

  function showOnboarding() {
    const el = document.getElementById("onboard");
    if (!el) return;
    const city = document.getElementById("ob-city");
    const purpose = document.getElementById("ob-purpose");
    if (city && state.profile) city.value = state.profile.city || "Bloemfontein";
    if (purpose && state.profile) purpose.value = state.profile.purpose || "household";
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
  }

  function hideOnboarding() {
    const el = document.getElementById("onboard");
    if (!el) return;
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
  }

  function completeOnboarding() {
    const city = ((document.getElementById("ob-city") && document.getElementById("ob-city").value) || "").trim();
    const purpose = (document.getElementById("ob-purpose") && document.getElementById("ob-purpose").value) || "";
    if (!city) { toast("Enter your city / region"); return; }
    if (!purpose) { toast("Choose what you run"); return; }
    state.profile = { onboarded: true, city: city, purpose: purpose, updatedAt: new Date().toISOString() };
    applyPurposeModules(purpose);
    save();
    hideOnboarding();
    updateBrandLocation();
    render();
    toast("Saved · modules adapted");
  }

  function maybeOnboard() {
    if (!state.profile) state.profile = { onboarded: false, city: "", purpose: "", updatedAt: null };
    if (!state.profile.onboarded) showOnboarding();
    else updateBrandLocation();
  }


  /* ── ProcessRunner ── */
  let prState = null; // { processId, phaseIndex, answers, suggestedNext }

  function getProcess(id) {
    return (state.processes || []).find((p) => p.id === id);
  }

  function prPhases(proc) {
    const def = PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom;
    const steps = def.steps || [];
    // start → steps → done (next due auto from cadence on done; optional override)
    return ["start", ...steps.map((_, i) => "step:" + i), "done"];
  }

  function openProcessRunner(processId) {
    const proc = getProcess(processId);
    if (!proc) {
      toast("Process not found");
      return;
    }
    prState = { processId, phaseIndex: 0, answers: {}, checks: {}, openedPay: false, showDueOverride: false };
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
    // From today + cadence (monthly/weekly/custom days) — user does not invent a date
    return isoDate(addDays(startOfDay(new Date()), days));
  }

  function cadenceLabel(days) {
    const n = Number(days) || 30;
    if (n === 7) return "weekly";
    if (n === 14) return "every 2 weeks";
    if (n === 30 || n === 31) return "monthly";
    if (n === 365) return "yearly";
    return "every " + n + " days";
  }

  function resolvePaymentLinks(proc) {
    const links = [];
    const seen = new Set();
    const push = (label, url) => {
      if (!url || url === "#" || seen.has(url)) return;
      seen.add(url);
      links.push({ label: label || "Open payment", url });
    };
    (proc.accountLinks || []).forEach((a) => push(a.label, a.url));
    if (proc.meta && proc.meta.billId) {
      const bill = state.bills.find((b) => b.id === proc.meta.billId);
      if (bill && bill.paymentUrl) push(bill.name + " · pay", bill.paymentUrl);
    }
    if (proc.meta && proc.meta.prepaidId) {
      const p = state.prepaid.find((x) => x.id === proc.meta.prepaidId);
      if (p && p.paymentUrl) push(p.type + " · top-up", p.paymentUrl);
    }
    return links;
  }

  function isMoneyPayProcess(proc) {
    const def = PROCESS_TYPES[proc.type] || PROCESS_TYPES.custom;
    return !!def.moneyProcess || ["pay_bill","prepaid_topup","retire_contrib","insurance_premium","school_fee","grocery_loop"].includes(proc.type);
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
        <div class="pr-meta">${esc(def.label)} · due ${fmtDate(proc.nextDue)} · ${esc(cadenceLabel(proc.cadenceDays))}</div>
        <div class="pr-card">
          <h4>What happens</h4>
          <p>${
            isMoneyPayProcess(proc)
              ? "Open the payment URL → pay yourself → confirm paid → next due is set automatically from cadence. Item leaves Today until the lead window."
              : "Guided process (" + def.steps.length + " steps). On complete, next due is set automatically from cadence — the item returns to Today when that date approaches."
          }</p>
          <p style="margin-top:8px;font-size:12px;color:var(--muted)">${esc(def.disclaimer || "")}</p>
        </div>
        ${renderPayLinks(proc, { prominent: isMoneyPayProcess(proc) })}
        ${proc.meta && proc.meta.amount ? `<div class="pr-card"><h4>Amount</h4><p>${fmtMoney(proc.meta.amount)}${proc.meta.accountRef ? " · ref " + esc(proc.meta.accountRef) : ""}</p></div>` : ""}
      `;
      act = `
        <button type="button" class="btn btn-ghost" id="pr-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="pr-next">Start →</button>
      `;
    } else if (phase.startsWith("step:")) {
      const si = Number(phase.split(":")[1]);
      const step = def.steps[si];
      const showPay = step.openPay || step.key === "pay" || step.key === "account" || step.key === "topup" || step.key === "efiling" || step.key === "visit" || step.key === "approve";
      html = `
        <div class="pr-phase-label">Step ${si + 1} of ${def.steps.length}</div>
        <div class="pr-title">${esc(step.title)}</div>
        <div class="pr-meta">${esc(step.body)}</div>
        ${showPay ? renderPayLinks(proc, { prominent: !!step.openPay || isMoneyPayProcess(proc) }) : ""}
        ${
          step.amountOptional
            ? `<div class="form-row"><label>Amount paid (optional)</label>
                <input type="number" id="pr-amount" min="0" step="0.01" placeholder="${proc.meta && proc.meta.amount ? proc.meta.amount : "e.g. 689"}" value="${esc(prState.answers.amountPaid || "")}" />
              </div>`
            : ""
        }
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
      const suggested = prState.suggestedNext || suggestNextDue(proc);
      prState.suggestedNext = suggested;
      const override = prState.showDueOverride;
      html = `
        <div class="pr-done-hero">
          <div class="big">✓</div>
          <h4>${isMoneyPayProcess(proc) ? "Paid · closing cycle" : "Marked done"}</h4>
          <p class="pr-meta">Nice — ${esc(proc.title)} is complete for this cycle.</p>
        </div>
        <div class="pr-card pr-next-auto">
          <h4>Next due (automatic)</h4>
          <p class="pr-next-date">${fmtDate(suggested)}</p>
          <p style="font-size:12px;color:var(--muted);margin-top:4px">From cadence · ${esc(cadenceLabel(proc.cadenceDays))} (${proc.cadenceDays} days). No need to invent a date.</p>
          <p style="font-size:12px;color:var(--muted);margin-top:6px">Returns to Today within lead window (${proc.leadDays != null ? proc.leadDays : def.leadDays} days before due).</p>
        </div>
        <button type="button" class="btn btn-ghost btn-block" id="pr-toggle-override" style="margin-bottom:10px">${override ? "Hide date override" : "Override date (optional)"}</button>
        ${
          override
            ? `<div class="form-row"><label>Next due date</label>
                <input type="date" id="pr-next-due" value="${suggested}" />
              </div>
              <div class="form-row"><label>Cadence (days)</label>
                <input type="number" id="pr-cadence" value="${proc.cadenceDays}" min="1" />
              </div>`
            : `<input type="hidden" id="pr-next-due" value="${suggested}" />
               <input type="hidden" id="pr-cadence" value="${proc.cadenceDays}" />`
        }
        <div class="form-row"><label>Note (optional)</label>
          <input type="text" id="pr-final-note" placeholder="${isMoneyPayProcess(proc) ? "e.g. Paid via FNB" : "Optional note"}" value="${esc(prState.answers.note || "")}" />
        </div>
      `;
      act = `
        <button type="button" class="btn btn-ghost" id="pr-back">Back</button>
        <button type="button" class="btn btn-primary" id="pr-finish">Done</button>
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
    $("#pr-toggle-override")?.addEventListener("click", () => {
      capturePrAnswers();
      const nextEl = document.getElementById("pr-next-due");
      if (nextEl && nextEl.value) prState.suggestedNext = nextEl.value;
      prState.showDueOverride = !prState.showDueOverride;
      renderProcessRunner();
    });
    body.querySelectorAll("[data-pr-check]").forEach((el) => {
      el.addEventListener("change", () => {
        prState.checks[el.getAttribute("data-pr-check")] = el.checked;
      });
    });
    body.querySelectorAll("[data-open-link]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-open-link");
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          prState.openedPay = true;
          toast("Payment tab opened — return here to confirm");
        }
      });
    });
  }

  function renderPayLinks(proc, opts) {
    opts = opts || {};
    const links = resolvePaymentLinks(proc);
    const prominent = !!opts.prominent;
    if (!links.length) {
      return `<div class="pr-card"><p style="font-size:12px;color:var(--muted)">No payment URL yet — add one in Settings → Recurring processes (account link).</p></div>`;
    }
    const primary = links[0];
    const rest = links.slice(1);
    let html = `<div class="pr-card ${prominent ? "pr-pay-card" : ""}">`;
    if (prominent) {
      html += `<h4>Payment link</h4>
        <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Exact URL stored for this account. Opens in a new tab — you pay; Life Desk does not.</p>
        <button type="button" class="pr-pay-btn" data-open-link="${esc(primary.url)}">
          <span class="pr-pay-btn-label">Open payment</span>
          <span class="pr-pay-btn-sub">${esc(primary.label)} ↗</span>
        </button>
        <div class="pr-pay-url" title="${esc(primary.url)}">${esc(primary.url)}</div>`;
      rest.forEach((a) => {
        html += `<button type="button" class="pr-link-btn" data-open-link="${esc(a.url)}"><span>Also · ${esc(a.label)}</span><span>↗</span></button>`;
      });
    } else {
      html += `<h4>Account / portal links</h4>`;
      links.forEach((a) => {
        html += `<button type="button" class="pr-link-btn" data-open-link="${esc(a.url)}"><span>Open · ${esc(a.label)}</span><span>↗</span></button>`;
      });
    }
    html += `</div>`;
    return html;
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
    const amt = document.getElementById("pr-amount");
    if (amt && amt.value !== "") prState.answers.amountPaid = amt.value.trim();
    const finalNote = document.getElementById("pr-final-note");
    if (finalNote) prState.answers.note = finalNote.value.trim() || prState.answers.note || "";
  }

  function finishProcess(proc) {
    capturePrAnswers();
    const nextEl = document.getElementById("pr-next-due");
    const cadEl = document.getElementById("pr-cadence");
    const noteEl = document.getElementById("pr-final-note");
    // Auto from cadence unless user overrode
    const nextDue = (nextEl && nextEl.value) || prState.suggestedNext || suggestNextDue(proc);
    const cadence = Math.max(1, Number(cadEl && cadEl.value) || proc.cadenceDays);
    const note = (noteEl && noteEl.value.trim()) || prState.answers.note || "";
    const amountPaid = prState.answers.amountPaid ? Number(prState.answers.amountPaid) : null;

    proc.nextDue = nextDue;
    proc.cadenceDays = cadence;
    proc.lastCompletedAt = isoDate(new Date());

    if (proc.type === "pay_bill" && proc.meta && proc.meta.billId) {
      const bill = state.bills.find((b) => b.id === proc.meta.billId);
      if (bill) {
        bill.status = "paid";
        if (amountPaid != null && !Number.isNaN(amountPaid) && amountPaid > 0) {
          bill.amount = amountPaid;
          proc.meta.amount = amountPaid;
        }
      }
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
      if (p) {
        p.lastTopUpDaysAgo = 0;
        if (amountPaid != null && !Number.isNaN(amountPaid) && amountPaid > 0) {
          p.lastAmount = amountPaid;
        }
      }
    }

    state.history = state.history || [];
    state.history.unshift({
      id: uid("h"),
      processId: proc.id,
      title: proc.title,
      type: proc.type,
      completedAt: isoDate(new Date()),
      nextDueSet: nextDue,
      note: note + (amountPaid != null && !Number.isNaN(amountPaid) ? (note ? " · " : "") + fmtMoney(amountPaid) : ""),
    });
    if (state.history.length > 50) state.history.length = 50;

    save();
    closeProcessRunner();
    scheduleReminderForProcess(proc);
    render();
    toast("Done · next due " + fmtDate(nextDue) + " (" + cadenceLabel(cadence) + ")");
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
      <div class="form-row"><label>Payment link label</label>
        <input type="text" id="np-link-label" value="${editing && editing.accountLinks && editing.accountLinks[0] ? esc(editing.accountLinks[0].label) : ""}" placeholder="e.g. DStv pay my account" />
      </div>
      <div class="form-row"><label>Payment URL (https)</label>
        <input type="url" id="np-link-url" value="${editing && editing.accountLinks && editing.accountLinks[0] ? esc(editing.accountLinks[0].url) : ""}" placeholder="https://…" />
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary btn-block" id="np-save">${editing ? "Save" : "Add process"}</button>
      </div>
      ${editing ? `<button type="button" class="btn btn-danger btn-block" id="np-run" style="margin-top:8px">Run wizard now</button>
                   <button type="button" class="btn btn-ghost btn-block" id="np-delete" style="margin-top:8px">Delete process</button>` : ""}
      <p style="font-size:11px;color:var(--muted);margin-top:10px">Not tax/legal advice. Payment URL opens via Open payment in the wizard (window.open). No OAuth — you pay yourself.</p>`
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
        const links = label && url ? [{ label, url }] : label ? [{ label, url: "#" }] : url ? [{ label: "Open payment", url }] : [];
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
    Object.keys(reminderTimers).forEach(clearReminderTimer);
    state = seed();
    save();
    showView("today");
    updateInstallBanner();
    rescheduleAllReminders();
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
    const openUrl = e.target.closest("[data-open-url]");
    if (openUrl) { window.open(openUrl.getAttribute("data-open-url"), "_blank", "noopener,noreferrer"); return; }
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
       <p>Tap a due bill → Open payment (exact stored URL) → confirm paid → next due auto from cadence. You only <strong>Approve</strong> money / legal / government steps.</p>
       <p>Sample data: Prinsloo household, Bloemfontein. Toggle modules in Settings.</p>
       <p style="font-size:12px;color:var(--muted)">Not financial, insurance, tax, labour, legal or medical advice. Does not file with SARS or uFiling. No mining, chemistry or environmental advisory. Demo / localStorage only. Installable PWA · export your JSON backup from Settings.</p>`
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
  document.getElementById("ob-save") && document.getElementById("ob-save").addEventListener("click", completeOnboarding);

  /* ── backup export / import ── */
  function collectExportPayload() {
    return {
      app: "life-desk",
      version: 1,
      exportedAt: new Date().toISOString(),
      keys: {
        [STORAGE_KEY]: state,
      },
    };
  }

  function exportJson() {
    const payload = collectExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "life-desk-backup-" + isoDate(new Date()) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Exported JSON backup");
  }

  function applyImportPayload(data) {
    if (!data || typeof data !== "object") throw new Error("Invalid file");
    let next = null;
    if (data.keys && data.keys[STORAGE_KEY]) next = data.keys[STORAGE_KEY];
    else if (data.state && typeof data.state === "object") next = data.state;
    else if (data.processes || data.modules) next = data;
    else if (data.keys) {
      const vals = Object.keys(data.keys);
      if (vals.length === 1) next = data.keys[vals[0]];
    }
    if (!next || typeof next !== "object") throw new Error("No Life Desk state in file");
    next.modules = Object.assign({}, DEFAULT_MODULES, next.modules || {});
    next.prefs = Object.assign({
      quietStart: 21,
      quietEnd: 7,
      notificationsEnabled: true,
      lastNotified: {},
      installDismissed: false,
    }, next.prefs || {});
    if (!Array.isArray(next.processes)) next.processes = seedProcesses(startOfDay(new Date()));
    if (!Array.isArray(next.history)) next.history = [];
    if (!next.profile) next.profile = { onboarded: false, city: "", purpose: "", updatedAt: null };
    state = next;
    save();
    rescheduleAllReminders();
    render();
    toast("Import complete");
  }

  function importJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(String(reader.result || ""));
        applyImportPayload(data);
      } catch (err) {
        toast("Import failed — check JSON");
      }
    };
    reader.onerror = function () { toast("Could not read file"); };
    reader.readAsText(file);
  }

  /* ── PWA install affordance ── */
  var deferredInstall = null;
  function updateInstallBanner() {
    const banner = $("#install-banner");
    if (!banner) return;
    const prefs = getPrefs();
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (standalone || prefs.installDismissed) {
      banner.classList.add("hidden");
      return;
    }
    if (deferredInstall) {
      banner.classList.remove("hidden");
      const btn = $("#btn-install");
      if (btn) btn.textContent = "Install";
    } else {
      /* iOS / browsers without beforeinstallprompt — still show how-to */
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && !prefs.installDismissed) {
        banner.classList.remove("hidden");
        const btn = $("#btn-install");
        if (btn) btn.textContent = "How to";
      } else {
        banner.classList.add("hidden");
      }
    }
  }
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstall = e;
    updateInstallBanner();
  });
  window.addEventListener("appinstalled", function () {
    deferredInstall = null;
    getPrefs().installDismissed = true;
    save();
    updateInstallBanner();
    toast("Life Desk installed");
  });

  $("#btn-install") && $("#btn-install").addEventListener("click", function () {
    if (deferredInstall) {
      deferredInstall.prompt();
      deferredInstall.userChoice.then(function (choice) {
        deferredInstall = null;
        if (choice && choice.outcome === "accepted") {
          getPrefs().installDismissed = true;
          save();
        }
        updateInstallBanner();
      });
      return;
    }
    openModal(
      "Add to Home Screen",
      `<p style="font-size:15px;line-height:1.55">On iPhone/iPad: Safari → Share → <strong>Add to Home Screen</strong>.</p>
       <p style="font-size:15px;line-height:1.55;margin-top:8px">On Android Chrome: menu → <strong>Install app</strong> / Add to Home screen.</p>
       <p style="font-size:13px;color:var(--muted);margin-top:10px">Offline shell caches index, app.js, styles, and manifest. Not financial/tax/insurance/legal advice.</p>`
    );
  });
  $("#btn-install-dismiss") && $("#btn-install-dismiss").addEventListener("click", function () {
    getPrefs().installDismissed = true;
    save();
    updateInstallBanner();
  });

  $("#btn-enable-notifs") && $("#btn-enable-notifs").addEventListener("click", function () {
    getPrefs().notificationsEnabled = true;
    save();
    requestNotificationPermission().then(function () {
      checkDueNotifications();
      rescheduleAllReminders();
    });
  });
  $("#btn-request-notifs") && $("#btn-request-notifs").addEventListener("click", function () {
    getPrefs().notificationsEnabled = true;
    save();
    requestNotificationPermission().then(function () {
      checkDueNotifications();
      rescheduleAllReminders();
      render();
    });
  });
  $("#pref-notifs") && $("#pref-notifs").addEventListener("change", function (e) {
    getPrefs().notificationsEnabled = !!e.target.checked;
    save();
    if (e.target.checked) {
      requestNotificationPermission().then(function () { rescheduleAllReminders(); });
    } else {
      Object.keys(reminderTimers).forEach(clearReminderTimer);
      toast("Reminder alerts off — queue still shows in Today");
    }
    render();
  });
  function saveQuietFromInputs() {
    const prefs = getPrefs();
    const qs = $("#quiet-start");
    const qe = $("#quiet-end");
    if (qs) {
      let v = Math.max(0, Math.min(23, Number(qs.value)));
      if (Number.isNaN(v)) v = 21;
      prefs.quietStart = v;
    }
    if (qe) {
      let v = Math.max(0, Math.min(23, Number(qe.value)));
      if (Number.isNaN(v)) v = 7;
      prefs.quietEnd = v;
    }
    save();
    rescheduleAllReminders();
    toast("Quiet hours saved");
    render();
  }
  $("#quiet-start") && $("#quiet-start").addEventListener("change", saveQuietFromInputs);
  $("#quiet-end") && $("#quiet-end").addEventListener("change", saveQuietFromInputs);

  $("#btn-export-json") && $("#btn-export-json").addEventListener("click", exportJson);
  $("#btn-import-json") && $("#btn-import-json").addEventListener("click", function () {
    const f = $("#import-file");
    if (f) f.click();
  });
  $("#import-file") && $("#import-file").addEventListener("change", function (e) {
    const file = e.target.files && e.target.files[0];
    importJsonFile(file);
    e.target.value = "";
  });

  /* boot */
  save();
  maybeOnboard();
  render();
  updateInstallBanner();
  rescheduleAllReminders();
  checkDueNotifications();
  setInterval(function () {
    checkDueNotifications();
  }, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") checkDueNotifications();
  });
})();
