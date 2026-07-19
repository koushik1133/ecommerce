"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2, Send, X, Users, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

type Subscriber = { email: string; subscribedAt: string };

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok?: boolean; sent?: number; error?: string } | null>(null);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe");
      const data = await res.json() as { subscribers: Subscriber[] };
      setSubscribers(data.subscribers ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSubscribers(); }, []);

  async function handleDelete(email: string) {
    if (!confirm(`Remove ${email} from subscribers?`)) return;
    setDeletingEmail(email);
    try {
      await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubscribers((prev) => prev.filter((s) => s.email !== email));
    } finally {
      setDeletingEmail(null);
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html: body }),
      });
      const data = await res.json() as { ok?: boolean; sent?: number; error?: string };
      setSendResult(data);
    } catch {
      setSendResult({ error: "Network error. Check server logs." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111]">Subscribers</h1>
          <p className="text-sm text-black/45 mt-0.5">People who signed up for launch updates.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSubscribers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white text-sm font-medium text-black/70 hover:bg-black/5 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => { setShowModal(true); setSendResult(null); }}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f6e56] text-white text-sm font-medium hover:bg-[#0b5a46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
            Send Newsletter
          </button>
        </div>
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0f6e56]/10 flex items-center justify-center">
            <Users size={18} className="text-[#0f6e56]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111]">{subscribers.length}</p>
            <p className="text-xs text-black/45 mt-0.5">Total Subscribers</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111]">
              {subscribers.filter(s => {
                const d = new Date(s.subscribedAt);
                const now = new Date();
                return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </p>
            <p className="text-xs text-black/45 mt-0.5">Last 7 days</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Send size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111]">
              {subscribers.filter(s => {
                const d = new Date(s.subscribedAt);
                const now = new Date();
                return now.getMonth() === d.getMonth() && now.getFullYear() === d.getFullYear();
              }).length}
            </p>
            <p className="text-xs text-black/45 mt-0.5">This month</p>
          </div>
        </div>
      </div>

      {/* Subscriber table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111]">Signed up for updates</h2>
          <span className="text-xs text-black/40">{subscribers.length} total</span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center text-black/30 text-sm">
            Loading…
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Mail size={32} className="text-black/20" />
            <p className="text-sm text-black/40">No subscribers yet.</p>
            <p className="text-xs text-black/30">When someone enters their email in the footer, they'll appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left">
                <th className="px-6 py-3 text-[11px] font-semibold tracking-wide text-black/40 uppercase">Email</th>
                <th className="px-6 py-3 text-[11px] font-semibold tracking-wide text-black/40 uppercase">Signed up</th>
                <th className="px-6 py-3 text-[11px] font-semibold tracking-wide text-black/40 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub, i) => (
                <tr
                  key={sub.email}
                  className={`border-b border-black/5 last:border-0 hover:bg-black/[0.015] transition-colors ${i % 2 === 0 ? "" : ""}`}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0f6e56]/10 flex items-center justify-center text-[10px] font-bold text-[#0f6e56] uppercase">
                        {sub.email[0]}
                      </div>
                      <span className="text-[#111] font-medium">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-black/50">
                    {new Date(sub.subscribedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(sub.email)}
                      disabled={deletingEmail === sub.email}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {deletingEmail === sub.email ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send Newsletter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
              <h3 className="text-base font-bold text-[#111]">Send Newsletter</h3>
              <button onClick={() => setShowModal(false)} className="text-black/30 hover:text-black transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-xs text-black/45">
                This will send an email to all <strong>{subscribers.length}</strong> subscriber{subscribers.length !== 1 ? "s" : ""}.
                Make sure your SMTP credentials are set in <code className="bg-black/5 px-1 rounded">.env.local</code>.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-black/40">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. New drop — limited edition tees are live 🔥"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f6e56] text-[#111]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-black/40">
                  Message Body <span className="normal-case text-black/30">(HTML supported)</span>
                </label>
                <textarea
                  rows={7}
                  placeholder={`<h2>Hey there 👋</h2>\n<p>Our latest drop is live. Check it out at <a href="https://yourbrand.com">yourbrand.com</a></p>`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f6e56] text-[#111] resize-none font-mono"
                />
              </div>

              {sendResult && (
                <div className={`flex items-start gap-3 p-3 rounded-xl text-sm ${sendResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {sendResult.ok
                    ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    : <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  }
                  <span>
                    {sendResult.ok
                      ? `✓ Sent to ${sendResult.sent} subscriber${sendResult.sent !== 1 ? "s" : ""} successfully.`
                      : sendResult.error
                    }
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm border border-black/10 text-black/60 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !body.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0f6e56] text-white text-sm font-medium hover:bg-[#0b5a46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={14} />
                {sending ? "Sending…" : `Send to ${subscribers.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
