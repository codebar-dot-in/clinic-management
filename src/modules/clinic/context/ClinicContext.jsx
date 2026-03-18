/**
 * ClinicContext — state + actions for the Clinic segment.
 */
import { createContext, useContext, useReducer, useCallback } from "react";
import { storage } from "../../../shared/utils/storage.js";
import { genId, genBillNo, genUHID } from "../../../shared/utils/id.js";
import { calcBillTotals } from "../../../shared/utils/gst.js";

// ─── Reference Data ────────────────────────────────────────────────────────────

export const SPECIALIZATIONS = [
  "General Medicine", "Obstetrics & Gynaecology", "Paediatrics",
  "Orthopaedics", "Dermatology", "ENT", "Ophthalmology",
  "Psychiatry", "General Surgery", "Cardiology", "Neurology", "General Practice",
];

export const TN_DISTRICTS = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
  "Tiruppur", "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur",
  "Ranipet", "Sivaganga", "Virudhunagar", "Nagapattinam", "Krishnagiri",
  "Dharmapuri", "Cuddalore", "Kancheepuram", "Villupuram", "Chengalpattu",
  "Tiruvannamalai", "Perambalur", "Ariyalur", "Karur", "Namakkal",
  "Nilgiris", "Pudukkottai", "Ramanathapuram", "Tenkasi", "Tirupattur",
  "Tiruvarur", "Kallakurichi", "Mayiladuthurai",
];

export const BLOOD_GROUPS  = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
export const RX_FREQUENCY  = ["OD", "BD", "TDS", "QID", "SOS", "HS", "Stat", "Weekly"];
export const RX_ROUTES     = ["Oral", "Topical", "IM", "IV", "SC", "Sublingual", "Inhalation", "Eye Drops", "Ear Drops", "Nasal Drops"];
export const RX_DURATION   = ["1 Day", "2 Days", "3 Days", "5 Days", "7 Days", "10 Days", "14 Days", "1 Month", "2 Months", "3 Months", "Continue"];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString();

const BLANK_ADDRESS = { doorNo: "", street: "", area: "", city: "Chennai", district: "Chennai", pincode: "", state: "Tamil Nadu" };
const BLANK_EC      = { name: "", relation: "", phone: "" };
const BLANK_INS     = { provider: "", policyNo: "", validUntil: "" };

export const MOCK_DOCTORS = [
  {
    id: "d1", tnmcRegNo: "TNMC-41823",
    nameEn: "Dr. Anand Krishnamurthy", nameTa: "டாக்டர் ஆனந்த் கிருஷ்ணமூர்த்தி",
    qualification: "MBBS, MD (Gen. Medicine)", specialization: "General Medicine",
    consultationFee: 500, experience: "12 years",
    timings: [
      { slot: "09:00–12:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat"] },
      { slot: "17:00–19:00", days: ["Mon","Wed","Fri"] },
    ],
    status: "active", phone: "9876543210", email: "anand@clinic.in", createdAt: TODAY,
  },
  {
    id: "d2", tnmcRegNo: "TNMC-38142",
    nameEn: "Dr. Priya Subramaniam", nameTa: "டாக்டர் பிரியா சுப்பிரமணியம்",
    qualification: "MBBS, DGO", specialization: "Obstetrics & Gynaecology",
    consultationFee: 600, experience: "8 years",
    timings: [{ slot: "10:00–13:00", days: ["Mon","Tue","Thu","Sat"] }],
    status: "active", phone: "9123456789", email: "", createdAt: TODAY,
  },
  {
    id: "d3", tnmcRegNo: "TNMC-29901",
    nameEn: "Dr. Rajesh Kumar", nameTa: "டாக்டர் ராஜேஷ் குமார்",
    qualification: "MBBS", specialization: "General Practice",
    consultationFee: 350, experience: "5 years",
    timings: [{ slot: "08:00–11:00", days: ["Mon","Tue","Wed","Thu","Fri"] }],
    status: "on-leave", phone: "8765432109", email: "", createdAt: TODAY,
  },
];

const MOCK_PATIENTS = [
  {
    id: "p1", uhid: "CL-9811-4231",
    nameEn: "Arjun Kumar", nameTa: "அர்ஜுன் குமார்",
    phone: "9876543210", altPhone: "",
    gender: "M", dob: "1990-06-15", bloodGroup: "B+",
    drugAllergies: [], foodAllergies: [], chronicConditions: ["Hypertension"],
    surgicalHistory: "", familyHistory: "Father — Hypertension",
    abhaNumber: null, rationCard: "",
    address: { ...BLANK_ADDRESS, doorNo: "12A", street: "Gandhi Road", area: "Adyar", city: "Chennai", district: "Chennai", pincode: "600020" },
    emergencyContact: { name: "Priya Arjun", relation: "Spouse", phone: "9876543211" },
    insurance: { ...BLANK_INS },
    createdAt: TODAY,
  },
  {
    id: "p2", uhid: "CL-7642-8812",
    nameEn: "Meena Devi", nameTa: "மீனா தேவி",
    phone: "9123456789", altPhone: "",
    gender: "F", dob: "1972-03-22", bloodGroup: "O+",
    drugAllergies: ["Penicillin"], foodAllergies: [], chronicConditions: ["Diabetes Type 2"],
    surgicalHistory: "Appendectomy - 2018", familyHistory: "Mother — Diabetes",
    abhaNumber: null, rationCard: "TN-2019-441982",
    address: { ...BLANK_ADDRESS, doorNo: "5", street: "Nehru Street", area: "Tambaram", city: "Chennai", district: "Chennai", pincode: "600045" },
    emergencyContact: { name: "Rajan Devi", relation: "Son", phone: "9123456780" },
    insurance: { provider: "Star Health", policyNo: "SH-2024-88812", validUntil: "2026-12-31" },
    createdAt: TODAY,
  },
  {
    id: "p3", uhid: "CL-5521-3301", nameEn: "Ravi Shankar",    nameTa: "ரவி சங்கர்",        phone: "8765432109", altPhone: "", gender: "M", dob: "1996-11-08", bloodGroup: "A+",  drugAllergies: [], foodAllergies: [], chronicConditions: [], surgicalHistory: "", familyHistory: "", abhaNumber: null, rationCard: "", address: { ...BLANK_ADDRESS }, emergencyContact: { ...BLANK_EC }, insurance: { ...BLANK_INS }, createdAt: TODAY },
  {
    id: "p4", uhid: "CL-4490-2291", nameEn: "Lakshmi Priya",  nameTa: "லட்சுமி பிரியா",    phone: "9988776655", altPhone: "", gender: "F", dob: "1983-07-30", bloodGroup: "AB+", drugAllergies: [], foodAllergies: [], chronicConditions: ["Back Pain"], surgicalHistory: "", familyHistory: "", abhaNumber: null, rationCard: "", address: { ...BLANK_ADDRESS }, emergencyContact: { ...BLANK_EC }, insurance: { ...BLANK_INS }, createdAt: TODAY },
  {
    id: "p5", uhid: "CL-3310-9901", nameEn: "Senthil Nathan", nameTa: "செந்தில் நாதன்",     phone: "8001122334", altPhone: "", gender: "M", dob: "1964-02-14", bloodGroup: "B-",  drugAllergies: [], foodAllergies: [], chronicConditions: ["Diabetes","BP"], surgicalHistory: "PTCA - 2022", familyHistory: "Father — Diabetes, BP", abhaNumber: "14-2024-0011-9281", rationCard: "", address: { ...BLANK_ADDRESS }, emergencyContact: { name: "Kavitha", relation: "Wife", phone: "8001122335" }, insurance: { provider: "LIC HFL", policyNo: "LIC-8812-2024", validUntil: "2027-03-31" }, createdAt: TODAY },
  {
    id: "p6", uhid: "CL-1190-5512", nameEn: "Vijaya Lakshmi", nameTa: "விஜயலட்சுமி",        phone: "7002233445", altPhone: "", gender: "F", dob: "1989-09-05", bloodGroup: "O-",  drugAllergies: [], foodAllergies: [], chronicConditions: [], surgicalHistory: "", familyHistory: "", abhaNumber: null, rationCard: "", address: { ...BLANK_ADDRESS }, emergencyContact: { ...BLANK_EC }, insurance: { ...BLANK_INS }, createdAt: TODAY },
  {
    id: "p7", uhid: "CL-0221-7781", nameEn: "Bharath Raj",    nameTa: "பரத் ராஜ்",          phone: "6003344556", altPhone: "", gender: "M", dob: "2002-04-19", bloodGroup: "A+",  drugAllergies: [], foodAllergies: [], chronicConditions: [], surgicalHistory: "", familyHistory: "", abhaNumber: null, rationCard: "", address: { ...BLANK_ADDRESS }, emergencyContact: { ...BLANK_EC }, insurance: { ...BLANK_INS }, createdAt: TODAY },
  {
    id: "p8", uhid: "CL-8891-0031", nameEn: "Kamala Devi",    nameTa: "கமலாதேவி",           phone: "5501166778", altPhone: "", gender: "F", dob: "1957-12-25", bloodGroup: "AB-", drugAllergies: ["Aspirin"], foodAllergies: [], chronicConditions: ["BP","Arthritis"], surgicalHistory: "Hip replacement - 2020", familyHistory: "Both parents — BP", abhaNumber: null, rationCard: "TN-2015-119032", address: { ...BLANK_ADDRESS }, emergencyContact: { name: "Suresh", relation: "Son", phone: "5501166779" }, insurance: { ...BLANK_INS }, createdAt: TODAY },
];

const MOCK_APPOINTMENTS = [
  { id: "a1", token: "T-001", patientId: "p1", patient: MOCK_PATIENTS[0], doctorId: "d1", time: "09:00", type: "booked",  complaint: "Fever & headache",      consultStatus: "done",       doctor: "Dr. Anand Krishnamurthy", notes: "Viral fever. Rest + fluids.", date: TODAY },
  { id: "a2", token: "T-002", patientId: "p2", patient: MOCK_PATIENTS[1], doctorId: "d2", time: "09:20", type: "booked",  complaint: "Knee pain",              consultStatus: "done",       doctor: "Dr. Priya Subramaniam",   notes: "",                           date: TODAY },
  { id: "a3", token: "T-003", patientId: "p3", patient: MOCK_PATIENTS[2], doctorId: "d1", time: "09:40", type: "booked",  complaint: "Cold & cough",           consultStatus: "inProgress", doctor: "Dr. Anand Krishnamurthy", notes: "",                           date: TODAY },
  { id: "a4", token: "T-004", patientId: "p4", patient: MOCK_PATIENTS[3], doctorId: "d3", time: "10:00", type: "walkIn",  complaint: "Back pain",              consultStatus: "waiting",    doctor: "Dr. Rajesh Kumar",        notes: "",                           date: TODAY },
  { id: "a5", token: "T-005", patientId: "p5", patient: MOCK_PATIENTS[4], doctorId: "d1", time: "10:20", type: "booked",  complaint: "Diabetes follow-up",     consultStatus: "waiting",    doctor: "Dr. Anand Krishnamurthy", notes: "",                           date: TODAY },
  { id: "a6", token: "T-006", patientId: "p6", patient: MOCK_PATIENTS[5], doctorId: "d2", time: "10:40", type: "walkIn",  complaint: "Skin rash",              consultStatus: "waiting",    doctor: "Dr. Priya Subramaniam",   notes: "",                           date: TODAY },
  { id: "a7", token: "T-007", patientId: "p7", patient: MOCK_PATIENTS[6], doctorId: "d3", time: "11:00", type: "booked",  complaint: "Ear pain",               consultStatus: "waiting",    doctor: "Dr. Rajesh Kumar",        notes: "",                           date: TODAY },
  { id: "a8", token: "T-008", patientId: "p8", patient: MOCK_PATIENTS[7], doctorId: "d1", time: "11:20", type: "booked",  complaint: "BP checkup",             consultStatus: "waiting",    doctor: "Dr. Anand Krishnamurthy", notes: "",                           date: TODAY },
];

const MOCK_VISITS = [
  {
    id: "v1", visitNo: "OPD-V-001",
    patientId: "p1", appointmentId: "a1", doctorId: "d1",
    doctor: "Dr. Anand Krishnamurthy", visitType: "new",
    date: TODAY,
    vitals: { bp: "120/80", pulse: "72", temp: "98.6", weight: "68", height: "172", spo2: "98", rbs: "", rr: "16" },
    chiefComplaint: "Fever and headache for 3 days",
    hopi: "High grade fever since 3 days, associated with headache. No vomiting or loose stools.",
    examination: "Temp: 101°F. Throat mild congestion. No lymphadenopathy. Chest clear.",
    diagnosisEn: "Viral Fever",
    prescription: [
      { id: "rx1", name: "Paracetamol 500mg", dosage: "500mg", frequency: "TDS", duration: "5 Days", route: "Oral", instructions: "After food" },
      { id: "rx2", name: "Cetirizine 10mg",   dosage: "10mg",  frequency: "HS",  duration: "3 Days", route: "Oral", instructions: "At bedtime" },
    ],
    procedures: [],
    nextVisit: "2026-03-25",
    sickLeave: { enabled: true, from: "2026-03-18", to: "2026-03-20" },
    notes: "Adequate hydration. Return if no improvement in 3 days.",
    createdAt: TODAY,
  },
  {
    id: "v2", visitNo: "OPD-V-002",
    patientId: "p5", appointmentId: "a5", doctorId: "d1",
    doctor: "Dr. Anand Krishnamurthy", visitType: "followup",
    date: TODAY,
    vitals: { bp: "138/88", pulse: "80", temp: "98.2", weight: "74", height: "168", spo2: "97", rbs: "148", rr: "18" },
    chiefComplaint: "Diabetes follow-up — 3 months review",
    hopi: "Patient on Metformin 500mg BD. Sugars moderately controlled. Diet compliance fair.",
    examination: "BP elevated at 138/88. BMI 26.2. No pedal edema. Peripheral pulses normal.",
    diagnosisEn: "Type 2 Diabetes Mellitus — Sub-optimal control",
    prescription: [
      { id: "rx3", name: "Metformin 500mg",  dosage: "500mg", frequency: "BD", duration: "1 Month", route: "Oral", instructions: "After food" },
      { id: "rx4", name: "Glimepiride 1mg",  dosage: "1mg",   frequency: "OD", duration: "1 Month", route: "Oral", instructions: "Before breakfast" },
      { id: "rx5", name: "Amlodipine 5mg",   dosage: "5mg",   frequency: "OD", duration: "1 Month", route: "Oral", instructions: "Morning" },
    ],
    procedures: [],
    nextVisit: "2026-04-18",
    sickLeave: { enabled: false, from: "", to: "" },
    notes: "Advised to monitor BP daily. Diet counselling given. HbA1c repeat in 3 months.",
    createdAt: TODAY,
  },
];

const MOCK_BILLS = [
  {
    id: "b1", billNo: "OPD-2026-0001", billType: "opd",
    patient: MOCK_PATIENTS[0], doctorId: "d1", doctor: "Dr. Anand Krishnamurthy",
    visitId: "v1",
    items: [
      { id: genId(), name: "Consultation Fee", qty: 1, unitPrice: 500, gstSlab: 0, lineTotal: 500 },
      { id: genId(), name: "ECG",              qty: 1, unitPrice: 300, gstSlab: 18, lineTotal: 354 },
    ],
    subtotal: 800, totalGst: 54, grandTotal: 854,
    paymentMode: "upi", paymentStatus: "paid", notes: "", nextVisit: "2026-03-25", createdAt: TODAY,
  },
  {
    id: "b2", billNo: "OPD-2026-0002", billType: "opd",
    patient: MOCK_PATIENTS[1], doctorId: "d2", doctor: "Dr. Priya Subramaniam",
    visitId: null,
    items: [{ id: genId(), name: "Consultation Fee", qty: 1, unitPrice: 500, gstSlab: 0, lineTotal: 500 }],
    subtotal: 500, totalGst: 0, grandTotal: 500,
    paymentMode: "cash", paymentStatus: "paid", notes: "", nextVisit: null, createdAt: TODAY,
  },
  {
    id: "b3", billNo: "OPD-2026-0003", billType: "opd",
    patient: MOCK_PATIENTS[4], doctorId: "d1", doctor: "Dr. Anand Krishnamurthy",
    visitId: "v2",
    items: [
      { id: genId(), name: "Consultation Fee",  qty: 1, unitPrice: 500, gstSlab: 0, lineTotal: 500 },
      { id: genId(), name: "Blood Sugar (RBS)", qty: 1, unitPrice: 150, gstSlab: 0, lineTotal: 150 },
    ],
    subtotal: 650, totalGst: 0, grandTotal: 650,
    paymentMode: "cash", paymentStatus: "pending", notes: "", nextVisit: "2026-04-18", createdAt: TODAY,
  },
];

// ─── Reducer ──────────────────────────────────────────────────────────────────

const ACTIONS = {
  ADD_PATIENT:        "ADD_PATIENT",
  UPDATE_PATIENT:     "UPDATE_PATIENT",
  DELETE_PATIENT:     "DELETE_PATIENT",
  ADD_APPOINTMENT:    "ADD_APPOINTMENT",
  UPDATE_APPT:        "UPDATE_APPT",
  DELETE_APPOINTMENT: "DELETE_APPOINTMENT",
  ADD_VISIT:          "ADD_VISIT",
  UPDATE_VISIT:       "UPDATE_VISIT",
  ADD_BILL:           "ADD_BILL",
  UPDATE_BILL:        "UPDATE_BILL",
  ADD_DOCTOR:         "ADD_DOCTOR",
  UPDATE_DOCTOR:      "UPDATE_DOCTOR",
  DELETE_DOCTOR:      "DELETE_DOCTOR",
};

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_PATIENT:        return { ...state, patients: [payload, ...state.patients] };
    case ACTIONS.UPDATE_PATIENT:     return { ...state, patients: state.patients.map((p) => p.id === payload.id ? { ...p, ...payload } : p) };
    case ACTIONS.DELETE_PATIENT:     return { ...state, patients: state.patients.filter((p) => p.id !== payload) };
    case ACTIONS.ADD_APPOINTMENT:    return { ...state, appointments: [...state.appointments, payload] };
    case ACTIONS.UPDATE_APPT:        return { ...state, appointments: state.appointments.map((a) => a.id === payload.id ? { ...a, ...payload } : a) };
    case ACTIONS.DELETE_APPOINTMENT: return { ...state, appointments: state.appointments.filter((a) => a.id !== payload) };
    case ACTIONS.ADD_VISIT:        return { ...state, visits: [payload, ...state.visits] };
    case ACTIONS.UPDATE_VISIT:     return { ...state, visits: state.visits.map((v) => v.id === payload.id ? { ...v, ...payload } : v) };
    case ACTIONS.ADD_BILL:         return { ...state, bills: [payload, ...state.bills] };
    case ACTIONS.UPDATE_BILL:      return { ...state, bills: state.bills.map((b) => b.id === payload.id ? { ...b, ...payload } : b) };
    case ACTIONS.ADD_DOCTOR:    return { ...state, doctors: [payload, ...state.doctors] };
    case ACTIONS.UPDATE_DOCTOR: return { ...state, doctors: state.doctors.map((d) => d.id === payload.id ? { ...d, ...payload } : d) };
    case ACTIONS.DELETE_DOCTOR: return { ...state, doctors: state.doctors.filter((d) => d.id !== payload) };
    default: return state;
  }
}

function getInitialState() {
  return {
    patients:     storage.get("clinic_patients",     MOCK_PATIENTS),
    appointments: storage.get("clinic_appointments", MOCK_APPOINTMENTS),
    visits:       storage.get("clinic_visits",       MOCK_VISITS),
    bills:        storage.get("clinic_bills",        MOCK_BILLS),
    doctors:      storage.get("clinic_doctors",      MOCK_DOCTORS),
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ClinicContext = createContext(null);

export function ClinicProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const persist = useCallback((key, value) => storage.set(key, value), []);

  const addPatient = useCallback((data) => {
    const patient = {
      id: genId(), uhid: genUHID("CL"),
      nameEn: data.nameEn, nameTa: data.nameTa ?? "",
      phone: data.phone, altPhone: data.altPhone ?? "",
      gender: data.gender,
      dob: data.dob ?? null, bloodGroup: data.bloodGroup ?? null,
      abhaNumber: data.abhaNumber ?? null,
      rationCard: data.rationCard ?? "",
      drugAllergies:     Array.isArray(data.drugAllergies)     ? data.drugAllergies     : (data.drugAllergies     ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      foodAllergies:     Array.isArray(data.foodAllergies)     ? data.foodAllergies     : (data.foodAllergies     ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : (data.chronicConditions ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      surgicalHistory: data.surgicalHistory ?? "",
      familyHistory:   data.familyHistory   ?? "",
      address: {
        doorNo: data.doorNo ?? "", street: data.street ?? "",
        area: data.area ?? "", city: data.city ?? "Chennai",
        district: data.district ?? "Chennai", pincode: data.pincode ?? "",
        state: "Tamil Nadu",
      },
      emergencyContact: { name: data.ecName ?? "", relation: data.ecRelation ?? "", phone: data.ecPhone ?? "" },
      insurance: { provider: data.insProvider ?? "", policyNo: data.insPolicyNo ?? "", validUntil: data.insValidUntil ?? "" },
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_PATIENT, payload: patient });
    persist("clinic_patients", [patient, ...state.patients]);
    return patient;
  }, [state.patients, persist]);

  const updatePatient = useCallback((id, data) => {
    const updates = {
      ...data,
      drugAllergies:     Array.isArray(data.drugAllergies)     ? data.drugAllergies     : (data.drugAllergies     ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      foodAllergies:     Array.isArray(data.foodAllergies)     ? data.foodAllergies     : (data.foodAllergies     ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : (data.chronicConditions ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    dispatch({ type: ACTIONS.UPDATE_PATIENT, payload: { id, ...updates } });
    const updated = state.patients.map((p) => p.id === id ? { ...p, ...updates } : p);
    persist("clinic_patients", updated);
  }, [state.patients, persist]);

  const addAppointment = useCallback((data) => {
    const nextToken = `T-${String(state.appointments.length + 1).padStart(3, "0")}`;
    const appt = {
      id: genId(), token: nextToken,
      patientId: data.patient.id, patient: data.patient,
      doctorId: data.doctorId ?? null, time: data.time,
      type: data.type ?? "walkIn", complaint: data.complaint ?? "",
      consultStatus: "waiting", doctor: data.doctor ?? "",
      notes: "", date: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_APPOINTMENT, payload: appt });
    persist("clinic_appointments", [...state.appointments, appt]);
    return appt;
  }, [state.appointments, persist]);

  const updateAppointment = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_APPT, payload: { id, ...updates } });
    const updated = state.appointments.map((a) => a.id === id ? { ...a, ...updates } : a);
    persist("clinic_appointments", updated);
  }, [state.appointments, persist]);

  const addVisit = useCallback((data) => {
    const visitCount = state.visits.length + 1;
    const visit = {
      id: genId(),
      visitNo: `OPD-V-${String(visitCount).padStart(3, "0")}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_VISIT, payload: visit });
    persist("clinic_visits", [visit, ...state.visits]);
    // Mark appointment as done if linked
    if (data.appointmentId) {
      const updatedAppts = state.appointments.map((a) =>
        a.id === data.appointmentId ? { ...a, consultStatus: "done", notes: data.chiefComplaint } : a
      );
      dispatch({ type: ACTIONS.UPDATE_APPT, payload: { id: data.appointmentId, consultStatus: "done" } });
      persist("clinic_appointments", updatedAppts);
    }
    return visit;
  }, [state.visits, state.appointments, persist]);

  const updateVisit = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_VISIT, payload: { id, ...updates } });
    const updated = state.visits.map((v) => v.id === id ? { ...v, ...updates } : v);
    persist("clinic_visits", updated);
  }, [state.visits, persist]);

  const deletePatient = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_PATIENT, payload: id });
    const updated = state.patients.filter((p) => p.id !== id);
    persist("clinic_patients", updated);
  }, [state.patients, persist]);

  const deleteAppointment = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_APPOINTMENT, payload: id });
    const updated = state.appointments.filter((a) => a.id !== id);
    persist("clinic_appointments", updated);
  }, [state.appointments, persist]);

  const addDoctor = useCallback((data) => {
    const doctor = { id: genId(), ...data, createdAt: new Date().toISOString() };
    dispatch({ type: ACTIONS.ADD_DOCTOR, payload: doctor });
    persist("clinic_doctors", [doctor, ...state.doctors]);
    return doctor;
  }, [state.doctors, persist]);

  const deleteDoctor = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_DOCTOR, payload: id });
    const updated = state.doctors.filter((d) => d.id !== id);
    persist("clinic_doctors", updated);
  }, [state.doctors, persist]);

  const updateDoctor = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_DOCTOR, payload: { id, ...updates } });
    const updated = state.doctors.map((d) => d.id === id ? { ...d, ...updates } : d);
    persist("clinic_doctors", updated);
  }, [state.doctors, persist]);

  const createBill = useCallback((data, facilityBillCounter) => {
    const totals = calcBillTotals(data.items);
    const bill = {
      id: genId(),
      billNo: genBillNo("OPD", facilityBillCounter),
      billType: "opd",
      patient: data.patient,
      doctorId: data.doctorId ?? null,
      doctor: data.doctor ?? "",
      visitId: data.visitId ?? null,
      items: data.items.map((item) => {
        const lineTotal = item.unitPrice * item.qty * (1 + item.gstSlab / 100);
        return { ...item, id: item.id ?? genId(), lineTotal: Math.round(lineTotal * 100) / 100 };
      }),
      ...totals,
      paymentMode:   data.paymentMode,
      paymentStatus: data.paymentStatus ?? "paid",
      notes: data.notes ?? "", nextVisit: data.nextVisit ?? null,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: ACTIONS.ADD_BILL, payload: bill });
    persist("clinic_bills", [bill, ...state.bills]);
    return bill;
  }, [state.bills, persist]);

  const updateBill = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_BILL, payload: { id, ...updates } });
    const updated = state.bills.map((b) => b.id === id ? { ...b, ...updates } : b);
    persist("clinic_bills", updated);
  }, [state.bills, persist]);

  // ── Derived stats ──
  const todayPrefix       = new Date().toISOString().split("T")[0];
  const todayBills        = state.bills.filter((b) => b.createdAt?.startsWith(todayPrefix));
  const todayRevenue      = todayBills.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.grandTotal, 0);
  const pendingCount      = state.appointments.filter((a) => a.consultStatus === "waiting").length;
  const completedCount    = state.appointments.filter((a) => a.consultStatus === "done").length;
  const activeDoctorCount = state.doctors.filter((d) => d.status === "active").length;

  const value = {
    ...state,
    addPatient, updatePatient, deletePatient,
    addAppointment, updateAppointment, deleteAppointment,
    addVisit, updateVisit,
    addDoctor, updateDoctor, deleteDoctor,
    createBill, updateBill,
    todayRevenue, pendingCount, completedCount,
    totalOPD: state.appointments.length,
    todayBillCount: todayBills.length,
    activeDoctorCount,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export const useClinic = () => {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be inside ClinicProvider");
  return ctx;
};
