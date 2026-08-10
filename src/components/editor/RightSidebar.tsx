import React from 'react';
import { useCanvasStore, CanvasObject, FrameSettings } from '@/lib/canvas-store';
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
  FileText,
  ChevronRight
} from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { IconProperties } from './icons/IconProperties';
import { toast } from 'sonner';
import { TextProperties, MediaProperties, ShapeProperties } from './properties/ObjectProperties';
import { SlideDesignProperties } from './properties/SlideDesignProperties';

export default function RightSidebar() {
  const { 
    objects, 
    selection, 
    updateObject, 
    presentationSettings, 
    updatePresentationSettings,
    isRightSidebarVisible,
    setRightSidebarVisible
  } = useCanvasStore();
  const selectedObject = objects.find(o => selection.includes(o.id));

  if (!isRightSidebarVisible) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button 
          onClick={() => setRightSidebarVisible(true)}
          className="p-2 bg-white border border-neutral-200 border-r-0 rounded-l-xl shadow-lg text-neutral-500 hover:text-primary transition-all group"
          title="Show Properties"
        >
          <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    if (selectedObject) {
      updateObject(selectedObject.id, { [key]: value });
    }
  };

  const ensureFrameSettings = (settings: Partial<FrameSettings> = {}): FrameSettings => ({
    duration: settings.duration ?? 1200,
    easing: settings.easing ?? 'smooth',
    camera: settings.camera ?? { x: 0, y: 0, zoom: 1, rotation: 0 },
    ...settings
  });

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="py-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">{title}</h3>
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
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-extrabold text-neutral-900">Project Settings</h2>
          <button 
            onClick={() => setRightSidebarVisible(false)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors"
            title="Hide Panel"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="p-4 flex-1">
          <Section title="Presentation Mode">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Transition Speed (ms)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="100" max="2500" step="100"
                    value={presentationSettings.transitionDuration}
                    onChange={(e) => updatePresentationSettings({ transitionDuration: parseInt(e.target.value) })}
                    className="flex-1 accent-primary" 
                  />
                  <span className="text-[10px] w-12">{presentationSettings.transitionDuration}ms</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Presentation Zoom (Outer Space)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" max="0.8" step="0.01"
                    value={presentationSettings.zoomPadding ?? 0.1}
                    onChange={(e) => updatePresentationSettings({ zoomPadding: parseFloat(e.target.value) })}
                    className="flex-1 accent-primary" 
                  />
                  <span className="text-[10px] w-12">{Math.round((presentationSettings.zoomPadding ?? 0.1) * 100)}%</span>
                </div>
                <p className="text-[9px] text-neutral-400">Increase to zoom OUT more during presentation.</p>
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
          
          <Section title="Project Canvas">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Canvas Background Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={presentationSettings.backgroundColor || '#f8f9fa'}
                    onChange={(e) => updatePresentationSettings({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-neutral-200 cursor-pointer overflow-hidden p-0" 
                  />
                  <input 
                    type="text"
                    value={presentationSettings.backgroundColor || '#f8f9fa'}
                    onChange={(e) => updatePresentationSettings({ backgroundColor: e.target.value })}
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 text-[10px] font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-neutral-500 uppercase">Background Image</label>
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          updatePresentationSettings({ backgroundImage: dataUrl });
                          toast.success('Background image updated');
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="w-full py-2 bg-neutral-900 text-white rounded text-[11px] font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={12} /> Upload Photo
                </button>
                {presentationSettings.backgroundImage && (
                  <button 
                    onClick={() => updatePresentationSettings({ backgroundImage: undefined })}
                    className="w-full py-2 text-red-500 hover:bg-red-50 rounded text-[10px] font-bold transition-colors"
                  >
                    Remove Background Photo
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Canvas Navigation">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-500">Snap to Objects</label>
                <input 
                  type="checkbox"
                  checked={useCanvasStore.getState().snapEnabled}
                  onChange={(e) => useCanvasStore.getState().setSnapEnabled(e.target.checked)}
                  className="rounded border-neutral-300 text-primary"
                />
              </div>
              <button 
                onClick={() => {
                  useCanvasStore.getState().setViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-bold text-neutral-600 transition-colors"
              >
                Reset Canvas View
              </button>
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
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="font-extrabold text-neutral-900 capitalize">{selectedObject.type} Properties</h2>
        <button 
          onClick={() => setRightSidebarVisible(false)}
          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors"
          title="Hide Panel"
        >
          <ChevronRight size={18} />
        </button>
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

        {selectedObject.type === 'frame' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SlideDesignProperties object={selectedObject} />
          </div>
        )}

        {selectedObject.type === 'frame' && (
          <>
            <Section title="Camera Settings">
              <button 
                onClick={() => {
                  const { viewport } = useCanvasStore.getState();
                  const settings = ensureFrameSettings({ 
                    ...(selectedObject.settings || {}), 
                    camera: { x: viewport.x, y: viewport.y, zoom: viewport.zoom, rotation: viewport.rotation } 
                  });
                  updateObject(selectedObject.id, { settings });
                  toast.success('Camera position captured');
                }}
                className="w-full py-2 bg-neutral-900 text-white rounded text-[11px] font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <Maximize size={12} /> Capture Viewport
              </button>
            </Section>

            <Section title="Transition Step">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-neutral-500 uppercase">Duration (ms)</label>
                  <input 
                    type="number" 
                    value={selectedObject.settings?.duration || 1200}
                    onChange={(e) => {
                      const settings = ensureFrameSettings({ 
                        ...(selectedObject.settings || {}), 
                        duration: parseInt(e.target.value) 
                      });
                      updateObject(selectedObject.id, { settings });
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-neutral-500 uppercase">Transition Effect</label>
                  <select 
                    value={selectedObject.settings?.easing || 'smooth'}
                    onChange={(e) => {
                      const settings = ensureFrameSettings({ 
                        ...(selectedObject.settings || {}), 
                        easing: e.target.value as any 
                      });
                      updateObject(selectedObject.id, { settings });
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-primary text-neutral-900"
                  >
                    <option value="smooth" className="text-neutral-900">Smooth Morph</option>
                    <option value="cinematic" className="text-neutral-900">Cinematic Zoom</option>
                    <option value="vortex" className="text-neutral-900">Vortex Spin</option>
                    <option value="origami" className="text-neutral-900">Origami Fold</option>
                    <option value="fade" className="text-neutral-900">Cross Fade</option>
                    <option value="bounce" className="text-neutral-900">Spring Bounce</option>
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Speaker Notes">
              <textarea 
                value={selectedObject.speakerNotes || ''}
                onChange={(e) => updateObject(selectedObject.id, { speakerNotes: e.target.value })}
                placeholder="Add notes for this frame..."
                className="w-full h-32 bg-neutral-50 border border-neutral-200 rounded px-2 py-2 text-xs outline-none focus:border-primary resize-none font-medium leading-relaxed"
              />
              <p className="text-[10px] text-neutral-400">
                Visible in Presenter View.
              </p>
            </Section>
          </>
        )}

        {selectedObject.type === 'text' && <TextProperties object={selectedObject} />}
        {(selectedObject.type === 'image' || selectedObject.type === 'video') && <MediaProperties object={selectedObject} />}
        {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle') && <ShapeProperties object={selectedObject} />}

        {selectedObject.type === 'icon' && (
          <Section title="Icon Settings">
            <IconProperties object={selectedObject} />
          </Section>
        )}

      </div>
    </div>
  );
}
