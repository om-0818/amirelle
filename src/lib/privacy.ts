/**
 * Digital closet privacy — house rules.
 *
 * Google Photos Wardrobe (2026) scans a library you did not open for that purpose.
 * Smart Closet lost years of paid backups. Acloset paywalls after you uploaded labour.
 *
 * Amirelle files what you bring. It does not walk a camera roll. Photos from
 * "Your photos" stay as data URLs in this browser. The stylist is sent names,
 * not pictures.
 */

export const STORAGE_KEYS = {
  user: "amirelle_user_v1",
  hidden: "amirelle_hidden_v1",
  history: "amirelle_history_v2",
  meta: "amirelle_meta_v4",
  taste: "amirelle_taste_v1",
  wears: "amirelle_wears_v1",
  ledger: "amirelle_ledger_v1",
  pins: "amirelle_pins_v1",
  birth: "amirelle_birth_date",
  gender: "amirelle_gender",
  light: "amirelle_light",
  schema: "amirelle_schema",
} as const;

export const LOCAL_ONLY = [
  "Photos you brought (camera roll / Google Photos picker) — data URLs, this browser",
  "Pieces you added or hid on the house rail",
  "Wear counts, cost-per-wear, skip/hold taste",
  "Looks you logged",
  "Theme",
] as const;

export const ACCOUNT_ONLY = [
  "Email, for the member door",
  "Birth date, who we dress, city — so the rail follows you on another device",
] as const;

export const NEVER = [
  "A scan of your Google Photos library",
  "A face used to train a model",
  "The house catalog of 15,000 pieces — that is ours, not stored as yours",
  "Photos sent to the stylist sitting (ids, names, houses, colours only)",
] as const;

export function leavesDeviceForGrill(wardrobeLine: string) {
  return !/https?:|data:image/i.test(wardrobeLine);
}

export const STORAGE_KEY_LINES: { key: string; line: string }[] = [
  { key: STORAGE_KEYS.user, line: "Your pieces and photos — data URLs, this browser" },
  { key: STORAGE_KEYS.hidden, line: "House pieces you hid" },
  { key: STORAGE_KEYS.history, line: "Looks you logged" },
  { key: STORAGE_KEYS.meta, line: "Onboarding, streak, sittings — local copy" },
  { key: STORAGE_KEYS.taste, line: "Holds / Almost / Not this" },
  { key: STORAGE_KEYS.wears, line: "Wear counts and cost-per-wear" },
  { key: STORAGE_KEYS.ledger, line: "Wear ledger — item, date, occasion, outcome. Append-only." },
  { key: STORAGE_KEYS.pins, line: "Pieces held for the next look" },
  { key: STORAGE_KEYS.birth, line: "Birth date (also on the account)" },
  { key: STORAGE_KEYS.gender, line: "Who we dress (also on the account)" },
  { key: STORAGE_KEYS.light, line: "Light or dark" },
  { key: STORAGE_KEYS.schema, line: "Local schema version — so a release cannot eat the closet" },
];

export const ACCOUNT_FIELDS = ["email", "birth", "gender", "city"] as const;

export type AccountPayload = { [K in (typeof ACCOUNT_FIELDS)[number]]: string };

export function accountPayload(input: Record<string, unknown>): AccountPayload {
  return {
    email: typeof input.email === "string" ? input.email : "",
    birth: typeof input.birth === "string" ? input.birth : "",
    gender: typeof input.gender === "string" ? input.gender : "",
    city: typeof input.city === "string" ? input.city : "",
  };
}

export function exportLocalData(
  read: (key: string) => string,
  extras: { email?: string; city?: string } = {},
): {
  exportedAt: string;
  local: Record<string, unknown>;
  account: AccountPayload;
} {
  const local: Record<string, unknown> = {};
  for (const name of Object.keys(STORAGE_KEYS) as (keyof typeof STORAGE_KEYS)[]) {
    const raw = read(STORAGE_KEYS[name]);
    if (!raw) {
      local[name] = null;
      continue;
    }
    try {
      local[name] = JSON.parse(raw);
    } catch {
      local[name] = raw;
    }
  }
  const meta = (local.meta ?? {}) as Record<string, unknown>;
  return {
    exportedAt: new Date().toISOString(),
    local,
    account: accountPayload({
      email: extras.email ?? "",
      birth: typeof meta.birthDate === "string" ? meta.birthDate : String(local.birth ?? ""),
      gender: typeof meta.gender === "string" ? meta.gender : String(local.gender ?? ""),
      city: extras.city ?? "",
    }),
  };
}

export function clearAllLocal(remove: (key: string) => void) {
  for (const key of Object.values(STORAGE_KEYS)) remove(key);
}
