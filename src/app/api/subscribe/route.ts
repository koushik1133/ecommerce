import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

// POST /api/subscribe — add a new subscriber
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string };
  const email = (body.email ?? "").toLowerCase().trim();

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
}

// GET /api/subscribe — return all subscribers (admin use)
export async function GET() {
  const list = readSubscribers();
  return NextResponse.json({ subscribers: list });
}

// DELETE /api/subscribe — remove subscriber by email (body: { email })
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string };
  const email = (body.email ?? "").toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Email required." }, { status: 400 });
  }
  let list = readSubscribers();
  const before = list.length;
  list = list.filter((s) => s.email !== email);
  if (list.length === before) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  writeSubscribers(list);
  return NextResponse.json({ ok: true });
}
