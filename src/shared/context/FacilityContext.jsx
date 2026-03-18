/**
 * FacilityContext — current facility config.
 * In Phase 1 this is set from the segment selector + a quick setup form.
 * Phase 2: pulled from Supabase after auth.
 */
import { createContext, useContext, useState } from "react";
import { storage } from "../utils/storage.js";

/** Default demo facility per segment */
const DEMO_FACILITIES = {
  clinic: {
    id: "fac-clinic-001",
    segment: "clinic",
    name: "Dr. Anand's Multi-Specialty Clinic",
    nameTa: "டாக்டர் ஆனந்த் பல்சிறப்பு கிளினிக்",
    address: "Anna Nagar, Chennai — 600040",
    phone: "044-2623-4567",
    gstin: "33AABCA1234A1Z5",
    regNo: "TN-MED-2019-8821",
    doctors: ["Dr. Anand (MBBS, MD)", "Dr. Priya (MBBS, DGO)", "Dr. Kumar (MBBS)"],
    billCounter: 1,
  },
  lab: {
    id: "fac-lab-001",
    segment: "lab",
    name: "SciLife Diagnostics",
    nameTa: "சயின்ஸ் லைஃப் கண்டறிதல் மையம்",
    address: "T. Nagar, Chennai — 600017",
    phone: "044-4567-8901",
    gstin: "33AACLA5678B2Z6",
    nabl: true,
    billCounter: 1,
  },
  pharmacy: {
    id: "fac-pharmacy-001",
    segment: "pharmacy",
    name: "Sri Murugan Medical",
    nameTa: "ஸ்ரீ முருகன் மெடிக்கல்",
    address: "Tambaram, Chennai — 600045",
    phone: "044-2278-9012",
    gstin: "33AABPA9012C3Z7",
    drugLicence: "TN-PHARM-11-2842",
    billCounter: 1,
  },
  ayush: {
    id: "fac-ayush-001",
    segment: "ayush",
    name: "Vaidhya Siddha Nilayam",
    nameTa: "வைத்திய சித்த நிலையம்",
    address: "Mylapore, Chennai — 600004",
    phone: "044-2498-3456",
    ayushReg: "TN-SID-2018-442",
    practitioners: ["Dr. Rajan (BSMS)", "Dr. Kavitha (BSMS, MD)"],
    billCounter: 1,
  },
};

const FacilityContext = createContext(null);

export function FacilityProvider({ children }) {
  const [facility, setFacility] = useState(
    () => storage.get("facility", null)
  );

  const loadDemoFacility = (segmentId) => {
    const demo = DEMO_FACILITIES[segmentId] ?? DEMO_FACILITIES.clinic;
    storage.set("facility", demo);
    setFacility(demo);
    return demo;
  };

  const updateFacility = (updates) => {
    const updated = { ...facility, ...updates };
    storage.set("facility", updated);
    setFacility(updated);
  };

  const incrementBillCounter = () => {
    const next = (facility?.billCounter ?? 0) + 1;
    updateFacility({ billCounter: next });
    return next;
  };

  return (
    <FacilityContext.Provider value={{ facility, setFacility, loadDemoFacility, updateFacility, incrementBillCounter }}>
      {children}
    </FacilityContext.Provider>
  );
}

export const useFacility = () => {
  const ctx = useContext(FacilityContext);
  if (!ctx) throw new Error("useFacility must be used inside FacilityProvider");
  return ctx;
};
