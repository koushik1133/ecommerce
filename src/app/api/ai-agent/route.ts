import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

type ToolCall =
  | { type: "navigate"; path: string; reason: string }
  | { type: "add_to_cart"; productId: string; productName: string; size: string; color: string; quantity: number; logoPlacement?: string; logoLabel?: string }
  | { type: "ask_for_details"; missingField: "size" | "color" | "product"; question: string; options: string[] }
  | { type: "configure_3d"; modelSlug: string; color?: string }
  | { type: "open_cart" };

export async function POST(req: NextRequest) {
  // Rate limit AI requests (30 reqs/min per IP)
  const rateLimit = checkRateLimit(req, 30, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests to AI agent. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const message = sanitizeInput(body.message || "");
    const history = body.history || [];
    const groqKey = req.headers.get("x-groq-key") || process.env.GROQ_API_KEY;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Try calling Groq API if key is present
    if (groqKey) {
      try {
        const groqResult = await callGroqApi(groqKey, message, history);
        if (groqResult) {
          return NextResponse.json(groqResult);
        }
      } catch (e) {
        console.error("Groq API error fallback:", e);
      }
    }

    // Fallback Intelligent Reasoning & Intent Engine (Works 100% cleanly offline or without API key)
    const fallbackResult = processIntelligentIntent(message);
    return NextResponse.json(fallbackResult);
  } catch {
    return NextResponse.json({ error: "Failed to process AI agent request" }, { status: 500 });
  }
}

async function callGroqApi(apiKey: string, userMessage: string, history: any[]) {
  const catalogSummary = products
    .map((p) => `- ${p.name} (id: "${p.id}", slug: "${p.slug}", category: "${p.garmentCategory}", price: ₹${p.price}, sizes: [${p.sizes.join(", ")}], colors: [${p.colors.map((c) => c.name).join(", ")}])`)
    .join("\n");

  const systemPrompt = `You are "Brand AI Concierge", an intelligent, fashion-expert AI assistant for our premium 3D streetwear & luxury garment store.
Store Catalog:
${catalogSummary}

Available Pages for Navigation:
- /shop : Full collection of T-shirts, Hoodies, Sweatpants, Caps, Polos.
- /customizer : 3D Garment Configurator studio (3D rotation, custom logo placement, block-out stitch).
- /checkout : Checkout & Payment page.
- /faq : Sizing guide & FAQ.
- /product/[slug] : Product detail pages (e.g. /product/warmup-hoodie, /product/studio-cap, /product/restday-sweatpants, /product/tech-zip-hoodie).

CRITICAL INSTRUCTIONS & TOOL CALL RULES:
1. RESPONSE LENGTH: Provide 4 to 5 lines of detailed, helpful, and engaging response covering fabric quality (e.g., 380-400 GSM French Terry), fit details, customization options, and styling recommendations.

2. RELEVANT FOLLOW-UP SUGGESTIONS: Always include 3 to 4 highly relevant shopping & customization follow-up suggestions in your response JSON. Focus on garments, colors, 3D customizer, size selection, and cart actions. DO NOT suggest privacy policy unless explicitly asked.

3. ADD TO CART: If user asks to add an item to cart (e.g. "add to cart a hoodie of size M and color Ink with white logo in center"):
   - Parse size, color, specific product, and optional logo placement.
   - If size or color is missing, politely ask the user using tool call {"tool": "ask_for_details"}.
   - Output tool call:
     {"tool": "add_to_cart", "productId": "warmup-hoodie", "productName": "Warmup Heavy Hoodie", "size": "M", "color": "Ink", "quantity": 1, "logoPlacement": "center", "logoLabel": "White Wordmark"}

4. NAVIGATION: If user asks to go to a page or view a category (e.g., "take me to shop", "show me caps", "open 3d customizer"):
   {"tool": "navigate", "path": "/customizer", "reason": "Opening 3D Studio"}

OUTPUT FORMAT (Must be valid JSON):
{
  "reply": "Multi-line detailed helpful response (4-5 lines)...",
  "toolCall": null or ToolCallObject,
  "suggestions": ["Try 3D Customizer Studio", "Add Warmup Hoodie M / Ink", "Check Heavyweight Joggers"]
}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent);
    return {
      reply: parsed.reply || "How can I assist you with your order today?",
      toolCall: parsed.toolCall || null,
      suggestions: parsed.suggestions || ["Explore 3D Customizer Studio", "Add Warmup Hoodie in Medium", "Filter Hoodies & Sweatshirts"],
    };
  } catch {
    return null;
  }
}

// Built-in Intelligent Fallback Engine
function processIntelligentIntent(userMessage: string) {
  const msg = userMessage.toLowerCase().trim();

  // 1. Navigation intents
  if (msg.includes("privacy") || msg.includes("privacy policy")) {
    return {
      reply: "Taking you to our Privacy Policy page.\nOur storefront strictly complies with GDPR, CCPA, and international data protection standards.\nYour personal payment data and browsing context are fully encrypted and protected.\nLet me know if you need assistance with any product orders or 3D customizations afterwards!",
      toolCall: { type: "navigate", path: "/privacy", reason: "Navigating to Privacy Policy" },
      suggestions: ["Return to Shop Collection", "Explore 3D Garment Studio", "View Heavyweight Hoodies"],
    };
  }

  if (msg.includes("checkout") || msg.includes("pay") || msg.includes("buy now")) {
    return {
      reply: "Navigating to the Checkout page right away!\nAll transactions on our store are processed using PCI-DSS encrypted payment gateways.\nYou can complete your order using UPI, Credit/Debit cards, or NetBanking with instant confirmation.\nLet me know if you would like to adjust any cart quantities before finalizing your payment.",
      toolCall: { type: "navigate", path: "/checkout", reason: "Navigating to Checkout" },
      suggestions: ["View Cart Items", "Add Studio Twill Cap", "Apply Flash Promo Code"],
    };
  }

  if (msg.includes("customizer") || msg.includes("configurator") || msg.includes("3d studio") || msg.includes("3d")) {
    return {
      reply: "Opening our interactive 3D Garment Studio!\nHere you can inspect high-precision 360° 3D models of Hoodies, Sweatpants, Polos, and Caps.\nYou can swap garment colorways, upload custom PNG logos, and toggle Block-out Stitch embroidery.\nLet's get your custom creation started!",
      toolCall: { type: "navigate", path: "/customizer", reason: "Opening 3D Studio" },
      suggestions: ["Configure Oversized Hoodie", "Customize Studio Cap 360°", "Upload Custom Logo"],
    };
  }

  if (msg.includes("shop") || msg.includes("collection") || msg.includes("browse")) {
    return {
      reply: "Taking you to our full streetwear collection!\nExplore our complete catalog featuring 220-260 GSM heavyweight cotton T-shirts, 400 GSM French Terry hoodies, and structured twill caps.\nEvery piece includes interactive 360° product previews and full sizing guidance.\nSelect any item to customize in 3D or add to your shopping bag.",
      toolCall: { type: "navigate", path: "/shop", reason: "Navigating to Shop" },
      suggestions: ["Filter Hoodies & Sweatshirts", "Filter Sweatpants & Joggers", "Filter Caps"],
    };
  }

  if (msg.includes("cap") && (msg.includes("show") || msg.includes("go") || msg.includes("open") || msg.includes("view"))) {
    return {
      reply: "Opening the Studio Twill Cap 360° view page!\nOur caps feature structured 6-panel twill construction, an adjustable antique brass buckle strap, and a pre-curved visor.\nAvailable in Ink, Forest, Rust, Chalk, and Fog colorways.\nYou can rotate the 3D model 360° or open it in the customizer to add your brand logo.",
      toolCall: { type: "navigate", path: "/product/studio-cap", reason: "Navigating to Cap product page" },
      suggestions: ["Add Studio Cap (Ink) to Cart", "Customize Cap in 3D Studio", "View Heavyweight Joggers"],
    };
  }

  // 2. Add to Cart intents with clarification logic & logo placement parsing
  if (msg.includes("add") && (msg.includes("cart") || msg.includes("bag"))) {
    let matchedProduct = products.find((p) => msg.includes(p.slug) || msg.includes(p.name.toLowerCase()));
    if (!matchedProduct) {
      if (msg.includes("hoodie")) {
        matchedProduct = products.find((p) => p.slug === "warmup-hoodie") || products[0];
      } else if (msg.includes("cap")) {
        matchedProduct = products.find((p) => p.slug === "studio-cap") || products[0];
      } else if (msg.includes("sweatpants") || msg.includes("pant") || msg.includes("jogger")) {
        matchedProduct = products.find((p) => p.slug === "restday-sweatpants") || products[0];
      } else if (msg.includes("polo")) {
        matchedProduct = products.find((p) => p.slug === "heritage-polo") || products[0];
      } else {
        matchedProduct = products.find((p) => p.slug === "studio-tee") || products[0];
      }
    }

    // Parse Size (S, M, L, XL, XXL)
    let selectedSize = "";
    const sizeMatch = msg.match(/\b(size\s+)?(s|m|l|xl|xxl)\b/i);
    if (sizeMatch) {
      selectedSize = sizeMatch[2].toUpperCase();
    }

    // Parse Color
    let selectedColor = "";
    matchedProduct.colors.forEach((c) => {
      if (msg.includes(c.name.toLowerCase()) || msg.includes(c.slug)) {
        selectedColor = c.name;
      }
    });

    // Parse Logo placement / white logo in center
    let logoPlacement = "";
    let logoLabel = "";
    if (msg.includes("logo") || msg.includes("center") || msg.includes("chest")) {
      logoPlacement = msg.includes("center") ? "center" : "chest";
      logoLabel = msg.includes("white") ? "White Brand Logo" : "Custom Logo";
    }

    // If missing size, politely ask the user
    if (!selectedSize) {
      return {
        reply: `I would be happy to add the ${matchedProduct.name} to your shopping bag!\nOur hoodies and tops feature a relaxed streetwear drape crafted from 400 GSM French Terry cotton.\nTo ensure the perfect fit, please choose your preferred size below.\nWe offer sizes S through XXL. Which size would you prefer?`,
        toolCall: {
          type: "ask_for_details",
          missingField: "size",
          question: `Please select a size for ${matchedProduct.name}:`,
          options: matchedProduct.sizes,
        },
        suggestions: matchedProduct.sizes.map((s) => `Size ${s}`),
      };
    }

    if (!selectedColor) {
      selectedColor = matchedProduct.colors[0]?.name || "Ink";
    }

    const logoText = logoPlacement ? ` with ${logoLabel} placed at ${logoPlacement}` : "";

    return {
      reply: `Great choice! Adding the ${matchedProduct.name} (Size ${selectedSize} / Color ${selectedColor}${logoText}) directly to your shopping bag!\nThis piece is crafted from pre-shrunk 400 GSM French Terry cotton with double-stitched seams and ribbed trim for a durable luxury drape.\nYour cart drawer is opening so you can review your item.\nWould you like to head to checkout or explore matching sweatpants?`,
      toolCall: {
        type: "add_to_cart",
        productId: matchedProduct.id,
        productName: matchedProduct.name,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        logoPlacement,
        logoLabel,
      },
      suggestions: ["Go to Checkout", "Add Restday Sweatpants (M)", "Explore 3D Configurator Studio"],
    };
  }

  // 3. Product & Sizing detailed answers
  if (msg.includes("size") || msg.includes("fit") || msg.includes("chart") || msg.includes("gsm")) {
    return {
      reply: "Here is our comprehensive sizing and fabric guide:\n- T-Shirts: 220-260 GSM 100% combed cotton with dropped shoulders and a boxy streetwear cut.\n- Hoodies & Sweatshirts: 380-400 GSM heavy French Terry fleece with double-layer hoods and thick ribbed trim.\n- Sweatpants: 350 GSM brushed fleece with elastic waistbands and deep side pockets.\n- Caps: Structured 6-panel twill with adjustable brass buckle.\nWe recommend choosing your standard size for an intentional relaxed fit, or sizing down for a tailored silhouette.",
      toolCall: null,
      suggestions: ["Add Warmup Hoodie (M / Ink)", "Add Restday Sweatpants (M)", "Try 3D Configurator Studio"],
    };
  }

  // 4. Default multi-line helpful concierge response
  return {
    reply: "Hello and welcome! I am your Brand AI Concierge, your personal guide for streetwear styling, size advice, and 3D customization.\nI can seamlessly navigate the site for you, configure 3D garments, or add items directly to your shopping bag.\nTry asking: 'Add to cart a hoodie of size M and color Ink with white logo in center'.\nHow can I help elevate your wardrobe today?",
    toolCall: null,
    suggestions: [
      "Add a Hoodie size M color Ink to cart",
      "Open 3D Garment Studio",
      "Show Heavyweight Joggers",
      "Take me to Checkout",
    ],
  };
}
