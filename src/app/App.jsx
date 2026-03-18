import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider }      from "../shared/context/I18nContext.jsx";
import { ToastProvider }     from "../shared/context/ToastContext.jsx";
import { FacilityProvider }  from "../shared/context/FacilityContext.jsx";

import { SelectSegmentPage } from "../pages/SelectSegmentPage.jsx";
import { AppShell }          from "../shared/components/layout/AppShell.jsx";

// Clinic
import { ClinicLayout }       from "../modules/clinic/pages/ClinicLayout.jsx";
import { DashboardPage }      from "../modules/clinic/pages/DashboardPage.jsx";
import { PatientsPage }       from "../modules/clinic/pages/PatientsPage.jsx";
import { PatientDetailPage }  from "../modules/clinic/pages/PatientDetailPage.jsx";
import { PatientMasterPage }  from "../modules/clinic/pages/PatientMasterPage.jsx";
import { DoctorsPage }        from "../modules/clinic/pages/DoctorsPage.jsx";
import { DoctorMasterPage }   from "../modules/clinic/pages/DoctorMasterPage.jsx";
import { NewDoctorPage }      from "../modules/clinic/pages/NewDoctorPage.jsx";
import { ConsultationPage }   from "../modules/clinic/pages/ConsultationPage.jsx";
import { NewAppointmentPage } from "../modules/clinic/pages/NewAppointmentPage.jsx";
import { OPDBillingPage }     from "../modules/clinic/pages/OPDBillingPage.jsx";
import { BillingHistoryPage } from "../modules/clinic/pages/BillingHistoryPage.jsx";
import { DoctorViewPage }     from "../modules/clinic/pages/DoctorViewPage.jsx";
import { AppointmentsPage }   from "../modules/clinic/pages/AppointmentsPage.jsx";

// Lab
import { LabLayout }          from "../modules/lab/pages/LabLayout.jsx";
import { TestRequestsPage }   from "../modules/lab/pages/TestRequestsPage.jsx";
import { ReportDeliveryPage } from "../modules/lab/pages/ReportDeliveryPage.jsx";

// Pharmacy
import { PharmacyLayout }     from "../modules/pharmacy/pages/PharmacyLayout.jsx";
import { PharmacyBillingPage } from "../modules/pharmacy/pages/PharmacyBillingPage.jsx";
import { InventoryPage }      from "../modules/pharmacy/pages/InventoryPage.jsx";

// AYUSH
import { AyushLayout }        from "../modules/ayush/pages/AyushLayout.jsx";
import { TreatmentPage }      from "../modules/ayush/pages/TreatmentPage.jsx";
import { HerbalInventoryPage } from "../modules/ayush/pages/HerbalInventoryPage.jsx";

/**
 * Route tree:
 *   /                → SelectSegmentPage
 *   /clinic/*        → AppShell → ClinicLayout (ClinicProvider) → page
 *   /lab/*           → AppShell → LabLayout    (LabProvider)    → page
 *   /pharmacy/*      → AppShell → PharmacyLayout               → page
 *   /ayush/*         → AppShell → AyushLayout                  → page
 *
 * AppShell reads facility.segment (set by SelectSegmentPage via loadDemoFacility)
 * to apply the correct CSS theme tokens.
 */
export function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <FacilityProvider>
            <Routes>
              {/* Landing — segment picker */}
              <Route index element={<SelectSegmentPage />} />

              {/* Clinic */}
              <Route path="clinic" element={<AppShell />}>
                <Route element={<ClinicLayout />}>
                  <Route index                                element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard"                     element={<DashboardPage />} />
                  <Route path="patients"                      element={<PatientsPage />} />
                  <Route path="patients/new"                  element={<PatientMasterPage />} />
                  <Route path="patients/:patientId"           element={<PatientDetailPage />} />
                  <Route path="patients/:patientId/edit"      element={<PatientMasterPage />} />
                  <Route path="doctors"                       element={<DoctorsPage />} />
                  <Route path="doctors/new"                   element={<NewDoctorPage />} />
                  <Route path="doctors/:doctorId"             element={<DoctorMasterPage />} />
                  <Route path="consultation"                  element={<ConsultationPage />} />
                  <Route path="consultation/:visitId"         element={<ConsultationPage />} />
                  <Route path="appointments"                  element={<AppointmentsPage />} />
                  <Route path="appointments/new"              element={<NewAppointmentPage />} />
                  <Route path="billing"                       element={<OPDBillingPage />} />
                  <Route path="history"                       element={<BillingHistoryPage />} />
                  <Route path="doctor"                        element={<DoctorViewPage />} />
                </Route>
              </Route>

              {/* Lab */}
              <Route path="lab" element={<AppShell />}>
                <Route element={<LabLayout />}>
                  <Route index element={<Navigate to="requests" replace />} />
                  <Route path="requests" element={<TestRequestsPage />} />
                  <Route path="reports"  element={<ReportDeliveryPage />} />
                </Route>
              </Route>

              {/* Pharmacy */}
              <Route path="pharmacy" element={<AppShell />}>
                <Route element={<PharmacyLayout />}>
                  <Route index element={<Navigate to="billing" replace />} />
                  <Route path="billing"   element={<PharmacyBillingPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                </Route>
              </Route>

              {/* AYUSH */}
              <Route path="ayush" element={<AppShell />}>
                <Route element={<AyushLayout />}>
                  <Route index element={<Navigate to="treatment" replace />} />
                  <Route path="treatment" element={<TreatmentPage />} />
                  <Route path="inventory" element={<HerbalInventoryPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FacilityProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
