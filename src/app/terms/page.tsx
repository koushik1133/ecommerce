import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="container-brand py-10 md:py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-bold tracking-tight">Terms</h1>
      <div className="mt-8 space-y-4 text-sm text-muted leading-relaxed">
        <p>
          By shopping on brand you agree that products, pricing, and availability
          may change during early access. Orders are confirmed when we send a
          confirmation email or on-screen order ID.
        </p>
        <p>
          Custom logo uploads must be owned by you or licensed for commercial
          print. You are responsible for the content of uploaded artwork.
        </p>
        <p>
          This demo checkout does not process real payments. For production use,
          connect a payment gateway and update these terms with counsel.
        </p>
      </div>
    </div>
  );
}
