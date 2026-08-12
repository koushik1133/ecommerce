"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, Send, X, Sparkles, ShoppingBag, ArrowRight,
  Key, RefreshCw, CheckCircle2, ChevronDown, MessageSquare
} from "lucide-react";
import { useCart } from "@/store/cart";
import { products } from "@/lib/products";

type Message = {
  id: string;
  sender: "user" | "agent";
  text: string;
  toolCall?: any;
  suggestions?: string[];
  timestamp: number;
};

export function FloatingAIAgent() {
  const router = useRouter();
  const cart = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: "Hello! I am your Brand AI Concierge. Ask me anything about our 3D apparel, or tell me to navigate, configure garments, or add items directly to your cart!",
      suggestions: [
        "Take me to Privacy Policy",
        "Add a Hoodie size M color Ink to cart",
        "Open 3D Configurator Studio",
      ],
      timestamp: Date.now(),
    },
  ]);

  // Load stored Groq API Key from localStorage if user added one
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("brand_groq_api_key");
      if (savedKey) setGroqKey(savedKey);
    }
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("brand_groq_api_key", groqKey.trim());
    }
    setShowKeyInput(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  // Client Tool Execution Engine
  const executeToolCall = (toolCall: any) => {
    if (!toolCall) return;

    try {
      if (toolCall.type === "navigate" && toolCall.path) {
        router.push(toolCall.path);
      } else if (toolCall.type === "add_to_cart") {
        const prod =
          products.find((p) => p.id === toolCall.productId || p.slug === toolCall.productId) ||
          products.find((p) => p.name.toLowerCase().includes(toolCall.productName?.toLowerCase() || "")) ||
          products[0];

        const colorObj =
          prod.colors.find((c) => c.name.toLowerCase() === toolCall.color?.toLowerCase()) ||
          prod.colors[0];

        cart.addItem({
          productId: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: prod.price,
          color: colorObj.name,
          colorHex: colorObj.hex,
          size: toolCall.size || prod.sizes[0] || "M",
          quantity: toolCall.quantity || 1,
        });

        // Automatically open cart drawer to show customer!
        setTimeout(() => {
          cart.openCart();
        }, 400);
      } else if (toolCall.type === "configure_3d") {
        router.push(`/customizer?model=${toolCall.modelSlug || "cap"}`);
      } else if (toolCall.type === "open_cart") {
        cart.openCart();
      }
    } catch (e) {
      console.error("Failed to execute tool call:", e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(groqKey ? { "x-groq-key": groqKey } : {}),
        },
        body: JSON.stringify({
          message: prompt,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reach AI agent");
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: data.reply || "I have processed your request.",
        toolCall: data.toolCall || null,
        suggestions: data.suggestions || ["View Shop Collection", "Open 3D Studio"],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Execute tool action directly on web app
      if (data.toolCall) {
        executeToolCall(data.toolCall);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "agent",
          text: `I'm having trouble processing that request right now: ${err.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-[#0f0f14] hover:bg-black text-white p-3.5 pr-5 rounded-full shadow-2xl border border-white/15 transition-all duration-300 hover:scale-105"
          >
            {/* Glowing Pulse Dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>

            <div className="w-8 h-8 rounded-full bg-[#0f6e56] flex items-center justify-center text-white shrink-0 shadow-inner">
              <Bot size={18} />
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight">AI Concierge</p>
              <p className="text-[10px] text-white/50 leading-tight">Ask or command anything</p>
            </div>
          </button>
        </div>
      )}

      {/* Expandable Glassmorphism Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#0f0f14]/95 text-white rounded-3xl shadow-2xl border border-white/15 backdrop-blur-xl flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#0f6e56] text-white flex items-center justify-center shadow-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Brand AI Concierge</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-white/50">Powered by Llama-3 AI & Web Tools</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="Configure Groq API Key"
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <Key size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Optional Groq Key Config Drawer */}
          {showKeyInput && (
            <form onSubmit={handleSaveKey} className="p-3 bg-white/5 border-b border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white/80">Groq API Key (Optional)</span>
                <span className="text-[10px] text-white/40">Stored locally in browser</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#0f6e56] text-white font-bold text-xs hover:bg-[#0c5945] transition"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Message History Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#0f6e56] text-white rounded-br-none shadow-md"
                      : "bg-white/10 text-white/95 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {m.text}

                  {/* Executed Tool Call Badge */}
                  {m.toolCall && (
                    <div className="mt-2.5 pt-2 border-t border-white/15 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>
                        {m.toolCall.type === "navigate"
                          ? `Navigating to ${m.toolCall.path}`
                          : m.toolCall.type === "add_to_cart"
                          ? `Added ${m.toolCall.productName} (${m.toolCall.size} / ${m.toolCall.color}) to cart`
                          : m.toolCall.type === "configure_3d"
                          ? `Switched 3D model to ${m.toolCall.modelSlug}`
                          : "Executed action"}
                      </span>
                    </div>
                  )}

                  {/* Options Buttons for Clarification */}
                  {m.toolCall?.type === "ask_for_details" && m.toolCall.options && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/15">
                      {m.toolCall.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => handleSend(`${m.toolCall.missingField === "size" ? "Size " : ""}${opt}`)}
                          className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Follow-up Suggestion Chips */}
                {m.suggestions && m.suggestions.length > 0 && m.sender === "agent" && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                    {m.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-white/70 hover:text-white transition flex items-center gap-1"
                      >
                        <span>{sug}</span>
                        <ArrowRight size={10} className="opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 p-3 rounded-2xl w-fit">
                <RefreshCw size={13} className="animate-spin text-emerald-400" />
                <span>AI Concierge is processing tool actions…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-white/10 bg-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-3 py-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or command (e.g. 'Add hoodie size M', 'Take me to privacy')..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-xl bg-[#0f6e56] hover:bg-[#0c5945] disabled:opacity-40 text-white flex items-center justify-center transition shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
