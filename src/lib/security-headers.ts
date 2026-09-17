/** Security headers.
 *
 * Start writes a per-request inline `$_TSR` bootstrap (the payload includes a
 * timestamp, so a hash cannot be pinned). That script must run or the desk
 * hydrates into a black error. `'unsafe-inline'` is allowed on script and
 * style for that reason only — still no `'unsafe-eval'`.
 */

export type HeaderKind = "prod" | "preview";

/** Popup completion HTML hashes — kept in lockstep by security-headers.test.ts. */
export const POPUP_SCRIPT_SHA = [
  "sha256-eaAWbVomu8h23iXCnb0wArv1pYShQLPKGYXW5/J89aI=",
  "sha256-XuoQJQxbKsFrqVTOj/VchBH5ltkge+0i1/mYZtbCzkA=",
];
export const POPUP_STYLE_SHA = [
  "sha256-bp/ZI40hpEtiVkMuuLbERg3MnfYmvn39qa1lDQ5XQbE=",
  "sha256-7FfDaRZOpJfTCBDCtK6jFZJQ2LFr08+7hVP1ZVk5T6Y=",
];

export function contentSecurityPolicy(kind: HeaderKind): string {
  const frame =
    kind === "prod"
      ? "frame-ancestors 'none'"
      : "frame-ancestors https://grok.com https://*.grok.com";
  return [
    "default-src 'self'",
    "script-src 'self' https://grok.com 'unsafe-inline'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "style-src-elem 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "connect-src 'self' https://grok.com wss: ws:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "worker-src 'self'",
    frame,
    ...(kind === "prod" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function securityHeaders(kind: HeaderKind): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Security-Policy": contentSecurityPolicy(kind),
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  };
  if (kind === "prod") {
    headers["X-Frame-Options"] = "DENY";
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }
  return headers;
}

export function applySecurityHeaders(target: { setHeader(name: string, value: string): void }, kind: HeaderKind) {
  for (const [name, value] of Object.entries(securityHeaders(kind))) {
    target.setHeader(name, value);
  }
}
