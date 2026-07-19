import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    subject?: string;
    html?: string;
  };

  const subject = (body.subject ?? "").trim();
  const html = (body.html ?? "").trim();

  if (!subject || !html) {
    return NextResponse.json({ error: "subject and html are required." }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json(
      { error: "SMTP credentials not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env.local" },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const subscribers = readSubscribers();

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No subscribers yet." });
  }

  const from = SMTP_FROM ?? SMTP_USER;
  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from,
        to: sub.email,
        subject,
        html,
      });
      sent++;
    } catch (err) {
      errors.push(`${sub.email}: ${String(err)}`);
    }
  }

  return NextResponse.json({ ok: true, sent, total: subscribers.length, errors });
}
