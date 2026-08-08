import * as LucideIcons from "lucide-react";

export type IconCategory =
  | "General"
  | "Business"
  | "Education"
  | "Research"
  | "Finance"
  | "Technology"
  | "People"
  | "Communication"
  | "Media"
  | "Files"
  | "Charts"
  | "Arrows"
  | "Shapes"
  | "Maps"
  | "Weather"
  | "Food"
  | "Travel"
  | "Medical"
  | "Security"
  | "Programming"
  | "Artificial Intelligence"
  | "Government";

export const ICON_CATEGORIES: IconCategory[] = [
  "General",
  "Business",
  "Education",
  "Research",
  "Finance",
  "Technology",
  "People",
  "Communication",
  "Media",
  "Files",
  "Charts",
  "Arrows",
  "Shapes",
  "Maps",
  "Weather",
  "Food",
  "Travel",
  "Medical",
  "Security",
  "Programming",
  "Artificial Intelligence",
  "Government",
];

export interface IconMeta {
  /** kebab-case canonical id, e.g. "user-round" */
  id: string;
  /** human readable name, e.g. "User Round" */
  label: string;
  /** lucide component name, e.g. "UserRound" */
  pascal: string;
  category: IconCategory;
  keywords: string;
}

/** Ordered keyword rules — first match wins. */
const CATEGORY_RULES: [IconCategory, string[]][] = [
  ["Artificial Intelligence", ["bot", "brain", "sparkle", "wand", "atom-ai", "cpu", "circuit", "binary"]],
  ["Programming", ["code", "terminal", "git", "braces", "bracket", "bug", "regex", "webhook", "command", "variable", "function", "curly"]],
  ["Charts", ["chart", "graph", "trending", "activity", "gauge", "sigma", "percent", "waves"]],
  ["Finance", ["dollar", "euro", "pound", "yen", "bitcoin", "coin", "cash", "banknote", "wallet", "credit-card", "receipt", "piggy", "landmark", "badge-dollar", "hand-coins", "currency", "invoice"]],
  ["Medical", ["heart-pulse", "stethoscope", "pill", "syringe", "hospital", "ambulance", "bandage", "cross", "dna", "thermometer", "brain-cog", "tooth", "bone", "accessibility", "wheelchair", "biohazard", "activity-square"]],
  ["Security", ["lock", "unlock", "shield", "key", "fingerprint", "scan-face", "eye-off", "vault", "verified", "password"]],
  ["Weather", ["cloud", "sun", "moon", "rain", "snow", "storm", "wind", "thermo", "umbrella", "rainbow", "tornado", "haze", "droplet", "fog"]],
  ["Food", ["coffee", "pizza", "burger", "utensil", "cake", "apple", "egg", "beer", "wine", "cup", "soup", "ice-cream", "candy", "cookie", "salad", "sandwich", "milk", "carrot", "beef", "fish", "croissant", "popcorn", "martini", "chef"]],
  ["Travel", ["plane", "luggage", "suitcase", "hotel", "palmtree", "tent", "backpack", "ticket", "passport", "globe", "compass", "mountain-snow", "sailboat", "anchor", "caravan"]],
  ["Maps", ["map", "pin", "navigation", "route", "milestone", "signpost", "locate", "waypoint", "earth", "radar"]],
  ["Transport", ["car", "bus", "train", "bike", "truck", "ship", "rocket", "fuel", "traffic", "tram", "subway", "scooter"]],
  ["Government", ["landmark", "scale", "gavel", "flag", "vote", "crown", "shield-check", "building-2", "library", "stamp", "podium"]],
  ["Education", ["school", "graduation", "book", "notebook", "pencil", "pen", "eraser", "backpack", "abacus", "library", "presentation", "highlighter", "ruler"]],
  ["Research", ["microscope", "flask", "test-tube", "telescope", "atom", "search-check", "magnet", "beaker", "dna", "orbit", "radiation"]],
  ["Business", ["briefcase", "building", "handshake", "target", "trophy", "award", "medal", "goal", "clipboard", "calendar", "workflow", "factory", "store", "shopping", "package", "truck-delivery", "tag", "megaphone", "rocket"]],
  ["People", ["user", "users", "person", "contact", "baby", "smile", "frown", "meh", "angry", "laugh", "annoyed", "group", "id-card"]],
  ["Communication", ["mail", "message", "chat", "phone", "send", "bell", "at-sign", "inbox", "voicemail", "rss", "share", "reply", "forward", "speech", "headphones", "mic", "megaphone", "signal", "wifi", "radio"]],
  ["Media", ["play", "pause", "video", "music", "camera", "image", "film", "volume", "audio", "podcast", "disc", "gallery", "aperture", "clapperboard", "cast", "youtube", "photo", "speaker", "tv", "airplay", "repeat", "shuffle", "skip"]],
  ["Files", ["file", "folder", "archive", "paperclip", "download", "upload", "save", "print", "copy", "clipboard", "trash", "book-copy", "sheet", "table", "notebook-text", "hard-drive", "database", "box"]],
  ["Arrows", ["arrow", "chevron", "corner", "move", "redo", "undo", "refresh", "rotate", "expand", "shrink", "maximize", "minimize", "fast-forward", "step", "iteration", "merge", "split"]],
  ["Shapes", ["square", "circle", "triangle", "hexagon", "octagon", "pentagon", "diamond", "star", "shapes", "rectangle", "spline", "vector", "frame", "layout", "grid", "columns", "rows"]],
  ["Technology", ["cpu", "server", "monitor", "laptop", "smartphone", "tablet", "keyboard", "mouse", "usb", "battery", "plug", "bluetooth", "network", "router", "chip", "memory", "screen", "printer", "watch", "hard", "cable", "satellite", "antenna", "power", "zap"]],
];

function toKebab(pascal: string): string {
  return pascal
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toLabel(pascal: string): string {
  return pascal.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

function categorize(id: string): IconCategory {
  for (const [category, keywords] of CATEGORY_RULES) {
    if (keywords.some((k) => id.includes(k))) {
      // "Transport" is not part of the requested list -> fold into Travel
      return (category as string) === "Transport" ? "Travel" : category;
    }
  }
  return "General";
}

const EXCLUDED = new Set([
  "Icon",
  "createLucideIcon",
  "icons",
  "default",
  "LucideIcon",
  "IconNode",
  "DynamicIcon",
]);

function buildRegistry(): IconMeta[] {
  const source = (LucideIcons as any).icons as Record<string, unknown> | undefined;
  const names = source
    ? Object.keys(source)
    : Object.keys(LucideIcons).filter(
        (k) => /^[A-Z]/.test(k) && !EXCLUDED.has(k) && typeof (LucideIcons as any)[k] === "object",
      );

  const seen = new Set<string>();
  const list: IconMeta[] = [];

  for (const pascal of names) {
    if (EXCLUDED.has(pascal) || !/^[A-Z]/.test(pascal)) continue;
    // Skip deprecated aliases ending with "Icon" (e.g. "ActivityIcon")
    if (pascal.endsWith("Icon") && names.includes(pascal.slice(0, -4))) continue;
    if (!(pascal in LucideIcons)) continue;
    const id = toKebab(pascal);
    if (seen.has(id)) continue;
    seen.add(id);
    const category = categorize(id);
    list.push({
      id,
      pascal,
      label: toLabel(pascal),
      category,
      keywords: `${id} ${category.toLowerCase()}`,
    });
  }

  return list.sort((a, b) => a.id.localeCompare(b.id));
}

export const ALL_ICONS: IconMeta[] = buildRegistry();

const BY_ID = new Map(ALL_ICONS.map((i) => [i.id, i]));

export function getIconMeta(id: string): IconMeta | undefined {
  if (!id) return undefined;
  return BY_ID.get(id) ?? BY_ID.get(toKebab(id));
}

export function getIconComponent(id: string): any {
  const meta = getIconMeta(id);
  const pascal = meta?.pascal;
  return (pascal && (LucideIcons as any)[pascal]) || (LucideIcons as any).HelpCircle;
}

export function iconsByCategory(category: IconCategory | "All"): IconMeta[] {
  if (category === "All") return ALL_ICONS;
  return ALL_ICONS.filter((i) => i.category === category);
}

/** Instant, ranked search across the whole registry. */
export function searchIcons(query: string, category: IconCategory | "All" = "All"): IconMeta[] {
  const pool = iconsByCategory(category);
  const q = query.trim().toLowerCase().replace(/\s+/g, "-");
  if (!q) return pool;

  const scored: { meta: IconMeta; score: number }[] = [];
  for (const meta of pool) {
    let score = -1;
    if (meta.id === q) score = 0;
    else if (meta.id.startsWith(q)) score = 1;
    else if (meta.id.includes(q)) score = 2;
    else if (meta.keywords.includes(q)) score = 3;
    if (score >= 0) scored.push({ meta, score });
  }
  scored.sort((a, b) => a.score - b.score || a.meta.id.length - b.meta.id.length);
  return scored.map((s) => s.meta);
}

export const ICON_COUNT = ALL_ICONS.length;
