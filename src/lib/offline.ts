/** Web push is scaffolded and off. Closet never leaves this device. */
export const PUSH_ENABLED = false as const;

export function registerOffline() {
  if (typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function registerPush(): Promise<null> {
  if (!PUSH_ENABLED) return null;
  return null;
}
