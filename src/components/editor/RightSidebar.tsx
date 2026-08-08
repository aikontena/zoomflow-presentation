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
  Box,
  FileText
} from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { IconProperties } from './icons/IconProperties';
import { toast } from 'sonner';

export default function RightSidebar() {
  const { objects, selection, updateObject, presentationSettings, updatePresentationSettings } = useCanvasStore();
  const selectedObject = objects.find(o => selection.includes(o.id));

  const handleChange = (key: string, value: any) => {
    if (selectedObject) {
      updateObject(selectedObject.id, { [key]: value });
    }
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

  if (!selectedObject) {
    return (
      <div className="w-64 h-full bg-white border-l border-neutral-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Project Settings</h2>
        </div>
        <div className="p-4 flex-1">
          <Section title="Presentation Mode">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Transition Speed (ms)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="100" max="2000" step="100"
                    value={presentationSettings.transitionDuration}
                    onChange={(e) => updatePresentationSettings({ transitionDuration: parseInt(e.target.value) })}
                    className="flex-1 accent-primary" 
                  />
                  <span className="text-[10px] w-12">{presentationSettings.transitionDuration}ms</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Zoom Padding</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" max="0.5" step="0.05"
                    value={presentationSettings.zoomPadding ?? 0.1}
                    onChange={(e) => updatePresentationSettings({ zoomPadding: parseFloat(e.target.value) })}
                    className="flex-1 accent-primary" 
                  />
                  <span className="text-[10px] w-12">{Math.round((presentationSettings.zoomPadding ?? 0.1) * 100)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-500">Auto-play</label>
                <input 
                  type="checkbox"
                  checked={presentationSettings.autoPlay}
                  onChange={(e) => updatePresentationSettings({ autoPlay: e.target.checked })}
                  className="rounded border-neutral-300 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-500">Loop</label>
                <input 
                  type="checkbox"
                  checked={presentationSettings.loop}
                  onChange={(e) => updatePresentationSettings({ loop: e.target.checked })}
                  className="rounded border-neutral-300 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-500">Dark Background</label>
                <input 
                  type="checkbox"
                  checked={presentationSettings.darkBackground}
                  onChange={(e) => updatePresentationSettings({ darkBackground: e.target.checked })}
                  className="rounded border-neutral-300 text-primary"
                />
              </div>
            </div>
          </Section>

          <div className="mt-8 flex flex-col items-center justify-center text-neutral-400 gap-2 opacity-50">
            <Layers size={32} strokeWidth={1.5} />
            <p className="text-sm">Select an object for properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-white border-l border-neutral-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-neutral-100">
        <h2 className="font-semibold text-neutral-900 capitalize">{selectedObject.type} Properties</h2>
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
          <InputRow label="Opacity">
            <input 
              type="range" 
              min="0" max="1" step="0.1"
              value={selectedObject.opacity ?? 1}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              className="w-24 accent-primary"
            />
          </InputRow>
        </Section>

        {selectedObject.type === 'frame' && (
          <>
            <Section title="Camera & Transition">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-neutral-500 uppercase">Transition Duration (ms)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={selectedObject.settings?.duration || 1200}
                      onChange={(e) => {
                        const settings = { ...(selectedObject.settings || {}), duration: parseInt(e.target.value) };
                        handleChange('settings', settings);
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-neutral-500 uppercase">Easing Style</label>
                  <select 
                    value={selectedObject.settings?.easing || 'smooth'}
                    onChange={(e) => {
                      const settings = { ...(selectedObject.settings || {}), easing: e.target.value };
                      handleChange('settings', settings);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                  >
                    <option value="smooth">Smooth</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="fast">Fast</option>
                    <option value="slow">Slow</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    const { viewport } = useCanvasStore.getState();
                    const settings = { 
                      ...(selectedObject.settings || {}), 
                      camera: { x: viewport.x, y: viewport.y, zoom: viewport.zoom, rotation: viewport.rotation } 
                    };
                    handleChange('settings', settings);
                    toast.success('Camera position captured');
                  }}
                  className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-bold text-neutral-600 transition-colors"
                >
                  Capture Current Camera
                </button>
              </div>
            </Section>

            <Section title="Speaker Notes">
              <textarea 
                value={selectedObject.speakerNotes || ''}
                onChange={(e) => handleChange('speakerNotes', e.target.value)}
                placeholder="Add notes for this frame..."
                className="w-full h-32 bg-neutral-50 border border-neutral-200 rounded px-2 py-2 text-xs outline-none focus:border-primary resize-none font-medium leading-relaxed"
              />
              <p className="text-[10px] text-neutral-400">
                Visible in Presenter View.
              </p>
            </Section>
          </>
        )}

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
          </Section>
        )}

        {selectedObject.type === 'icon' && (
          <Section title="Icon Settings">
            <IconProperties object={selectedObject} />
          </Section>
        )}

      </div>
    </div>
  );
}
