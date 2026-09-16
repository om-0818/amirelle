import type { ErrorComponentProps } from "@tanstack/react-router";
import { errorMessage } from "./resilience.ts";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <p className="kicker-brand text-accent">Amirelle</p>
      <h1 className="font-display text-4xl italic">The desk paused</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">{errorMessage(error)}</p>
      <button
        type="button"
        className="mt-2 min-h-11 rounded-full border border-border px-5 text-sm"
        onClick={() => {
          try {
            window.location.reload();
          } catch {
            /* ignore */
          }
        }}
      >
        Try again
      </button>
    </main>
  );
}
