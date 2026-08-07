import { Lock, Unlock, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useEditor, type AnimationName } from "@/lib/editor-store";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function NumberField({ value, onChange, suffix }: { value: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <div className="flex w-24 items-center rounded-lg border border-border bg-background/60 px-2 py-1">
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent text-right text-xs outline-none"
      />
      {suffix && <span className="pl-1 text-[10px] text-muted-foreground">{suffix}</span>}
    </div>
  );
}

const SWATCHES = [
  "var(--primary)",
  "var(--accent)",
  "var(--aurora)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--surface-2)",
  "var(--foreground)",
  "transparent",
];

const SECTIONS = ["Properties", "Typography", "Position", "Fill", "Stroke", "Shadow", "Animation", "Interaction", "Layer"];

export function RightSidebar() {
  const { doc, selectedIds, updateSelected, updateObject, commit, duplicateSelected, deleteSelected, reorder } = useEditor();
  const obj = doc.objects.find((o) => o.id === selectedIds[0]);

  if (!obj) {
    return (
      <aside className="hidden h-full w-[300px] shrink-0 border-l border-border bg-sidebar/70 p-4 backdrop-blur-xl lg:block">
        <h3 className="text-sm font-semibold">Properties</h3>
        <p className="mt-2 text-xs text-muted-foreground">Select an object on the canvas to edit it.</p>
        <ul className="mt-6 space-y-2 text-[11px] text-muted-foreground">
          {SECTIONS.map((s) => (
            <li key={s} className="rounded-lg border border-border/60 px-3 py-2">
              {s}
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  const set = (patch: Parameters<typeof updateSelected>[0]) => updateSelected(patch);
  const live = (patch: Parameters<typeof updateSelected>[0]) => updateObject(obj.id, patch);

  return (
    <aside className="hidden h-full w-[300px] shrink-0 overflow-y-auto border-l border-border bg-sidebar/70 p-4 backdrop-blur-xl lg:block">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize">{obj.type}</h3>
        <div className="flex gap-1">
          <button onClick={() => set({ locked: !obj.locked })} className="rounded-lg p-1.5 hover:bg-secondary" title={obj.locked ? "Unlock" : "Lock"}>
            {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button onClick={duplicateSelected} className="rounded-lg p-1.5 hover:bg-secondary" title="Duplicate">
            <Copy size={14} />
          </button>
          <button onClick={deleteSelected} className="rounded-lg p-1.5 text-destructive hover:bg-secondary" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <Section title="Position">
        <Row label="X"><NumberField value={obj.x} onChange={(n) => set({ x: n })} /></Row>
        <Row label="Y"><NumberField value={obj.y} onChange={(n) => set({ y: n })} /></Row>
        <Row label="Width"><NumberField value={obj.width} onChange={(n) => set({ width: Math.max(8, n) })} /></Row>
        <Row label="Height"><NumberField value={obj.height} onChange={(n) => set({ height: Math.max(8, n) })} /></Row>
        <Row label="Rotation"><NumberField value={obj.rotation} onChange={(n) => set({ rotation: n })} suffix="°" /></Row>
      </Section>

      <Section title="Typography">
        <Row label="Size"><NumberField value={obj.fontSize} onChange={(n) => set({ fontSize: Math.max(8, n) })} /></Row>
        <Row label="Weight">
          <select
            value={obj.fontWeight}
            onChange={(e) => set({ fontWeight: Number(e.target.value) })}
            className="w-24 rounded-lg border border-border bg-background/60 px-2 py-1 text-xs outline-none"
          >
            {[300, 400, 500, 600, 700].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </Row>
        <Row label="Align">
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                onClick={() => set({ align: a })}
                className={`rounded-md px-2 py-1 text-[10px] capitalize ${obj.align === a ? "bg-primary/25 text-primary" : "hover:bg-secondary"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </Row>
        <textarea
          value={obj.text}
          onChange={(e) => live({ text: e.target.value })}
          onBlur={commit}
          placeholder="Content"
          className="mt-2 h-20 w-full resize-none rounded-lg border border-border bg-background/60 p-2 text-xs outline-none focus:border-primary/60"
        />
      </Section>

      <Section title="Fill & color">
        <div className="grid grid-cols-8 gap-1.5 py-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => set({ fill: c })}
              className="h-6 w-6 rounded-md border border-border"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
        <Row label="Text color">
          <div className="flex gap-1">
            {["var(--foreground)", "var(--accent)", "var(--primary)", "var(--primary-foreground)"].map((c) => (
              <button key={c} onClick={() => set({ color: c })} className="h-5 w-5 rounded border border-border" style={{ background: c }} />
            ))}
          </div>
        </Row>
        <Row label="Opacity">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={obj.opacity}
            onChange={(e) => live({ opacity: Number(e.target.value) })}
            onPointerUp={commit}
            className="w-28 accent-[var(--primary)]"
          />
        </Row>
      </Section>

      <Section title="Stroke & shape">
        <Row label="Stroke width"><NumberField value={obj.strokeWidth} onChange={(n) => set({ strokeWidth: Math.max(0, n) })} /></Row>
        <Row label="Corner radius"><NumberField value={obj.radius} onChange={(n) => set({ radius: Math.max(0, n) })} /></Row>
        <Row label="Shadow">
          <input
            type="range"
            min={0}
            max={48}
            value={obj.shadow}
            onChange={(e) => live({ shadow: Number(e.target.value) })}
            onPointerUp={commit}
            className="w-28 accent-[var(--primary)]"
          />
        </Row>
      </Section>

      <Section title="Animation">
        <div className="grid grid-cols-2 gap-1.5">
          {(["none", "fade", "pop", "slide"] as AnimationName[]).map((a) => (
            <button
              key={a}
              onClick={() => set({ animation: a })}
              className={`rounded-lg border px-2 py-1.5 text-[11px] capitalize ${
                obj.animation === a ? "border-primary/60 bg-primary/15 text-primary" : "border-border hover:bg-secondary"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Interaction">
        <input
          value={obj.href ?? ""}
          onChange={(e) => live({ href: e.target.value })}
          onBlur={commit}
          placeholder="Link on click (https://…)"
          className="w-full rounded-lg border border-border bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-primary/60"
        />
      </Section>

      <Section title="Layer">
        <div className="flex gap-2">
          <button onClick={() => reorder(obj.id, "forward")} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11px] hover:bg-secondary">
            <ArrowUp size={12} /> Forward
          </button>
          <button onClick={() => reorder(obj.id, "backward")} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11px] hover:bg-secondary">
            <ArrowDown size={12} /> Backward
          </button>
        </div>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-border/70 pt-3">
      <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {children}
    </section>
  );
}
