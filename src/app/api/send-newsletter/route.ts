import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
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

export async function POST(req: NextRequest) {
  // Enforce strict rate limit for sending newsletters (max 5 per minute)
  const rateLimit = checkRateLimit(req, 5, 60000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many newsletter broadcast requests. Please wait." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      subject?: string;
      html?: string;
    };

    const subject = sanitizeInput(body.subject ?? "");
    const html = (body.html ?? "").trim();

    if (!subject || !html) {
      return NextResponse.json({ error: "subject and html parameters are required." }, { status: 400 });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return NextResponse.json(
        { error: "SMTP credentials not configured. Please set SMTP parameters in environment variables." },
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
      return NextResponse.json({ ok: true, sent: 0, message: "No subscribers found." });
    }

    const from = SMTP_FROM ?? SMTP_USER;
    let sent = 0;

    for (const sub of subscribers) {
      try {
        await transporter.sendMail({
          from: `"Brand Studio" <${from}>`,
          to: sub.email,
          subject,
          html,
        });
        sent++;
      } catch {
        // Fail securely without exposing internal recipient context or SMTP logs
      }
    }

    return NextResponse.json({ ok: true, sent, total: subscribers.length });
  } catch {
    return NextResponse.json({ error: "Failed to process newsletter dispatch securely." }, { status: 500 });
  }
}
