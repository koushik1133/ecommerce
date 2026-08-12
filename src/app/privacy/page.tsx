import type { Metadata } from "next";
import { ShieldCheck, Eye, Lock, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Privacy Policy · Brand" };

export default function PrivacyPage() {
  return (
    <div className="container-brand py-12 md:py-20 max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={20} className="text-[#0f6e56]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#0f6e56]">Legal & Compliance</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#0f0f14] tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-xs md:text-sm text-[#6b6b6b]">
          Last updated: August 12, 2026 • Compliant with GDPR, CCPA, and DPDP standards.
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#4a4a4a] leading-relaxed">
        {/* Section 1: Overview */}
        <section className="bg-white rounded-2xl p-6 border border-[#e2e2df] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#0f0f14] flex items-center gap-2">
            <Lock size={16} className="text-[#0f6e56]" />
            1. Overview & Data Collection
          </h2>
          <p>
            At <strong>brand</strong>, we respect your privacy and are committed to protecting your personal data. We collect only the information necessary to fulfill your orders, provide interactive 3D garment customization, and optimize your overall shopping experience.
          </p>
          <p>
            Personal information collected during checkout includes your name, shipping address, email address, and contact number. Payment transactions (UPI, Credit/Debit Cards) are processed via PCI-DSS compliant payment gateways; full card details are never stored on our servers.
          </p>
        </section>

        {/* Section 2: Real-Time Telemetry & Live Visitor Analytics */}
        <section className="bg-white rounded-2xl p-6 border border-[#e2e2df] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#0f0f14] flex items-center gap-2">
            <Eye size={16} className="text-[#0f6e56]" />
            2. Real-Time Telemetry & Store Analytics
          </h2>
          <p>
            Like major e-commerce platforms (e.g. Shopify Live View), our website utilizes first-party real-time telemetry to monitor active website performance and customer interactions on our store.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#555]">
            <li><strong>Session Telemetry:</strong> Anonymous/pseudonymous identifiers tracking active pages visited, 3D model 360° interactions, and cart updates.</li>
            <li><strong>Geographic Data:</strong> Coarse city & country location derived from standard IP address headers.</li>
            <li><strong>Device Context:</strong> Browser type, operating system, and screen category (Desktop, Mobile, Tablet) to ensure smooth 3D WebGL rendering.</li>
          </ul>
          <p className="text-xs text-[#6b6b6b] pt-1">
            This telemetry data is strictly used for store operations, inventory planning, and website optimization. We do not sell, rent, or trade telemetry data to third-party ad networks.
          </p>
        </section>

        {/* Section 3: Data Protection & Rights */}
        <section className="bg-white rounded-2xl p-6 border border-[#e2e2df] shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#0f0f14] flex items-center gap-2">
            <FileText size={16} className="text-[#0f6e56]" />
            3. Your Privacy Rights & Contact
          </h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data stored with us. You may also opt out of promotional emails at any time via the unsubscribe link in our newsletters.
          </p>
          <p>
            For privacy-related inquiries, data requests, or policy questions, please contact our Data Protection team at{" "}
            <a href="mailto:privacy@brand.in" className="text-[#0f6e56] font-semibold underline">
              privacy@brand.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
