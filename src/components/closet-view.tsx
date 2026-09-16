import { Plus, Search, Upload } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PiecePhoto } from "@/components/piece";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { forYou } from "@/lib/sample-closet";
import { chrome } from "@/lib/copy";
import { fashionPulse, sortBySeason } from "@/lib/fashion-clock";
import { costPerWear, formatCpw, sortByCpw, wardrobeMetrics } from "@/lib/habit";
import { ROLL_FREE, ROLL_MEMBER } from "@/lib/membership";
import { closetEmpty, EMPTY_CLOSET } from "@/lib/resilience";
import { fileToRailPhoto } from "@/lib/photos";
import { CATEGORIES, HOUSES, inr, type Category, type Cloth, type Wearer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCloset } from "@/store/closet";

const PAGE = 24;

export function ClosetView() {
  const allClothes = useCloset((s) => s.clothes);
  const ageBand = useCloset((s) => s.meta.ageBand);
  const gender = useCloset((s) => s.meta.gender);
  const labels = chrome();
  const clothes = useMemo(() => {
    const pulse = fashionPulse(ageBand);
    return sortBySeason(forYou(allClothes, ageBand, gender), pulse);
  }, [allClothes, ageBand, gender]);
  const brands = useMemo(
    () => [...new Set(clothes.map((c) => c.brand).filter(Boolean))] as string[],
    [clothes],
  );
  const cat = useCloset((s) => s.cat);
  const brand = useCloset((s) => s.brand);
  const house = useCloset((s) => s.house);
  const pinned = useCloset((s) => s.pinned);
  const setCat = useCloset((s) => s.setCat);
  const setBrand = useCloset((s) => s.setBrand);
  const setHouse = useCloset((s) => s.setHouse);
  const togglePin = useCloset((s) => s.togglePin);
  const removeCloth = useCloset((s) => s.removeCloth);
  const addCloth = useCloset((s) => s.addCloth);
  const addMany = useCloset((s) => s.addMany);
  const updateCloth = useCloset((s) => s.updateCloth);
  const setScreen = useCloset((s) => s.setScreen);
  const wearCounts = useCloset((s) => s.wearCounts);
  const search = useCloset((s) => s.query);
  const setSearch = useCloset((s) => s.setQuery);

  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Cloth | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [sort, setSort] = useState<"rail" | "quiet" | "cpw">("rail");
  const deferred = useDeferredValue(search);
  const plan = useCloset((s) => s.meta.plan);
  const metrics = useMemo(() => wardrobeMetrics(clothes, wearCounts), [clothes, wearCounts]);

  const filtered = useMemo(() => {
    const q = deferred.toLowerCase().trim();
    let list = clothes.filter((c) => {
      if (cat !== "all" && c.cat !== cat) return false;
      if (brand !== "all" && c.brand !== brand) return false;
      if (house !== "all" && c.house !== house) return false;
      if (sort === "quiet" && (wearCounts[c.id] ?? 0) > 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.color.toLowerCase().includes(q) ||
        (c.brand ?? "").toLowerCase().includes(q)
      );
    });
    if (sort === "cpw") list = sortByCpw(list, wearCounts);
    return list;
  }, [clothes, cat, brand, house, deferred, sort, wearCounts]);

  useEffect(() => {
    setShown(PAGE);
  }, [cat, brand, house, deferred, sort]);

  const visible = filtered.slice(0, shown);

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl italic leading-none">{labels.closet}</h2>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} of {clothes.length} ·{" "}
            {metrics.avgCpw != null
              ? `avg ${formatCpw(metrics.avgCpw)} a wear`
              : "log a wear to open cost"}{" "}
            · {metrics.quiet} quiet
          </p>
        </div>
        <div className="flex gap-2">
          <label className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-border bg-card px-3 text-xs">
            <Upload className="mr-1.5 size-3.5" />
            Your photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                e.target.value = "";
                if (!files.length) return;
                const rollCap = plan === "atelier" ? ROLL_MEMBER : ROLL_FREE;
                const already = allClothes.filter((c) => c.from === "roll").length;
                const room = Math.max(0, rollCap - already);
                const take = files.slice(0, room);
                if (!take.length) {
                  toast(`The roll is full · ${rollCap} photos on this plan.`);
                  return;
                }
                void (async () => {
                  const wearer: Wearer =
                    gender === "femme" ? "femme" : gender === "masc" ? "masc" : "uni";
                  const items: Cloth[] = [];
                  for (let i = 0; i < take.length; i++) {
                    try {
                      const photo = await fileToRailPhoto(take[i]);
                      items.push({
                        id: Date.now() + i,
                        name: take[i].name.replace(/\.[^.]+$/, "") || "From your photos",
                        cat: "tops",
                        color: "mixed",
                        photo,
                        brand: "Yours",
                        house: "high",
                        wearer,
                        from: "roll",
                        gens: ["alpha", "teen", "z", "zlate", "mill", "x", "prime"],
                      });
                    } catch {
                      toast("That file is not a photo we can file.");
                    }
                  }
                  const filed = addMany(items);
                  if (filed) {
                    toast(filed);
                    return;
                  }
                  toast(
                    `${items.length} from your photos — on this device, not a library scan.${
                      files.length > take.length ? ` ${files.length - take.length} left at the cap.` : ""
                    }`,
                  );
                })().catch(() => toast("Could not read those photos."));
              }}
            />
          </label>
          <Button variant="secondary" size="sm" onClick={() => setBulkOpen(true)}>
            Bulk
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setAddOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </header>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brand, piece, colour"
          className="h-11 pl-9"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      <div className="mb-3 flex gap-2">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
          aria-label="Brand"
        >
          <option value="all">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          value={house}
          onChange={(e) => setHouse(e.target.value as typeof house)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
          aria-label="Line"
        >
          {HOUSES.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn(
              "min-h-9 rounded-full border px-3 text-xs",
              cat === c.id
                ? "border-accent bg-accent text-accent-fg"
                : "border-border bg-card text-muted",
            )}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSort((s) => (s === "quiet" ? "rail" : "quiet"))}
          className={cn(
            "min-h-9 rounded-full border px-3 text-xs",
            sort === "quiet" ? "border-fg bg-fg text-bg" : "border-border bg-card text-muted",
          )}
        >
          Quiet
        </button>
        <button
          type="button"
          onClick={() => setSort((s) => (s === "cpw" ? "rail" : "cpw"))}
          className={cn(
            "min-h-9 rounded-full border px-3 text-xs",
            sort === "cpw" ? "border-fg bg-fg text-bg" : "border-border bg-card text-muted",
          )}
        >
          Cost a wear
        </button>
      </div>

      {closetEmpty(clothes.length, filtered.length) !== "ok" ? (
        <div className="border border-dashed border-border py-16 text-center">
          <p className="font-display text-2xl italic">
            {closetEmpty(clothes.length, filtered.length) === "none" ? "The closet is empty" : "Nothing on this rail"}
          </p>
          <p className="mt-2 text-sm text-muted">{EMPTY_CLOSET}</p>
          <div className="mt-4 flex justify-center gap-2">
            {closetEmpty(clothes.length, filtered.length) === "filter" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setBrand("all");
                  setHouse("all");
                  setCat("all");
                  setSort("rail");
                }}
              >
                Reset filters
              </Button>
            ) : (
              <Button onClick={() => { setEditing(null); setAddOpen(true); }}>Add a piece</Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((c) => (
              <article key={c.id} className="cv-auto">
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => togglePin(c.id)}
                >
                  <div
                    className={cn(
                      "relative aspect-[3/4] overflow-hidden bg-card",
                      pinned.includes(c.id) ? "ring-2 ring-accent" : "",
                    )}
                  >
                    <PiecePhoto cloth={c} className="object-cover" />
                    <span className="absolute left-2 top-2 bg-bg/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]">
                      {c.brand}
                    </span>
                    {pinned.includes(c.id) && (
                      <span className="absolute bottom-2 left-2 bg-accent px-2 py-0.5 text-[10px] uppercase text-accent-fg">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-[11px] uppercase tracking-[0.14em] text-muted">
                    {c.brand}
                  </p>
                  <p className="truncate text-sm">{c.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <span
                      className="size-2 rounded-full border border-border"
                      style={{ background: c.color }}
                    />
                    {c.price ? inr(c.price) : c.color}
                    {(wearCounts[c.id] ?? 0) > 0
                      ? ` · ${wearCounts[c.id]} wear${wearCounts[c.id] === 1 ? "" : "s"}`
                      : " · quiet"}
                    {costPerWear(c.price, wearCounts[c.id] ?? 0)
                      ? ` · ${formatCpw(costPerWear(c.price, wearCounts[c.id] ?? 0)!)} a wear`
                      : ""}
                  </p>
                </button>
                <div className="mt-1 flex min-h-9 items-center gap-3 text-xs text-muted">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c);
                      setAddOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCloth(c.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          {shown < filtered.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => setShown((n) => n + PAGE)}>
                Load more · {filtered.length - shown} left
              </Button>
            </div>
          )}
        </>
      )}

      {pinned.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto flex max-w-md justify-center px-4">
          <Button size="lg" className="w-full" onClick={() => setScreen("style")}>
            {labels.styleVerb} {pinned.length} pinned
          </Button>
        </div>
      )}

      {addOpen && (
        <ClothForm
          initial={editing}
          onClose={() => setAddOpen(false)}
          onSave={(cloth) => {
            const err = editing ? updateCloth({ ...cloth, from: "roll" }) : addCloth({ ...cloth, from: "roll" });
            if (err) {
              toast(err);
              return;
            }
            setAddOpen(false);
            toast(editing ? "Updated" : "Added");
          }}
        />
      )}
      {bulkOpen && (
        <BulkForm
          onClose={() => setBulkOpen(false)}
          onSave={(items) => {
            const err = addMany(items.map((c) => ({ ...c, from: "roll" as const })));
            if (err) {
              toast(err);
              return;
            }
            setBulkOpen(false);
            toast(`Added ${items.length}`);
          }}
        />
      )}
    </div>
  );
}


function ClothForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Cloth | null;
  onClose: () => void;
  onSave: (c: Cloth) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [cat, setCat] = useState<Category>(initial?.cat ?? "tops");
  const [color, setColor] = useState(initial?.color ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);

  async function onFile(file: File) {
    try {
      const data = await fileToRailPhoto(file);
      setPhoto(data);
    } catch {
      toast("That photo could not be read. Try another.");
    }
  }

  return (
    <Modal onClose={onClose} title={initial ? "Edit piece" : "Add to closet"}>
      <Label>Name</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="White floral kurta" autoFocus />
      <div className="mt-3">
        <Label>Category</Label>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as Category)}
          className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
        >
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        <Label>Colour</Label>
        <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Dusty pink" />
      </div>
      <div className="mt-3">
        <Label>Photo</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-8 text-muted hover:border-accent">
          <Upload className="mb-2 size-5" />
          <span className="text-sm">Tap to upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
          {photo && (
            <img
              src={photo}
              alt=""
              width={800}
              height={1066}
              className="mt-3 h-32 w-full rounded-lg object-cover"
              style={{ aspectRatio: "3 / 4" }}
              loading="lazy"
              decoding="async"
            />
          )}
        </label>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (!name.trim()) {
              toast("Give it a name");
              return;
            }
            onSave({
              id: initial?.id ?? Date.now(),
              name: name.trim(),
              cat,
              color: color.trim(),
              photo,
              brand: initial?.brand,
              from: "roll",
            });
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

function BulkForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (items: Cloth[]) => void;
}) {
  const [text, setText] = useState("");
  return (
    <Modal onClose={onClose} title="Bulk add">
      <p className="mb-3 text-sm leading-relaxed text-muted">
        One piece per line. Format{" "}
        <span className="font-medium text-fg">Name | category | colour</span>.
        Category and colour are optional.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`White floral kurta | tops | white\nBlue denim jeans | bottoms | blue\nBlack sneakers | shoes`}
      />
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            const items = parseBulk(text);
            if (!items.length) {
              toast("Paste at least one piece");
              return;
            }
            onSave(items);
          }}
        >
          Add all
        </Button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fg/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 font-display text-2xl italic">{title}</h3>
        {children}
      </div>
    </div>
  );
}

const VALID: Category[] = [
  "tops",
  "bottoms",
  "dresses",
  "shoes",
  "accessories",
  "outerwear",
];

function guessCat(raw: string): Category {
  const c = raw.toLowerCase();
  if (/(top|shirt|kurta|blouse|tee|polo)/.test(c)) return "tops";
  if (/(bottom|jean|pant|trouser|skirt|short|jogger|cargo)/.test(c)) return "bottoms";
  if (/(dress|gown|saree|lehenga)/.test(c)) return "dresses";
  if (/(shoe|sneaker|heel|sandal|boot|loafer)/.test(c)) return "shoes";
  if (/(accessor|earring|necklace|bag|belt|watch|scarf|cap|tote)/.test(c))
    return "accessories";
  if (/(outer|jacket|coat|blazer|hoodie|sweater|trench|bomber)/.test(c))
    return "outerwear";
  return VALID.includes(c as Category) ? (c as Category) : "tops";
}

function parseBulk(raw: string): Cloth[] {
  const items: Cloth[] = [];
  raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      let parts = line.split("|").map((p) => p.trim());
      if (parts.length === 1) parts = line.split(",").map((p) => p.trim());
      const name = parts[0];
      if (!name) return;
      items.push({
        id: Date.now() + i + Math.random(),
        name,
        cat: guessCat(parts[1] || "tops"),
        color: parts[2] || "",
        photo: null,
      });
    });
  return items;
}
