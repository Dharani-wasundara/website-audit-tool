/** Normalize and validate an http(s) URL for API routes. */
export function assertHttpUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("URL must use http:// or https://");
  }
  return u.href;
}
