import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const SECRET_ENV_KEYS = [
  "XAI_API_KEY",
  "BETTER_AUTH_SECRET",
  "DATABASE_URL",
  "GROK_CONNECTOR_ACCESS_TOKEN",
  "GROK_AUTH_CLIENT_SECRET",
];

export const CLIENT_BUNDLE_ROOTS = [
  ".vercel/output/static",
  ".output/public",
  "dist/client",
];

const TOKEN_RE = [
  /xai-[A-Za-z0-9_-]{24,}/g,
  /postgres(?:ql)?:\/\/[^\s"'\\]{12,}/gi,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(js|mjs|cjs|css|html|map)$/.test(name)) acc.push(p);
  }
  return acc;
}

export function clientAssetFiles(cwd = process.cwd()) {
  return CLIENT_BUNDLE_ROOTS.flatMap((r) => walk(join(cwd, r)));
}

export function liveSecretValues() {
  return SECRET_ENV_KEYS.map((key) => {
    const value = process.env[key]?.trim() ?? "";
    return value.length >= 8 ? { key, value } : null;
  }).filter(Boolean);
}

export function scanClientBundle(cwd = process.cwd()) {
  const files = clientAssetFiles(cwd);
  const leaks = [];
  const secrets = liveSecretValues();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const { key } of secrets) {
      if (text.includes(secrets.find((s) => s.key === key).value)) {
        leaks.push({ file, kind: key });
      }
    }
    for (const re of TOKEN_RE) {
      re.lastIndex = 0;
      if (re.test(text)) leaks.push({ file, kind: String(re) });
    }
  }
  return { files, leaks };
}
