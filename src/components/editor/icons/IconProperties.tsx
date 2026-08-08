import React, { useMemo, useState } from 'react';
import { useCanvasStore, CanvasObject } from '@/lib/canvas-store';
import { searchIcons, getIconMeta } from '@/lib/icon-registry';
import { IconRenderer } from '../IconRenderer';
import { Lock, Unlock, Copy, Trash2, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

const SWATCHES = ['#0f172a', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#14b8a6', '#64748b'];

export const IconProperties: React.FC<{ object: CanvasObject }> = ({ object }) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const duplicateObjects = useCanvasStore((s) => s.duplicateObjects);
  const deleteObjects = useCanvasStore((s) => s.deleteObjects);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);

  const [replaceOpen, setReplaceOpen] = useState(false);
  const [query, setQuery] = useState('');

  const meta = getIconMeta(object.iconName || '');
  const replaceResults = useMemo(() => searchIcons(query).slice(0, 40), [query]);
  const set = (patch: Partial<CanvasObject>) => updateObject(object.id, patch);

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-neutral-500">{label}</label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
        <IconRenderer name={object.iconName || 'help-circle'} size={24} color={object.fill} strokeWidth={object.strokeWidth || 2} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-900 truncate">{meta?.label || object.iconName}</p>
          <p className="text-[10px] text-neutral-400">{meta?.category || 'General'}</p>
        </div>
      </div>

      <Row label="Size">
        <input
          type="number"
          min={8}
          value={Math.round(object.width)}
          onChange={(e) => {
            const v = Math.max(8, parseInt(e.target.value) || 8);
            set({ width: v, height: v });
          }}
          className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary text-right"
        />
      </Row>

      <Row label="Rotation">
        <input
          type="range"
          min={0}
          max={360}
          value={object.rotation || 0}
          onChange={(e) => set({ rotation: parseInt(e.target.value) })}
          className="w-20 accent-primary"
        />
        <span className="text-[10px] w-8 text-right text-neutral-500">{Math.round(object.rotation || 0)}°</span>
      </Row>

      <Row label="Fill Color">
        <span className="text-[10px] text-neutral-400 uppercase font-mono">{object.fill}</span>
        <input type="color" value={object.fill} onChange={(e) => set({ fill: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-none" />
      </Row>

      <div className="flex flex-wrap gap-1.5">
        {SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => set({ fill: c })}
            style={{ backgroundColor: c }}
            className="w-5 h-5 rounded-md border border-black/10 hover:scale-110 transition-transform"
            aria-label={`Set color ${c}`}
          />
        ))}
      </div>

      <Row label="Stroke">
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.25}
          value={object.strokeWidth || 2}
          onChange={(e) => set({ strokeWidth: parseFloat(e.target.value) })}
          className="w-20 accent-primary"
        />
        <span className="text-[10px] w-8 text-right text-neutral-500">{object.strokeWidth || 2}</span>
      </Row>

      <Row label="Opacity">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={object.opacity ?? 1}
          onChange={(e) => set({ opacity: parseFloat(e.target.value) })}
          className="w-20 accent-primary"
        />
        <span className="text-[10px] w-8 text-right text-neutral-500">{Math.round((object.opacity ?? 1) * 100)}%</span>
      </Row>

      <Row label="Shadow">
        <input
          type="checkbox"
          checked={!!object.shadow}
          onChange={(e) => set({ shadow: e.target.checked })}
          className="rounded border-neutral-300 text-primary"
        />
      </Row>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={() => sendBackward([object.id])} className="flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-md border border-neutral-200 hover:bg-neutral-50">
          <ArrowDown size={12} /> Backward
        </button>
        <button onClick={() => bringForward([object.id])} className="flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-md border border-neutral-200 hover:bg-neutral-50">
          <ArrowUp size={12} /> Forward
        </button>
        <button onClick={() => set({ locked: !object.locked })} className="flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-md border border-neutral-200 hover:bg-neutral-50">
          {object.locked ? <Unlock size={12} /> : <Lock size={12} />} {object.locked ? 'Unlock' : 'Lock'}
        </button>
        <button onClick={() => duplicateObjects([object.id])} className="flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-md border border-neutral-200 hover:bg-neutral-50">
          <Copy size={12} /> Duplicate
        </button>
        <button onClick={() => deleteObjects([object.id])} className="col-span-2 flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-md border border-red-100 text-red-500 hover:bg-red-50">
          <Trash2 size={12} /> Delete
        </button>
      </div>

      <div className="pt-1">
        <button
          onClick={() => setReplaceOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md bg-primary text-white hover:bg-primary/90"
        >
          <RefreshCw size={12} /> Replace Icon
        </button>
        {replaceOpen && (
          <div className="mt-2 space-y-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full h-8 px-2 rounded-md bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-primary"
            />
            <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
              {replaceResults.map((i) => (
                <button
                  key={i.id}
                  title={i.label}
                  onClick={() => {
                    set({ iconName: i.id });
                    setReplaceOpen(false);
                  }}
                  className="aspect-square rounded-md border border-neutral-100 flex items-center justify-center hover:border-primary hover:bg-primary/5"
                >
                  <IconRenderer name={i.id} size={16} className="text-neutral-700" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconProperties;
