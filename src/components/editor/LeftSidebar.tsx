import { useState } from "react";
import {
  Layers,
  Image as ImageIcon,
  Upload,
  Shapes,
  LayoutTemplate,
  Sparkles,
  Plus,
  Trash2,
  Crosshair,
  Search,
} from "lucide-react";
import { useEditor, type ObjectType } from "@/lib/editor-store";
import { templates } from "@/lib/templates";

const TABS = [
  { id: "pages", label: "Pages", icon: Layers },
  { id: "assets", label: "Assets", icon: ImageIcon },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "icons", label: "Icons", icon: Shapes },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "ai", label: "AI", icon: Sparkles },
] as const;

const ICON_NAMES = ["Sparkles", "Rocket", "Target", "Lightbulb", "TrendingUp", "Users", "Globe", "Zap", "Star", "Heart", "Shield", "Brain"];

export function LeftSidebar() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pages");
  const {
    doc,
    activePageId,
    setActivePage,
    addPage,
    removePage,
    renamePage,
    capturePageFrame,
    setViewport,
    loadTemplate,
    addObject,
    updateObject,
    selectedIds,
    viewport,
  } = useEditor();
  const [query, setQuery] = useState("");

  const gotoPage = (frame: { x: number; y: number; width: number; height: number }) => {
    setViewport({ x: -frame.x * 0.8 + 120, y: -frame.y * 0.8 + 80, zoom: 0.8 });
  };

  return (
    <aside className="flex h-full w-[300px] shrink-0 border-r border-border bg-sidebar/70 backdrop-blur-xl">
      <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            title={t.label}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              tab === t.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <t.icon size={18} />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "pages" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Pages & path</h3>
              <button onClick={addPage} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Plus size={16} />
              </button>
            </div>
            {doc.pages.map((p, i) => (
              <div
                key={p.id}
                onClick={() => {
                  setActivePage(p.id);
                  gotoPage(p.frame);
                }}
                className={`group cursor-pointer rounded-xl border p-3 transition-colors ${
                  activePageId === p.id ? "border-primary/60 bg-primary/10" : "border-border hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                  <input
                    value={p.name}
                    onChange={(e) => renamePage(p.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  />
                  <button
                    title="Set frame to current view"
                    onClick={(e) => {
                      e.stopPropagation();
                      capturePageFrame(p.id, {
                        x: Math.round(-viewport.x / viewport.zoom),
                        y: Math.round(-viewport.y / viewport.zoom),
                        width: Math.round(960 / viewport.zoom),
                        height: Math.round(540 / viewport.zoom),
                      });
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Crosshair size={14} className="text-muted-foreground hover:text-accent" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(p.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "assets" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Objects</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["heading", "text", "rect", "circle", "arrow", "sticky", "code", "table", "chart", "image", "video", "pdf"] as ObjectType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => addObject(t)}
                  className="rounded-xl border border-border bg-card/60 px-3 py-3 text-xs capitalize transition-colors hover:border-primary/50 hover:bg-primary/10"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "uploads" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Uploads</h3>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground hover:border-primary/50">
              <Upload size={20} />
              Drop an image or click to pick
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  const id = addObject("image");
                  updateObject(id, { src: url, text: file.name });
                }}
              />
            </label>
            <p className="text-[11px] text-muted-foreground">Uploads stay in this browser session for now.</p>
          </div>
        )}

        {tab === "icons" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
              <Search size={14} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons"
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ICON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())).map((name) => (
                <button
                  key={name}
                  title={name}
                  onClick={() => {
                    const id = addObject("icon");
                    updateObject(id, { icon: name, text: name });
                  }}
                  className="rounded-lg border border-border p-2 text-[10px] hover:border-primary/50 hover:bg-primary/10"
                >
                  {name.slice(0, 6)}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "templates" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Templates</h3>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.build())}
                className="w-full rounded-xl border border-border bg-card/60 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/10"
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.blurb}</p>
              </button>
            ))}
          </div>
        )}

        {tab === "ai" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">AI assistant</h3>
            <div className="rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
              Ask for an outline, a rewrite, or a layout. Wiring comes in the next phase — the panel and
              object model are already built for it.
            </div>
            <textarea
              placeholder="Draft a 5-page pitch about…"
              className="h-28 w-full resize-none rounded-xl border border-border bg-background/60 p-3 text-xs outline-none focus:border-primary/60"
            />
            <button className="w-full rounded-xl bg-primary/90 px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary">
              Generate
            </button>
            <p className="text-[10px] text-muted-foreground">
              {selectedIds.length} object{selectedIds.length === 1 ? "" : "s"} selected as context
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
