import { createContext, useContext, useReducer, useCallback } from "react";
import { storage } from "../../../shared/utils/storage.js";
import { genId, genBillNo, genUHID } from "../../../shared/utils/id.js";
import { calcBillTotals } from "../../../shared/utils/gst.js";

const TODAY = new Date().toISOString();

const MOCK_INVENTORY = [
  { id: "inv1", drugName: "Metformin 500mg", generic: "Metformin HCl", manufacturer: "Sun Pharma", batchNo: "MF2409", expiry: "2027-09-30", scheduleType: "H",  gstSlab: 5,  stock: 450, reorderPoint: 100, costPrice: 2.20, sellingPrice: 2.80 },
  { id: "inv2", drugName: "Amlodipine 5mg",  generic: "Amlodipine",    manufacturer: "Cipla",     batchNo: "AM2312", expiry: "2027-12-31", scheduleType: "H",  gstSlab: 12, stock: 200, reorderPoint: 50,  costPrice: 2.80, sellingPrice: 3.20 },
  { id: "inv3", drugName: "Vitamin D3 60K IU", generic: "Cholecalciferol", manufacturer: "Abbott",  batchNo: "VD2406", expiry: "2027-06-30", scheduleType: "H",  gstSlab: 12, stock: 80,  reorderPoint: 30,  costPrice: 11.00, sellingPrice: 14.00 },
  { id: "inv4", drugName: "Paracetamol 500mg", generic: "Acetaminophen", manufacturer: "GSK",      batchNo: "PC2503", expiry: "2027-03-31", scheduleType: "OTC", gstSlab: 0,  stock: 1000, reorderPoint: 200, costPrice: 0.50, sellingPrice: 0.80 },
  { id: "inv5", drugName: "Azithromycin 500mg", generic: "Azithromycin", manufacturer: "Mankind",  batchNo: "AZ2408", expiry: "2026-08-31", scheduleType: "H1", gstSlab: 12, stock: 30,  reorderPoint: 20,  costPrice: 18.00, sellingPrice: 24.00 },
  { id: "inv6", drugName: "Omeprazole 20mg",  generic: "Omeprazole",    manufacturer: "Torrent",   batchNo: "OM2501", expiry: "2026-01-31", scheduleType: "H",  gstSlab: 5,  stock: 15,  reorderPoint: 50,  costPrice: 3.50, sellingPrice: 5.00 },
];

const MOCK_BILLS = [
  {
    id: "pb1", billNo: "PH-2026-0001",
    patient: { id: "phpt1", nameEn: "Kumar Raj", nameTa: "குமார் ராஜ்", phone: "9876540001", uhid: "PH-0001" },
    items: [
      { id: "pi1", name: "Metformin 500mg ×30", qty: 30, unitPrice: 2.80, gstSlab: 5, lineTotal: 88.2, batchNo: "MF2409", expiry: "2027-09-30", scheduleType: "H", rxDoctorReg: "TN-MED-12345" },
      { id: "pi2", name: "Amlodipine 5mg ×15",  qty: 15, unitPrice: 3.20, gstSlab: 12, lineTotal: 53.76, batchNo: "AM2312", expiry: "2027-12-31", scheduleType: "H", rxDoctorReg: "TN-MED-12345" },
    ],
    subtotal: 96, totalGst: 8.4, grandTotal: 104.4, rxDoctorReg: "TN-MED-12345",
    paymentMode: "cash", paymentStatus: "paid", createdAt: TODAY,
  },
];

function reducer(state, { type, payload }) {
  switch (type) {
    case "ADD_BILL":
      return { ...state, bills: [payload, ...state.bills] };
    case "UPDATE_BILL":
      return { ...state, bills: state.bills.map((b) => b.id === payload.id ? { ...b, ...payload } : b) };
    case "ADD_INVENTORY":
      return { ...state, inventory: [payload, ...state.inventory] };
    case "UPDATE_INVENTORY":
      return { ...state, inventory: state.inventory.map((i) => i.id === payload.id ? { ...i, ...payload } : i) };
    case "REDUCE_STOCK":
      return {
        ...state,
        inventory: state.inventory.map((i) =>
          i.id === payload.id ? { ...i, stock: Math.max(0, i.stock - payload.qty) } : i
        ),
      };
    default: return state;
  }
}

const PharmacyContext = createContext(null);

export function PharmacyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    inventory: storage.get("pharmacy_inventory", MOCK_INVENTORY),
    bills:     storage.get("pharmacy_bills",     MOCK_BILLS),
  }));

  const persist = useCallback((key, val) => storage.set(key, val), []);

  const createBill = useCallback((data, counter) => {
    const totals = calcBillTotals(data.items);
    const bill = {
      id: genId(), billNo: genBillNo("PH", counter),
      patient: data.patient,
      items: data.items.map((item) => ({
        ...item, id: item.id ?? genId(),
        lineTotal: Math.round(item.unitPrice * item.qty * (1 + item.gstSlab / 100) * 100) / 100,
      })),
      ...totals,
      rxDoctorReg:   data.rxDoctorReg ?? null,
      paymentMode:   data.paymentMode,
      paymentStatus: data.paymentStatus ?? "paid",
      createdAt:     new Date().toISOString(),
    };
    dispatch({ type: "ADD_BILL", payload: bill });
    persist("pharmacy_bills", [bill, ...state.bills]);
    // Reduce stock for each dispensed drug
    data.items.forEach((item) => {
      if (item.inventoryId) {
        dispatch({ type: "REDUCE_STOCK", payload: { id: item.inventoryId, qty: item.qty } });
      }
    });
    return bill;
  }, [state.bills, persist]);

  const addInventory = useCallback((data) => {
    const item = { id: genId(), ...data };
    dispatch({ type: "ADD_INVENTORY", payload: item });
    persist("pharmacy_inventory", [item, ...state.inventory]);
    return item;
  }, [state.inventory, persist]);

  const updateInventory = useCallback((id, updates) => {
    dispatch({ type: "UPDATE_INVENTORY", payload: { id, ...updates } });
    const updated = state.inventory.map((i) => i.id === id ? { ...i, ...updates } : i);
    persist("pharmacy_inventory", updated);
  }, [state.inventory, persist]);

  const todayRevenue   = state.bills.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.grandTotal, 0);
  const lowStockCount  = state.inventory.filter((i) => i.stock <= i.reorderPoint).length;

  return (
    <PharmacyContext.Provider value={{ ...state, createBill, addInventory, updateInventory, todayRevenue, lowStockCount }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be inside PharmacyProvider");
  return ctx;
};
