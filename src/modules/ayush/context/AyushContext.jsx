import { createContext, useContext, useReducer, useCallback } from "react";
import { storage } from "../../../shared/utils/storage.js";
import { genId, genBillNo, genUHID } from "../../../shared/utils/id.js";
import { calcBillTotals } from "../../../shared/utils/gst.js";

const TODAY = new Date().toISOString();

const MOCK_PATIENTS = [
  { id: "ap1", uhid: "SID-4421-8812", nameEn: "Anitha Priya",  nameTa: "அனிதா பிரியா",  phone: "9876541234", gender: "F", dob: "1981-07-14", chronicConditions: ["Arthritis"], abhaNumber: null },
  { id: "ap2", uhid: "SID-3301-2291", nameEn: "Murugan Raj",   nameTa: "முருகன் ராஜ்",  phone: "8765432109", gender: "M", dob: "1970-03-22", chronicConditions: ["Diabetes"],   abhaNumber: null },
  { id: "ap3", uhid: "SID-1190-9901", nameEn: "Kavitha Devi",  nameTa: "கவிதா தேவி",   phone: "7654323456", gender: "F", dob: "1995-11-08", chronicConditions: [],             abhaNumber: null },
];

const MOCK_VISITS = [
  {
    id: "av1", visitNo: "SID-2026-0001",
    patient: MOCK_PATIENTS[0], practitioner: "Dr. Rajan (BSMS)",
    prakruthi: "வாத-பித்தம்",
    diagnosisTa: "மூட்டுவலி — வாத நோய்",
    diagnosisEn: "Arthritis — Vata disorder",
    treatmentPlan: "Nilavembu kashayam + Thylam application + diet modification",
    kashayamRx: [
      { id: "k1", name: "நிலவேம்பு கஷாயம்", dosage: "50ml × 2 daily", duration: "7 days" },
      { id: "k2", name: "அரிமேதஸ் லேகியம்", dosage: "5g × 2 daily", duration: "14 days" },
    ],
    procedures: [{ id: "pr1", name: "தைலம் தேய்ப்பு", price: 250 }],
    bill: { billNo: "SID-2026-0001", grandTotal: 970, subtotal: 970, totalGst: 0, paymentMode: "upi", paymentStatus: "paid" },
    nextVisit: "2026-03-25", createdAt: TODAY,
  },
  {
    id: "av2", visitNo: "SID-2026-0002",
    patient: MOCK_PATIENTS[1], practitioner: "Dr. Rajan (BSMS)",
    prakruthi: "கப-பித்தம்",
    diagnosisTa: "நீரிழிவு — கப நோய்",
    diagnosisEn: "Diabetes — Kapha disorder",
    treatmentPlan: "Bitter gourd juice + Vijayasar tablet + exercise regimen",
    kashayamRx: [
      { id: "k3", name: "விஜயசார் கஷாயம்", dosage: "30ml × 3 daily before meals", duration: "30 days" },
    ],
    procedures: [],
    bill: { billNo: "SID-2026-0002", grandTotal: 720, subtotal: 720, totalGst: 0, paymentMode: "cash", paymentStatus: "paid" },
    nextVisit: "2026-04-18", createdAt: TODAY,
  },
];

const MOCK_INVENTORY = [
  { id: "hi1", name: "நிலவேம்பு கஷாயம்", nameEn: "Nilavembu Kashayam",  unit: "litres",  stock: 15, reorderPoint: 5,  costPrice: 80,  sellingPrice: 120 },
  { id: "hi2", name: "விஜயசார் கஷாயம்",  nameEn: "Vijayasar Kashayam", unit: "litres",  stock: 8,  reorderPoint: 5,  costPrice: 100, sellingPrice: 150 },
  { id: "hi3", name: "அரிமேதஸ் லேகியம்", nameEn: "Arimedhasa Lehyam",   unit: "kg",      stock: 4,  reorderPoint: 2,  costPrice: 280, sellingPrice: 400 },
  { id: "hi4", name: "பஞ்சகர்மா தைலம்",  nameEn: "Panchakarma Thylam",  unit: "litres",  stock: 2,  reorderPoint: 2,  costPrice: 500, sellingPrice: 700 },
];

function reducer(state, { type, payload }) {
  switch (type) {
    case "ADD_PATIENT":  return { ...state, patients: [payload, ...state.patients] };
    case "ADD_VISIT":    return { ...state, visits: [payload, ...state.visits] };
    case "UPDATE_VISIT": return { ...state, visits: state.visits.map((v) => v.id === payload.id ? { ...v, ...payload } : v) };
    case "ADD_HERBAL":    return { ...state, herbalInventory: [payload, ...state.herbalInventory] };
    default: return state;
  }
}

const AyushContext = createContext(null);

export function AyushProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    patients:        storage.get("ayush_patients", MOCK_PATIENTS),
    visits:          storage.get("ayush_visits",   MOCK_VISITS),
    herbalInventory: storage.get("ayush_herbal",   MOCK_INVENTORY),
  }));

  const persist = useCallback((key, val) => storage.set(key, val), []);

  const addPatient = useCallback((data) => {
    const patient = { id: genId(), uhid: genUHID("SID"), ...data, createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_PATIENT", payload: patient });
    persist("ayush_patients", [patient, ...state.patients]);
    return patient;
  }, [state.patients, persist]);

  const createVisit = useCallback((data, counter) => {
    const bill = data.items?.length > 0 ? {
      billNo: genBillNo("SID", counter),
      ...calcBillTotals(data.items.map((i) => ({ ...i, gstSlab: 0 }))),
      paymentMode: data.paymentMode, paymentStatus: "paid",
    } : null;

    const visit = {
      id: genId(), visitNo: genBillNo("SID", counter),
      patient: data.patient, practitioner: data.practitioner,
      prakruthi: data.prakruthi ?? "",
      diagnosisTa: data.diagnosisTa ?? "", diagnosisEn: data.diagnosisEn ?? "",
      treatmentPlan: data.treatmentPlan ?? "",
      kashayamRx: data.kashayamRx ?? [],
      procedures: data.procedures ?? [],
      bill, nextVisit: data.nextVisit ?? null,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_VISIT", payload: visit });
    persist("ayush_visits", [visit, ...state.visits]);
    return visit;
  }, [state.visits, persist]);

  const addHerbal = useCallback((data) => {
    const item = { id: genId(), ...data };
    dispatch({ type: "ADD_HERBAL", payload: item });
    persist("ayush_herbal", [item, ...state.herbalInventory]);
  }, [state.herbalInventory, persist]);

  const todayRevenue = state.visits.filter((v) => v.bill?.paymentStatus === "paid")
    .reduce((s, v) => s + (v.bill?.grandTotal ?? 0), 0);

  return (
    <AyushContext.Provider value={{ ...state, addPatient, createVisit, addHerbal, todayRevenue }}>
      {children}
    </AyushContext.Provider>
  );
}

export const useAyush = () => {
  const ctx = useContext(AyushContext);
  if (!ctx) throw new Error("useAyush must be inside AyushProvider");
  return ctx;
};
