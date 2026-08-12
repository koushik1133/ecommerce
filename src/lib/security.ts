import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiting store: ip -> { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Enforces sliding-window rate limiting per IP address.
 * Defaults to 60 requests per minute per IP.
 */
export function checkRateLimit(
  req: NextRequest,
  limit: number = 60,
  windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  const ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: Math.ceil((now + windowMs) / 1000) };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: Math.ceil(entry.resetAt / 1000) };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, reset: Math.ceil(entry.resetAt / 1000) };
}

/**
 * Sanitizes input strings to prevent Cross-Site Scripting (XSS) attacks.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

/**
 * Validates whether an outbound URL is safe to prevent SSRF (Server-Side Request Forgery).
 */
export function isSafeOutboundUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Only allow http and https protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    // Block localhost and internal IP ranges (RFC 1918 & Cloud Metadata)
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Creates standard HTTP security headers for Next.js responses.
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self';"
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return res;
}
