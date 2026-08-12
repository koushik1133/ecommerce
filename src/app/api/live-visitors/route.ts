import { NextRequest, NextResponse } from "next/server";
import { getRealSessions, getRealEvents, recordHeartbeat } from "@/lib/real-telemetry";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 120, 60000); // 120 reqs/min
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  const sessions = getRealSessions();
  const events = getRealEvents();

  return NextResponse.json(
    {
      success: true,
      sessions,
      events,
      activeCount: sessions.length,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 120, 60000); // 120 reqs/min for heartbeats
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  try {
    const rawBody = await req.json().catch(() => ({}));

    // Sanitize input strings against XSS / Script injection
    const sanitizedBody = {
      sessionId: sanitizeInput(rawBody.sessionId),
      page: sanitizeInput(rawBody.page),
      pageTitle: sanitizeInput(rawBody.pageTitle),
      activeGarment: sanitizeInput(rawBody.activeGarment),
      action: sanitizeInput(rawBody.action),
      eventType: sanitizeInput(rawBody.eventType),
      eventDescription: sanitizeInput(rawBody.eventDescription),
      cartCount: typeof rawBody.cartCount === "number" ? Math.max(0, rawBody.cartCount) : 0,
      cartTotal: typeof rawBody.cartTotal === "number" ? Math.max(0, rawBody.cartTotal) : 0,
    };

    const session = recordHeartbeat(req, sanitizedBody);

    return NextResponse.json({
      success: true,
      session,
      activeCount: getRealSessions().length,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid payload format" }, { status: 400 });
  }
}
