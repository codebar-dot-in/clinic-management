import { useState } from "react";
import { Plus, AlertTriangle, Package } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { usePharmacy } from "../context/PharmacyContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { isNearExpiry, isExpired } from "../../../shared/utils/date.js";
import { GST_SLABS } from "../../../shared/utils/gst.js";

const DEFAULT = {
  drugName: "", generic: "", manufacturer: "", batchNo: "", expiry: "",
  scheduleType: "OTC", gstSlab: 5, stock: 0, reorderPoint: 20, costPrice: 0, sellingPrice: 0,
};

export function InventoryPage() {
  const { t } = useI18n();
  const { success } = useToast();
  const { inventory, addInventory, updateInventory, lowStockCount } = usePharmacy();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(DEFAULT);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    const matchQ = item.drugName.toLowerCase().includes(q) || item.generic.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (filter === "low")     return item.stock <= item.reorderPoint;
    if (filter === "expiring") return isNearExpiry(item.expiry, 90);
    if (filter === "expired")  return isExpired(item.expiry);
    return true;
  });

  const handleSave = (e) => {
    e.preventDefault();
    addInventory({ ...form, stock: Number(form.stock), reorderPoint: Number(form.reorderPoint), costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), gstSlab: Number(form.gstSlab) });
    success(t.inventoryUpdated);
    setForm(DEFAULT);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">{t.inventory}</h1>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-0.5">
              <AlertTriangle size={12} /> {lowStockCount} items below reorder point
            </div>
          )}
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>{t.addToInventory}</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drugs…"
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary] w-48" />
        {[["all", "All"], ["low", "Low Stock"], ["expiring", "Expiring (90d)"], ["expired", "Expired"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === val ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            style={filter === val ? { background: "var(--seg-primary)" } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                {["Drug Name", "Generic", "Batch", "Expiry", "Schedule", "GST", "Stock", "Price", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => {
                const expired   = isExpired(item.expiry);
                const nearExp   = isNearExpiry(item.expiry, 90);
                const lowStock  = item.stock <= item.reorderPoint;
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 transition ${expired ? "bg-red-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{item.drugName}</div>
                      <div className="text-xs text-slate-400">{item.manufacturer}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.generic}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.batchNo}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={expired ? "text-red-600 font-bold" : nearExp ? "text-amber-600 font-semibold" : "text-slate-500"}>
                        {item.expiry}
                        {expired && " ⚠"}
                        {!expired && nearExp && " ⚡"}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge label={item.scheduleType} color={item.scheduleType} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.gstSlab}%</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${lowStock ? "text-red-600" : "text-slate-800"}`}>{item.stock}</span>
                      {lowStock && <span className="ml-1 text-xs text-red-400">↓ {item.reorderPoint}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-slate-500">Cost: {formatINR(item.costPrice)}</div>
                      <div className="font-semibold" style={{ color: "var(--seg-primary)" }}>MRP: {formatINR(item.sellingPrice)}</div>
                    </td>
                    <td className="px-4 py-3">
                      {expired   && <Badge label="Expired" color="error" />}
                      {!expired && nearExp  && <Badge label="Expiring" color="warning" />}
                      {!expired && !nearExp && lowStock && <Badge label="Low Stock" color="warning" />}
                      {!expired && !nearExp && !lowStock && <Badge label="OK" color="success" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon="📦" title={t.noData} />}
        </div>
      </div>

      {/* Add inventory modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={t.addToInventory} size="md">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormSection title="Drug Details">
            <FormRow>
              <Input label={t.drugName + " *"} value={form.drugName} onChange={set("drugName")} required />
              <Input label={t.generic} value={form.generic} onChange={set("generic")} />
            </FormRow>
            <FormRow>
              <Input label={t.manufacturer} value={form.manufacturer} onChange={set("manufacturer")} />
              <Select label={t.scheduleType} value={form.scheduleType} onChange={set("scheduleType")}>
                <option value="OTC">{t.otc}</option>
                <option value="H">{t.schedH}</option>
                <option value="H1">{t.schedH1}</option>
              </Select>
            </FormRow>
            <FormRow>
              <Input label={t.batchNo} value={form.batchNo} onChange={set("batchNo")} />
              <Input label={t.expiry} type="date" value={form.expiry} onChange={set("expiry")} />
            </FormRow>
            <Select label={`${t.gstSlab} (GST %)`} value={form.gstSlab} onChange={set("gstSlab")}>
              {GST_SLABS.map((s) => <option key={s} value={s}>{s}%</option>)}
            </Select>
          </FormSection>

          <FormSection title="Stock & Pricing">
            <FormRow>
              <Input label={t.stock + " (units)"} type="number" value={form.stock} onChange={set("stock")} min="0" />
              <Input label={t.reorderPoint} type="number" value={form.reorderPoint} onChange={set("reorderPoint")} min="0" />
            </FormRow>
            <FormRow>
              <Input label={t.costPrice} type="number" value={form.costPrice} onChange={set("costPrice")} min="0" step="0.01" />
              <Input label={t.sellingPrice} type="number" value={form.sellingPrice} onChange={set("sellingPrice")} min="0" step="0.01" />
            </FormRow>
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t.cancel}</Button>
            <Button type="submit">{t.addToInventory}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
