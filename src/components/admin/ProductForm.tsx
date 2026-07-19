"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, ArrowLeft, Loader2 } from "lucide-react";
import type { Product, ProductColor } from "@/lib/products";
import { SIZES } from "@/lib/products";
import { TeeMockup } from "@/components/TeeMockup";

type FormProduct = Omit<Product, "id" | "spinFrames" | "gallery">;

const BLANK: FormProduct = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: 999,
  compareAt: undefined,
  colors: [{ name: "Ink", hex: "#1A1A1A", slug: "ink" }],
  sizes: [...SIZES],
  fabric: "100% cotton",
  fit: "Regular",
  features: [""],
  badges: [],
  category: "essentials",
  viewer: "auto",
};

type Props = {
  initial?: Partial<FormProduct>;
  onSave: (data: FormProduct) => void;
  saving?: boolean;
  title: string;
};

export function ProductForm({ initial = BLANK, onSave, saving = false, title }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormProduct>({ ...BLANK, ...initial });
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ffffff");
  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback(<K extends keyof FormProduct>(key: K, val: FormProduct[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (form.price <= 0) e.price = "Price must be > 0";
    if (form.colors.length === 0) e.colors = "Add at least one color";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    const color: ProductColor = {
      name: newColorName.trim(),
      hex: newColorHex,
      slug: newColorName.toLowerCase().replace(/\s+/g, "-"),
    };
    set("colors", [...form.colors, color]);
    setNewColorName("");
    setNewColorHex("#ffffff");
  };

  const removeColor = (slug: string) => {
    set("colors", form.colors.filter((c) => c.slug !== slug));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    set("features", [...form.features, newFeature.trim()]);
    setNewFeature("");
  };

  const previewColor = form.colors[0] ?? { hex: "#1A1A1A", name: "Ink", slug: "ink" };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-[#e2e2df] bg-white hover:bg-[#f0f0ee] text-[#0f0f14] transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-[#0f0f14] font-bold text-xl">{title}</h2>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0f0f14] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2a2a2a] transition disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save product
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Product name" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!initial?.slug) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                  }}
                  className={inputCls(errors.name)}
                  placeholder="e.g. Studio Tee"
                />
              </Field>
              <Field label="Slug (URL)" error={errors.slug}>
                <input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  className={inputCls(errors.slug)}
                  placeholder="e.g. studio-tee"
                />
              </Field>
            </div>
            <Field label="Tagline">
              <input
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className={inputCls()}
                placeholder="Short one-liner"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                className={inputCls() + " resize-none"}
                placeholder="Full product description"
              />
            </Field>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Price (₹)" error={errors.price}>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className={inputCls(errors.price)}
                  min={0}
                />
              </Field>
              <Field label="Compare-at price (₹) — optional">
                <input
                  type="number"
                  value={form.compareAt ?? ""}
                  onChange={(e) => set("compareAt", e.target.value ? Number(e.target.value) : undefined)}
                  className={inputCls()}
                  min={0}
                  placeholder="Original price (for strikethrough)"
                />
              </Field>
            </div>
          </Section>

          {/* Category & Fit */}
          <Section title="Category & Fit">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as Product["category"])}
                  className={inputCls()}
                >
                  <option value="essentials">Essentials</option>
                  <option value="graphics">Graphics</option>
                  <option value="premium">Premium</option>
                </select>
              </Field>
              <Field label="Fabric">
                <input
                  value={form.fabric}
                  onChange={(e) => set("fabric", e.target.value)}
                  className={inputCls()}
                  placeholder="100% cotton, 200 GSM"
                />
              </Field>
              <Field label="Fit">
                <input
                  value={form.fit}
                  onChange={(e) => set("fit", e.target.value)}
                  className={inputCls()}
                  placeholder="Regular"
                />
              </Field>
            </div>
          </Section>

          {/* Sizes */}
          <Section title="Sizes">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => {
                const active = form.sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() =>
                      set("sizes", active ? form.sizes.filter((s) => s !== sz) : [...form.sizes, sz])
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                      active
                        ? "bg-[#0f0f14] text-white border-[#0f0f14]"
                        : "bg-white text-[#6b6b6b] border-[#e2e2df] hover:border-[#0f0f14]"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors" error={errors.colors}>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.colors.map((c) => (
                <div
                  key={c.slug}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e2e2df] bg-white text-sm"
                >
                  <div className="w-4 h-4 rounded-full border border-black/10" style={{ background: c.hex }} />
                  <span className="text-[#0f0f14] font-medium">{c.name}</span>
                  <button onClick={() => removeColor(c.slug)} className="text-[#c0c0bb] hover:text-red-500 transition">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[#e2e2df] cursor-pointer p-0.5"
              />
              <input
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addColor()}
                placeholder="Color name (e.g. Forest)"
                className={inputCls() + " flex-1"}
              />
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-2 rounded-xl border border-[#e2e2df] bg-white text-[#0f0f14] hover:bg-[#f0f0ee] transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </Section>

          {/* Features */}
          <Section title="Features">
            <div className="space-y-2 mb-3">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={f}
                    onChange={(e) => {
                      const arr = [...form.features];
                      arr[i] = e.target.value;
                      set("features", arr);
                    }}
                    className={inputCls() + " flex-1"}
                    placeholder="Feature description"
                  />
                  <button
                    onClick={() => set("features", form.features.filter((_, j) => j !== i))}
                    className="text-[#c0c0bb] hover:text-red-500 p-2 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFeature()}
                placeholder="Add a feature"
                className={inputCls() + " flex-1"}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-2 rounded-xl border border-[#e2e2df] bg-white text-[#0f0f14] hover:bg-[#f0f0ee] transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </Section>

          {/* Flags */}
          <Section title="Flags & Visibility">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("comingSoon", !form.comingSoon)}
                className={`w-11 h-6 rounded-full transition-colors ${form.comingSoon ? "bg-[#0f6e56]" : "bg-[#e2e2df]"} relative`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.comingSoon ? "translate-x-6" : "translate-x-1"}`}
                />
              </div>
              <span className="text-sm text-[#0f0f14]">Mark as "Coming Soon"</span>
            </label>
          </Section>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5 sticky top-6">
            <p className="text-[#0f0f14] font-semibold text-sm mb-4">Live Preview</p>
            <div className="bg-[#f5f5f4] rounded-xl p-6 flex items-center justify-center min-h-48">
              <TeeMockup
                color={previewColor.hex}
                logoLabel="brand"
                placement="chest-center"
                angle={0}
                className="w-40 h-auto"
              />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[#0f0f14] font-bold text-lg">{form.name || "Product Name"}</p>
              <p className="text-[#6b6b6b] text-sm">{form.tagline || "Tagline"}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[#0f0f14] font-bold text-xl">₹{form.price.toLocaleString("en-IN")}</span>
                {form.compareAt && (
                  <span className="text-[#9b9b9b] text-sm line-through">₹{form.compareAt.toLocaleString("en-IN")}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.colors.map((c) => (
                  <div
                    key={c.slug}
                    title={c.name}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper sub-components
function Section({ title, children, error }: { title: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
      <h3 className="text-[#0f0f14] font-semibold text-sm mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#6b6b6b] uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full px-3 py-2.5 rounded-xl border text-sm text-[#0f0f14] bg-white outline-none transition focus:ring-2 focus:ring-[#0f6e56]/20 focus:border-[#0f6e56] ${
    error ? "border-red-400 bg-red-50" : "border-[#e2e2df] hover:border-[#c0c0bb]"
  }`;
}
