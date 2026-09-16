import { securityHeaders, type HeaderKind } from "../../src/lib/security-headers";

type Event = {
  url: URL;
  req: { method?: string; headers: Headers };
};

export default async function securityMiddleware(
  event: Event,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const kind: HeaderKind = process.env.VERCEL ? "prod" : "preview";
  const extra = securityHeaders(kind);
  const result = await next();
  if (result instanceof Response) {
    const headers = new Headers(result.headers);
    for (const [name, value] of Object.entries(extra)) headers.set(name, value);
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers,
    });
  }
  return result;
}
