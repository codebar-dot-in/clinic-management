import { createContext, useContext, useReducer, useCallback } from "react";
import { storage } from "../../../shared/utils/storage.js";
import { genId, genBillNo, genUHID } from "../../../shared/utils/id.js";
import { calcBillTotals } from "../../../shared/utils/gst.js";

const TODAY = new Date().toISOString();

const MOCK_PATIENTS = [
  { id: "lp1", uhid: "LAB-1921-4421", nameEn: "Meena Sundar",   nameTa: "மீனா சுந்தர்",    phone: "9876501234", gender: "F", dob: "1988-03-22", abhaNumber: null, drugAllergies: [], chronicConditions: ["Diabetes"] },
  { id: "lp2", uhid: "LAB-3301-8812", nameEn: "Karthik Raj",    nameTa: "கார்த்திக் ராஜ்", phone: "8765409876", gender: "M", dob: "1975-11-08", abhaNumber: null, drugAllergies: [], chronicConditions: [] },
  { id: "lp3", uhid: "LAB-5512-2291", nameEn: "Anitha Priya",   nameTa: "அனிதா பிரியா",    phone: "7654323456", gender: "F", dob: "1993-07-14", abhaNumber: "14-2023-0022-8811", drugAllergies: [], chronicConditions: [] },
  { id: "lp4", uhid: "LAB-7781-9901", nameEn: "Ramu Krishnan",  nameTa: "ராமு கிருஷ்ணன்", phone: "6543212345", gender: "M", dob: "1960-05-30", abhaNumber: null, drugAllergies: [], chronicConditions: ["Hypertension", "CKD"] },
];

const MOCK_REQUESTS = [
  {
    id: "r1", reqNo: "LAB-2026-0001",
    patient: MOCK_PATIENTS[0], referringDoctor: "Dr. Priya (Endocrinology)",
    status: "delivered",
    tests: [
      { id: "t1", testName: "HbA1c",            resultValue: "8.2",  unit: "%",      normalRange: "< 5.7",    isAbnormal: true,  price: 450 },
      { id: "t2", testName: "Fasting Blood Sugar", resultValue: "142", unit: "mg/dL", normalRange: "70–99",    isAbnormal: true,  price: 120 },
      { id: "t3", testName: "Total Cholesterol", resultValue: "198", unit: "mg/dL",  normalRange: "< 200",    isAbnormal: false, price: 680 },
    ],
    bill: { billNo: "LAB-2026-0001", grandTotal: 1475, subtotal: 1250, totalGst: 225, paymentMode: "upi", paymentStatus: "paid" },
    createdAt: TODAY, sampleCollectedAt: TODAY,
  },
  {
    id: "r2", reqNo: "LAB-2026-0002",
    patient: MOCK_PATIENTS[1], referringDoctor: "Dr. Anand (General Medicine)",
    status: "ready",
    tests: [
      { id: "t4", testName: "CBC",               resultValue: null, unit: "",       normalRange: "—",        isAbnormal: false, price: 350 },
      { id: "t5", testName: "LFT (Liver Function)", resultValue: null, unit: "",   normalRange: "—",        isAbnormal: false, price: 850 },
    ],
    bill: { billNo: "LAB-2026-0002", grandTotal: 1416, subtotal: 1200, totalGst: 216, paymentMode: "cash", paymentStatus: "paid" },
    createdAt: TODAY, sampleCollectedAt: TODAY,
  },
  {
    id: "r3", reqNo: "LAB-2026-0003",
    patient: MOCK_PATIENTS[2], referringDoctor: "Walk-in",
    status: "processing",
    tests: [
      { id: "t6", testName: "Thyroid Profile (T3,T4,TSH)", resultValue: null, unit: "", normalRange: "—", isAbnormal: false, price: 750 },
    ],
    bill: { billNo: "LAB-2026-0003", grandTotal: 885, subtotal: 750, totalGst: 135, paymentMode: "upi", paymentStatus: "paid" },
    createdAt: TODAY, sampleCollectedAt: TODAY,
  },
  {
    id: "r4", reqNo: "LAB-2026-0004",
    patient: MOCK_PATIENTS[3], referringDoctor: "Dr. Kumar (Nephrology)",
    status: "requested",
    tests: [
      { id: "t7", testName: "Serum Creatinine", resultValue: null, unit: "mg/dL", normalRange: "0.7–1.3", isAbnormal: false, price: 200 },
      { id: "t8", testName: "eGFR",             resultValue: null, unit: "mL/min", normalRange: "> 60",   isAbnormal: false, price: 200 },
      { id: "t9", testName: "Urine Routine",    resultValue: null, unit: "",       normalRange: "—",       isAbnormal: false, price: 150 },
    ],
    bill: null,
    createdAt: TODAY, sampleCollectedAt: null,
  },
];

const STATUS_ORDER = ["requested", "collected", "processing", "ready", "delivered"];

function reducer(state, { type, payload }) {
  switch (type) {
    case "ADD_PATIENT":
      return { ...state, patients: [payload, ...state.patients] };
    case "ADD_REQUEST":
      return { ...state, requests: [payload, ...state.requests] };
    case "UPDATE_REQUEST":
      return {
        ...state,
        requests: state.requests.map((r) => r.id === payload.id ? { ...r, ...payload } : r),
      };
    case "UPDATE_TEST":
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === payload.requestId
            ? { ...r, tests: r.tests.map((t) => t.id === payload.testId ? { ...t, ...payload.updates } : t) }
            : r
        ),
      };
    default: return state;
  }
}

const LabContext = createContext(null);

export function LabProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    patients: storage.get("lab_patients", MOCK_PATIENTS),
    requests: storage.get("lab_requests", MOCK_REQUESTS),
  }));

  const persist = useCallback((key, value) => storage.set(key, value), []);

  const addPatient = useCallback((data) => {
    const patient = { id: genId(), uhid: genUHID("LAB"), ...data, createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_PATIENT", payload: patient });
    persist("lab_patients", [patient, ...state.patients]);
    return patient;
  }, [state.patients, persist]);

  const createRequest = useCallback((data, counter) => {
    const req = {
      id: genId(), reqNo: genBillNo("LAB", counter),
      patient: data.patient, referringDoctor: data.referringDoctor ?? "",
      tests: (data.tests ?? []).map((t) => ({ id: genId(), ...t, resultValue: null, isAbnormal: false })),
      status: "requested",
      bill: data.bill ?? null,
      createdAt: new Date().toISOString(), sampleCollectedAt: null,
    };
    dispatch({ type: "ADD_REQUEST", payload: req });
    persist("lab_requests", [req, ...state.requests]);
    return req;
  }, [state.requests, persist]);

  const advanceStatus = useCallback((id) => {
    const req = state.requests.find((r) => r.id === id);
    if (!req) return;
    const idx = STATUS_ORDER.indexOf(req.status);
    if (idx >= STATUS_ORDER.length - 1) return;
    const next = STATUS_ORDER[idx + 1];
    const updates = {
      id, status: next,
      ...(next === "collected" ? { sampleCollectedAt: new Date().toISOString() } : {}),
    };
    dispatch({ type: "UPDATE_REQUEST", payload: updates });
    const updated = state.requests.map((r) => r.id === id ? { ...r, ...updates } : r);
    persist("lab_requests", updated);
  }, [state.requests, persist]);

  const updateTestResult = useCallback((requestId, testId, updates) => {
    dispatch({ type: "UPDATE_TEST", payload: { requestId, testId, updates } });
    const updated = state.requests.map((r) =>
      r.id === requestId
        ? { ...r, tests: r.tests.map((t) => t.id === testId ? { ...t, ...updates } : t) }
        : r
    );
    persist("lab_requests", updated);
  }, [state.requests, persist]);

  const pendingCount   = state.requests.filter((r) => r.status !== "delivered").length;
  const readyCount     = state.requests.filter((r) => r.status === "ready").length;

  return (
    <LabContext.Provider value={{ ...state, addPatient, createRequest, advanceStatus, updateTestResult, pendingCount, readyCount }}>
      {children}
    </LabContext.Provider>
  );
}

export const useLab = () => {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be inside LabProvider");
  return ctx;
};
