import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="container-brand py-10 md:py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-bold tracking-tight">Privacy</h1>
      <div className="mt-8 space-y-4 text-sm text-muted leading-relaxed">
        <p>
          brand collects only what we need to fulfil orders and reply to you —
          name, email, phone, and shipping address. Payment details for UPI/card
          are handled by payment partners; we do not store full card numbers.
        </p>
        <p>
          We never sell your data. Launch emails are optional; you can
          unsubscribe anytime. For privacy requests, write to hello@brand.in.
        </p>
        <p>This is a demo storefront policy for the Coming Soon launch site.</p>
      </div>
    </div>
  );
}
