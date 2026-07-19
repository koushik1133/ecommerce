"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Store, Truck, Bell, Shield, Globe } from "lucide-react";
import { useAdminSettings, AdminSettings } from "@/store/admin";

type LocalSettings = AdminSettings & {
  adminPassword?: string;
  confirmPassword?: string;
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#0f6e56]/10 flex items-center justify-center text-[#0f6e56]">{icon}</div>
        <h3 className="text-[#0f0f14] font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#6b6b6b] uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[#9b9b9b] text-xs">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[#e2e2df] text-sm text-[#0f0f14] bg-white outline-none transition focus:ring-2 focus:ring-[#0f6e56]/20 focus:border-[#0f6e56] hover:border-[#c0c0bb]";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors ${checked ? "bg-[#0f6e56]" : "bg-[#e2e2df]"} relative flex-shrink-0`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </div>
      <span className="text-sm text-[#0f0f14]">{label}</span>
    </label>
  );
}

export default function SettingsPage() {
  const { settings: persistedSettings, updateSettings } = useAdminSettings();
  const [settings, setSettings] = useState<LocalSettings>({
    ...persistedSettings,
    adminPassword: "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings((s) => ({
      ...s,
      ...persistedSettings,
    }));
  }, [persistedSettings]);

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-center text-muted">
        Loading settings…
      </div>
    );
  }

  const set = <K extends keyof LocalSettings>(key: K, val: LocalSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    const { adminPassword, confirmPassword, ...rest } = settings;
    updateSettings(rest);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Save bar */}
      <div className="flex items-center justify-between">
        <p className="text-[#6b6b6b] text-sm">Configure your store preferences</p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#0f0f14] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2a2a2a] transition"
        >
          {saved ? <><CheckCircle size={16} className="text-green-400" /> Saved!</> : <><Save size={16} /> Save changes</>}
        </button>
      </div>

      {/* Store Info */}
      <Section title="Store Information" icon={<Store size={16} />}>
        <Field label="Store name">
          <input value={settings.storeName} onChange={(e) => set("storeName", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Contact email">
          <input type="email" value={settings.storeEmail} onChange={(e) => set("storeEmail", e.target.value)} className={inputCls} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Currency">
            <select value={settings.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls}>
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
            </select>
          </Field>
          <Field label="Timezone">
            <select value={settings.timezone} onChange={(e) => set("timezone", e.target.value)} className={inputCls}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (ET)</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Shipping */}
      <Section title="Shipping" icon={<Truck size={16} />}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Flat shipping rate (₹)" hint="Applied to all orders below threshold">
            <input
              type="number"
              value={settings.shippingFlat}
              onChange={(e) => set("shippingFlat", Number(e.target.value))}
              className={inputCls}
              min={0}
            />
          </Field>
          <Field label="Free shipping threshold (₹)" hint="Orders above this get free shipping">
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
              className={inputCls}
              min={0}
            />
          </Field>
        </div>
        <div className="pt-1 space-y-3">
          <p className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wide">Payment Methods</p>
          <Toggle checked={settings.codEnabled} onChange={(v) => set("codEnabled", v)} label="Cash on Delivery (COD)" />
          <Toggle checked={settings.upiEnabled} onChange={(v) => set("upiEnabled", v)} label="UPI / PhonePe / GPay" />
          <Toggle checked={settings.cardEnabled} onChange={(v) => set("cardEnabled", v)} label="Credit / Debit Cards" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={16} />}>
        <Toggle checked={settings.orderNotifications} onChange={(v) => set("orderNotifications", v)} label="Email me on new orders" />
        <Toggle checked={settings.lowStockAlerts} onChange={(v) => set("lowStockAlerts", v)} label="Low stock alerts (coming soon)" />
        <Toggle checked={settings.newsletterSignups} onChange={(v) => set("newsletterSignups", v)} label="Newsletter signup notifications" />
      </Section>

      {/* Security */}
      <Section title="Admin Security" icon={<Shield size={16} />}>
        <Field label="New admin password">
          <input
            type="password"
            value={settings.adminPassword}
            onChange={(e) => set("adminPassword", e.target.value)}
            className={inputCls}
            placeholder="Leave blank to keep current"
          />
        </Field>
        <Field label="Confirm password">
          <input
            type="password"
            value={settings.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            className={inputCls}
            placeholder="Repeat new password"
          />
        </Field>
        {settings.adminPassword && settings.adminPassword !== settings.confirmPassword && (
          <p className="text-red-600 text-xs">Passwords do not match</p>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-xs">
          ⚠️ For production: connect to a real auth provider (e.g. NextAuth, Clerk, or Supabase Auth).
        </div>
      </Section>
    </div>
  );
}
