/** Client-side upload guards for logos, backgrounds, and spin frames. */

export const UPLOAD_LIMITS = {
  maxBytes: 5 * 1024 * 1024, // 5 MB
  maxDataUrlChars: 7 * 1024 * 1024, // ~5MB binary as base64 + header
  maxSpinFrames: 72,
  allowedMime: new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ]),
} as const;

export type UploadError =
  | "type"
  | "size"
  | "too-many"
  | "empty"
  | "unsafe";

const SVG_DANGER =
  /<script|on\w+\s*=|javascript:|data:text\/html|<foreignObject/i;

export function validateImageFile(file: File): UploadError | null {
  if (!file || file.size <= 0) return "empty";
  if (!UPLOAD_LIMITS.allowedMime.has(file.type)) return "type";
  if (file.size > UPLOAD_LIMITS.maxBytes) return "size";
  return null;
}

/** Extra checks after reading file contents (SVG XSS, oversized data URLs). */
export async function validateImageContents(file: File): Promise<UploadError | null> {
  const basic = validateImageFile(file);
  if (basic) return basic;

  if (file.type === "image/svg+xml") {
    const text = await file.text();
    if (SVG_DANGER.test(text)) return "unsafe";
    // Reject absurdly large SVG markup
    if (text.length > 512 * 1024) return "size";
  }

  return null;
}

export function uploadErrorMessage(error: UploadError): string {
  switch (error) {
    case "type":
      return "Only PNG, JPG, WebP, or SVG images are allowed.";
    case "size":
      return "Each file must be under 5 MB.";
    case "too-many":
      return `You can upload up to ${UPLOAD_LIMITS.maxSpinFrames} spin frames.`;
    case "empty":
      return "That file looks empty. Try another image.";
    case "unsafe":
      return "That SVG looks unsafe. Export as PNG/JPG instead.";
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      if (!result.startsWith("data:image/")) {
        reject(new Error("Invalid image data"));
        return;
      }
      if (result.length > UPLOAD_LIMITS.maxDataUrlChars) {
        reject(new Error("Image too large after encoding"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
