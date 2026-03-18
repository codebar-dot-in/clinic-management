import { useState } from "react";

// ─── i18n ───────────────────────────────────────────────────────────────────
const i18n = {
  en: {
    appTitle: "Clinic Dashboard",
    opdBilling: "OPD Billing",
    doctorView: "Doctor View",
    summaryStats: "Today's Summary",
    token: "Token",
    patientName: "Patient Name",
    age: "Age",
    consultFee: "Consult Fee (₹)",
    paymentMode: "Payment",
    status: "Status",
    actions: "Actions",
    printReceipt: "Print Receipt",
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    paid: "Paid",
    pending: "Pending",
    waived: "Waived",
    markPaid: "Mark Paid",
    appointments: "Appointments",
    currentPatient: "Current Patient",
    diagnosisNotes: "Diagnosis / Notes",
    diagnosisPlaceholder: "Type diagnosis, prescription, or notes here…",
    markDone: "Mark as Done",
    done: "Done",
    waiting: "Waiting",
    inProgress: "In Progress",
    todayOPD: "Today's OPD",
    revenue: "Revenue",
    pendingPatients: "Pending",
    completed: "Completed",
    noPatient: "No patient selected.",
    selectPatient: "Click a patient row to view details.",
    phone: "Phone",
    complaint: "Chief Complaint",
    noAppointments: "No appointments for today.",
    langToggle: "தமிழ்",
    search: "Search patient…",
    saveNotes: "Save Notes",
    notesSaved: "Notes saved!",
  },
  ta: {
    appTitle: "கிளினிக் டாஷ்போர்ட்",
    opdBilling: "OPD பில்லிங்",
    doctorView: "மருத்துவர் பார்வை",
    summaryStats: "இன்றைய சுருக்கம்",
    token: "டோக்கன்",
    patientName: "நோயாளி பெயர்",
    age: "வயது",
    consultFee: "கட்டணம் (₹)",
    paymentMode: "கட்டண முறை",
    status: "நிலை",
    actions: "செயல்கள்",
    printReceipt: "ரசீது அச்சிடு",
    cash: "பணம்",
    upi: "UPI",
    card: "அட்டை",
    paid: "செலுத்தப்பட்டது",
    pending: "நிலுவை",
    waived: "தள்ளுபடி",
    markPaid: "பணம் பெற்றது",
    appointments: "சந்திப்புகள்",
    currentPatient: "தற்போதைய நோயாளி",
    diagnosisNotes: "நோயறிதல் / குறிப்புகள்",
    diagnosisPlaceholder: "நோயறிதல், மருந்து அல்லது குறிப்புகளை இங்கே உள்ளிடவும்…",
    markDone: "முடிந்தது என குறி",
    done: "முடிந்தது",
    waiting: "காத்திருக்கிறது",
    inProgress: "நடைபெறுகிறது",
    todayOPD: "இன்றைய OPD",
    revenue: "வருவாய்",
    pendingPatients: "நிலுவை",
    completed: "நிறைவு",
    noPatient: "நோயாளி தேர்வு செய்யப்படவில்லை.",
    selectPatient: "விவரங்களை காண நோயாளி வரிசையை கிளிக் செய்யவும்.",
    phone: "தொலைபேசி",
    complaint: "முக்கிய முறையீடு",
    noAppointments: "இன்று சந்திப்புகள் இல்லை.",
    langToggle: "English",
    search: "நோயாளி தேடு…",
    saveNotes: "குறிப்புகள் சேமி",
    notesSaved: "குறிப்புகள் சேமிக்கப்பட்டன!",
  },
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialPatients = [
  { id: 1, token: "T-001", name: "Arjun Kumar", age: 34, phone: "98765-43210", complaint: "Fever & headache", fee: 300, paymentMode: "cash", paymentStatus: "paid", consultStatus: "done", time: "09:00" },
  { id: 2, token: "T-002", name: "Meena Devi", age: 52, phone: "91234-56789", complaint: "Knee pain", fee: 300, paymentMode: "upi", paymentStatus: "paid", consultStatus: "done", time: "09:20" },
  { id: 3, token: "T-003", name: "Ravi Shankar", age: 28, phone: "87654-32109", complaint: "Cold & cough", fee: 300, paymentMode: "card", paymentStatus: "paid", consultStatus: "inProgress", time: "09:40" },
  { id: 4, token: "T-004", name: "Lakshmi Priya", age: 41, phone: "99887-76655", complaint: "Back pain", fee: 300, paymentMode: "cash", paymentStatus: "pending", consultStatus: "waiting", time: "10:00" },
  { id: 5, token: "T-005", name: "Senthil Nathan", age: 60, phone: "80011-22334", complaint: "Diabetes follow-up", fee: 200, paymentMode: "upi", paymentStatus: "paid", consultStatus: "waiting", time: "10:20" },
  { id: 6, token: "T-006", name: "Vijaya Lakshmi", age: 35, phone: "70022-33445", complaint: "Skin rash", fee: 300, paymentMode: "cash", paymentStatus: "pending", consultStatus: "waiting", time: "10:40" },
  { id: 7, token: "T-007", name: "Bharath Raj", age: 22, phone: "60033-44556", complaint: "Ear pain", fee: 300, paymentMode: "cash", paymentStatus: "pending", consultStatus: "waiting", time: "11:00" },
  { id: 8, token: "T-008", name: "Kamala Devi", age: 67, phone: "55011-66778", complaint: "BP checkup", fee: 150, paymentMode: "upi", paymentStatus: "waived", consultStatus: "waiting", time: "11:20" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCurrency = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const statusColors = {
  done: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  inProgress: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  waiting: { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" },
};

const payStatusColors = {
  paid: { bg: "#d1fae5", text: "#065f46" },
  pending: { bg: "#fee2e2", text: "#991b1b" },
  waived: { bg: "#f3f4f6", text: "#6b7280" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: "18px 22px",
      flex: 1,
      minWidth: 140,
      boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${accent}`,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 4 }}>{value}</span>
      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function Badge({ text, colors }) {
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border || colors.bg}`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

// ─── OPD Billing Panel ────────────────────────────────────────────────────────
function OPDBilling({ patients, setPatients, t, lang }) {
  const [search, setSearch] = useState("");
  const [editFee, setEditFee] = useState({});
  const [toastId, setToastId] = useState(null);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.token.toLowerCase().includes(search.toLowerCase())
  );

  const updatePatient = (id, updates) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handlePrint = (p) => {
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <html><head><title>Receipt - ${p.token}</title>
      <style>body{font-family:sans-serif;padding:24px;max-width:360px;margin:auto}
      h2{color:#0d9488;margin-bottom:4px}hr{border:1px dashed #ccc}
      .row{display:flex;justify-content:space-between;padding:4px 0}
      .total{font-size:18px;font-weight:700;color:#0d9488}
      </style></head><body>
      <h2>Clinic Receipt</h2>
      <p style="color:#6b7280;font-size:13px">Date: ${new Date().toLocaleDateString("en-IN")}</p>
      <hr/>
      <div class="row"><span>Token</span><strong>${p.token}</strong></div>
      <div class="row"><span>Patient</span><strong>${p.name}</strong></div>
      <div class="row"><span>Age</span><strong>${p.age} yrs</strong></div>
      <div class="row"><span>Phone</span><strong>${p.phone}</strong></div>
      <div class="row"><span>Complaint</span><strong>${p.complaint}</strong></div>
      <hr/>
      <div class="row"><span>Consultation Fee</span><strong>₹${p.fee}</strong></div>
      <div class="row"><span>Payment Mode</span><strong>${p.paymentMode.toUpperCase()}</strong></div>
      <div class="row"><span>Status</span><strong>${p.paymentStatus.toUpperCase()}</strong></div>
      <hr/>
      <div class="row total"><span>Total Paid</span><span>₹${p.paymentStatus === "paid" ? p.fee : 0}</span></div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:24px">Thank you for visiting!<br/>Get well soon.</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const showToast = (id) => {
    setToastId(id);
    setTimeout(() => setToastId(null), 2000);
  };

  return (
    <section style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg,#0d9488,#059669)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 18, fontWeight: 700 }}>{t.opdBilling}</h2>
        <input
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, outline: "none", width: 180, background: "rgba(255,255,255,0.9)" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              {[t.token, t.patientName, t.age, t.consultFee, t.paymentMode, t.status, t.actions].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f0fdfa"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f9fafb"}
              >
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0d9488" }}>{p.token}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.time}</div>
                </td>
                <td style={{ padding: "10px 14px", color: "#374151" }}>{p.age}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#374151" }}>₹</span>
                    <input
                      type="number"
                      value={editFee[p.id] !== undefined ? editFee[p.id] : p.fee}
                      onChange={e => setEditFee(f => ({ ...f, [p.id]: e.target.value }))}
                      onBlur={() => {
                        if (editFee[p.id] !== undefined) {
                          updatePatient(p.id, { fee: Number(editFee[p.id]) });
                          setEditFee(f => { const n = { ...f }; delete n[p.id]; return n; });
                        }
                      }}
                      style={{ width: 60, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px", fontSize: 13, outline: "none" }}
                    />
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <select
                    value={p.paymentMode}
                    onChange={e => updatePatient(p.id, { paymentMode: e.target.value })}
                    style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 13, background: "#fff", cursor: "pointer" }}
                  >
                    <option value="cash">{t.cash}</option>
                    <option value="upi">{t.upi}</option>
                    <option value="card">{t.card}</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <Badge text={t[p.paymentStatus]} colors={payStatusColors[p.paymentStatus]} />
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.paymentStatus === "pending" && (
                      <button
                        onClick={() => { updatePatient(p.id, { paymentStatus: "paid" }); showToast(p.id); }}
                        style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                      >
                        {toastId === p.id ? "✓" : t.markPaid}
                      </button>
                    )}
                    <button
                      onClick={() => handlePrint(p)}
                      style={{ background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                    >
                      {t.printReceipt}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Doctor View ──────────────────────────────────────────────────────────────
function DoctorView({ patients, setPatients, t }) {
  const [selectedId, setSelectedId] = useState(3); // default to inProgress
  const [notes, setNotes] = useState({});
  const [savedId, setSavedId] = useState(null);

  const selected = patients.find(p => p.id === selectedId);

  const updatePatient = (id, updates) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const saveNotes = (id) => {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const consultLabel = { done: t.done, inProgress: t.inProgress, waiting: t.waiting };

  return (
    <section style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg,#0f766e,#047857)", padding: "16px 22px" }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 18, fontWeight: 700 }}>{t.doctorView}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 0 }}>
        {/* Appointments List */}
        <div style={{ borderRight: "1px solid #e2e8f0", maxHeight: 480, overflowY: "auto" }}>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5, textTransform: "uppercase" }}>
            {t.appointments}
          </div>
          {patients.length === 0 && (
            <p style={{ padding: 20, color: "#9ca3af", fontSize: 13 }}>{t.noAppointments}</p>
          )}
          {patients.map(p => {
            const sc = statusColors[p.consultStatus];
            const isSelected = selectedId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                  background: isSelected ? "#f0fdfa" : "#fff",
                  borderLeft: isSelected ? "3px solid #0d9488" : "3px solid transparent",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#0d9488", fontSize: 12 }}>{p.token}</span>
                    <span style={{ fontWeight: 600, color: "#111827", marginLeft: 8, fontSize: 13 }}>{p.name}</span>
                  </div>
                  <Badge text={consultLabel[p.consultStatus]} colors={sc} />
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#9ca3af" }}>{p.time} · {p.complaint}</div>
              </div>
            );
          })}
        </div>

        {/* Current Patient Detail */}
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {!selected ? (
            <div style={{ color: "#9ca3af", paddingTop: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40 }}>🩺</div>
              <div style={{ fontWeight: 600, color: "#374151", marginTop: 8 }}>{t.noPatient}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{t.selectPatient}</div>
            </div>
          ) : (
            <>
              <div style={{ background: "#f0fdfa", borderRadius: 10, padding: "14px 18px", border: "1px solid #99f6e4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>{selected.name}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                      {t.age}: {selected.age} &nbsp;|&nbsp; {t.phone}: {selected.phone}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#0d9488", fontSize: 16 }}>{selected.token}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{selected.time}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #d1fae5" }}>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{t.complaint}: </span>
                  <span style={{ fontSize: 13, color: "#111827" }}>{selected.complaint}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{t.diagnosisNotes}</label>
                <textarea
                  value={notes[selected.id] || ""}
                  onChange={e => setNotes(n => ({ ...n, [selected.id]: e.target.value }))}
                  placeholder={t.diagnosisPlaceholder}
                  rows={5}
                  style={{
                    width: "100%", borderRadius: 8, border: "1px solid #d1d5db", padding: "10px 12px",
                    fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit",
                    boxSizing: "border-box", lineHeight: 1.6, color: "#111827",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => saveNotes(selected.id)}
                  style={{
                    flex: 1, background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4",
                    borderRadius: 8, padding: "9px 0", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  }}
                >
                  {savedId === selected.id ? `✓ ${t.notesSaved}` : t.saveNotes}
                </button>
                <button
                  onClick={() => updatePatient(selected.id, { consultStatus: "done" })}
                  disabled={selected.consultStatus === "done"}
                  style={{
                    flex: 1,
                    background: selected.consultStatus === "done" ? "#d1fae5" : "linear-gradient(135deg,#0d9488,#059669)",
                    color: selected.consultStatus === "done" ? "#065f46" : "#fff",
                    border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 700,
                    fontSize: 14, cursor: selected.consultStatus === "done" ? "default" : "pointer",
                  }}
                >
                  {selected.consultStatus === "done" ? `✓ ${t.done}` : t.markDone}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClinicDashboard() {
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("opd");
  const [patients, setPatients] = useState(initialPatients);
  const t = i18n[lang];

  const todayOPD = patients.length;
  const revenue = patients.filter(p => p.paymentStatus === "paid").reduce((s, p) => s + p.fee, 0);
  const pending = patients.filter(p => p.consultStatus === "waiting").length;
  const completed = patients.filter(p => p.consultStatus === "done").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0fdf4",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#111827",
    }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg,#0d9488 0%,#059669 100%)",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>🏥</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: 0.3 }}>{t.appTitle}</div>
            <div style={{ color: "#a7f3d0", fontSize: 11 }}>{new Date().toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>
        <button
          onClick={() => setLang(l => l === "en" ? "ta" : "en")}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            color: "#fff",
            borderRadius: 8,
            padding: "7px 16px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            letterSpacing: 0.3,
          }}
        >
          {t.langToggle}
        </button>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Stats Row */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <StatCard label={t.todayOPD} value={todayOPD} accent="#0d9488" icon="🧑‍⚕️" />
          <StatCard label={t.revenue} value={fmtCurrency(revenue)} accent="#059669" icon="💰" />
          <StatCard label={t.pendingPatients} value={pending} accent="#f59e0b" icon="⏳" />
          <StatCard label={t.completed} value={completed} accent="#3b82f6" icon="✅" />
        </div>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 10, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", width: "fit-content" }}>
          {[
            { key: "opd", label: `🧾 ${t.opdBilling}` },
            { key: "doctor", label: `🩺 ${t.doctorView}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? "linear-gradient(135deg,#0d9488,#059669)" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#6b7280",
                border: "none",
                borderRadius: 7,
                padding: "9px 22px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {activeTab === "opd" && (
          <OPDBilling patients={patients} setPatients={setPatients} t={t} lang={lang} />
        )}
        {activeTab === "doctor" && (
          <DoctorView patients={patients} setPatients={setPatients} t={t} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: 12, borderTop: "1px solid #e5e7eb", marginTop: 16 }}>
        Clinic Dashboard &copy; {new Date().getFullYear()} &mdash; Built with care for your clinic
      </footer>
    </div>
  );
}
