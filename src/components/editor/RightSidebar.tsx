import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  Move, 
  Maximize, 
  RotateCw, 
  Palette, 
  Square, 
  Circle, 
  Type, 
  Wind,
  Layers,
  ChevronDown,
  RefreshCw,
  Box
} from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { ICONS } from '@/lib/icons';
import { toast } from 'sonner';

export default function RightSidebar() {
  const { objects, selection, updateObject } = useCanvasStore();
  const selectedObject = objects.find(o => selection.includes(o.id));

  if (!selectedObject) {
    return (
      <div className="w-64 h-full bg-white border-l border-neutral-200 p-4 flex flex-col items-center justify-center text-neutral-400 gap-2">
        <Layers size={32} strokeWidth={1.5} />
        <p className="text-sm">Select an object to edit</p>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateObject(selectedObject.id, { [key]: value });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="py-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{title}</h3>
        <ChevronDown size={12} className="text-neutral-300" />
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const InputRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs text-neutral-500">{label}</label>
      <div className="flex-1 flex justify-end">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-64 h-full bg-white border-l border-neutral-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-neutral-100">
        <h2 className="font-semibold text-neutral-900">Properties</h2>
      </div>

      <div className="p-4 flex-1">
        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400">X</span>
              <input 
                type="number" 
                value={Math.round(selectedObject.x)}
                onChange={(e) => handleChange('x', parseInt(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400">Y</span>
              <input 
                type="number" 
                value={Math.round(selectedObject.y)}
                onChange={(e) => handleChange('y', parseInt(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400">Width</span>
              <input 
                type="number" 
                value={Math.round(selectedObject.width)}
                onChange={(e) => handleChange('width', parseInt(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-400">Height</span>
              <input 
                type="number" 
                value={Math.round(selectedObject.height)}
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
          <InputRow label="Rotation">
            <input 
              type="number" 
              value={selectedObject.rotation || 0}
              onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
              className="w-20 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary text-right"
            />
          </InputRow>
        </Section>

        <Section title="Style">
          <InputRow label="Fill">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 uppercase font-mono">{selectedObject.fill}</span>
              <input 
                type="color" 
                value={selectedObject.fill}
                onChange={(e) => handleChange('fill', e.target.value)}
                className="w-6 h-6 rounded border-none cursor-pointer"
              />
            </div>
          </InputRow>
          <InputRow label="Stroke">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 border border-neutral-200 rounded bg-transparent" />
             </div>
          </InputRow>
          <InputRow label="Corner Radius">
             <input 
                type="number" 
                defaultValue={0}
                className="w-12 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary text-right"
              />
          </InputRow>
          <InputRow label="Opacity">
            <input 
              type="range" 
              min="0" max="1" step="0.1"
              value={selectedObject.opacity ?? 1}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              className="w-24 accent-primary"
            />
          </InputRow>
          <InputRow label="Shadow">
             <div className="w-4 h-4 rounded border border-neutral-200" />
          </InputRow>
        </Section>

        {selectedObject.type === 'text' && (
          <Section title="Typography">
            <InputRow label="Font Size">
              <input 
                type="number" 
                value={selectedObject.fontSize || 16}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="w-12 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary text-right"
              />
            </InputRow>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <button className="p-1.5 bg-neutral-50 border border-neutral-200 rounded hover:bg-neutral-100 transition-colors">
                <Type size={14} className="mx-auto" />
              </button>
              <button className="p-1.5 bg-neutral-50 border border-neutral-200 rounded hover:bg-neutral-100 transition-colors font-bold">B</button>
            </div>
          </Section>
        )}

        <Section title="Animation & Transition">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-neutral-500 uppercase">Entrance Animation</label>
              <select className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded text-xs outline-none focus:border-primary">
                <option>None</option>
                <option>Fade In</option>
                <option>Scale Up</option>
                <option>Slide Left</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-neutral-500 uppercase">Transition Duration</label>
              <div className="flex items-center gap-2">
                <input type="range" className="flex-1 accent-primary" min="0" max="2" step="0.1" />
                <span className="text-[10px] w-8">0.3s</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                Focus Mode: When this object is focused, the camera will zoom to its position with the selected transition.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
