import { useState } from "react";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";

const DEFAULT = {
  nameEn: "", nameTa: "", phone: "", gender: "M",
  dob: "", abhaNumber: "", drugAllergies: "", chronicConditions: "",
};

export function AddPatientModal({ open, onClose, onCreated }) {
  const { t } = useI18n();
  const { success, error } = useToast();
  const { addPatient } = useClinic();
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nameEn.trim() || !form.phone.trim()) {
      error("Patient name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      const patient = addPatient({
        ...form,
        drugAllergies:    form.drugAllergies.split(",").map((s) => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean),
      });
      success(t.patientAdded);
      onCreated?.(patient);
      setForm(DEFAULT);
      onClose();
    } catch (err) {
      error(t.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t.addPatient} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormSection title="Patient Information">
          <FormRow>
            <Input label={t.patientName + " *"} value={form.nameEn} onChange={set("nameEn")} placeholder="e.g. Arjun Kumar" required />
            <Input label={t.patientNameTa} value={form.nameTa} onChange={set("nameTa")} placeholder="e.g. அர்ஜுன் குமார்" className="font-tamil" />
          </FormRow>
          <FormRow>
            <Input label={t.phone + " *"} value={form.phone} onChange={set("phone")} placeholder="9876543210" type="tel" required />
            <Select label={t.gender} value={form.gender} onChange={set("gender")}>
              <option value="M">{t.male}</option>
              <option value="F">{t.female}</option>
              <option value="O">{t.other}</option>
            </Select>
          </FormRow>
          <FormRow>
            <Input label={t.dob} value={form.dob} onChange={set("dob")} type="date" />
            <Input label={t.abhaNumber} value={form.abhaNumber} onChange={set("abhaNumber")} placeholder="14-digit ABHA" />
          </FormRow>
        </FormSection>

        <FormSection title="Medical History">
          <Input
            label={t.drugAllergies + " (comma separated)"}
            value={form.drugAllergies}
            onChange={set("drugAllergies")}
            placeholder="e.g. Penicillin, Aspirin"
          />
          <Input
            label={t.chronicConditions + " (comma separated)"}
            value={form.chronicConditions}
            onChange={set("chronicConditions")}
            placeholder="e.g. Diabetes, Hypertension"
          />
        </FormSection>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.cancel}</Button>
          <Button type="submit" loading={saving}>{t.addPatient}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
