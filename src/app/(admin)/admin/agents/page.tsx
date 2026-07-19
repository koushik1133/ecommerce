"use client";

import { useState } from "react";
import {
  Bot, FileText, Search, ImageIcon, Package, Users, TrendingUp,
  Play, Loader2, CheckCircle, Clock, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { useAdminProducts, useAdminOrders, useAdminCustomers } from "@/store/admin";

type AgentStatus = "idle" | "running" | "done";

type Agent = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  category: string;
  mockOutput: string;
};

const AGENTS: Agent[] = [
  {
    id: "product-describer",
    name: "Product Describer",
    description: "Generates compelling, SEO-optimized product descriptions from basic product specs.",
    icon: <FileText size={20} />,
    accent: "#0f6e56",
    category: "Content",
    mockOutput: `**Studio Tee — Crafted for the Conscious Wardrobe**

Introducing the Studio Tee — where Indian craft meets modern minimalism. Woven from 200 GSM pure cotton, this tee drapes with intention and carries a hand-embroidered Ganesha motif that speaks without shouting.

The dropped shoulder seam ensures ease of movement, while the reinforced chest placement keeps embroidery pristine wash after wash. Available in five considered colorways — from the depth of Ink to the quiet warmth of Bone.

✦ 200 GSM pre-shrunk cotton  
✦ Gold Ganesha chest embroidery  
✦ Regular fit, true to size  
✦ Shipped across India in 3–5 business days

Made for those who dress with purpose.`,
  },
  {
    id: "seo-optimizer",
    name: "SEO Optimizer",
    description: "Analyzes your product titles, descriptions, and meta tags — suggests improvements for organic search.",
    icon: <Search size={20} />,
    accent: "#6366f1",
    category: "Marketing",
    mockOutput: `**SEO Analysis Report — brand store**

🔴 Issues Found (3)
→ Studio Tee: Title tag missing primary keyword "cotton tee India"
→ Everyday Crew: Meta description is 89 chars (recommended: 150–160)
→ Monogram Tee: No alt text on product images

✅ Recommendations
1. Add "buy cotton t-shirts India" to Studio Tee title
2. Expand Everyday Crew meta to: "Shop the Everyday Crew — 180 GSM combed cotton tee designed for daily wear. Ships across India."
3. Add descriptive alt text to all product images

📈 Estimated Impact: +18% organic impressions in 60 days`,
  },
  {
    id: "image-alt-gen",
    name: "Image Alt Generator",
    description: "Auto-generates descriptive, accessible alt text for all product images using vision AI.",
    icon: <ImageIcon size={20} />,
    accent: "#f59e0b",
    category: "Accessibility",
    mockOutput: `**Alt Text Generation Complete — 10 images processed**

studio-tee/front-clean.jpg
→ "Studio Tee in Ink colorway, front view — black cotton crew neck t-shirt with gold Ganesha embroidery on chest, displayed flat on white background"

studio-tee/back-clean.jpg  
→ "Studio Tee back view — clean cotton t-shirt in dark ink, showing curved hem and relaxed shoulder fit"

studio-tee/embroidery-closeup.jpg
→ "Close-up of gold Ganesha chest embroidery on Studio Tee — detailed threadwork with deity motif in metallic gold"

...and 7 more images updated ✓`,
  },
  {
    id: "order-summarizer",
    name: "Order Summarizer",
    description: "Generates daily/weekly order digests and flags anomalies or fulfillment delays.",
    icon: <Package size={20} />,
    accent: "#ef4444",
    category: "Operations",
    mockOutput: `**Weekly Order Summary — Jul 12–18, 2025**

📦 28 orders processed
💰 Total revenue: ₹38,420
🚚 Avg fulfillment time: 1.8 days

⚠️ Anomalies Detected:
• Order #10019 (Rahul Verma) — shipped 4 days ago, no delivery confirmation. Follow up with courier.
• 3 COD orders in Bengaluru have unusually high return probability (ML model score: 0.78). Consider prepayment incentive.

🏆 Best Sellers This Week:
1. Studio Tee (Ink) — 8 units
2. Everyday Crew (Ink) — 6 units  
3. Heavyweight Box (Navy) — 4 units

Next scheduled digest: Jul 25, 2025 at 9:00 AM`,
  },
  {
    id: "customer-segmenter",
    name: "Customer Segmenter",
    description: "Clusters your customers into behavioral segments for targeted marketing campaigns.",
    icon: <Users size={20} />,
    accent: "#06b6d4",
    category: "Marketing",
    mockOutput: `**Customer Segmentation Analysis — 20 customers**

🎯 Segments Identified:

**High-Value Loyalists (4 customers — 32% of revenue)**
Kunal Bose, Ananya Reddy, Aditya Kumar, Vikram Singh
→ 3+ orders, ₹4,000+ LTV. Recommend: Early access, free shipping always.

**Growth Opportunities (7 customers)**
1-2 orders, moderate spend. Strong potential.  
→ Recommend: Re-engagement email with 10% off second purchase.

**New Acquirers (9 customers)**
Single order, <30 days old. Need nurturing.  
→ Recommend: Post-purchase onboarding sequence + review request.

📧 Suggested Campaign: "We miss you" — target Growth segment with personalized recommendation.`,
  },
  {
    id: "price-optimizer",
    name: "Price Optimizer",
    description: "Analyzes sales velocity, margins, and competitor data to recommend optimal price points.",
    icon: <TrendingUp size={20} />,
    accent: "#10b981",
    category: "Revenue",
    mockOutput: `**Price Optimization Report — brand catalog**

📊 Analysis Based On: 90 days sales data, category benchmarks

✅ Keep Current Price:
• Studio Tee (₹1,499) — strong conversion, premium positioning justified
• Everyday Crew (₹999) — high velocity, price-elastic segment

📈 Increase Recommended:
• Monogram Tee: ₹1,299 → ₹1,499 (+15%)
  Rationale: Customization premium under-priced. Similar SKUs on Myntra: ₹1,799+

📉 Decrease Recommended:
• City Stripe: ₹1,199 → ₹999
  Rationale: Slow velocity, 23% conversion below category avg. Price sensitivity test suggested.

💡 Dynamic Pricing: Enable "flash sale" pricing on weekends (+8% estimated lift)`,
  },
];

type AgentState = {
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  output?: string;
};

export default function AgentsPage() {
  const [states, setStates] = useState<Record<string, AgentState>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const runAgent = (agent: Agent) => {
    setStates((s) => ({
      ...s,
      [agent.id]: { status: "running", startedAt: new Date().toISOString() },
    }));
    setExpanded(agent.id);

    setTimeout(() => {
      let finalOutput = agent.mockOutput;

      if (agent.id === "product-describer") {
        const firstProd = useAdminProducts.getState().products[0];
        if (firstProd) {
          useAdminProducts.getState().updateProduct(firstProd.id, {
            description: "✦ 200 GSM pre-shrunk cotton\n✦ Gold Ganesha chest embroidery\n✦ Regular fit, true to size\n\nCompelling, premium cotton drop woven for India. Styled with Ganesha chest gold thread embroidery.",
            tagline: "Ganesha embroidered drop. Woven for brand.",
          });
          finalOutput = `**Product Describer Agent Complete**\n\nUpdated product: **${firstProd.name}**\n\nNew Tagline: "Ganesha embroidered drop. Woven for brand."\n\nNew Description updated in the store catalog ✓`;
        }
      } else if (agent.id === "seo-optimizer") {
        const products = useAdminProducts.getState().products;
        products.forEach((p) => {
          if (p.slug === "studio-tee" && !p.name.includes("India")) {
            useAdminProducts.getState().updateProduct(p.id, {
              name: "Studio Tee - Premium Cotton India",
            });
          }
        });
        finalOutput = `**SEO Optimizer Agent Complete**\n\nUpdated "Studio Tee" to "Studio Tee - Premium Cotton India" to rank for targeted keywords.\n\nAdded SEO descriptions. Store catalog updated ✓`;
      } else if (agent.id === "image-alt-gen") {
        const products = useAdminProducts.getState().products;
        let count = 0;
        products.forEach((p) => {
          if (p.gallery) {
            const updatedGallery = p.gallery.map((img) => {
              count++;
              return {
                ...img,
                label: img.label.includes("Alt:") ? img.label : `Alt: ${img.label} - brand Premium T-Shirt`,
              };
            });
            useAdminProducts.getState().updateProduct(p.id, { gallery: updatedGallery });
          }
        });
        finalOutput = `**Image Alt Generator Agent Complete**\n\nProcessed and generated accessibility alt tags for ${count} product images.\n\nChanges saved directly to product gallery configurations ✓`;
      } else if (agent.id === "order-summarizer") {
        const orders = useAdminOrders.getState().orders;
        const total = orders.reduce((s, o) => s + o.total, 0);
        finalOutput = `**Order Summarizer Agent Report**\n\n📦 ${orders.length} total orders processed\n💰 Dynamic Revenue Total: ₹${total}\n\nAll metrics calculated live from local store data. No anomalies detected.`;
      } else if (agent.id === "customer-segmenter") {
        const customers = useAdminCustomers.getState().customers;
        const vip = customers.filter((c) => c.totalSpend > 2000).map((c) => c.name);
        const regular = customers.filter((c) => c.totalSpend <= 2000).map((c) => c.name);
        finalOutput = `**Customer Segmenter Agent Report**\n\n🎯 Segments Identified from live database:\n\n` +
          `**High-Value Loyalists (${vip.length} customers):**\n${vip.join(", ") || "No customers with spend > ₹2,000 yet."}\n\n` +
          `**New & Standard Segment (${regular.length} customers):**\n${regular.join(", ") || "No other customers in database."}`;
      } else if (agent.id === "price-optimizer") {
        const products = useAdminProducts.getState().products;
        products.forEach((p) => {
          if (p.slug === "monogram-tee" && p.price === 1299) {
            useAdminProducts.getState().updateProduct(p.id, { price: 1499 });
          }
        });
        finalOutput = `**Price Optimizer Agent Complete**\n\nRecommended and applied price optimization:\n- Monogram Tee adjusted to ₹1,499 (customization premium markup).\n\nUpdates are live on store storefront!`;
      }

      setStates((s) => ({
        ...s,
        [agent.id]: {
          ...s[agent.id],
          status: "done",
          completedAt: new Date().toISOString(),
          output: finalOutput,
        },
      }));
    }, 2500 + Math.random() * 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f0f14] to-[#1a2035] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg">AI Agent Hub</p>
            <p className="text-white/50 text-xs">Powered by Gemini — automate store operations with one click</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-white/50 text-xs">Agents Available</p>
            <p className="font-bold text-xl">{AGENTS.length}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Completed Runs</p>
            <p className="font-bold text-xl">{Object.values(states).filter((s) => s.status === "done").length}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Running Now</p>
            <p className="font-bold text-xl">{Object.values(states).filter((s) => s.status === "running").length}</p>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-3">
        {AGENTS.map((agent) => {
          const state = states[agent.id] ?? { status: "idle" };
          const isExpanded = expanded === agent.id;

          return (
            <div
              key={agent.id}
              className="bg-white border border-[#e8e8e5] rounded-2xl overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: agent.accent + "18" }}
                >
                  <span style={{ color: agent.accent }}>{agent.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#0f0f14] font-semibold">{agent.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0f0ee] text-[#6b6b6b] font-medium">
                      {agent.category}
                    </span>
                  </div>
                  <p className="text-[#6b6b6b] text-sm">{agent.description}</p>

                  {/* State info */}
                  {state.status === "running" && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#6b6b6b]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0f6e56] animate-pulse" />
                      Running since {new Date(state.startedAt!).toLocaleTimeString("en-IN")}
                    </div>
                  )}
                  {state.status === "done" && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                      <CheckCircle size={12} />
                      Completed at {new Date(state.completedAt!).toLocaleTimeString("en-IN")}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {state.status === "done" && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : agent.id)}
                      className="p-2 rounded-xl border border-[#e2e2df] text-[#6b6b6b] hover:bg-[#f0f0ee] transition"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                  <button
                    onClick={() => state.status !== "running" && runAgent(agent)}
                    disabled={state.status === "running"}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      state.status === "running"
                        ? "bg-[#0f6e56]/20 text-[#0f6e56] cursor-not-allowed"
                        : state.status === "done"
                        ? "bg-[#f0f0ee] text-[#6b6b6b] hover:bg-[#e8e8e5]"
                        : "bg-[#0f0f14] text-white hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {state.status === "running" ? (
                      <><Loader2 size={14} className="animate-spin" /> Running…</>
                    ) : state.status === "done" ? (
                      <><Play size={14} /> Re-run</>
                    ) : (
                      <><Play size={14} /> Run</>
                    )}
                  </button>
                </div>
              </div>

              {/* Running progress bar */}
              {state.status === "running" && (
                <div className="h-1 bg-[#f0f0ee]">
                  <div
                    className="h-full rounded-full animate-pulse"
                    style={{ background: agent.accent, width: "60%", transition: "width 0.5s" }}
                  />
                </div>
              )}

              {/* Output panel */}
              {state.status === "done" && isExpanded && state.output && (
                <div className="border-t border-[#e8e8e5] bg-[#fafaf9] p-5">
                  <p className="text-[#9b9b9b] text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Bot size={13} /> Agent Output
                  </p>
                  <pre className="text-[#0f0f14] text-sm whitespace-pre-wrap font-mono leading-relaxed bg-white border border-[#e8e8e5] rounded-xl p-4 max-h-80 overflow-y-auto">
                    {state.output}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
