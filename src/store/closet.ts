import { create } from "zustand";
import { SAMPLE_CLOSET } from "@/lib/sample-closet";
import { store } from "@/lib/storage";
import type { AgeBand, Category, Cloth, Gender, HistoryEntry, House, Meta, Plan, WeatherTheme } from "@/lib/types";
import { generationFromBirthDate, modeFromGeneration, BIRTH_KEY, applyLifetime } from "@/lib/generations";
import { LOOKBOOK_FREE, LOOKBOOK_MEMBER } from "@/lib/membership";
import { EMPTY_TASTE, nextStreak, type Taste } from "@/lib/habit";
import { formatCivilIST } from "@/lib/clock";
import { STORAGE_KEYS, clearAllLocal } from "@/lib/privacy";
import { migrateLocal } from "@/lib/storage-migrate";
import { applyAdd, applyRemove, tryWriteAdding, tryWriteUser } from "@/lib/closet-local";
import { appendWear, countsFromLedger, daysFromLedger, parseLedger, tasteFromLedger, type WearRecord } from "@/lib/ledger";
import { keepCut } from "@/lib/outfit";
import { pinFromCredits as holdExact, loadPins, savePins } from "@/lib/pins";
import { sittingsRemaining, takeSitting } from "@/lib/sitting";
import { todayKey } from "@/lib/types";
import { DEFAULT_WEATHER } from "@/lib/weather";

const USER_KEY = STORAGE_KEYS.user;
const HIDDEN_KEY = STORAGE_KEYS.hidden;
const HISTORY_KEY = STORAGE_KEYS.history;
const META_KEY = STORAGE_KEYS.meta;
const TASTE_KEY = STORAGE_KEYS.taste;
const WEARS_KEY = STORAGE_KEYS.wears;
const LEDGER_KEY = STORAGE_KEYS.ledger;

const DEFAULT_META: Meta = {
  onboarded: false,
  identity: "day",
  ageBand: "z",
  cohort: "house",
  birthDate: "",
  lastSyncDate: "",
  plan: "free",
  streak: 0,
  lastWear: "",
  lastWornIds: [],
  wears: 0,
  grillDate: "",
  grillCount: 0,
  practiceDay: 1,
  wornLog: [],
  gender: "",
};

function loadTaste(): Taste {
  try {
    const raw = store.get(TASTE_KEY, "");
    if (!raw) return { ...EMPTY_TASTE };
    return { ...EMPTY_TASTE, ...(JSON.parse(raw) as Taste) };
  } catch {
    return { ...EMPTY_TASTE };
  }
}

function loadLedger(): WearRecord[] {
  try {
    return parseLedger(store.get(LEDGER_KEY, ""));
  } catch {
    return [];
  }
}

function saveLedger(rows: WearRecord[]) {
  store.set(LEDGER_KEY, JSON.stringify(rows));
}

function loadWears(): Record<number, number> {
  const fromLedger = countsFromLedger(loadLedger());
  if (Object.keys(fromLedger).length) return fromLedger;
  try {
    const raw = store.get(WEARS_KEY, "");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(parsed)) out[Number(k)] = v;
    return out;
  } catch {
    return {};
  }
}

function loadUser(): Cloth[] {
  try {
    const raw = store.get(USER_KEY, "");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Cloth[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadHidden(): number[] {
  try {
    const raw = store.get(HIDDEN_KEY, "[]");
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUser(user: Cloth[]) {
  return store.set(USER_KEY, JSON.stringify(user));
}

function saveHidden(ids: number[]) {
  store.set(HIDDEN_KEY, JSON.stringify(ids));
}

const SAMPLE_IDS = new Set(SAMPLE_CLOSET.map((c) => c.id));

function assemble(): Cloth[] {
  const hidden = new Set(loadHidden());
  const map = new Map<number, Cloth>();
  for (const c of SAMPLE_CLOSET) {
    if (!hidden.has(c.id)) map.set(c.id, c);
  }
  for (const c of loadUser()) map.set(c.id, c);
  return [...map.values()];
}

function upsertUser(c: Cloth) {
  const user = applyAdd(loadUser(), c);
  return tryWriteUser(user, (json) => store.set(USER_KEY, json), c.name);
}

function loadClothes(): Cloth[] {
  return assemble();
}

function loadHistory(): HistoryEntry[] {
  return [];
}

function loadMeta(): Meta {
  try {
    const raw = store.get(META_KEY, "");
    const parsed = raw ? (JSON.parse(raw) as Meta) : {};
    const meta = { ...DEFAULT_META, ...parsed };
    if (!meta.birthDate) {
      try {
        const b = sessionStorage.getItem(BIRTH_KEY) || localStorage.getItem(BIRTH_KEY) || "";
        if (b) {
          meta.birthDate = b;
          meta.onboarded = true;
        }
      } catch {
        /* ignore */
      }
    }
    return meta;
  } catch {
    return { ...DEFAULT_META };
  }
}

function saveMeta(meta: Meta) {
  store.set(META_KEY, JSON.stringify(meta));
}

export function hydrateCloset() {
  try {
    migrateLocal({
      get: (key) => store.get(key, ""),
      set: (key, value) => store.set(key, value),
    });
    const hist = store.get(HISTORY_KEY, "[]");
    const parsedH = JSON.parse(hist) as HistoryEntry[];
    if (Array.isArray(parsedH)) useCloset.setState({ history: parsedH });
    const loaded = loadMeta();
    const ledger = loadLedger();
    if (ledger.length) loaded.wornLog = daysFromLedger(ledger);
    const meta = applyLifetime(loaded);
    if (meta !== loaded) saveMeta(meta);
    const current = useCloset.getState().screen;
    const keep = current !== "welcome";
    useCloset.setState({
      clothes: assemble(),
      meta,
      taste: loadTaste(),
      wearCounts: loadWears(),
      pinned: loadPins(),
      ...(keep ? {} : { screen: meta.onboarded && meta.birthDate && meta.gender ? "today" : "welcome" }),
    });
  } catch {
    /* ignore */
  }
}

export type Screen =
  | "welcome"
  | "today"
  | "closet"
  | "style"
  | "looks"
  | "practice"
  | "journal"
  | "atelier"
  | "privacy";

type State = {
  screen: Screen;
  clothes: Cloth[];
  history: HistoryEntry[];
  meta: Meta;
  mood: string;
  occ: string;
  city: string;
  cat: Category | "all";
  brand: string;
  house: House | "all";
  query: string;
  pinned: number[];
  weather: WeatherTheme;
  lastPieces: Cloth[];
  lastDesc: string;
  lastVibe: string;
  lastWhy: string[];
  lastVisual: string | null;
  visualLoading: boolean;
  taste: Taste;
  wearCounts: Record<number, number>;
  setScreen: (s: Screen) => void;
  setMood: (m: string) => void;
  setOcc: (o: string) => void;
  setCity: (c: string) => void;
  setCat: (c: Category | "all") => void;
  setBrand: (b: string) => void;
  setHouse: (h: House | "all") => void;
  setQuery: (q: string) => void;
  setWeather: (w: WeatherTheme) => void;
  togglePin: (id: number) => void;
  pinFromCredits: (item: Cloth) => void;
  addCloth: (c: Cloth) => string;
  addMany: (items: Cloth[]) => string;
  updateCloth: (c: Cloth) => string;
  removeCloth: (id: number) => void;
  setLook: (pieces: Cloth[], desc: string, vibe?: string, why?: string[]) => void;
  setVisual: (url: string | null) => void;
  setVisualLoading: (v: boolean) => void;
  saveLook: () => void;
  removeLook: (i: number) => void;
  patchMeta: (p: Partial<Meta>) => void;
  finishOnboarding: (identity: string, ageBand: AgeBand, birthDate?: string, gender?: Gender | "") => void;
  syncLifetime: (now?: Date) => boolean;
  wearToday: () => string;
  passLook: () => void;
  almostLook: () => void;
  spendSitting: () => boolean;
  sittingsLeft: () => number;
  setPlan: (p: Plan) => void;
  wipePersonal: () => void;
};

function saveHistory(history: HistoryEntry[]) {
  store.set(HISTORY_KEY, JSON.stringify(history));
}

export const useCloset = create<State>((set, get) => ({
  screen: "welcome",
  clothes: loadClothes(),
  history: loadHistory(),
  meta: loadMeta(),
  mood: "confident",
  occ: "casual",
  city: "Pune",
  cat: "all",
  brand: "all",
  house: "all",
  query: "",
  pinned: loadPins(),
  weather: DEFAULT_WEATHER,
  lastPieces: [],
  lastDesc: "",
  lastVibe: "",
  lastWhy: [],
  lastVisual: null,
  visualLoading: false,
  taste: loadTaste(),
  wearCounts: loadWears(),
  setScreen: (screen) => set({ screen }),
  setMood: (mood) => set({ mood }),
  setOcc: (occ) => set({ occ }),
  setCity: (city) => set({ city }),
  setCat: (cat) => set({ cat }),
  setBrand: (brand) => set({ brand }),
  setHouse: (house) => set({ house }),
  setQuery: (query) => set({ query }),
  setWeather: (weather) => set({ weather }),
  togglePin: (id) => {
    const pinned = get().pinned.includes(id)
      ? get().pinned.filter((x) => x !== id)
      : [...get().pinned, id];
    savePins(pinned);
    set({ pinned });
  },
  pinFromCredits: (item) => {
    const next = holdExact(
      { clothes: get().clothes, pinned: get().pinned, hidden: loadHidden() },
      item,
    );
    saveHidden(next.hidden);
    savePins(next.pinned);
    if (!SAMPLE_IDS.has(item.id)) upsertUser(item);
    set({ clothes: assemble(), pinned: next.pinned });
  },
  addCloth: (c) => {
    const result = upsertUser(c);
    if (result.ok) set({ clothes: assemble() });
    return result.ok ? "" : (result.message ?? "");
  },
  addMany: (items) => {
    const result = tryWriteAdding(loadUser(), items, (json) => store.set(USER_KEY, json));
    set({ clothes: assemble() });
    return result.ok ? "" : (result.message ?? "");
  },
  updateCloth: (c) => {
    const result = upsertUser(c);
    if (result.ok) set({ clothes: assemble() });
    return result.ok ? "" : (result.message ?? "");
  },
  removeCloth: (id) => {
    const user = applyRemove(loadUser(), id);
    tryWriteUser(user, (json) => store.set(USER_KEY, json));
    if (SAMPLE_IDS.has(id)) saveHidden([...loadHidden(), id]);
    const pinned = get().pinned.filter((x) => x !== id);
    savePins(pinned);
    set({ clothes: assemble(), pinned });
  },
  setLook: (lastPieces, lastDesc, lastVibe = "", lastWhy = []) =>
    set({ lastPieces, lastDesc, lastVibe, lastWhy, lastVisual: null }),
  setVisual: (lastVisual) => set({ lastVisual, visualLoading: false }),
  setVisualLoading: (visualLoading) => set({ visualLoading }),
  saveLook: () => {
    const { lastPieces, lastDesc, lastVibe, lastWhy, lastVisual, mood, occ, history } =
      get();
    if (!lastDesc) return;
    const entry: HistoryEntry = {
      date: formatCivilIST(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      pieces: lastPieces.map((c) => ({
        name: c.name,
        cat: c.cat,
        photo: c.photo,
        brand: c.brand,
      })),
      desc: lastDesc,
      vibe: lastVibe,
      why: lastWhy,
      visual: lastVisual,
      mood,
      occ,
    };
    const cap = get().meta.plan === "atelier" ? LOOKBOOK_MEMBER : LOOKBOOK_FREE;
    const next = [entry, ...history].slice(0, cap);
    saveHistory(next);
    set({ history: next });
  },
  removeLook: (i) => {
    const next = get().history.filter((_, idx) => idx !== i);
    saveHistory(next);
    set({ history: next });
  },
  patchMeta: (p) => {
    const meta = { ...get().meta, ...p };
    saveMeta(meta);
    set({ meta });
  },
  finishOnboarding: (identity, ageBand, birthDate, gender) => {
    const date = birthDate || get().meta.birthDate;
    const band = date ? generationFromBirthDate(date) : ageBand;
    const cohort = modeFromGeneration(band);
    const meta = applyLifetime({
      ...get().meta,
      onboarded: true,
      identity,
      ageBand: band,
      cohort,
      birthDate: date,
      gender: gender || get().meta.gender,
    });
    saveMeta(meta);
    set({ meta, screen: "today", lastPieces: [], lastDesc: "", lastVibe: "", lastWhy: [] });
  },
  syncLifetime: (now) => {
    const next = applyLifetime(get().meta, now);
    if (next === get().meta) return false;
    const changed = next.ageBand !== get().meta.ageBand;
    saveMeta(next);
    set({ meta: next });
    return changed;
  },
  wearToday: () => {
    const m = get().meta;
    const today = todayKey();
    if (m.lastWear === today) return "";
    const pieces = get().lastPieces;
    const occ = get().occ || "casual";
    let ledger = loadLedger();
    for (const p of pieces) ledger = appendWear(ledger, { item: p.id, date: today, occ, outcome: "worn" });
    saveLedger(ledger);
    const counts = countsFromLedger(ledger);
    store.set(WEARS_KEY, JSON.stringify(counts));
    const lookup = (id: number) => get().clothes.find((c) => c.id === id);
    const taste = tasteFromLedger(ledger, lookup);
    store.set(TASTE_KEY, JSON.stringify(taste));
    const streak = nextStreak(m.lastWear, m.streak);
    const wornLog = daysFromLedger(ledger);
    const meta = {
      ...m,
      lastWear: today,
      lastWornIds: pieces.map((c) => c.id),
      wears: m.wears + 1,
      streak,
      practiceDay: Math.min(7, m.practiceDay + (m.practiceDay < 7 ? 1 : 0)),
      wornLog,
    };
    saveMeta(meta);
    set({ meta, wearCounts: counts, taste });
    get().saveLook();
    const p = pieces.find((x) => x.price);
    if (!p) return "Logged.";
    const n = counts[p.id];
    const each = Math.round((p.price ?? 0) / n);
    return `${p.brand ?? p.name} now ₹${each.toLocaleString("en-IN")} a wear.`;
  },
  passLook: () => {
    const pieces = get().lastPieces;
    if (!pieces.length) return;
    const today = todayKey();
    const occ = get().occ || "casual";
    let ledger = loadLedger();
    for (const p of pieces) ledger = appendWear(ledger, { item: p.id, date: today, occ, outcome: "not" });
    saveLedger(ledger);
    const taste = tasteFromLedger(ledger, (id) => get().clothes.find((c) => c.id === id));
    store.set(TASTE_KEY, JSON.stringify(taste));
    set({ taste });
  },
  almostLook: () => {
    const pieces = get().lastPieces;
    if (!pieces.length) return;
    const { keepId } = keepCut(pieces, get().occ, get().clothes);
    const rest = pieces.filter((p) => p.id !== keepId);
    const today = todayKey();
    const occ = get().occ || "casual";
    let ledger = loadLedger();
    for (const p of rest.length ? rest : pieces) {
      ledger = appendWear(ledger, { item: p.id, date: today, occ, outcome: "almost" });
    }
    saveLedger(ledger);
    const taste = tasteFromLedger(ledger, (id) => get().clothes.find((c) => c.id === id));
    store.set(TASTE_KEY, JSON.stringify(taste));
    set({ taste });
  },
  spendSitting: () => {
    const m = get().meta;
    const { ok, next } = takeSitting(
      { grillDate: m.grillDate, grillCount: m.grillCount, plan: m.plan },
    );
    if (!ok) return false;
    const meta = { ...m, grillDate: next.grillDate, grillCount: next.grillCount };
    saveMeta(meta);
    set({ meta });
    return true;
  },
  sittingsLeft: () => {
    const m = get().meta;
    return sittingsRemaining(
      { grillDate: m.grillDate, grillCount: m.grillCount, plan: m.plan },
    );
  },
  setPlan: (plan) => {
    const meta = { ...get().meta, plan };
    saveMeta(meta);
    set({ meta });
  },
  wipePersonal: () => {
    clearAllLocal((key) => store.remove(key));
    const meta = { ...DEFAULT_META };
    set({
      clothes: assemble(),
      history: [],
      taste: { ...EMPTY_TASTE },
      wearCounts: {},
      pinned: [],
      lastPieces: [],
      lastDesc: "",
      lastVibe: "",
      lastWhy: [],
      lastVisual: null,
      meta,
    });
  },
}));
