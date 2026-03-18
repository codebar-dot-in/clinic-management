import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useAyush } from "../context/AyushContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";

const DEFAULT = { name: "", nameEn: "", unit: "kg", stock: 0, reorderPoint: 5, costPrice: 0, sellingPrice: 0 };

const UNITS = ["kg", "litres", "grams", "ml", "packets", "nos"];

export function HerbalInventoryPage() {
  const { t, lang } = useI18n();
  const { success }  = useToast();
  const { herbalInventory, addHerbal } = useAyush();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(DEFAULT);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const lowCount = herbalInventory.filter((i) => i.stock <= i.reorderPoint).length;

  const filtered = herbalInventory.filter((item) => {
    const q = search.toLowerCase();
    const match = item.name.toLowerCase().includes(q) || item.nameEn.toLowerCase().includes(q);
    if (!match) return false;
    if (filter === "low") return item.stock <= item.reorderPoint;
    return true;
  });

  const handleSave = (e) => {
    e.preventDefault();
    addHerbal({
      ...form,
      stock: Number(form.stock),
      reorderPoint: Number(form.reorderPoint),
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
    });
    success("மூலிகை சரக்கு சேர்க்கப்பட்டது");
    setForm(DEFAULT);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">
            {lang === "en" ? "Herbal Inventory" : "மூலிகை சரக்கு"}
          </h1>
          {lowCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-0.5">
              <AlertTriangle size={12} /> {lowCount} {lang === "en" ? "items below reorder point" : "பொருட்கள் குறைவான இருப்பு"}
            </div>
          )}
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>
          {lang === "en" ? "Add Herbal Item" : "மூலிகை சேர்க்க"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "en" ? "Search herbs…" : "மூலிகை தேடு…"}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary] w-48"
        />
        {[["all", lang === "en" ? "All" : "அனைத்தும்"], ["low", lang === "en" ? "Low Stock" : "குறைவான இருப்பு"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === val ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            style={filter === val ? { background: "var(--seg-primary)" } : {}}
          >
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
                {[
                  lang === "en" ? "Herb Name (Tamil)" : "மூலிகை பெயர்",
                  lang === "en" ? "English Name" : "ஆங்கில பெயர்",
                  lang === "en" ? "Unit" : "அலகு",
                  lang === "en" ? "Stock" : "இருப்பு",
                  lang === "en" ? "Reorder At" : "மறு-ஆர்டர்",
                  lang === "en" ? "Cost Price" : "கொள்முதல் விலை",
                  lang === "en" ? "Selling Price" : "விற்பனை விலை",
                  lang === "en" ? "Status" : "நிலை",
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => {
                const low = item.stock <= item.reorderPoint;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-tamil font-semibold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.nameEn}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${low ? "text-red-600" : "text-slate-800"}`}>{item.stock}</span>
                      {low && <span className="ml-1 text-xs text-red-400">↓ {item.reorderPoint}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.reorderPoint}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatINR(item.costPrice)}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--seg-primary)" }}>{formatINR(item.sellingPrice)}</td>
                    <td className="px-4 py-3">
                      <Badge label={low ? (lang === "en" ? "Low Stock" : "குறைவு") : "OK"} color={low ? "warning" : "success"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon="🌿" title={t.noData} />}
        </div>
      </div>

      {/* Add Herbal Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={lang === "en" ? "Add Herbal Item" : "மூலிகை சேர்க்க"} size="md">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormSection title={lang === "en" ? "Herb Details" : "மூலிகை விவரங்கள்"}>
            <FormRow>
              <Input
                label={lang === "en" ? "Tamil Name *" : "தமிழ் பெயர் *"}
                value={form.name}
                onChange={set("name")}
                required
                className="font-tamil"
                placeholder="நிலவேம்பு கஷாயம்"
              />
              <Input
                label={lang === "en" ? "English Name" : "ஆங்கில பெயர்"}
                value={form.nameEn}
                onChange={set("nameEn")}
                placeholder="Nilavembu Kashayam"
              />
            </FormRow>
            <Select label={lang === "en" ? "Unit" : "அலகு"} value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
          </FormSection>

          <FormSection title={lang === "en" ? "Stock & Pricing" : "இருப்பு & விலை"}>
            <FormRow>
              <Input label={lang === "en" ? "Current Stock" : "தற்போதைய இருப்பு"} type="number" value={form.stock} onChange={set("stock")} min="0" />
              <Input label={lang === "en" ? "Reorder Point" : "மறு-ஆர்டர் எல்லை"} type="number" value={form.reorderPoint} onChange={set("reorderPoint")} min="0" />
            </FormRow>
            <FormRow>
              <Input label={lang === "en" ? "Cost Price (₹)" : "கொள்முதல் விலை (₹)"} type="number" value={form.costPrice} onChange={set("costPrice")} min="0" step="0.01" />
              <Input label={lang === "en" ? "Selling Price (₹)" : "விற்பனை விலை (₹)"} type="number" value={form.sellingPrice} onChange={set("sellingPrice")} min="0" step="0.01" />
            </FormRow>
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t.cancel}</Button>
            <Button type="submit">{lang === "en" ? "Add Item" : "சேர்க்க"}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
