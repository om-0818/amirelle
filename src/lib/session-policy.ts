/** Session cookie and lifetime — the contract tests pin, `server.ts` applies. */

export const SESSION_POLICY = {
  cookieName: "__Host-grok-auth.session_token",
  httpOnly: true,
  secure: true,
  /** Lax so the OAuth callback can land. Strict would drop the session on return. */
  sameSite: "lax" as const,
  path: "/",
  /** 7 civil days. */
  expiresIn: 60 * 60 * 24 * 7,
  /** Refresh the row once a day while the member is active. */
  updateAge: 60 * 60 * 24,
  cookieCacheMaxAge: 300,
} as const;

export function sessionExpired(expiresAt: Date | number | string, now = new Date()): boolean {
  const end = expiresAt instanceof Date ? expiresAt.getTime() : new Date(expiresAt).getTime();
  if (!Number.isFinite(end)) return true;
  return now.getTime() >= end;
}

/** Signed cookie shape Better Auth uses: `value.signature`. Anything else is junk. */
export function sessionTampered(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return true;
  const t = token.trim();
  if (!t) return true;
  const dot = t.lastIndexOf(".");
  if (dot <= 0 || dot === t.length - 1) return true;
  const sig = t.slice(dot + 1);
  if (sig.length < 8) return true;
  if (/[\s<>]/.test(t)) return true;
  return false;
}

export const COOKIE_FLAGS = {
  httpOnly: SESSION_POLICY.httpOnly,
  secure: SESSION_POLICY.secure,
  sameSite: SESSION_POLICY.sameSite,
  path: SESSION_POLICY.path,
} as const;
