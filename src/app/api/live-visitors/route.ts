import { NextRequest, NextResponse } from "next/server";
import { getRealSessions, getRealEvents, recordHeartbeat } from "@/lib/real-telemetry";

export async function GET() {
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
  try {
    const body = await req.json().catch(() => ({}));
    const session = recordHeartbeat(req, body);

    return NextResponse.json({
      success: true,
      session,
      activeCount: getRealSessions().length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
