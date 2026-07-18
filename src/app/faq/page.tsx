import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about brand T-shirts, shipping, and logo customization.",
};

const FAQS = [
  {
    q: "When do you fully launch?",
    a: "We're in Coming Soon / early access mode now — you can already shop tees. The full brand launch with more categories is next.",
  },
  {
    q: "Do you only sell T-shirts?",
    a: "Yes, for now. Hoodies, caps, and seasonal pieces are coming soon.",
  },
  {
    q: "Can I upload my own logo?",
    a: "Yes. On customizable products, choose a preset or upload PNG/JPG/SVG, then pick chest-left, chest-center, or back placement.",
  },
  {
    q: "Where do you ship?",
    a: "Pan-India. Standard delivery is 3–5 business days for most metros; remote areas may take longer.",
  },
  {
    q: "Is COD available?",
    a: "Yes — Cash on Delivery is available at checkout for eligible PIN codes.",
  },
  {
    q: "What is your return policy?",
    a: "Unused items with tags can be exchanged within 7 days. Custom logo prints are exchange-only for manufacturing defects.",
  },
  {
    q: "Are prices inclusive of GST?",
    a: "Displayed prices are in INR and inclusive of applicable GST. Invoices are available with your order.",
  },
];

export default function FAQPage() {
  return (
    <div className="container-brand py-10 md:py-16 max-w-3xl">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10">
        FAQ
      </h1>
      <div className="divide-y divide-line border-y border-line">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="cursor-pointer list-none font-medium flex items-center justify-between gap-4">
              {item.q}
              <span className="text-muted text-xl group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted leading-relaxed pr-8">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
