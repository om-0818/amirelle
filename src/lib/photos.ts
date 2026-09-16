export const PHOTO_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
/** Stored jpeg ceiling after downscale. Camera originals may be larger inbound. */
export const STORE_PHOTO_MAX = 350 * 1024;
export const MAX_PHOTO_EDGE = 8192;
export const JPEG_QUALITIES = [0.72, 0.58, 0.44, 0.32, 0.2] as const;

const DATA_URL =
  /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i;

export type PhotoGate = { ok: true; mime: string; bytes: number } | { ok: false; reason: string };

function normMime(raw: string) {
  const m = raw.toLowerCase();
  return m === "image/jpg" ? "image/jpeg" : m;
}

function magicOk(b: Uint8Array, mime: string): boolean {
  if (b.length < 12) return false;
  if (mime === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (mime === "image/png") return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (mime === "image/webp") {
    return b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  }
  return false;
}

export function inspectDataUrl(url: string | null | undefined): PhotoGate {
  if (!url || typeof url !== "string") return { ok: false, reason: "empty" };
  if (url.length > MAX_PHOTO_BYTES * 1.4 + 40) return { ok: false, reason: "too large" };
  const m = DATA_URL.exec(url.trim());
  if (!m) return { ok: false, reason: "not an allowed image" };
  const mime = normMime(m[1]);
  const b64 = m[2];
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > MAX_PHOTO_BYTES) return { ok: false, reason: "too large" };
  let bin: Uint8Array;
  try {
    bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return { ok: false, reason: "could not decode" };
  }
  if (!magicOk(bin, mime)) return { ok: false, reason: "could not decode" };
  return { ok: true, mime, bytes };
}

export function inspectFile(file: { type: string; size: number }): PhotoGate {
  const mime = normMime(file.type || "");
  if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp") {
    return { ok: false, reason: "not an allowed image" };
  }
  if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) return { ok: false, reason: "too large" };
  return { ok: true, mime, bytes: file.size };
}

export function fitsStore(url: string, max = STORE_PHOTO_MAX): boolean {
  const g = inspectDataUrl(url);
  return g.ok && g.bytes <= max;
}

/** Re-encode jpeg, stepping quality down until it sits under the store ceiling. */
export function encodeDown(
  toDataURL: (type: string, quality: number) => string,
  max = STORE_PHOTO_MAX,
): string {
  let last = "";
  for (const q of JPEG_QUALITIES) {
    last = toDataURL("image/jpeg", q);
    if (fitsStore(last, max)) return last;
  }
  throw new Error("too large");
}

/** Cover-crop a camera-roll photo into the same 3:4 rail frame. */
export function fileToRailPhoto(file: File): Promise<string> {
  const gate = inspectFile(file);
  if (!gate.ok) return Promise.reject(new Error(gate.reason));
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const w0 = img.naturalWidth || img.width;
      const h0 = img.naturalHeight || img.height;
      if (!w0 || !h0 || w0 > MAX_PHOTO_EDGE || h0 > MAX_PHOTO_EDGE) {
        URL.revokeObjectURL(url);
        reject(new Error("could not decode"));
        return;
      }
      const canvas = document.createElement("canvas");
      const W = 800;
      const H = 1066;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      const scale = Math.max(W / w0, H / h0);
      const w = w0 * scale;
      const h = h0 * scale;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      URL.revokeObjectURL(url);
      try {
        resolve(encodeDown((type, q) => canvas.toDataURL(type, q)));
      } catch (e) {
        reject(e instanceof Error ? e : new Error("too large"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not decode"));
    };
    img.src = url;
  });
}
