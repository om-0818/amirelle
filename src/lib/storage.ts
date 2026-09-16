const mem: Record<string, string> = {};

function canUseLs(): boolean {
  try {
    const t = "__amirelle_t";
    localStorage.setItem(t, "1");
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

export const persistOk = typeof window !== "undefined" && canUseLs();

export function isQuotaError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { name?: string; code?: number };
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014
  );
}

export const store = {
  get(key: string, fallback: string): string {
    try {
      if (persistOk) {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v;
      }
    } catch {
      /* sandboxed */
    }
    return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key]! : fallback;
  },
  set(key: string, value: string): boolean {
    try {
      if (persistOk) localStorage.setItem(key, value);
      mem[key] = value;
      return true;
    } catch (e) {
      if (isQuotaError(e)) return false;
      mem[key] = value;
      return !persistOk;
    }
  },
  remove(key: string) {
    try {
      if (persistOk) localStorage.removeItem(key);
    } catch {
      /* sandboxed */
    }
    delete mem[key];
  },
};
