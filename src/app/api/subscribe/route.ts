import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

const DATA_FILE = path.join(process.cwd(), "data", "subscribers.json");

type Subscriber = { email: string; subscribedAt: string };

function readSubscribers(): Subscriber[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Subscriber[];
  } catch {
    return [];
  }
}

function writeSubscribers(list: Subscriber[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// POST /api/subscribe — add a new subscriber with rate limiting & sanitization
export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 10, 60000); // 10 subscriptions/min limit per IP
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const rawEmail = (body.email ?? "").toLowerCase().trim();
    const email = sanitizeInput(rawEmail);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const list = readSubscribers();
    if (list.some((s) => s.email === email)) {
      return NextResponse.json({ error: "Already subscribed." }, { status: 409 });
    }

    list.push({ email, subscribedAt: new Date().toISOString() });
    writeSubscribers(list);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to process subscription request." }, { status: 400 });
  }
}

// GET /api/subscribe — return all subscribers
export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 30, 60000);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const list = readSubscribers();
  return NextResponse.json({ subscribers: list });
}

// DELETE /api/subscribe — remove subscriber by email
export async function DELETE(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 20, 60000);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const email = sanitizeInput((body.email ?? "").toLowerCase().trim());

    if (!email) {
      return NextResponse.json({ error: "Email parameter required." }, { status: 400 });
    }

    let list = readSubscribers();
    list = list.filter((s) => s.email !== email);
    writeSubscribers(list);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete subscriber." }, { status: 400 });
  }
}
