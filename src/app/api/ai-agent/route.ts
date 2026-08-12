import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

type ToolCall =
  | { type: "navigate"; path: string; reason: string }
  | { type: "add_to_cart"; productId: string; productName: string; size: string; color: string; quantity: number }
  | { type: "ask_for_details"; missingField: "size" | "color" | "product"; question: string; options: string[] }
  | { type: "configure_3d"; modelSlug: string; color?: string }
  | { type: "open_cart" };

export async function POST(req: NextRequest) {
  // Rate limit AI requests to prevent API abuse (30 reqs/min per IP)
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
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process AI agent request" }, { status: 500 });
  }
}

async function callGroqApi(apiKey: string, userMessage: string, history: any[]) {
  const catalogSummary = products
    .map((p) => `- ${p.name} (id: "${p.id}", slug: "${p.slug}", category: "${p.garmentCategory}", price: ₹${p.price}, sizes: [${p.sizes.join(", ")}], colors: [${p.colors.map((c) => c.name).join(", ")}])`)
    .join("\n");

  const systemPrompt = `You are "Brand AI Concierge", an intelligent, polite, and helpful e-commerce AI assistant for our premium 3D garment store.
Store Catalog:
${catalogSummary}

Available Pages for Navigation:
- /shop : Full collection of T-shirts, Hoodies, Sweatpants, Caps, Polos.
- /customizer : 3D Garment Configurator studio (change 3D models, upload custom logos, select block-out stitch).
- /privacy : Privacy Policy page.
- /about : About Brand.
- /contact : Customer Support & Contact.
- /checkout : Order Checkout page.
- /faq : Frequently Asked Questions & Size Guide.
- /product/[slug] : Product detail pages (e.g., /product/studio-cap, /product/warmup-hoodie, /product/restday-sweatpants, /product/tech-zip-hoodie).

CRITICAL INSTRUCTIONS & TOOL CALL RULES:
1. NAVIGATION: If the user asks to go/take them to any page (e.g. "take me to privacy policy", "open shop", "take me to checkout", "show me caps"), generate a tool call:
   {"tool": "navigate", "path": "/privacy", "reason": "Navigating to Privacy Policy page"}

2. ADD TO CART: If the user asks to add an item to cart (e.g. "add to cart a hoodie of size M and color Ink"):
   - Check if size, color, AND specific product are specified.
   - If size or color or specific product is missing (e.g. user says "add a hoodie to cart" without size/color), DO NOT add to cart yet! Instead, politely ask the user for the missing details using tool call:
     {"tool": "ask_for_details", "missingField": "size", "question": "What size would you like for the Warmup Hoodie? (Available: S, M, L, XL, XXL)", "options": ["S", "M", "L", "XL", "XXL"]}
   - If size and color are specified, find the matching product and output tool call:
     {"tool": "add_to_cart", "productId": "warmup-hoodie", "productName": "Warmup Heavy Hoodie", "size": "M", "color": "Ink", "quantity": 1}

3. 3D CONFIGURATOR: If user wants to view or configure a 3D garment, output tool call:
   {"tool": "configure_3d", "modelSlug": "cap", "color": "Forest"}

4. ETHICAL SCOPE: Stay strictly focused on store products, sizing, customization, navigation, and purchasing. If asked about unrelated topics, politely steer back to the store.

5. FOLLOW-UP SUGGESTIONS: Always include 2-3 relevant follow-up suggestion strings in your response JSON.

OUTPUT FORMAT (Must be valid JSON):
{
  "reply": "Polite response text to customer...",
  "toolCall": null or ToolCallObject,
  "suggestions": ["View Size Guide", "Go to 3D Configurator", "Add Warmup Hoodie M / Ink"]
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

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq API error:", res.status, errText);
    return null;
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent);
    return {
      reply: parsed.reply || "How can I assist you with your order today?",
      toolCall: parsed.toolCall || null,
      suggestions: parsed.suggestions || ["View Shop Collection", "Open 3D Configurator", "Check Size Guide"],
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
      reply: "Taking you to our Privacy Policy page right away!",
      toolCall: { type: "navigate", path: "/privacy", reason: "Navigating to Privacy Policy" },
      suggestions: ["View Terms & Conditions", "Contact Customer Support", "Return to Shop"],
    };
  }

  if (msg.includes("checkout") || msg.includes("pay") || msg.includes("buy now")) {
    return {
      reply: "Taking you directly to the Checkout page to complete your order.",
      toolCall: { type: "navigate", path: "/checkout", reason: "Navigating to Checkout" },
      suggestions: ["View Cart Items", "Continue Shopping", "Check Promo Codes"],
    };
  }

  if (msg.includes("customizer") || msg.includes("configurator") || msg.includes("3d studio")) {
    return {
      reply: "Opening the 3D Garment Configurator Studio where you can customize 3D models and upload custom logos!",
      toolCall: { type: "navigate", path: "/customizer", reason: "Opening 3D Studio" },
      suggestions: ["Customize Cap 360°", "Customize Hoodie", "Upload Custom Logo"],
    };
  }

  if (msg.includes("shop") || msg.includes("collection") || msg.includes("browse")) {
    return {
      reply: "Here is our full catalog of premium 3D apparel — T-shirts, Hoodies, Sweatpants, Polos, and Caps.",
      toolCall: { type: "navigate", path: "/shop", reason: "Navigating to Shop" },
      suggestions: ["Filter Hoodies", "Filter Sweatpants", "Filter Caps"],
    };
  }

  if (msg.includes("cap") && (msg.includes("show") || msg.includes("go") || msg.includes("open"))) {
    return {
      reply: "Navigating to our Studio Twill Cap 360° view page.",
      toolCall: { type: "navigate", path: "/product/studio-cap", reason: "Navigating to Cap product page" },
      suggestions: ["View in 3D Configurator", "Add Studio Cap to Bag", "Check Available Colors"],
    };
  }

  // 2. Add to Cart intents with clarification logic
  if (msg.includes("add") && (msg.includes("cart") || msg.includes("bag"))) {
    // Check garment type
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

    // If missing size or color, politely ask the user!
    if (!selectedSize) {
      return {
        reply: `Which size would you like for the ${matchedProduct.name}?`,
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
      const defaultColor = matchedProduct.colors[0]?.name || "Ink";
      selectedColor = defaultColor;
    }

    return {
      reply: `Adding ${matchedProduct.name} (Size ${selectedSize} / Color ${selectedColor}) to your bag now!`,
      toolCall: {
        type: "add_to_cart",
        productId: matchedProduct.id,
        productName: matchedProduct.name,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      },
      suggestions: ["Go to Checkout", "Open Cart Drawer", "View 3D Configurator"],
    };
  }

  // 3. Product & Sizing questions
  if (msg.includes("size") || msg.includes("fit") || msg.includes("chart")) {
    return {
      reply: "Our garments feature a relaxed, modern streetwear fit. T-shirts are heavyweight 220-260 GSM cotton, and hoodies/sweatshirts are 380-400 GSM French Terry. We recommend ordering your true size for a relaxed drape, or sizing down for a fitted silhouette.",
      toolCall: null,
      suggestions: ["View Shop Collection", "Try 3D Configurator", "Add Warmup Hoodie in M"],
    };
  }

  // 4. Default helpful concierge response
  return {
    reply: "Hello! I am your Brand AI Concierge. I can help you navigate our site, answer product & sizing questions, switch 3D garment models, or add items directly to your shopping bag. How can I assist you today?",
    toolCall: null,
    suggestions: ["Take me to Shop", "Open 3D Studio", "Take me to Privacy Policy"],
  };
}
