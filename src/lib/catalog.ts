import type { Category, Cloth, Gender, Generation, House, Wearer } from "./types.ts";

/** Every photo is forced to the same 3:4 frame so the rail aligns. */
export const PHOTO = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&h=1066&fit=crop&crop=center&q=80&auto=format`;

const TOPS = [
  "photo-1521572163474-6864f9cf17ab",
  "photo-1583743814966-8936f5b7be1a",
  "photo-1596755094514-f87e34085b2c",
  "photo-1602810318383-e386cc2a3ccf",
  "photo-1598032895397-b9472444bf93",
  "photo-1603252109303-2751441dd157",
  "photo-1576566588028-4147f3842f27",
  "photo-1434389677669-e08b4cac3105",
  "photo-1556821840-3a63f95609a7",
  "photo-1586790170083-2f9ceadc732d",
  "photo-1564257631407-4deb1f99d992",
  "photo-1485230895905-ec40ba36b9bc",
  "photo-1620799140408-edc6dcb6d633",
  "photo-1571945153237-4929e783af4a",
  "photo-1618354691373-d851c5c3a99b",
  "photo-1523381294911-8d3cead13475",
  "photo-1489980557514-251d61e3eeb6",
  "photo-1521572267360-ee0c2909d518",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1490481651871-ab68de25d43d",
  "photo-1539533018447-63fcce2678e3",
  "photo-1594938298603-c8148c4dae35",
  "photo-1434389677669-e08b4cac3105",
  "photo-1617137984095-74e4ed0b2106",
];

const BOTTOMS = [
  "photo-1542272454315-4c01d7abdf4a",
  "photo-1541099649105-f69ad21f3246",
  "photo-1594633312681-425c7b97ccd1",
  "photo-1473966968600-fa801b869a1a",
  "photo-1594633313593-bab3825d0caf",
  "photo-1584370848010-d7fe6bc76787",
  "photo-1541099649105-f69ad21f3246",
  "photo-1582418702054-89533739a0d5",
  "photo-1506629082955-511b1aa682f3",
  "photo-1624378439575-d8705ad7ae80",
  "photo-1591195853828-11db59a44d6b",
  "photo-1583496661160-fb5886a0aaaa",
  "photo-1517438476312-10d79c077509",
  "photo-1453486038486-61e1850980bb",
  "photo-1582552938357-32b906df40cb",
  "photo-1604176354204-9268737828e4",
  "photo-1548883354-94bcfe323ff1",
  "photo-1475178626620-a4d074967452",
  "photo-1506629082955-511b1aa682f3",
  "photo-1552902865-b72c031ac5ea",
];

const DRESSES = [
  "photo-1515372039744-b8f02a3ae446",
  "photo-1595777457583-95e059d581b8",
  "photo-1539008835657-9e8e9680c956",
  "photo-1496747611176-843222e1e57c",
  "photo-1572804013309-59a88b7e92f1",
  "photo-1566174053879-31528523f8ae",
  "photo-1595777457583-95e059d581b8",
  "photo-1502716119720-b23a93e5fe1b",
  "photo-1515377905703-c4788e51af15",
  "photo-1475180098084-4f4f0b67a27c",
  "photo-1495385791824-e8d6e74dbbf2",
  "photo-1509631179647-0177331693ae",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1539008835657-9e8e9680c956",
  "photo-1552874869-59c7687e60c6",
  "photo-1485968579580-b6d095142e6e",
  "photo-1525507398800-59f5dd1951dc",
  "photo-1469334031218-e382a71b716b",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1483985988355-763728e1935b",
];

const SHOES = [
  "photo-1600269452121-4f2416e55c28",
  "photo-1542291026-7eec264c27ff",
  "photo-1491553895911-0055eca6402d",
  "photo-1539185444077-9717cb68338c",
  "photo-1463100099107-aa0980c36220",
  "photo-1543163521-1bf539c55dd2",
  "photo-1608256246200-53e0794d38e4",
  "photo-1515347619252-60a4bf4fff4f",
  "photo-1566150905458-1bf1fc113f0d",
  "photo-1533867617858-e7b97e060509",
  "photo-1549298916-b41d501d3772",
  "photo-1595950653106-6c9ebd614d3a",
  "photo-1460353581641-37baddab0fa2",
  "photo-1515955656353-def05cc973d2",
  "photo-1525966222134-fcfa99b8ae77",
  "photo-1560769629-975ec94e6a86",
  "photo-1543508282-6319a3e4a33c",
  "photo-1603808033192-082d166b1731",
  "photo-1614252369475-531eba835eb1",
  "photo-1582897085656-c636d006bd58",
];

const ACCESSORIES = [
  "photo-1630019852942-f89202989a59",
  "photo-1548036328-c9fa89d128fa",
  "photo-1590874103328-eac38a683ce7",
  "photo-1584917865442-de89df76afd3",
  "photo-1624222247344-550fb60583fd",
  "photo-1572635196237-14b3f281503f",
  "photo-1523275335684-37898b6baf30",
  "photo-1591561954557-26941169b49e",
  "photo-1611652022419-a7906c816dde",
  "photo-1553062407-98eeb64c6a31",
  "photo-1594223275447-5cfa2d81b5f6",
  "photo-1583292650873-86f5c4b06743",
  "photo-1617038260897-41a1f14a8ca0",
  "photo-1515562141397-5e0ee2b2d1d3",
  "photo-1611591437281-460bfbe1220a",
  "photo-1576566588028-4147f3842f27",
  "photo-1523170335258-f5ed11844a49",
  "photo-1506630448388-4e683c67ddb0",
  "photo-1611085583191-a3b181a88401",
  "photo-1589782182703-2aaa69037b5b",
];

const OUTER = [
  "photo-1551028719-00167b16eac5",
  "photo-1539533018447-63fcce2678e3",
  "photo-1594938298603-c8148c4dae35",
  "photo-1617137984095-74e4ed0b2106",
  "photo-1521223890158-f9f7c3d5d504",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1617127365659-c47fa713d77a",
  "photo-1591047139829-d91aecb6caea",
  "photo-1544022613-e87ca75a784a",
  "photo-1591369822096-ffd140ec948f",
  "photo-1520975954732-504780bc8f40",
  "photo-1548126032-079a0fb0099d",
  "photo-1608063615781-e87dab8b3571",
  "photo-1495105787522-5334e3ffa0ef",
  "photo-1551028719-00167b16eac5",
  "photo-1544022613-e87ca75a784a",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1617137984095-74e4ed0b2106",
  "photo-1521223890158-f9f7c3d5d504",
  "photo-1591047139829-d91aecb6caea",
];

const CUT_STILL: [RegExp, string][] = [
  [/dress|kurta|kameez|wrap midi/, "photo-1515372039744-b8f02a3ae446"],
  [/hoodie|sweatshirt/, "photo-1556821840-3a63f95609a7"],
  [/cotton tee|oversized tee|ribbed tank/, "photo-1521572163474-6864f9cf17ab"],
  [/polo/, "photo-1583743814966-8936f5b7be1a"],
  [/shirt|blouse|henley/, "photo-1598032895397-b9472444bf93"],
  [/track trousers|drawstring/, "photo-1552902865-b72c031ac5ea"],
  [/jean/, "photo-1542272454315-4c01d7abdf4a"],
  [/short|bermuda|chino|trouser/, "photo-1594633312681-425c7b97ccd1"],
  [/trainer|runner sneaker|court sneaker|hiking sneaker/, "photo-1542291026-7eec264c27ff"],
  [/canvas sneaker|leather sneaker|slip-on/, "photo-1525966222134-fcfa99b8ae77"],
  [/loafer/, "photo-1614252369475-531eba835eb1"],
  [/boot|derby|oxford shoe|brogue/, "photo-1549298916-b41d501d3772"],
  [/heel|pump|slingback|mule|sandal/, "photo-1543163521-1bf539c55dd2"],
  [/leather jacket|biker/, "photo-1551028719-00167b16eac5"],
  [/down jacket|puffer|parka|fleece/, "photo-1544022613-e87ca75a784a"],
  [/blazer|suit jacket/, "photo-1521223890158-f9f7c3d5d504"],
  [/trench|raincoat|overcoat/, "photo-1591047139829-d91aecb6caea"],
  [/sunglass/, "photo-1572635196237-14b3f281503f"],
  [/watch|cuff/, "photo-1523170335258-f5ed11844a49"],
  [/tote|bag|crossbody/, "photo-1590874103328-eac38a683ce7"],
  [/\bcap\b|beanie/, "photo-1553062407-98eeb64c6a31"],
];

export function photoFor(cat: Category, cut: string, salt: number) {
  const hit = CUT_STILL.find(([re]) => re.test(cut));
  const id = hit ? hit[1] : POOL[cat][salt % POOL[cat].length];
  return PHOTO(id);
}

export function stillIdFromPhoto(url: string | null | undefined): string {
  const hit = url?.match(/images\.unsplash\.com\/(photo-[^?]+)/);
  return hit?.[1] ?? "";
}

export function stillCats(id: string): Category[] {
  return (Object.keys(POOL) as Category[]).filter((cat) => POOL[cat].includes(id));
}

const POOL: Record<Category, string[]> = {
  tops: TOPS,
  bottoms: BOTTOMS,
  dresses: DRESSES,
  shoes: SHOES,
  accessories: ACCESSORIES,
  outerwear: OUTER,
};

const CUTS: Record<Category, string[]> = {
  tops: [
    "poplin shirt",
    "oxford shirt",
    "linen shirt",
    "silk blouse",
    "satin blouse",
    "knit polo",
    "pique polo",
    "cotton tee",
    "oversized tee",
    "ribbed tank",
    "silk camisole",
    "merino crew",
    "cashmere crew",
    "hoodie",
    "sweatshirt",
    "rugby knit",
    "wrap blouse",
    "turtleneck",
    "henley",
    "camp-collar shirt",
    "boat-neck knit",
    "fine-gauge cardigan",
    "boxy shirt",
    "gauze blouse",
    "twill shirt",
  ],
  bottoms: [
    "wide-leg trousers",
    "column trousers",
    "pleated trousers",
    "tailored trousers",
    "straight jeans",
    "slim jeans",
    "wide jeans",
    "chinos",
    "linen trousers",
    "crop trousers",
    "tailored shorts",
    "bermuda shorts",
    "utility trousers",
    "knit trousers",
    "paperbag trousers",
    "cigarette trousers",
    "barrel jeans",
    "cargo trousers",
    "drawstring trousers",
    "satin trousers",
    "culottes",
    "track trousers",
    "wool trousers",
    "denim skirt",
    "midi skirt",
  ],
  dresses: [
    "midi wrap dress",
    "shirt dress",
    "sundress",
    "knit dress",
    "column dress",
    "smock dress",
    "slip dress",
    "polo dress",
    "linen dress",
    "shirt-tail dress",
    "tiered dress",
    "knit polo dress",
    "utility dress",
    "pleated dress",
    "A-line dress",
    "halter dress",
    "square-neck dress",
    "t-shirt dress",
    "kameez dress",
    "kurta dress",
    "silk dress",
    "cotton day dress",
    "wrap midi",
    "long-sleeve dress",
    "drop-waist dress",
  ],
  shoes: [
    "leather sneakers",
    "runner sneakers",
    "court sneakers",
    "canvas sneakers",
    "loafer",
    "penny loafer",
    "chelsea boot",
    "ankle boot",
    "derby shoe",
    "oxford shoe",
    "mule",
    "slingback",
    "block-heel pump",
    "kitten heel",
    "sandal",
    "slide",
    "hiking sneaker",
    "slip-on",
    "brogue",
    "monk strap",
    "combat boot",
    "knee boot",
    "espadrille",
    "mary jane",
    "trainer",
  ],
  accessories: [
    "structured tote",
    "shoulder bag",
    "crossbody bag",
    "mini bag",
    "hobo bag",
    "belt bag",
    "leather belt",
    "woven belt",
    "hoop earrings",
    "drop earrings",
    "chain necklace",
    "silk scarf",
    "wool scarf",
    "aviator sunglasses",
    "wayfarer sunglasses",
    "leather watch",
    "cap",
    "beanie",
    "card holder",
    "wallet",
    "hair clip",
    "cuff",
    "ring set",
    "phone pouch",
    "bucket bag",
  ],
  outerwear: [
    "trench coat",
    "wool overcoat",
    "peacoat",
    "blazer",
    "unstructured blazer",
    "denim jacket",
    "leather jacket",
    "bomber",
    "quilted jacket",
    "raincoat",
    "parka",
    "chore coat",
    "shacket",
    "cardigan coat",
    "cape coat",
    "field jacket",
    "suit jacket",
    "Nehru jacket",
    "coach jacket",
    "windbreaker",
    "fleece",
    "down jacket",
    "car coat",
    "duffle coat",
    "wrap coat",
  ],
};

export { CUTS, CUT_STILL };

const YOUTH_SHOE = CUTS.shoes.filter(
  (s) => !/heel|pump|slingback|knee boot|mule/.test(s),
);
const YOUTH_DRESS = CUTS.dresses.filter((s) => !/slip|halter|silk dress/.test(s));

const COLORS = [
  "black",
  "white",
  "navy",
  "cream",
  "beige",
  "grey",
  "brown",
  "olive",
  "burgundy",
  "emerald",
  "camel",
  "sand",
  "ivory",
  "charcoal",
  "khaki",
  "blue",
];

const ALL: Generation[] = ["alpha", "teen", "z", "zlate", "mill", "x", "prime"];
const YOUTH: Generation[] = ["alpha", "teen", "z", "zlate"];
const TEENUP: Generation[] = ["teen", "z", "zlate", "mill"];
const ADULT: Generation[] = ["z", "zlate", "mill", "x", "prime"];
const WORK: Generation[] = ["zlate", "mill", "x", "prime"];
const SPORT: Generation[] = ["alpha", "teen", "z", "zlate", "mill"];
const INDIAN: Generation[] = ["z", "zlate", "mill", "x", "prime"];

type Line = "youth" | "adult" | "sport" | "indian";

type BrandDef = {
  name: string;
  house: House;
  base: number;
  gens: Generation[];
  line: Line;
};

export const HOUSES_ONLINE: BrandDef[] = [
  { name: "Zara", house: "high", base: 3290, gens: TEENUP, line: "adult" },
  { name: "Mango", house: "high", base: 3490, gens: TEENUP, line: "adult" },
  { name: "COS", house: "premium", base: 5900, gens: ADULT, line: "adult" },
  { name: "Arket", house: "premium", base: 4900, gens: ADULT, line: "adult" },
  { name: "Uniqlo", house: "high", base: 1990, gens: ALL, line: "youth" },
  { name: "Gap", house: "high", base: 2290, gens: YOUTH, line: "youth" },
  { name: "Levi's", house: "high", base: 4990, gens: TEENUP, line: "adult" },
  { name: "Nike", house: "sport", base: 7990, gens: SPORT, line: "sport" },
  { name: "Adidas", house: "sport", base: 6990, gens: SPORT, line: "sport" },
  { name: "New Balance", house: "sport", base: 8990, gens: SPORT, line: "sport" },
  { name: "Converse", house: "sport", base: 5990, gens: YOUTH, line: "sport" },
  { name: "Charles & Keith", house: "premium", base: 4990, gens: TEENUP, line: "adult" },
  { name: "Calvin Klein", house: "premium", base: 6990, gens: ADULT, line: "adult" },
  { name: "Tommy Hilfiger", house: "premium", base: 6490, gens: TEENUP, line: "adult" },
  { name: "Massimo Dutti", house: "premium", base: 7990, gens: WORK, line: "adult" },
  { name: "Marks & Spencer", house: "high", base: 3990, gens: WORK, line: "adult" },
  { name: "Ralph Lauren", house: "premium", base: 9990, gens: WORK, line: "adult" },
  { name: "Hugo Boss", house: "premium", base: 12990, gens: WORK, line: "adult" },
  { name: "Gant", house: "premium", base: 7490, gens: WORK, line: "adult" },
  { name: "Lacoste", house: "premium", base: 6990, gens: TEENUP, line: "adult" },
  { name: "Coach", house: "premium", base: 18990, gens: ADULT, line: "adult" },
  { name: "Aldo", house: "premium", base: 5990, gens: ADULT, line: "adult" },
  { name: "Michael Kors", house: "premium", base: 9990, gens: ADULT, line: "adult" },
  { name: "Fabindia", house: "indian", base: 3490, gens: INDIAN, line: "indian" },
  { name: "Manyavar", house: "indian", base: 6990, gens: INDIAN, line: "indian" },
];

const CAT_MULT: Record<Category, number> = {
  tops: 1,
  bottoms: 1.15,
  dresses: 1.35,
  shoes: 1.4,
  accessories: 0.9,
  outerwear: 2.1,
};

const CATS: Category[] = ["tops", "bottoms", "dresses", "shoes", "accessories", "outerwear"];

function cutsFor(cat: Category, line: Line): string[] {
  if (cat === "shoes" && (line === "youth" || line === "sport")) return YOUTH_SHOE;
  if (cat === "dresses" && (line === "youth" || line === "sport")) return YOUTH_DRESS;
  return CUTS[cat];
}

function cutWearer(cat: Category, cut: string): Wearer {
  if (cat === "dresses") return "femme";
  if (
    /skirt|blouse|camisole|heel|pump|slingback|mule|kitten|mary jane|hoop|drop earring|hair clip|hobo|mini bag|cape coat|wrap blouse|wrap coat|satin blouse/.test(
      cut,
    )
  ) {
    return "femme";
  }
  if (/derby|brogue|monk strap|suit jacket|nehru|oxford shoe|oxford shirt/.test(cut)) {
    return "masc";
  }
  return "uni";
}

function build(): Cloth[] {
  const out: Cloth[] = [];
  let id = 10_000;
  for (const brand of HOUSES_ONLINE) {
    for (const cat of CATS) {
      const cuts = cutsFor(cat, brand.line);
      let n = 0;
      for (let s = 0; n < 100; s++) {
        const cut = cuts[s % cuts.length];
        const color = COLORS[(s + brand.name.length) % COLORS.length];
        const photo = photoFor(cat, cut, s + brand.name.length);
        const jitter = 0.86 + ((s * 17 + brand.base) % 9) * 0.03;
        const price = Math.round(brand.base * CAT_MULT[cat] * jitter);
        out.push({
          id: id++,
          name: title(color, cut),
          cat,
          color,
          photo,
          brand: brand.name,
          price,
          house: brand.house,
          gens: brand.gens,
          wearer: cutWearer(cat, cut),
          from: "house",
          cut,
        });
        n++;
      }
    }
  }
  return out;
}

export const SAMPLE_CLOSET: Cloth[] = build();

export const BRANDS = HOUSES_ONLINE.map((b) => b.name);

function title(color: string, cut: string) {
  return `${color[0].toUpperCase()}${color.slice(1)} ${cut}`;
}

export function forCohort(clothes: Cloth[], gen: Generation) {
  if (gen === "alpha" || gen === "teen") {
    return clothes.filter((c) => c.gens?.includes(gen));
  }
  return clothes.filter((c) => {
    if (!c.gens?.length) return true;
    const onlyMinor = c.gens.every((g) => g === "alpha" || g === "teen");
    return !onlyMinor;
  });
}

export function forYou(clothes: Cloth[], gen: Generation, gender: Gender | "" = "both") {
  const rail = forCohort(clothes, gen);
  if (gender === "femme") return rail.filter((c) => (c.wearer ?? "uni") !== "masc");
  if (gender === "masc") return rail.filter((c) => (c.wearer ?? "uni") !== "femme");
  return rail;
}
