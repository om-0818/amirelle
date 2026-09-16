import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ACCOUNT_ONLY, NEVER, STORAGE_KEY_LINES, exportLocalData } from "@/lib/privacy";
import { store } from "@/lib/storage";
import { useCloset } from "@/store/closet";

export function PrivacyView() {
  const wipePersonal = useCloset((s) => s.wipePersonal);
  const roll = useCloset((s) => s.clothes.filter((c) => c.from === "roll").length);

  function exportRail() {
    const state = useCloset.getState();
    const payload = exportLocalData((k) => store.get(k, ""), {
      city: state.city,
      email: "",
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amirelle-rail.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Your rail, as a file. The house catalog is not in it.");
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 pb-20">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">The desk</p>
      <h2 className="mt-2 font-display text-3xl italic leading-tight">What never leaves</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Google will scan a library you did not open for that purpose. We file what you bring.{" "}
        {roll} photo{roll === 1 ? "" : "s"} from your roll sit in this browser.
      </p>

      <section className="mt-10">
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted">On this device</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {STORAGE_KEY_LINES.map((row) => (
            <li key={row.key}>{row.line}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted">On the account</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {ACCOUNT_ONLY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted">Never</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {NEVER.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={exportRail}>
          Export your rail
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            wipePersonal();
            toast("Everything this browser held is gone. The house rail stays.");
          }}
        >
          Wipe what is yours
        </Button>
      </div>
    </div>
  );
}
